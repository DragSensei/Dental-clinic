import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

const THEMES = ["light", "dark"];
const LOCALES = ["en", "ar"];

const outputDir = path.resolve(process.cwd(), ".audit/screenshots");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function runAudit() {
  console.log("Starting visual audit across 12 combinations...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      for (const locale of LOCALES) {
        const key = `${vp.name}-${theme}-${locale}`;
        console.log(`Auditing ${key} (${vp.width}x${vp.height})...`);

        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          locale: locale === "ar" ? "ar-EG" : "en-US",
        });

        await context.addInitScript(({ themeVal, localeVal }) => {
          try {
            window.localStorage.setItem("dental-demo-theme", themeVal);
            window.localStorage.setItem("dental-demo-locale", localeVal);
          } catch (e) {}
        }, { themeVal: theme, localeVal: locale });

        const page = await context.newPage();
        await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

        // Ensure theme class and dir/lang attributes are synchronized
        await page.evaluate(({ themeVal, localeVal }) => {
          if (themeVal === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          document.documentElement.dir = localeVal === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = localeVal === "ar" ? "ar" : "en-US";
        }, { themeVal: theme, localeVal: locale });

        // Wait a tick for fonts/animations
        await page.waitForTimeout(300);

        // 1. Horizontal stability check
        const overflow = await page.evaluate(() => {
          const scrollW = document.documentElement.scrollWidth;
          const clientW = document.documentElement.clientWidth;
          return {
            hasOverflow: scrollW > clientW,
            delta: scrollW - clientW,
            scrollW,
            clientW,
          };
        });

        // 2. Touch target audit (on mobile 375)
        let touchAudit = { total: 0, passing: 0, failing: [] };
        if (vp.name === "mobile") {
          touchAudit = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll("button, a, input, select, [role='button']"));
            let passing = 0;
            const failing = [];
            for (const el of elements) {
              // Ignore hidden elements
              const style = window.getComputedStyle(el);
              if (style.display === "none" || style.visibility === "hidden" || el.offsetParent === null) continue;
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;
              // Ignore links deeply nested in paragraphs (prose)
              if (el.tagName === "A" && el.closest("p")) continue;

              if (rect.width >= 43.5 && rect.height >= 43.5) {
                passing++;
              } else {
                failing.push({
                  tag: el.tagName,
                  text: (el.textContent || "").trim().slice(0, 30),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                  className: el.className,
                });
              }
            }
            return { total: passing + failing.length, passing, failing };
          });
        }

        // 3. Mobile above-the-fold check: is the 'Next available' card visible on 375x667?
        let mobileAboveFold = null;
        if (vp.name === "mobile") {
          mobileAboveFold = await page.evaluate(() => {
            const card = document.querySelector("#home .rounded-2xl");
            if (!card) return false;
            const rect = card.getBoundingClientRect();
            // Visible if top is within viewport
            return {
              top: rect.top,
              bottom: rect.bottom,
              height: rect.height,
              inViewport: rect.top < 667 && rect.bottom > 0,
            };
          });
        }

        // 4. Capture screenshot
        const screenshotPath = path.join(outputDir, `${key}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        results.push({
          key,
          viewport: `${vp.width}x${vp.height}`,
          theme,
          locale,
          overflow: overflow.hasOverflow ? `FAIL (+${overflow.delta}px)` : "PASS",
          touchTargets: vp.name === "mobile" ? `${touchAudit.passing}/${touchAudit.total}` : "N/A",
          touchFailing: touchAudit.failing,
          mobileAboveFold,
          screenshotPath,
        });

        await context.close();
      }
    }
  }

  await browser.close();

  console.log("\n================ AUDIT SUMMARY ================");
  console.table(
    results.map((r) => ({
      Scenario: r.key,
      Dimensions: r.viewport,
      Overflow: r.overflow,
      TouchPass: r.touchTargets,
      AboveFold: r.mobileAboveFold ? (r.mobileAboveFold.inViewport ? "YES" : "NO") : "-",
    }))
  );

  const hasFailingOverflow = results.some((r) => r.overflow !== "PASS");
  const failingTouches = results.flatMap((r) => r.touchFailing || []);

  if (hasFailingOverflow) {
    console.error("FAIL: Horizontal overflow detected in one or more scenarios!");
  }
  if (failingTouches.length > 0) {
    console.warn(`WARNING: Found ${failingTouches.length} touch targets below 44px:`, failingTouches.slice(0, 5));
  }

  console.log(`\nAll 12 screenshots written to: ${outputDir}`);
  return { results, hasFailingOverflow, failingTouches };
}

runAudit().catch(console.error);
