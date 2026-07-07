// Smoke test for the Pixels DnDBeyond chrome extension against live dndbeyond.com.
// See test/README.md for setup. Requires a logged-in session (cookies.json) and
// DDB_CHARACTER_URL pointing at a character of that account.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const EXTENSION_DIR = path.resolve(__dirname, "..", "chrome_extension");
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
        const headerMatch = text.match(/^\s*cookie:\s*(.+)$/im);
        const header = curlMatch?.[1] || headerMatch?.[1] || (text.includes("=") && !text.includes("\n--") ? text.trim() : null);
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
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${label}.png`), fullPage: true });
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

    const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
        headless: !HEADED,
        args: [
            `--disable-extensions-except=${EXTENSION_DIR}`,
            `--load-extension=${EXTENSION_DIR}`,
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
        window.__pixelsTest = { sent: [], intercepted: false };
        const origSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
            if (typeof data === "string") {
                window.__pixelsTest.sent.push(data);
            }
            return origSend.call(this, data);
        };
    });

    await ctx.addCookies(cookies);

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

            // ---- 6. roll appears in game log ----
            try {
                await page.click(".ct-character-header-desktop__group--game-log, [class*='game-log']", { timeout: 5000 });
                await page.waitForTimeout(2000);
                const inLog = await page.evaluate(() => document.body.innerText.includes("18"));
                report("roll visible in game log", inLog ? "PASS" : "WARN", inLog ? "" : "could not confirm");
            } catch {
                report("roll visible in game log", "WARN", "could not open game log");
            }

            // ---- 7. pixel mode flow: click a check button, then roll ----
            try {
                const clicked = await page.evaluate(() => {
                    // strength check button on the desktop sheet
                    const abilities = document.querySelectorAll(".ddbc-ability-summary button, .ct-ability-summary button, [class*='ability-summary'] button");
                    if (abilities.length === 0) return false;
                    abilities[0].click();
                    return true;
                });
                if (!clicked) {
                    report("pixel mode check roll", "WARN", "no ability check button found — selectors may have changed");
                } else {
                    await page.waitForTimeout(1500);
                    const expected = await page.evaluate(() => (typeof currentlyExpectedRoll !== "undefined" ? currentlyExpectedRoll : null));
                    if (!expected || Object.keys(expected).length === 0) {
                        report("pixel mode check roll", "WARN", "clicking check button did not arm a pixel roll");
                    } else {
                        const before2 = (await getSentRollMessages(page)).length;
                        await page.evaluate(() => rollDice("d20", 15));
                        await page.waitForTimeout(3000);
                        const rolls2 = (await getSentRollMessages(page)).slice(before2);
                        const fulfilled2 = rolls2.find((m) => m.eventType === "dice/roll/fulfilled");
                        const ok = fulfilled2 && fulfilled2.data?.rolls?.[0]?.result?.values?.[0] === 15;
                        report("pixel mode check roll", ok ? "PASS" : "FAIL", ok ? `modifier ${expected.modifier} applied` : "roll not submitted");
                    }
                }
            } catch (e) {
                report("pixel mode check roll", "WARN", e.message.slice(0, 120));
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
