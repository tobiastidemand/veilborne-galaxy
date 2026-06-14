import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const url = process.argv[2];
const tag = process.argv[3] ?? "out";
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: ["--enable-unsafe-swiftshader", "--window-size=1600,900"],
  defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 30000 });
await new Promise((r) => setTimeout(r, 4500));
await page.screenshot({ path: `scripts/${tag}-nav.png`, clip: { x: 0, y: 0, width: 1600, height: 130 } });
await page.screenshot({ path: `scripts/${tag}-legend.png`, clip: { x: 0, y: 560, width: 360, height: 340 } });
await page.screenshot({ path: `scripts/${tag}-panel.png`, clip: { x: 1230, y: 0, width: 370, height: 900 } });
await page.screenshot({ path: `scripts/${tag}-junction.png`, clip: { x: 1180, y: 0, width: 420, height: 180 } });
await page.screenshot({ path: `scripts/${tag}-rail.png`, clip: { x: 1226, y: 380, width: 130, height: 220 } });
await page.screenshot({ path: `scripts/${tag}-back.png`, clip: { x: 0, y: 90, width: 320, height: 100 } });
await page.screenshot({ path: `scripts/${tag}-bottom.png`, clip: { x: 1226, y: 838, width: 260, height: 56 } });
console.log("OK");
await browser.close();
