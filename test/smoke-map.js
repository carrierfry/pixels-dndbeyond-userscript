// Smoke test for the maps VTT part of the Pixels DnDBeyond chrome extension
// against live dndbeyond.com. See test/README.md for setup. Requires a
// logged-in session (cookies.json), DDB_CHARACTER_URL (any character on the
// account — visited first because the map page load is flaky) and
// DDB_MAP_URL pointing at an active map (e.g. https://www.dndbeyond.com/games/1234567).

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const EXTENSION_DIR = path.resolve(__dirname, "..", "chrome_extension");
const ARTIFACTS_DIR = path.join(__dirname, "artifacts");
const PROFILE_DIR = path.join(__dirname, ".profile");
const COOKIES_PATH = process.env.DDB_COOKIES || path.join(__dirname, "cookies.json");
const CHARACTER_URL = process.env.DDB_CHARACTER_URL;
const MAP_URL = process.env.DDB_MAP_URL;
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
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${label}.png`) });
        console.log(`   artifacts written to test/artifacts/${label}.png`);
    } catch (e) {
        console.log(`   could not write artifacts: ${e.message}`);
    }
}

async function openSheetIframe(page) {
    await page.evaluate(() => document.querySelector("[data-testid='sidebar-button']")?.click());
    await page.waitForTimeout(2500);
    await page.evaluate(() => document.querySelector("[data-testid='encounter-list-item'] summary")?.click());
    await page.waitForTimeout(1000);
    const hoverTarget = await page.evaluate(() => {
        const r = document.querySelector("[data-testid='encounter-list-item']").getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await page.mouse.move(hoverTarget.x, hoverTarget.y, { steps: 8 });
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.querySelector("[data-testid='open-character-sheet']").click());
    let frame = null;
    for (let i = 0; i < 30 && !frame; i++) {
        await page.waitForTimeout(1000);
        frame = page.frames().find((f) => f.url().includes("view=vtt")) || null;
    }
    if (frame) {
        // the content script's main() needs a few seconds to inject the pixel UI
        await frame.waitForSelector("#advButton", { timeout: 20000 }).catch(() => {});
    }
    return frame;
}

async function sentRolls(page) {
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
    if (!MAP_URL || !CHARACTER_URL) {
        console.error("DDB_MAP_URL and DDB_CHARACTER_URL are required, e.g.");
        console.error('  export DDB_MAP_URL="https://www.dndbeyond.com/games/1234567"');
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
        channel: "chromium",
        args: [
            `--disable-extensions-except=${EXTENSION_DIR}`,
            `--load-extension=${EXTENSION_DIR}`,
            "--disable-dev-shm-usage",
            "--renderer-process-limit=2",
            "--js-flags=--max-old-space-size=512",
            "--disable-gpu",
            "--disable-background-networking",
            "--disable-sync",
        ],
        viewport: { width: 1600, height: 900 },
    });

    await ctx.addInitScript(() => {
        if (navigator.bluetooth === undefined) {
            Object.defineProperty(navigator, "bluetooth", {
                value: { getAvailability: async () => true },
                configurable: true,
            });
        }
        window.__pixelsTest = { sent: [] };
        const origSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
            if (typeof data === "string") {
                window.__pixelsTest.sent.push(data);
            }
            return origSend.call(this, data);
        };
    });

    await ctx.addCookies(cookies);

    // block trackers only; the map itself renders image tiles / canvas, so
    // unlike smoke.js images are NOT blocked here
    const blockedHosts = /doubleclick|googlesyndication|googletagmanager|google-analytics|datadoghq|hotjar|ketchcdn|amazon-adsystem|adnxs|scorecardresearch|quantserve|nitropay|cookielaw/i;
    await ctx.route("**/*", (route) => {
        if (blockedHosts.test(new URL(route.request().url()).hostname)) {
            return route.abort();
        }
        return route.continue();
    });

    const page = await ctx.newPage();
    page.on("dialog", async (d) => {
        await d.dismiss();
    });

    let exitCode = 0;
    try {
        // The map page intermittently fails to load with D&D Beyond server
        // 500s; visiting a character sheet first + reload retries works around it.
        await page.goto(CHARACTER_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(8000);

        let loaded = false;
        for (let attempt = 0; attempt < 4 && !loaded; attempt++) {
            await page.goto(MAP_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
            await page.waitForTimeout(20000);
            loaded = await page.evaluate(() =>
                !!document.querySelector("[data-testid='rollDiceButton']") && !document.body.innerText.includes("Something went wrong")
            );
            if (!loaded) {
                console.log(`   map load attempt ${attempt + 1} failed, retrying…`);
            }
        }
        report("map page loads", loaded ? "PASS" : "FAIL", loaded ? "" : "still showing 'Something went wrong' after retries");
        if (!loaded) {
            await dumpArtifacts(page, "map-not-loaded");
            throw new Error("map did not load");
        }

        // ---- 1. top bar Pixels UI ----
        const topUi = await page.evaluate(() => {
            const ui = document.querySelector("#pixels-map-ui");
            if (!ui) return null;
            return {
                pixelModeButton: !!document.querySelector("#pixels-map-pixelmode"),
                connectButton: !!document.querySelector("#pixels-map-connect"),
                connectLabel: ui.querySelector("#pixels-map-connect span")?.textContent || "",
                inRightButtons: !!ui.closest("[class*='rightButtons']"),
            };
        });
        report(
            "top bar Pixels UI injected",
            topUi && topUi.pixelModeButton && topUi.connectButton && topUi.inRightButtons ? "PASS" : "FAIL",
            topUi ? "" : "#pixels-map-ui missing"
        );

        // ---- 2. sheet iframe opens with hidden pixel UI ----
        const frame = await openSheetIframe(page);
        report("sheet iframe opens via sidebar", frame ? "PASS" : "FAIL");
        if (!frame) {
            await dumpArtifacts(page, "map-no-iframe");
            throw new Error("no sheet iframe");
        }
        const iframeState = await frame.evaluate(() => ({
            hiddenButton: !!document.querySelector("#pixel-mode-button"),
            hiddenDisplay: document.querySelector("#pixel-mode-button")?.style.display || "",
            infoBox: !!document.querySelector(".pixels-info-box"),
            connectLink: !!document.querySelector("[class*='pixels-connect']"),
            advButton: !!document.querySelector("#advButton"),
        }));
        report(
            "iframe pixel UI (hidden button, info box, no connect link)",
            iframeState.hiddenButton && iframeState.hiddenDisplay === "none" && iframeState.infoBox && iframeState.advButton && !iframeState.connectLink ? "PASS" : "FAIL",
            JSON.stringify(iframeState)
        );

        // ---- 3. top bar toggle flips iframe pixelMode (status round-trip) ----
        // wait until the top bar reflects the iframe state (3 s status poll)
        const readState = async () => ({
            mode: await frame.evaluate(() => typeof pixelMode !== "undefined" && pixelMode),
            active: await page.evaluate(() => document.querySelector("#pixels-map-pixelmode").classList.contains("pixels-map-active")),
        });
        let state = await readState();
        for (let i = 0; i < 8 && state.mode !== state.active; i++) {
            await page.waitForTimeout(1500);
            state = await readState();
        }
        const modeBefore = state.mode;
        const classBefore = state.active;
        await page.evaluate(() => document.querySelector("#pixels-map-pixelmode").click());
        await page.waitForTimeout(1500);
        let modeAfter = (await readState()).mode;
        let classAfter = (await readState()).active;
        for (let i = 0; i < 8 && modeAfter !== classAfter; i++) {
            await page.waitForTimeout(1500);
            modeAfter = (await readState()).mode;
            classAfter = (await readState()).active;
        }
        const toggled = modeBefore !== modeAfter && classBefore !== classAfter && modeAfter === classAfter;
        report("pixel mode toggle round-trip (top bar → iframe → status)", toggled ? "PASS" : "FAIL", `before=${modeBefore}/${classBefore} after=${modeAfter}/${classAfter}`);
        // leave pixel mode on for the roll below
        if (!modeAfter) {
            await page.evaluate(() => document.querySelector("#pixels-map-pixelmode").click());
            await page.waitForTimeout(1500);
        }

        // ---- 4. bridge roll lands on the top frame socket with correct context ----
        const gameId = MAP_URL.match(/games\/(\d+)/)?.[1] || "";
        await page.evaluate(() => {
            window.__pixelsTest.sent = [];
        });
        await frame.evaluate(() => rollDice("d20", 14));
        await page.waitForTimeout(4000);
        const rolls = await sentRolls(page);
        const pending = rolls.find((m) => m.eventType === "dice/roll/pending");
        const fulfilled = rolls.find((m) => m.eventType === "dice/roll/fulfilled");
        const rollOk =
            !!pending &&
            !!fulfilled &&
            pending.gameId === gameId &&
            fulfilled.data?.context?.name &&
            fulfilled.data?.rolls?.[0]?.result?.total === 14 &&
            fulfilled.data?.context?.entityId;
        report(
            "bridge roll submits pending + fulfilled on game-log socket",
            rollOk ? "PASS" : "FAIL",
            rollOk ? `${fulfilled.data.context.name} total=${fulfilled.data.rolls[0].result.total} gameId=${fulfilled.gameId}` : JSON.stringify(rolls.map((m) => m.eventType))
        );

        // ---- 5. dice popup above the roll dice button ----
        const popup = await page.evaluate(() => {
            const el = document.querySelector("[data-pixels-map-popup]");
            if (!el) return null;
            const anchor = document.querySelector("[data-testid='rollDiceButton']")?.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            return {
                text: el.innerText,
                aboveAnchor: anchor ? r.bottom < anchor.top + 5 : null,
            };
        });
        report(
            "dice popup appears above the dice button",
            popup && popup.aboveAnchor === true && /\d/.test(popup.text) ? "PASS" : "FAIL",
            popup ? popup.text.replace(/\n/g, " | ") : "no [data-pixels-map-popup]"
        );

        // ---- 6. game log: queued while closed, flushed to DOM-first, observer ----
        // the roll above was made with the log closed → its entry must be queued
        const logOpenNow = await page.evaluate(() => !!document.querySelector("[data-testid='gameLogListItem']"));
        await page.evaluate(() => document.querySelector("[data-testid='gameLogButton']").click());
        await page.waitForTimeout(2500);
        const logState = await page.evaluate(() => {
            const list = document.querySelector("[data-testid='gameLogListItem']")?.parentElement;
            if (!list) return null;
            return {
                count: list.children.length,
                firstIsPixels: !!(list.children[0].id || "").startsWith("pixels-gamelog-entry-"),
                pixelsEntries: Array.from(list.querySelectorAll("[id^='pixels-gamelog-entry-']")).length,
            };
        });
        report(
            "queued roll flushes to the log (DOM-first)",
            logState && logState.firstIsPixels && logState.pixelsEntries >= 1 ? "PASS" : "FAIL",
            logState ? JSON.stringify(logState) : "no game log list"
        );

        // simulated DDB live entry appended at the DOM end (DDB's quirk) — the
        // observer must move it to DOM-first so it stays visually chronological
        await page.evaluate(() => {
            const list = document.querySelector("[data-testid='gameLogListItem']").parentElement;
            const sample = list.querySelector("li");
            const li = document.createElement("li");
            li.setAttribute("data-testid", "gameLogListItem");
            li.className = sample.className;
            li.innerHTML = sample.innerHTML;
            const time = li.querySelector("p[class*='__time']");
            if (time) time.textContent = "just now";
            const result = li.querySelector("span[class*='__rollResult']");
            if (result) result.textContent = "20";
            list.appendChild(li);
        });
        await page.waitForTimeout(1500);
        const observerMoved = await page.evaluate(() => {
            const list = document.querySelector("[data-testid='gameLogListItem']").parentElement;
            const first = list.children[0];
            return (first.id || "").startsWith("pixels-gamelog-entry-") ? "pixels" : first.querySelector("span[class*='__rollResult']")?.textContent;
        });
        report(
            "observer moves live entry to DOM-first (column-reverse order)",
            observerMoved === "20" ? "PASS" : "FAIL",
            `DOM-first is now: ${observerMoved}`
        );

        const failed = results.filter((r) => r.status === "FAIL").length;
        exitCode = failed > 0 ? 1 : 0;
        console.log(`\n${results.length} checks: ${results.filter((r) => r.status === "PASS").length} passed, ${failed} failed, ${results.filter((r) => r.status === "WARN").length} warnings`);
    } catch (e) {
        exitCode = 1;
        console.error("FATAL:", e.message);
        await dumpArtifacts(page, "map-fatal");
    } finally {
        await ctx.close();
    }
    process.exit(exitCode);
})();
