// Deterministic screenshots of the running Portal for design review.
// Usage: node apps/web/scripts/shoot.mjs [baseUrl]
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] || "http://127.0.0.1:5175";
const OUT = new URL("../../../.impeccable/review/", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  "$1",
);
mkdirSync(OUT, { recursive: true });

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const shots = [
  { file: "desktop.png", url: "/?theme=light", w: 1440, h: 1024, full: true },
  { file: "desktop-dark.png", url: "/?theme=dark", w: 1440, h: 1024, full: true },
  { file: "mobile.png", url: "/?theme=light", w: 390, h: 844, full: true, mobile: true },
  {
    file: "detail-desktop.png",
    url: "/r/linear-command-menu-2026-08-27?theme=light",
    w: 1440,
    h: 1024,
    full: true,
  },
  {
    file: "detail-mobile.png",
    url: "/r/linear-command-menu-2026-08-27?theme=light",
    w: 390,
    h: 844,
    full: true,
    mobile: true,
  },
  {
    file: "detail-edit-desktop.png",
    url: "/r/linear-command-menu-2026-08-27?theme=light&edit=1",
    w: 1440,
    h: 1024,
    full: true,
  },
  {
    file: "detail-dislike-dark.png",
    url: "/r/enterprise-iam-settings-2026-08-21?theme=dark",
    w: 1440,
    h: 1024,
    full: true,
  },
  { file: "removed-empty-desktop.png", url: "/removed?theme=light", w: 1440, h: 700, full: true },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
});

const settle = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 450));
};

for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({
    width: s.w,
    height: s.h,
    deviceScaleFactor: s.mobile ? 2 : 1,
    isMobile: !!s.mobile,
    hasTouch: !!s.mobile,
  });
  await page.goto(BASE + s.url, { waitUntil: "networkidle0", timeout: 30000 });
  await settle(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  await page.screenshot({ path: OUT + s.file, fullPage: s.full });
  console.log(
    `${s.file.padEnd(28)} ${s.w}px  h-overflow:${overflow}px${overflow > 1 ? "  <-- CHECK" : ""}`,
  );
  await page.close();
}

// Populated "Recently removed": drive the real remove flow, then screenshot.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 1 });
  await page.goto(BASE + "/r/cosmos-infinite-canvas-2026-08-15?theme=light", {
    waitUntil: "networkidle0",
    timeout: 30000,
  });
  await settle(page);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /remove/i.test(b.textContent || ""),
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 200));
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /take it down/i.test(b.textContent || ""),
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.goto(BASE + "/removed?theme=light", { waitUntil: "networkidle0" });
  await settle(page);
  await page.screenshot({ path: OUT + "removed-populated-desktop.png", fullPage: true });
  console.log("removed-populated-desktop.png    (drove remove flow)");
  await page.close();
}

await browser.close();
