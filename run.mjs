// usage: PW_DIR=<dir with node_modules/playwright> node run.mjs <chromium|webkit> <url> <runs>
import { createRequire } from "node:module";
const require = createRequire(process.env.PW_DIR + "/x.js");
const pw = require("playwright");
const [engine, url, runs] = [process.argv[2], process.argv[3], Number(process.argv[4])];
const browser = await pw[engine].launch();
let hits = 0, stack = "";
for (let i = 0; i < runs; i++) {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message + "\n" + (e.stack ?? "")));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(url);
  await page.waitForSelector("ion-app.hydrated");
  await page.click("#both");
  await page.waitForTimeout(1500);
  const bad = errs.find((e) => /Maximum call stack|RangeError/.test(e));
  if (bad) { hits++; stack ||= bad; }
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ engine, url, runs, rangeErrors: hits }));
if (stack) console.log(stack.split("\n").slice(0, 8).join("\n"));
