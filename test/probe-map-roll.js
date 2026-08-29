// E2E: pixel roll injects into the map game log (queued while closed)
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
            "--disable-dev-shm-usage", "--renderer-process-limit=2", "--js-flags=--max-old-space-size=512", "--disable-gpu", "--disable-background-networking", "--disable-sync",
        ],
        viewport: { width: 1600, height: 900 },
    });
    await ctx.addInitScript(() => {
        if (navigator.bluetooth === undefined) {
            Object.defineProperty(navigator, "bluetooth", { value: { getAvailability: async () => true }, configurable: true });
        }
    });
    await ctx.addCookies(loadCookies());

    const page = await ctx.newPage();
    page.on("pageerror", (err) => console.log("[pageerror]", String(err).slice(0, 300)));
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

    // open sheet iframe and roll TWICE while the game log is CLOSED
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
    await page.waitForTimeout(2000);
    await frame.evaluate(() => rollDice("d20", 9));
    await page.waitForTimeout(3000);

    const logClosed = await page.evaluate(() => ({
        hasList: !!document.querySelector("[data-testid='gameLogListItem']"),
        popup: !!document.querySelector("[data-pixels-map-popup]"),
    }));
    console.log("state with log closed (both rolls):", JSON.stringify(logClosed));
    await shot(page, "probe-960-log-closed");

    // open the game log -> queued entries must appear
    await page.evaluate(() => document.querySelector("[data-testid='gameLogButton']").click());
    await page.waitForTimeout(2000);
    const entries = await page.evaluate(() => {
        const list = document.querySelector("[data-testid='gameLogListItem']")?.parentElement;
        if (!list) return { list: false };
        return {
            list: true,
            count: list.children.length,
            pixelsEntries: Array.from(list.querySelectorAll("[id^='pixels-gamelog-entry-']")).map((e) => e.innerText.replace(/\n/g, " | ")),
            firstChildText: list.children[0]?.innerText.replace(/\n/g, " | ").slice(0, 80),
        };
    });
    console.log("game log after open:", JSON.stringify(entries, null, 1));
    await shot(page, "probe-961-log-open");

    // roll again while log is OPEN -> appears immediately
    await frame.evaluate(() => rollDice("d20", 20));
    await page.waitForTimeout(4000);
    const entries2 = await page.evaluate(() => {
        const list = document.querySelector("[data-testid='gameLogListItem']")?.parentElement;
        return {
            pixelsEntries: list ? Array.from(list.querySelectorAll("[id^='pixels-gamelog-entry-']")).map((e) => e.innerText.replace(/\n/g, " | ")) : [],
        };
    });
    console.log("after roll with log open:", JSON.stringify(entries2, null, 1));
    await shot(page, "probe-962-log-live");

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
