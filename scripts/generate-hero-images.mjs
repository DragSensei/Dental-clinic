import { chromium } from "playwright";

async function generate() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  // 1. Desktop: 2400x1350 (16:9)
  const page = await browser.newPage({ viewport: { width: 2400, height: 1350 } });
  const desktopHtml = `
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
        background: linear-gradient(120deg, #f5f9fc 0%, #eaf2f8 40%, #e1ecf4 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        position: relative;
      }
      /* Soft natural daylight from top-left */
      .window-light {
        position: absolute;
        top: -200px;
        left: -100px;
        width: 1500px;
        height: 1500px;
        background: radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(245,249,252,0.4) 55%, transparent 75%);
        pointer-events: none;
      }
      /* Right third subject: Modern calm luxury dental studio architectural composition */
      .clinic-stage {
        position: absolute;
        top: 0;
        right: 0;
        width: 46%;
        height: 100%;
        background: linear-gradient(135deg, rgba(230, 240, 248, 0.4) 0%, rgba(205, 225, 240, 0.65) 100%);
        border-left: 1px solid rgba(255,255,255,0.7);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        padding-bottom: 120px;
      }
      .wall-panel {
        position: absolute;
        top: 140px;
        right: 80px;
        width: 880px;
        height: 980px;
        border-radius: 40px;
        background: linear-gradient(180deg, #ffffff 0%, #edf4f9 100%);
        box-shadow: 0 40px 100px -20px rgba(25, 71, 107, 0.14);
        border: 2px solid rgba(255,255,255,0.95);
        overflow: hidden;
      }
      .oak-slat {
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        background: repeating-linear-gradient(90deg, #d8cbbf 0px, #d8cbbf 22px, #c9bbae 22px, #c9bbae 40px);
        opacity: 0.35;
      }
      .treatment-chair-silhouette {
        position: absolute;
        bottom: 80px;
        left: 100px;
        width: 580px;
        height: 640px;
        border-radius: 60px 60px 24px 24px;
        background: linear-gradient(145deg, #ffffff 0%, #d8e5ef 100%);
        box-shadow: 0 30px 60px rgba(25, 71, 107, 0.12);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,0.85);
      }
      .chair-headrest {
        width: 220px;
        height: 120px;
        border-radius: 40px;
        background: #f4f8fa;
        margin-bottom: 24px;
        border: 1px solid #c8dce8;
      }
      .chair-body {
        width: 380px;
        height: 280px;
        border-radius: 36px;
        background: #e2edf4;
        border: 1px solid #c8dce8;
      }
      .botanical {
        position: absolute;
        bottom: 60px;
        right: 60px;
        width: 240px;
        height: 380px;
        border-radius: 120px 120px 0 0;
        background: linear-gradient(180deg, rgba(85, 169, 220, 0.3) 0%, rgba(25, 71, 107, 0.12) 100%);
      }
      .demo-badge {
        position: absolute;
        bottom: 40px;
        right: 40px;
        background: rgba(25, 71, 107, 0.88);
        color: #ffffff;
        padding: 14px 28px;
        border-radius: 9999px;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        border: 1px solid rgba(255,255,255,0.25);
      }
    </style>
  </head>
  <body>
    <div class="window-light"></div>
    <div class="clinic-stage">
      <div class="wall-panel">
        <div class="oak-slat"></div>
        <div class="treatment-chair-silhouette">
          <div class="chair-headrest"></div>
          <div class="chair-body"></div>
        </div>
        <div class="botanical"></div>
      </div>
      <div class="demo-badge">CLINIC PHOTO DEMO ASSET · hero-desktop.jpg (16:9)</div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(desktopHtml);
  await page.screenshot({
    path: "e:/Projects/dental-template-1/public/images/demo/hero-desktop.jpg",
    type: "jpeg",
    quality: 92,
  });
  await page.close();

  // 2. Mobile: 1080x1350 (4:5)
  const mobilePage = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const mobileHtml = `
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
        background: linear-gradient(180deg, #ebf3f9 0%, #f4f8fb 55%, #f9fbfd 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        position: relative;
      }
      .window-light {
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 1000px;
        height: 700px;
        background: radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(240,246,250,0.5) 50%, transparent 80%);
      }
      .mobile-stage {
        position: absolute;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        width: 880px;
        height: 600px;
        border-radius: 40px;
        background: linear-gradient(145deg, #ffffff 0%, #e2edf6 100%);
        border: 2px solid rgba(255,255,255,0.95);
        box-shadow: 0 30px 60px rgba(25, 71, 107, 0.12);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .oak-slat {
        position: absolute;
        top: 0;
        right: 0;
        width: 180px;
        height: 100%;
        background: repeating-linear-gradient(90deg, #d8cbbf 0px, #d8cbbf 16px, #c9bbae 16px, #c9bbae 30px);
        opacity: 0.35;
      }
      .chair-headrest {
        width: 160px;
        height: 80px;
        border-radius: 28px;
        background: #f4f8fa;
        margin-bottom: 16px;
        border: 1px solid #c8dce8;
      }
      .chair-body {
        width: 260px;
        height: 180px;
        border-radius: 26px;
        background: #d8e5ef;
        border: 1px solid #c8dce8;
      }
      .demo-badge {
        position: absolute;
        top: 24px;
        left: 24px;
        background: rgba(25, 71, 107, 0.88);
        color: #ffffff;
        padding: 10px 20px;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid rgba(255,255,255,0.25);
      }
    </style>
  </head>
  <body>
    <div class="window-light"></div>
    <div class="mobile-stage">
      <div class="oak-slat"></div>
      <div class="chair-headrest"></div>
      <div class="chair-body"></div>
      <div class="demo-badge">CLINIC PHOTO DEMO ASSET · hero-mobile.jpg (4:5)</div>
    </div>
  </body>
  </html>
  `;
  await mobilePage.setContent(mobileHtml);
  await mobilePage.screenshot({
    path: "e:/Projects/dental-template-1/public/images/demo/hero-mobile.jpg",
    type: "jpeg",
    quality: 92,
  });
  await mobilePage.close();

  await browser.close();
  console.log("Successfully generated hero-desktop.jpg and hero-mobile.jpg");
}

generate().catch(console.error);
