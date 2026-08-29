// E2E: ordering of pixel vs virtual entries in the map game log
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
            "--disable-dev-shm-usage", "--renderer-process-limit=2", "--js-flags=--max-old-space-size=512", "--disable-gpu",
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
    page.on("pageerror", (err) => console.log("[pageerror]", String(err).slice(0, 200)));
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

    // open sheet, roll pixel (log closed -> queued)
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
    await page.waitForTimeout(2500);

    // open log -> pixel entry flushes
    await page.evaluate(() => document.querySelector("[data-testid='gameLogButton']").click());
    await page.waitForTimeout(2500);

    const snap = () => page.evaluate(() => {
        const list = document.querySelector("[data-testid='gameLogListItem']")?.parentElement;
        if (!list) return null;
        return Array.from(list.children).slice(0, 5).map((c) => {
            const ours = !!(c.id && c.id.startsWith("pixels-gamelog-entry-"));
            const t = c.querySelector("p[class*='__time']");
            const r = c.querySelector("span[class*='__rollResult']");
            return (ours ? "[PX] " : "[NV] ") + (r ? r.textContent : "?") + " @ " + (t ? t.textContent : "?");
        });
    });

    console.log("after pixel roll flush:", JSON.stringify(await snap(), null, 1));

    // roll a virtual d20 via the dice panel (native path) while log is open
    await page.evaluate(() => document.querySelector("[data-testid='rollDiceButton']").click());
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll("button, [role='button'], li, div")).find((e) => (e.innerText || "").trim() === "d20");
        if (el) el.click();
    });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll("button")).find((e) => /^roll$/i.test((e.innerText || "").trim()));
        if (el) el.click();
    });
    await page.waitForTimeout(4000);
    console.log("after virtual roll:", JSON.stringify(await snap(), null, 1));
    await shot(page, "probe-970-ordering");

    // our pixel entry time must have been refreshed by the poller (not stale "just now" forever)
    await page.waitForTimeout(65000);
    const pixelTime = await page.evaluate(() => {
        const el = document.querySelector("[id^='pixels-gamelog-entry-'] p[class*='__time']");
        return el ? el.textContent : "(none)";
    });
    console.log("pixel entry time after 65s:", pixelTime);

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
