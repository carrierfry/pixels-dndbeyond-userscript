// E2E: render pixel map popup and screenshot for visual comparison with DDB popup
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
    page.on("pageerror", (err) => console.log("[pageerror]", String(err).slice(0, 400)));
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

    // render our popup directly (synthetic fulfilled payload, check roll like the user's screenshot)
    const res = await page.evaluate(() => {
        const payload = JSON.stringify({
            id: "x", dateTime: Date.now(), gameId: "5307773", userId: "110040536", source: "web",
            data: { action: "intimidation", rollId: "r1", rolls: [{ diceNotationStr: "1d20", rollType: "check", rollKind: "", result: { constant: 0, values: [9], total: 9, text: "9" } }], context: { entityId: "116332191", entityType: "character", name: "OHNEBILD" } },
            entityId: "116332191", entityType: "character", eventType: "dice/roll/fulfilled", persist: true, messageScope: "gameId", messageTarget: "5307773",
        });
        try {
            showMapRollPopup(payload);
            const el = document.querySelector("[data-pixels-map-popup]");
            if (!el) return "(no popup)";
            const r = el.getBoundingClientRect();
            const a = document.querySelector("[data-testid='rollDiceButton']").getBoundingClientRect();
            return { text: el.innerText, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, anchor: { right: Math.round(a.right), y: Math.round(a.y) } };
        } catch (e) {
            return "ERROR: " + e.message;
        }
    });
    console.log("pixel popup:", JSON.stringify(res, null, 1));
    await page.screenshot({ path: path.join(__dirname, "artifacts", "probe-800-pixel-popup-styled.png") });

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
