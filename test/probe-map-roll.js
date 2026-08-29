// Debug: why doesn't the map popup appear?
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
        window.__postMessages = [];
        window.addEventListener("message", (e) => { if (window.__postMessages.length < 50) window.__postMessages.push({ data: typeof e.data === "string" ? e.data.slice(0, 200) : JSON.stringify(e.data).slice(0, 300), origin: e.origin }); });
    });
    await ctx.addCookies(loadCookies());

    const page = await ctx.newPage();
    page.on("pageerror", (err) => console.log("[pageerror]", String(err).slice(0, 500)));
    page.on("console", (m) => { if (m.type() === "error") console.log("[console]", m.text().slice(0, 200)); });
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
    await page.waitForTimeout(15000);
    const frame = page.frames().find((f) => f.url().includes("view=vtt"));
    if (!frame) throw new Error("no vtt frame");

    console.log("top frame path:", await page.evaluate(() => window.location.pathname));
    console.log("top has showMapRollPopup:", await page.evaluate(() => typeof showMapRollPopup));

    // call showMapRollPopup directly with a synthetic fulfilled payload
    const direct = await page.evaluate(() => {
        const payload = JSON.stringify({
            id: "x", dateTime: Date.now(), gameId: "5307773", userId: "110040536", source: "web",
            data: { action: "custom", rollId: "r1", rolls: [{ diceNotationStr: "1d20", rollType: "check", rollKind: "", result: { constant: 0, values: [14], total: 14, text: "14" } }], context: { entityId: "116332191", entityType: "character", name: "OHNEBILD" } },
            entityId: "116332191", entityType: "character", eventType: "dice/roll/fulfilled", persist: true, messageScope: "gameId", messageTarget: "5307773",
        });
        try {
            showMapRollPopup(payload);
            const el = document.querySelector("[data-pixels-map-popup]");
            return el ? el.innerText : "(no popup)";
        } catch (e) {
            return "ERROR: " + e.message;
        }
    });
    console.log("direct call result:", JSON.stringify(direct));
    await page.screenshot({ path: path.join(__dirname, "artifacts", "probe-600-direct-popup.png") });

    // now via postMessage from iframe
    await page.evaluate(() => { window.__postMessages = []; });
    await frame.evaluate(() => rollDice("d20", 14));
    await page.waitForTimeout(2500);
    const viaMsg = await page.evaluate(() => ({ captured: window.__postMessages, popup: !!document.querySelector("[data-pixels-map-popup]") }));
    console.log("via postMessage:", JSON.stringify(viaMsg, null, 1));
    await page.screenshot({ path: path.join(__dirname, "artifacts", "probe-601-via-message.png") });

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
