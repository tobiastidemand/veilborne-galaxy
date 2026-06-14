import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const url = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "scripts/shot.png";
// actions: comma-separated, e.g. "click:800,430;wait:3500;click:980,360;wait:1200"
const actions = process.argv[4] ?? "";

const mobile = process.argv.includes("mobile");
const vp = mobile
  ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : { width: 1600, height: 900 };
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: [
    "--enable-unsafe-swiftshader",
    `--window-size=${vp.width},${vp.height}`,
  ],
  defaultViewport: vp,
});

const page = await browser.newPage();
if (process.argv[5] === "reduced") {
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
}
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector("canvas, h1", { timeout: 30000 });
await new Promise((r) => setTimeout(r, 4000));

for (const step of actions.split(";").map((s) => s.trim()).filter(Boolean)) {
  const [cmd, arg] = step.split(":");
  if (cmd === "click") {
    const [x, y] = arg.split(",").map(Number);
    await page.mouse.click(x, y);
  } else if (cmd === "move") {
    const [x, y] = arg.split(",").map(Number);
    await page.mouse.move(x, y);
  } else if (cmd === "wheel") {
    // arg = "x,y,deltaY,steps"
    const [x, y, dy, steps] = arg.split(",").map(Number);
    await page.mouse.move(x, y);
    for (let s = 0; s < (steps || 1); s++) {
      await page.mouse.wheel({ deltaY: dy });
      await new Promise((r) => setTimeout(r, 60));
    }
  } else if (cmd === "wait") {
    await new Promise((r) => setTimeout(r, Number(arg)));
  }
}

await page.screenshot({ path: out });
console.log(`SHOT ${out}`);
console.log(errors.length ? "ERRORS:\n  " + errors.slice(0, 10).join("\n  ") : "NO_CONSOLE_ERRORS");
await browser.close();
