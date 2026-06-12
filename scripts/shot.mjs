import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const url = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "scripts/shot.png";
const actions = process.argv[4] ?? "";

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: ["--enable-unsafe-swiftshader", "--window-size=1600,900"],
  defaultViewport: { width: 1600, height: 900 },
});

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 30000 });
await new Promise((r) => setTimeout(r, 4000));

if (actions === "click-center-star") {
  // click roughly at Solara Prime (screen center)
  await page.mouse.click(800, 430);
  await new Promise((r) => setTimeout(r, 3500));
}

await page.screenshot({ path: out });
console.log(`SHOT ${out}`);
if (errors.length) {
  console.log("ERRORS:");
  errors.slice(0, 10).forEach((e) => console.log("  " + e));
} else {
  console.log("NO_CONSOLE_ERRORS");
}
await browser.close();
