// E2E verification of map VTT support: pixel UI in the sheet iframe + roll via bridge
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const EXTENSION_DIR = path.resolve(__dirname, "..", "chrome_extension");
const PROFILE_DIR = path.join(__dirname, ".profile");
const COOKIES_PATH = process.env.DDB_COOKIES || path.join(__dirname, "cookies.json");
const MAP_URL = process.env.DDB_MAP_URL || "https://www.dndbeyond.com/games/5307773";

function loadCookies() {
    const text = fs.readFileSync(COOKIES_PATH, "utf8");
    let raw;
    try { raw = JSON.parse(text); } catch {
        const curlCookieFlag = text.match(/(?:-b|--cookie)\s+(['"])([\s\S]*?)\1/);
        const header = curlCookieFlag?.[2] || text.trim();
        raw = header.split(/;\s*/).filter(Boolean).map((pair) => {
            const i = pair.indexOf("=");
            return { name: pair.slice(0, i), value: pair.slice(i + 1), domain: ".dndbeyond.com" };
        });
    }
    if (!Array.isArray(raw) && Array.isArray(raw.cookies)) raw = raw.cookies;
    return raw.map((c) => {
        const cookie = { name: c.name, value: c.value, domain: c.domain, path: c.path || "/", secure: !!c.secure, httpOnly: !!c.httpOnly };
        if (c.expirationDate) cookie.expires = Math.floor(c.expirationDate);
        cookie.sameSite = "Lax";
        return cookie;
    });
}
async function shot(page, name) {
    fs.mkdirSync(path.join(__dirname, "artifacts"), { recursive: true });
    await page.screenshot({ path: path.join(__dirname, "artifacts", `${name}.png`) });
    console.log(`   screenshot: test/artifacts/${name}.png`);
}

(async () => {
    const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
        headless: true,
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
            Object.defineProperty(navigator, "bluetooth", { value: { getAvailability: async () => true }, configurable: true });
        }
        window.__wsLog = { created: [] };
        const NativeWS = window.WebSocket;
        window.WebSocket = function (url, protocols) {
            const ws = new NativeWS(url, protocols);
            const entry = { url: String(url).split("?")[0], opened: false, sent: [] };
            window.__wsLog.created.push(entry);
            ws.addEventListener("open", () => { entry.opened = true; });
            const origSend = ws.send.bind(ws);
            ws.send = (data) => {
                entry.sent.push(typeof data === "string" ? data.slice(0, 300) : "(binary)");
                return origSend(data);
            };
            return ws;
        };
        window.WebSocket.prototype = NativeWS.prototype;
    });
    await ctx.addCookies(loadCookies());

    const page = await ctx.newPage();
    await page.goto("https://www.dndbeyond.com/characters/48300614", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(10000);
    await page.goto(MAP_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(25000);
    for (let i = 0; i < 5; i++) {
        if (!(await page.evaluate(() => document.body.innerText.includes("Something went wrong")))) break;
        await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(20000);
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.querySelector("[data-testid='sidebar-button']")?.click());
    await page.waitForTimeout(2500);
    await page.evaluate(() => document.querySelector("[data-testid='encounter-list-item'] summary")?.click());
    await page.waitForTimeout(1000);
    const box = await page.evaluate(() => {
        const r = document.querySelector("[data-testid='encounter-list-item']").getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await page.mouse.move(box.x, box.y, { steps: 8 });
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.querySelector("[data-testid='open-character-sheet']").click());
    console.log("sheet iframe opened");
    await page.waitForTimeout(15000);

    const frame = page.frames().find((f) => f.url().includes("view=vtt"));
    if (!frame) throw new Error("no vtt frame");

    // 1. pixel UI injected in the iframe?
    const ui = await frame.evaluate(() => ({
        pixelModeButton: !!document.querySelector("#pixel-mode-button"),
        connectToPixels: !!Array.from(document.querySelectorAll("a, div")).find((e) => e.innerText && e.innerText.trim() === "Connect to Pixels"),
        infoBox: !!document.querySelector(".pixels-info-box"),
        diceOverview: !!document.querySelector(".dice-overview-box"),
        windowPixels: Array.isArray(window.pixels),
    }));
    console.log("iframe pixel UI:", JSON.stringify(ui, null, 1));
    await shot(page, "map-200-pixel-ui");

    // 2. enable pixel mode in the iframe (one-shot click on the button)
    await frame.evaluate(() => document.querySelector("#pixel-mode-button").click());
    await page.waitForTimeout(2000);

    // 3. arm a roll: click a d20-ish dice button via the swapped handler (pixel mode on)
    //    simpler: call rollDice directly with an armed expectation via pixelModeClickHandler
    const armed = await frame.evaluate(() => {
        const btn = document.querySelectorAll(".integrated-dice__container")[1];
        if (!btn) return false;
        btn.click();
        return typeof currentlyExpectedRoll !== "undefined" ? Object.keys(currentlyExpectedRoll) : [];
    });
    console.log("armed roll keys:", JSON.stringify(armed));
    await page.waitForTimeout(1000);

    // 4. roll and verify the message lands in the TOP frame socket
    const before = await page.evaluate(() => (window.__wsLog?.created || []).map((c) => c.sent.length));
    await frame.evaluate(() => rollDice("d20", 14));
    await page.waitForTimeout(4000);
    const report = [];
    for (const f of page.frames()) {
        try {
            const info = await f.evaluate(() => ({
                href: location.href.slice(0, 80),
                sent: (window.__wsLog?.created || []).map((c) => ({ url: c.url, sentCount: c.sent.length, last: c.sent.slice(-2) })),
            }));
            report.push(info);
        } catch {}
    }
    console.log("=== WS TRAFFIC AFTER rollDice(d20,14) ===");
    for (const fr of report) {
        console.log("FRAME", fr.href);
        for (const ws of fr.sent) {
            console.log(`  ws ${ws.url} sent=${ws.sentCount}`);
            ws.last.forEach((s) => console.log("    >", s.replace(/\n/g, " ").slice(0, 250)));
        }
    }
    await shot(page, "map-201-after-roll");

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
