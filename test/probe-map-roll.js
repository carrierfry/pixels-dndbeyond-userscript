// E2E: top bar connect/pixelmode behavior with and without sheet iframe
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
    let errors = [];
    page.on("pageerror", (err) => errors.push(String(err).slice(0, 200)));
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
    await page.waitForTimeout(2000);

    // 1. WITHOUT sheet iframe: pixel mode click -> hint appears
    await page.evaluate(() => document.querySelector("#pixels-map-pixelmode").click());
    await page.waitForTimeout(800);
    const hint = await page.evaluate(() => {
        const el = document.querySelector("[data-pixels-map-popup]");
        return el ? el.textContent : "(no hint)";
    });
    console.log("hint without iframe:", JSON.stringify(hint));
    await shot(page, "probe-950-hint");

    // 2. WITHOUT iframe: connect click -> should call requestMyPixel locally, no uncaught error
    await page.waitForTimeout(4500);
    await page.evaluate(() => document.querySelector("#pixels-map-connect").click());
    await page.waitForTimeout(2000);
    const connectLabel = await page.evaluate(() => ({
        label: document.querySelector("#pixels-map-connect span").textContent,
        badgeDisplay: document.querySelector("#pixels-map-connect .pixels-map-count").style.display || "(default)",
    }));
    console.log("connect button after click (no iframe):", JSON.stringify(connectLabel));

    // 3. open sheet iframe -> status flows, badge stays hidden at 0 dice, label constant
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
    await page.waitForTimeout(5000);
    const withIframe = await page.evaluate(() => ({
        label: document.querySelector("#pixels-map-connect span").textContent,
        badgeDisplay: document.querySelector("#pixels-map-connect .pixels-map-count").style.display || "(default)",
        pixelModeCls: document.querySelector("#pixels-map-pixelmode").className,
    }));
    console.log("connect button with iframe open:", JSON.stringify(withIframe));

    // 4. close the sheet -> button resets after poll
    await page.evaluate(() => {
        const closeBtn = Array.from(document.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "").toLowerCase().includes("close") && b.getBoundingClientRect().x < 400);
        if (closeBtn) closeBtn.click();
    });
    await page.waitForTimeout(8000);
    const afterClose = await page.evaluate(() => ({
        label: document.querySelector("#pixels-map-connect span").textContent,
        badgeDisplay: document.querySelector("#pixels-map-connect .pixels-map-count").style.display || "(default)",
        pixelModeCls: document.querySelector("#pixels-map-pixelmode").className,
        iframeCount: document.querySelectorAll("iframe[src*='view=vtt']").length,
    }));
    console.log("after sheet close:", JSON.stringify(afterClose));
    await shot(page, "probe-951-after-close");

    const realErrors = errors.filter((e) => !e.includes("Failed to execute 'json'"));
    console.log("page errors (filtered):", realErrors.length ? realErrors : "none");

    await ctx.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
