// Debug 2: inspect getGameLogMessageCssHash() + li.innerHTML in live page
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

    const res = await page.evaluate(() => {
        const list = document.querySelector("[data-testid='gameLogListItem']")?.parentElement || document.querySelector("[class*='messagesContainer'] ol");
        if (!list) return "(no list)";
        const json = {
            id: "x", dateTime: Date.now(), gameId: "5307773", userId: "110040536", source: "web",
            data: { action: "custom", rollId: "debug-2", rolls: [{ diceNotation: { set: [{ count: 1, dieType: "d20", dice: [], operation: 0 }], constant: 2 }, diceNotationStr: "1d20 + 2", rollType: "check", rollKind: "", result: { constant: 2, values: [6], total: 8, text: "6+2" } }], context: { entityId: "116332191", entityType: "character", name: "OHNEBILD" } },
            eventType: "dice/roll/fulfilled",
        };
        const log = [];
        const origQS = Element.prototype.querySelector;
        Element.prototype.querySelector = function (sel) {
            const r = origQS.call(this, sel);
            if (!r) {
                Element.prototype.querySelector = origQS;
                try { throw new Error("miss on: " + sel + " | gm-ish innerHTML: " + this.innerHTML.slice(0, 300)); } finally { }
            }
            return r;
        };
        try {
            appendMapGamelogEntry({ id: "x", dateTime: Date.now(), data: { action: "custom", rollId: "debug-2", rolls: [{ diceNotation: { set: [{ count: 1, dieType: "d20", dice: [], operation: 0 }], constant: 2 }, diceNotationStr: "1d20 + 2", rollType: "check", rollKind: "", result: { constant: 2, values: [6], total: 8, text: "6+2" } }], context: { name: "OHNEBILD" } }, eventType: "dice/roll/fulfilled" }, list);
            return { ok: true, first: list.children[0].innerText.replace(/\n/g, " | ") };
        } catch (e) {
            return { error: e.message, log: window.__qsLog || null };
        }
    });
    console.log(JSON.stringify(res, null, 1));
    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
