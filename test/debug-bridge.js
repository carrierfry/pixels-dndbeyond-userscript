// Verify the roll message context sent through the bridge
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
        window.__wsSent = [];
        const origSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
            if (typeof data === "string" && data.includes("dice/roll")) window.__wsSent.push(data);
            return origSend.call(this, data);
        };
    });
    await ctx.addCookies(loadCookies());

    const page = await ctx.newPage();
    await page.goto("https://www.dndbeyond.com/characters/48300614", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(10000);
    await page.goto(MAP_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(25000);
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
    await page.waitForTimeout(15000);

    const frame = page.frames().find((f) => f.url().includes("view=vtt"));
    if (!frame) throw new Error("no vtt frame");

    await frame.evaluate(() => rollDice("d20", 14));
    await page.waitForTimeout(4000);

    const sent = await page.evaluate(() => window.__wsSent);
    console.log("sent roll messages:", sent.length);
    for (const m of sent) {
        const json = JSON.parse(m);
        console.log(JSON.stringify({
            eventType: json.eventType,
            userId: json.userId,
            gameId: json.gameId,
            entityId: json.entityId,
            context: json.data.context,
            roll: json.data.rolls && json.data.rolls[0] ? {
                rollType: json.data.rolls[0].rollType,
                diceNotationStr: json.data.rolls[0].diceNotationStr,
                total: json.data.rolls[0].result ? json.data.rolls[0].result.total : undefined,
                values: json.data.rolls[0].result ? json.data.rolls[0].result.values : undefined,
            } : null,
        }, null, 1));
    }

    // screenshot: does the roll show up in the map game log?
    await page.evaluate(() => document.querySelector("[aria-roledescription='Game Log'], [class*='GameLogButton'], [class*='gameLog']")?.click());
    await page.waitForTimeout(3000);
    fs.mkdirSync(path.join(__dirname, "artifacts"), { recursive: true });
    await page.screenshot({ path: path.join(__dirname, "artifacts", "map-300-gamelog.png") });
    console.log("screenshot: test/artifacts/map-300-gamelog.png");

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
