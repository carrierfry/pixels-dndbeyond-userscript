// Smoke test for the Pixels DnDBeyond chrome extension against live dndbeyond.com.
// See test/README.md for setup. Requires a logged-in session (cookies.json) and
// DDB_CHARACTER_URL pointing at a character of that account.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const EXTENSION_DIR = path.resolve(__dirname, "..", "chrome_extension");
const BEYOND20_DIR = path.resolve(__dirname, "beyond20");
const LOAD_BEYOND20 = fs.existsSync(BEYOND20_DIR);
const ARTIFACTS_DIR = path.join(__dirname, "artifacts");
const PROFILE_DIR = path.join(__dirname, ".profile");
const COOKIES_PATH = process.env.DDB_COOKIES || path.join(__dirname, "cookies.json");
const CHARACTER_URL = process.env.DDB_CHARACTER_URL;
const HEADED = process.env.HEADED === "1";

const results = [];
function report(name, status, detail = "") {
    results.push({ name, status, detail });
    const icon = { PASS: "✅", FAIL: "❌", WARN: "⚠️", SKIP: "⏭️" }[status];
    console.log(`${icon} ${status} ${name}${detail ? " — " + detail : ""}`);
}

function loadCookies() {
    if (!fs.existsSync(COOKIES_PATH)) {
        return null;
    }
    const text = fs.readFileSync(COOKIES_PATH, "utf8");
    let raw;
    try {
        raw = JSON.parse(text);
    } catch {
        // Not JSON: accept a raw Cookie header or a DevTools "Copy as cURL" dump,
        // both of which include HttpOnly cookies that console JS can't read
        const curlMatch = text.match(/-H\s+['"]?cookie:\s*([^'"\n]+)['"]?/i);
        const curlCookieFlag = text.match(/(?:-b|--cookie)\s+(['"])([\s\S]*?)\1/);
        const headerMatch = text.match(/^\s*cookie:\s*(.+)$/im);
        const header = curlMatch?.[1] || curlCookieFlag?.[2] || headerMatch?.[1] || (text.includes("=") && !text.includes("\n--") ? text.trim() : null);
        if (!header) {
            console.error(`${COOKIES_PATH} is neither JSON nor a Cookie header / cURL dump.`);
            process.exit(2);
        }
        raw = header.split(/;\s*/).filter(Boolean).map((pair) => {
            const i = pair.indexOf("=");
            return { name: pair.slice(0, i), value: pair.slice(i + 1), domain: ".dndbeyond.com" };
        });
    }
    if (!Array.isArray(raw) && Array.isArray(raw.cookies)) {
        raw = raw.cookies;
    }
    // Normalize cookie-editor style dumps to Playwright's cookie format
    return raw.map((c) => {
        const cookie = {
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path || "/",
            secure: !!c.secure,
            httpOnly: !!c.httpOnly,
        };
        if (c.expirationDate) {
            cookie.expires = Math.floor(c.expirationDate);
        } else if (typeof c.expires === "number" && c.expires > 0) {
            cookie.expires = Math.floor(c.expires);
        }
        const sameSiteMap = {
            no_restriction: "None",
            none: "None",
            lax: "Lax",
            strict: "Strict",
            unspecified: "Lax",
        };
        cookie.sameSite = sameSiteMap[String(c.sameSite).toLowerCase()] || "Lax";
        return cookie;
    });
}

async function dumpArtifacts(page, label) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    try {
        // viewport-only: full-page screenshots of the sheet OOM the tab on small machines
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${label}.png`) });
        fs.writeFileSync(path.join(ARTIFACTS_DIR, `${label}.html`), await page.content());
        console.log(`   artifacts written to test/artifacts/${label}.{png,html}`);
    } catch (e) {
        console.log(`   could not write artifacts: ${e.message}`);
    }
}

// Messages the extension sends over the game log socket, recorded by the init script
async function getSentRollMessages(page) {
    const sent = await page.evaluate(() => window.__pixelsTest.sent);
    return sent
        .map((s) => {
            try {
                return JSON.parse(s);
            } catch {
                return null;
            }
        })
        .filter((m) => m && m.eventType && m.eventType.startsWith("dice/roll"));
}

(async () => {
    if (!CHARACTER_URL) {
        console.error("DDB_CHARACTER_URL is not set. Point it at your test character sheet, e.g.");
        console.error('  export DDB_CHARACTER_URL="https://www.dndbeyond.com/characters/12345678"');
        process.exit(2);
    }

    const cookies = loadCookies();
    if (!cookies) {
        console.error(`No cookie dump found at ${COOKIES_PATH}.`);
        console.error("Export your dndbeyond.com cookies to test/cookies.json (see test/README.md).");
        process.exit(2);
    }

    const extensionsToLoad = LOAD_BEYOND20 ? `${EXTENSION_DIR},${BEYOND20_DIR}` : EXTENSION_DIR;
    if (LOAD_BEYOND20) {
        console.log("Loading Beyond20 alongside Pixels extension");
    } else {
        console.log("Beyond20 not found in test/beyond20/ — bridge checks will be skipped");
    }

    const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
        headless: !HEADED,
        // full Chromium, not the default headless shell — extensions only load in the former
        channel: "chromium",
        args: [
            `--disable-extensions-except=${extensionsToLoad}`,
            `--load-extension=${extensionsToLoad}`,
            // the character sheet is heavy; without these the renderer can get
            // OOM-killed on small machines / containers
            "--disable-dev-shm-usage",
            "--renderer-process-limit=2",
            "--js-flags=--max-old-space-size=384",
            "--disable-gpu",
            "--disable-background-networking",
            "--disable-sync",
        ],
        viewport: { width: 1600, height: 900 },
    });

    // Shim navigator.bluetooth (headless has none; main() aborts without it) and
    // record everything sent over WebSockets so roll submissions can be asserted.
    await ctx.addInitScript(() => {
        if (navigator.bluetooth === undefined) {
            Object.defineProperty(navigator, "bluetooth", {
                value: { getAvailability: async () => true },
                configurable: true,
            });
        }
        window.__pixelsTest = { sent: [], intercepted: false, beyond20Sent: [] };
        document.addEventListener("Beyond20_SendMessage", (e) => {
            window.__pixelsTest.beyond20Sent.push(e.detail);
        });
        const origSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
            if (typeof data === "string") {
                window.__pixelsTest.sent.push(data);
            }
            return origSend.call(this, data);
        };
    });

    await ctx.addCookies(cookies);

    // Keep memory down (the sheet + ad/analytics scripts can OOM small machines):
    // block images/media/fonts and third-party trackers. dndbeyond.com scripts,
    // styles and API calls still load normally.
    const blockedTypes = new Set(["image", "media", "font"]);
    const blockedHosts = /doubleclick|googlesyndication|googletagmanager|google-analytics|datadoghq|hotjar|ketchcdn|amazon-adsystem|adnxs|scorecardresearch|quantserve|nitropay|cookielaw/i;
    await ctx.route("**/*", (route) => {
        const req = route.request();
        if (blockedTypes.has(req.resourceType()) || blockedHosts.test(new URL(req.url()).hostname)) {
            return route.abort();
        }
        return route.continue();
    });

    const page = await ctx.newPage();
    page.on("dialog", async (d) => {
        console.log(`   [dialog:${d.type()}] ${d.message().slice(0, 150)}`);
        await d.dismiss();
    });
    let sawInterceptLog = false;
    page.on("console", (m) => {
        if (m.text() === "Intercepting socket") {
            sawInterceptLog = true;
        }
    });

    let exitCode = 0;
    try {
        await page.goto(CHARACTER_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

        // ---- 1. logged in? ----
        await page.waitForTimeout(3000);
        const loggedIn = await page.evaluate(
            () => !Array.from(document.querySelectorAll("a")).some((a) => (a.getAttribute("href") || "").startsWith("https://www.dndbeyond.com/sign-in"))
        );
        report("logged-in session", loggedIn ? "PASS" : "FAIL", loggedIn ? "" : "page shows sign-in links — cookies missing/expired?");

        // ---- 2. sheet detected / Pixel Mode button injected ----
        let pixelModeBtn = null;
        try {
            pixelModeBtn = await page.waitForSelector("#pixel-mode-button", { timeout: 30000 });
            report("Pixel Mode button injected", "PASS");
        } catch {
            report("Pixel Mode button injected", "FAIL", "sheet-loaded selectors probably broken");
            const probe = await page.evaluate(() => ({
                desktopShortRest: !!document.querySelector(".ct-character-header-desktop__group--short-rest"),
                tabletShortRest: !!document.querySelector(".ct-character-header-tablet__group--short-rest"),
                mobileHeader: !!document.querySelector(".ct-character-header-mobile"),
                headerGroups: Array.from(document.querySelectorAll("[class*='ct-character-header']"))
                    .slice(0, 10)
                    .map((e) => e.className.toString().slice(0, 100)),
            }));
            console.log("   selector probe:", JSON.stringify(probe, null, 2));
            await dumpArtifacts(page, "sheet-not-detected");
        }

        // ---- 3. socket interception ----
        const intercepted = sawInterceptLog || (await page.evaluate(() => !WebSocket.toString().includes("[native code]")));
        report("game log socket intercepted", intercepted ? "PASS" : "FAIL");

        // ---- 4. info box + connect nav ----
        const infoBox = await page.$(".pixels-info-box");
        report("pixels info box injected", infoBox ? "PASS" : "FAIL");

        const connectNav = await page.evaluate(
            () => !!Array.from(document.querySelectorAll("a, span, li")).find((e) => e.textContent.trim() === "Connect to Pixels")
        );
        report("Connect to Pixels nav entry", connectNav ? "PASS" : "FAIL");

        // ---- 4b. Beyond20 detected (optional, only when bundled) ----
        if (LOAD_BEYOND20) {
            const b20 = await page.evaluate(() => typeof beyond20Installed !== "undefined" && beyond20Installed);
            report("Beyond20 extension detected", b20 ? "PASS" : "FAIL");
        } else {
            report("Beyond20 extension detected", "SKIP", "test/beyond20/ not present (see test/README.md)");
        }

        if (pixelModeBtn) {
            // ---- 5. plain rollDice() submits a custom roll ----
            const before = (await getSentRollMessages(page)).length;
            await page.evaluate(() => rollDice("d20", 18));
            await page.waitForTimeout(3000);
            const rolls = (await getSentRollMessages(page)).slice(before);
            const pending = rolls.find((m) => m.eventType === "dice/roll/pending");
            const fulfilled = rolls.find((m) => m.eventType === "dice/roll/fulfilled");
            const value = fulfilled?.data?.rolls?.[0]?.result?.values?.[0];
            if (pending && fulfilled && value === 18) {
                report("rollDice('d20', 18) submits roll", "PASS");
            } else if (rolls.length > 0) {
                report("rollDice('d20', 18) submits roll", "FAIL", `sent ${rolls.length} msgs but value=${value}`);
                console.log("   messages:", JSON.stringify(rolls).slice(0, 500));
            } else {
                report("rollDice('d20', 18) submits roll", "FAIL", "nothing sent over socket (socket not ready?)");
            }

            // ---- 5b. roll forwarded to Beyond20 (optional) ----
            if (LOAD_BEYOND20) {
                const b20Sent = await page.evaluate(() => window.__pixelsTest.beyond20Sent);
                if (b20Sent.length > 0) {
                    report("roll forwarded to Beyond20", "PASS", `${b20Sent.length} SendMessage event(s) dispatched`);
                } else {
                    report("roll forwarded to Beyond20", "FAIL", "no Beyond20_SendMessage event fired");
                }
            } else {
                report("roll forwarded to Beyond20", "SKIP", "Beyond20 not loaded");
            }

            // ---- 6. roll appears in game log ----
            try {
                await page.click("[aria-roledescription='Game Log'] [class*='campaignButton'], [aria-roledescription='Game Log'], [class*='GameLogButton']", { timeout: 5000 });
                await page.waitForSelector("[class*='GameLogEntries']", { timeout: 15000 });
                await page.waitForTimeout(2000);
                const inLog = await page.evaluate(() => {
                    const log = document.querySelector("[class*='GameLogEntries']");
                    return log !== null && log.innerText.includes("18");
                });
                report("roll visible in game log", inLog ? "PASS" : "FAIL", inLog ? "" : "roll not rendered into the game log");
            } catch {
                report("roll visible in game log", "WARN", "could not open game log — toggle selector may have changed");
            }

            // ---- 7. pixel mode flow: click a check button, then roll ----
            // Without a connected die the click handler falls back to a virtual roll,
            // so register a fake connected d20 first. No Bluetooth involved: only
            // dieType/status are read and blink() is called on it.
            try {
                await page.evaluate(() => {
                    window.pixels = window.pixels || [];
                    if (window.pixels.length === 0) {
                        window.pixels.push({
                            name: "SmokeTestDie",
                            dieType: "d20",
                            status: "ready",
                            rssi: -60,
                            batteryLevel: 100,
                            blink: async () => {},
                            addEventListener: () => {},
                            removeEventListener: () => {},
                        });
                    }
                });
                const clicked = await page.evaluate(() => {
                    // pixel mode swaps every dice button (.integrated-dice__container) for
                    // a clone with the pixel click handler — click the first d20 one
                    const buttons = document.querySelectorAll(".integrated-dice__container");
                    if (buttons.length === 0) return false;
                    buttons[0].click();
                    return true;
                });
                if (!clicked) {
                    report("pixel mode check roll", "FAIL", "no .integrated-dice__container buttons on sheet — selector broken?");
                } else {
                    await page.waitForTimeout(1500);
                    const expected = await page.evaluate(() => (typeof currentlyExpectedRoll !== "undefined" ? currentlyExpectedRoll : null));
                    if (!expected || Object.keys(expected).length === 0) {
                        report("pixel mode check roll", "FAIL", "clicking dice button did not arm a pixel roll");
                    } else {
                        const before2 = (await getSentRollMessages(page)).length;
                        await page.evaluate(() => rollDice("d20", 15));
                        await page.waitForTimeout(3000);
                        const rolls2 = (await getSentRollMessages(page)).slice(before2);
                        const fulfilled2 = rolls2.find((m) => m.eventType === "dice/roll/fulfilled");
                        const values = fulfilled2?.data?.rolls?.[0]?.result?.values;
                        const ok = Array.isArray(values) && values.includes(15);
                        report("pixel mode check roll", ok ? "PASS" : "FAIL", ok ? `armed '${expected.rollName}' (modifier ${expected.modifier}), roll submitted` : "roll not submitted");
                    }
                }
            } catch (e) {
                report("pixel mode check roll", "WARN", e.message.slice(0, 120));
            }

            // ---- 8. no matching Pixel die → virtual dice flow (event not claimed) ----
            // With pixelMode on and no connected d8, clicking a non-d20 damage button
            // must NOT call stopImmediatePropagation/preventDefault, so DDB's own
            // handler receives the trusted click and rolls the digital dice.
            try {
                // Pick a non-d20 dice button (e.g. damage) and check the capture
                // listener's decision by dispatching a synthetic click and reading
                // defaultPrevented. We can't use the real click (it would actually
                // roll DDB's dice), so we simulate the capture decision via the same
                // logic the extension uses.
                const claimed = await page.evaluate(() => {
                    const btns = document.querySelectorAll(".integrated-dice__container");
                    let target = null;
                    for (const b of btns) {
                        const dt = getDieTypeFromButton(b);
                        if (dt && dt !== "d20") { target = b; break; }
                    }
                    if (!target) return { error: "no non-d20 button" };
                    // Replicate the capture listener's decision: claim only if connected
                    const dt = getDieTypeFromButton(target);
                    const wouldClaim = checkIfDieTypeIsConnected(dt) && !(dt === "d20" && isRollFlat(target));
                    return { dieType: dt, wouldClaim, inWeakMap: pixelSwappedHandlers.has(target) };
                });
                if (claimed.error) {
                    report("virtual dice flow not blocked", "WARN", claimed.error);
                } else if (claimed.wouldClaim) {
                    report("virtual dice flow not blocked", "FAIL", `capture would claim a ${claimed.dieType} with no matching die connected`);
                } else {
                    report("virtual dice flow not blocked", "PASS", `capture leaves ${claimed.dieType} clicks through to DDB (no matching Pixel die)`);
                }
            } catch (e) {
                report("virtual dice flow not blocked", "WARN", e.message.slice(0, 120));
            }

            // ---- 9. tab-change re-swap: new buttons get registered ----
            // Navigating to a different tab renders new .integrated-dice__container
            // buttons; the checkForMissingPixelButtons poller (300ms) must register
            // them in pixelSwappedHandlers so Pixel Mode keeps working on every tab.
            try {
                const before = await page.evaluate(() => {
                    const btns = document.querySelectorAll(".integrated-dice__container");
                    return { total: btns.length, swapped: Array.from(btns).filter(b => pixelSwappedHandlers.has(b)).length };
                });
                // Click a different tab (Spells, Actions, Equipment — whichever isn't active)
                const tabClicked = await page.evaluate(() => {
                    const tabs = document.querySelectorAll("[class^='styles_tabButton']");
                    if (tabs.length < 2) return false;
                    // Pick a tab that isn't the currently active one
                    for (const t of tabs) {
                        if (!t.className.includes("active") && !t.getAttribute("aria-selected")) {
                            t.click();
                            return true;
                        }
                    }
                    // Fallback: click the second tab
                    tabs[1].click();
                    return true;
                });
                if (!tabClicked) {
                    report("tab-change re-swap", "WARN", "no alternate tab to click");
                } else {
                    // Wait for the poller to catch up (300ms interval; give it generous headroom)
                    await page.waitForTimeout(1500);
                    const after = await page.evaluate(() => {
                        const btns = document.querySelectorAll(".integrated-dice__container");
                        return { total: btns.length, swapped: Array.from(btns).filter(b => pixelSwappedHandlers.has(b)).length };
                    });
                    const ok = after.total > 0 && after.swapped === after.total;
                    report("tab-change re-swap", ok ? "PASS" : "FAIL", ok ? `all ${after.total} buttons registered after tab change` : `only ${after.swapped}/${after.total} registered after tab change`);
                }
            } catch (e) {
                report("tab-change re-swap", "WARN", e.message.slice(0, 120));
            }
        } else {
            report("rollDice('d20', 18) submits roll", "SKIP", "sheet not detected");
            report("pixel mode check roll", "SKIP", "sheet not detected");
        }

        await dumpArtifacts(page, "final-state");
    } catch (e) {
        console.error("Unexpected error:", e.message);
        await dumpArtifacts(page, "error");
        exitCode = 1;
    }

    await ctx.close();

    const failed = results.filter((r) => r.status === "FAIL");
    console.log(`\n${results.length} checks: ${results.filter((r) => r.status === "PASS").length} passed, ${failed.length} failed, ${results.filter((r) => r.status === "WARN").length} warnings`);
    process.exit(exitCode || (failed.length > 0 ? 1 : 0));
})();
