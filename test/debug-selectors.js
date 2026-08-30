// Probe: where does DDB insert a new native roll into the map game log?
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

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
        args: ["--disable-dev-shm-usage", "--renderer-process-limit=2", "--js-flags=--max-old-space-size=512", "--disable-gpu"],
        viewport: { width: 1600, height: 900 },
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
    await page.evaluate(() => document.querySelector("[data-testid='gameLogButton']").click());
    await page.waitForTimeout(2000);

    const snap = () => page.evaluate(() => {
        const list = document.querySelector("[data-testid='gameLogListItem']")?.parentElement;
        if (!list) return null;
        const rows = Array.from(list.children).slice(0, 6).map((c) => {
            const t = c.querySelector("p[class*='__time']");
            const r = c.querySelector("span[class*='__rollResult']");
            return (r ? r.textContent : "?") + "@" + (t ? t.textContent : "?");
        });
        return { count: list.children.length, top3: rows.slice(0, 3), bottom2: rows.slice(-2) };
    });

    console.log("before:", JSON.stringify(await snap()));

    // roll d20 via dice panel (native path)
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

    console.log("after native roll:", JSON.stringify(await snap()));

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
