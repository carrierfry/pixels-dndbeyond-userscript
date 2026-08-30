// E2E: observer moves native-style live entries to DOM-first (visually chronological)
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

    // open sheet iframe
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

    // pixel roll (queue fills, poller + observer activate), then open the log
    await frame.evaluate(() => rollDice("d20", 14));
    await page.waitForTimeout(2500);
    await page.evaluate(() => document.querySelector("[data-testid='gameLogButton']").click());
    await page.waitForTimeout(2500);

    const snap = () => page.evaluate(() => {
        const list = document.querySelector("[data-testid='gameLogListItem']")?.parentElement;
        if (!list) return null;
        return Array.from(list.children).slice(0, 3).map((c) => {
            const ours = !!(c.id && c.id.startsWith("pixels-gamelog-entry-"));
            const t = c.querySelector("p[class*='__time']");
            const r = c.querySelector("span[class*='__rollResult']");
            return (ours ? "[PX] " : "[NV] ") + (r ? r.textContent : "?") + " @ " + (t ? t.textContent : "?");
        });
    });

    console.log("after pixel entry flush (DOM first 3):", JSON.stringify(await snap()));

    // simulate DDB's live insertion: native-style li appended at DOM END
    await page.evaluate(() => {
        const list = document.querySelector("[data-testid='gameLogListItem']").parentElement;
        const sample = list.querySelector("li");
        const li = document.createElement("li");
        li.setAttribute("data-testid", "gameLogListItem");
        li.className = sample.className;
        li.innerHTML = sample.innerHTML;
        const t = li.querySelector("p[class*='__time']");
        if (t) t.textContent = "just now";
        const r = li.querySelector("span[class*='__rollResult']");
        if (r) r.textContent = "20";
        list.appendChild(li);
    });
    await page.waitForTimeout(1500);
    const after = await snap();
    console.log("after simulated live entry (should be DOM-first):", JSON.stringify(after));
    const ok = after && after[0] && after[0].startsWith("[NV]") && after[0].includes("just now");
    console.log("observer moved live entry to DOM-first:", !!ok);
    await page.screenshot({ path: path.join(__dirname, "artifacts", "probe-995-observer.png") });

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
