// CX review screenshot capture (Phase 0). Not part of the app bundle — a
// reproducible tool for re-running the review. Captures the public conversion
// surfaces at 4 viewports and logs any console errors per route.
import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Run from repo root with the dev server up: `node cx-review/capture.mjs`.
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "screenshots");
const BASE = "http://localhost:3000";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

// Public (unauthenticated) routes — the visitor→customer funnel.
const ROUTES = [
  { path: "/", name: "home" },
  { path: "/login", name: "login" },
  { path: "/register", name: "register" },
  { path: "/forgot-password", name: "forgot-password" },
  { path: "/docs/index", name: "docs" },
  { path: "/architectures", name: "architectures-gated" }, // auth-gated: expect redirect to /login
];

const browser = await chromium.launch();
const report = [];

for (const route of ROUTES) {
  const consoleErrors = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await ctx.newPage();
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push("[pageerror] " + e.message));
    try {
      await page.goto(`${BASE}${route.path}`, {
        waitUntil: "networkidle",
        timeout: 15000,
      });
    } catch (e) {
      consoleErrors.push("[nav] " + e.message);
    }
    await page.waitForTimeout(600);
    const dir = `${OUT}/${route.name}`;
    mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/${vp.name}.png`, fullPage: true });
    const url = page.url();
    if (vp.name === "desktop")
      report.push({ route: route.name, landedUrl: url });
    await ctx.close();
  }
  const uniq = [...new Set(consoleErrors)];
  console.log(
    `${route.name}: ${uniq.length ? uniq.length + " console error(s)" : "clean"}`,
  );
  uniq.forEach((e) => console.log("   " + e.slice(0, 140)));
}

console.log("\nLanded URLs (desktop):");
report.forEach((r) => console.log(`  ${r.route} → ${r.landedUrl}`));
await browser.close();
