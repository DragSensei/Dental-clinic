import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function generate() {
  const sourceImage = path.resolve("public/dental-visit-hero.png");
  if (!fs.existsSync(sourceImage)) {
    console.error("source dental-visit-hero.png not found!");
    return;
  }
  const base64Data = fs.readFileSync(sourceImage).toString("base64");
  const dataUri = `data:image/png;base64,${base64Data}`;

  const browser = await chromium.launch({ channel: "msedge", headless: true });

  // 1. Desktop: 2400x1350 (16:9)
  // Subject in the right third; left 55% is calm negative space
  const page = await browser.newPage({ viewport: { width: 2400, height: 1350 } });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 2400px;
          height: 1350px;
          overflow: hidden;
          background: #f7fafc;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 82% 40%;
        }
      </style>
    </head>
    <body>
      <img src="${dataUri}" alt="Clinic Hero Desktop" />
    </body>
    </html>
  `);
  await page.screenshot({
    path: "public/images/demo/hero-desktop.jpg",
    type: "jpeg",
    quality: 92,
  });
  await page.close();

  // 2. Mobile: 1080x1350 (4:5)
  // Subject in the upper half; lower half calm for text
  const mobilePage = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await mobilePage.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1080px;
          height: 1350px;
          overflow: hidden;
          background: #f7fafc;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 65% 15%;
        }
      </style>
    </head>
    <body>
      <img src="${dataUri}" alt="Clinic Hero Mobile" />
    </body>
    </html>
  `);
  await mobilePage.screenshot({
    path: "public/images/demo/hero-mobile.jpg",
    type: "jpeg",
    quality: 92,
  });
  await mobilePage.close();

  await browser.close();
  console.log("Successfully generated real photo assets: hero-desktop.jpg and hero-mobile.jpg");
}

generate().catch(console.error);
