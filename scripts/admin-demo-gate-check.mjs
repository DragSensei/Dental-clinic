import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.emulateMedia({ reducedMotion: "no-preference" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

try {
  await page.goto(`${baseUrl}/admin/services`);
  await page.getByRole("heading", { name: "Create a demo account" }).waitFor();
  assert.equal(await page.getByRole("navigation", { name: "Admin navigation" }).count(), 0, "admin shell must stay hidden before sign-up");

  await page.getByLabel("Email", { exact: true }).fill("staff@example.test");
  await page.getByLabel("Password", { exact: true }).fill("clinic-demo-123");
  await page.getByLabel("Confirm password").fill("different-password");
  await page.getByRole("button", { name: "Create demo account" }).click();
  await page.getByRole("alert").getByText("Passwords do not match.").waitFor();

  await page.getByLabel("Confirm password").fill("clinic-demo-123");
  await page.getByRole("button", { name: "Create demo account" }).click();
  await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Services" }).click();
  await page.waitForURL("**/admin/services");
  await page.getByRole("button", { name: "Collapse admin sidebar" }).waitFor();
  const selectedRowInset = await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Services" }).evaluate((element) => {
    const row = element.getBoundingClientRect();
    const sidebar = element.closest("aside").getBoundingClientRect();
    return row.left > sidebar.left;
  });
  assert.equal(selectedRowInset, true, "active sidebar row should remain inset from the rail edge");
  const capsuleInsets = await page.locator("aside > div").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, bottom: window.innerHeight - rect.bottom };
  });
  assert.ok(capsuleInsets.top > 76 && capsuleInsets.bottom > 76, "sidebar capsule should have a visible top and bottom inset");
  assert.ok(Math.abs(capsuleInsets.top - capsuleInsets.bottom) < 30, "sidebar capsule top and bottom insets should feel balanced");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(50);
  const railTopBeforeNavigation = await page.locator("aside").evaluate((element) => ({ top: element.getBoundingClientRect().top, scrollY: window.scrollY, cssTop: getComputedStyle(element).top, position: getComputedStyle(element).position }));
  await page.screenshot({ path: ".audit/screenshots/admin-sidebar-expanded.png", fullPage: true });

  await page.getByRole("button", { name: "Collapse admin sidebar" }).click();
  await page.getByRole("button", { name: "Expand admin sidebar" }).waitFor();
  await page.screenshot({ path: ".audit/screenshots/admin-sidebar-collapsed.png", fullPage: true });
  await page.getByRole("button", { name: "Expand admin sidebar" }).click();
  await page.waitForTimeout(350);
  await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Appointments" }).click();
  await page.waitForURL("**/admin/appointments");
  const statusCombobox = page.getByRole("combobox", { name: "Status", exact: true });
  await statusCombobox.fill("cancelled");
  await statusCombobox.press("ArrowDown");
  await statusCombobox.press("Enter");
  assert.equal(await statusCombobox.inputValue(), "Cancelled", "appointment status should use the shared combobox");
  const sortCombobox = page.getByRole("combobox", { name: "Sort by", exact: true });
  await sortCombobox.fill("patient");
  await sortCombobox.press("ArrowDown");
  await sortCombobox.press("Enter");
  assert.equal(await sortCombobox.inputValue(), "Patient name", "appointment sorting should use the shared combobox");
  for (const width of [375, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.screenshot({ path: `.audit/screenshots/appointment-filters-${width}.png`, fullPage: true });
    const filterGeometry = await page.evaluate(() => {
      const [statusInput, sortInput] = document.querySelectorAll('input[role="combobox"]');
      const status = statusInput?.getBoundingClientRect();
      const sort = sortInput?.getBoundingClientRect();
      const panel = document.querySelector("main section")?.getBoundingClientRect();
      return status && sort && panel ? { statusRight: status.right, sortLeft: sort.left, statusBottom: status.bottom, sortTop: sort.top, panelRight: panel.right, sortRight: sort.right } : null;
    });
    assert.ok(filterGeometry, `appointment filters should render at ${width}px`);
    assert.ok(filterGeometry.statusBottom <= filterGeometry.sortTop || filterGeometry.statusRight < filterGeometry.sortLeft, `status and sort comboboxes should have spacing at ${width}px`);
    assert.ok(filterGeometry.sortRight <= filterGeometry.panelRight, `sort combobox should fit within the panel at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Calendar" }).click();
  await page.waitForURL("**/admin/calendar");
  await page.waitForTimeout(350);
  const railTopAfterNavigation = await page.locator("aside").evaluate((element) => ({ top: element.getBoundingClientRect().top, scrollY: window.scrollY, cssTop: getComputedStyle(element).top, position: getComputedStyle(element).position }));
  assert.ok(Math.abs(railTopAfterNavigation.top - railTopBeforeNavigation.top) < 1, `admin sidebar should not shift while navigating between categories (${JSON.stringify(railTopBeforeNavigation)} -> ${JSON.stringify(railTopAfterNavigation)})`);
  const dateCombobox = page.getByRole("combobox", { name: "Date (UTC)", exact: true });
  await dateCombobox.fill("Oct");
  const matchingDates = page.getByRole("option");
  assert.ok(await matchingDates.count() > 0, "combobox should filter matching dates");
  await dateCombobox.press("ArrowDown");
  await dateCombobox.press("Enter");
  await page.getByRole("heading", { name: /UTC$/ }).waitFor();
  assert.equal(await page.getByRole("heading", { name: /UTC$/ }).count(), 1, "keyboard selection should update the calendar date");
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.screenshot({ path: `.audit/screenshots/calendar-combobox-${width}.png`, fullPage: true });
    const fits = await dateCombobox.evaluate((element) => element.getBoundingClientRect().right <= window.innerWidth);
    assert.equal(fits, true, `calendar combobox should fit at ${width}px`);
  }
  await dateCombobox.fill("no matching date");
  await page.getByText("No matching dates.").waitFor();
  await dateCombobox.press("Escape");
  await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Services" }).click();
  await page.waitForURL("**/admin/services");
  const railTopAfterServices = await page.locator("aside").evaluate((element) => ({ top: element.getBoundingClientRect().top, scrollY: window.scrollY }));
  assert.ok(Math.abs(railTopAfterServices.top - railTopBeforeNavigation.top) < 1, `sidebar position should stay fixed when navigating back to Services (${railTopBeforeNavigation.top} -> ${JSON.stringify(railTopAfterServices)})`);
  await page.evaluate(() => window.scrollTo({ top: 320, behavior: "instant" }));
  await page.waitForTimeout(50);
  const stickyTop = await page.locator("aside").evaluate((element) => element.getBoundingClientRect().top);
  assert.ok(Math.abs(stickyTop - 69) < 1, "desktop admin sidebar should stay sticky beneath the global navigation");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(50);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("heading", { name: "Create a demo account" }).waitFor();
  await page.getByRole("button", { name: "Log in" }).click();
  await page.getByLabel("Email", { exact: true }).fill("staff@example.test");
  await page.getByLabel("Password", { exact: true }).fill("clinic-demo-123");
  await page.getByRole("button", { name: "Log in to demo" }).click();
  await page.getByRole("button", { name: "Sign out" }).waitFor();

  await page.reload();
  await page.getByRole("heading", { name: "Create a demo account" }).waitFor();
  await page.goto(`${baseUrl}/admin/appointments/demo-preview`);
  await page.getByRole("heading", { name: "Create a demo account" }).waitFor();

  await page.goto(`${baseUrl}/services`);
  const navState = await page.getByRole("banner").evaluate((header) => ({
    hasServicesCategory: [...header.querySelectorAll("a")].some((link) => link.textContent?.trim() === "Services"),
    stableScrollbar: getComputedStyle(document.documentElement).scrollbarGutter.includes("stable"),
    transition: getComputedStyle(document.querySelector(".route-enter")).animationDuration,
  }));
  assert.equal(navState.hasServicesCategory, true);
  assert.equal(navState.stableScrollbar, true);
  assert.notEqual(navState.transition, "0s");

  await page.goto(`${baseUrl}/book`);
  await page.locator("main section button[aria-pressed]").first().click();
  await page.getByRole("button", { name: "Continue" }).click();
  const clinicianHeading = page.getByRole("heading", { name: "Clinician", level: 2 });
  await clinicianHeading.waitFor();
  const bookingStepAnimation = await page.locator(".booking-step-enter").evaluate((element) => getComputedStyle(element).animationName);
  assert.equal(bookingStepAnimation, "booking-step-enter", "booking step content should slide in from the right");
  await page.waitForTimeout(100);
  await page.screenshot({ path: ".audit/screenshots/booking-step-transition.png" });
  await page.waitForTimeout(350);
  const headingCenter = await clinicianHeading.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return ((rect.top + rect.bottom) / 2) / window.innerHeight;
  });
  assert.ok(headingCenter > 0.35 && headingCenter < 0.7, `booking step heading should settle near viewport center (got ${headingCenter.toFixed(2)})`);
  await page.screenshot({ path: ".audit/screenshots/booking-step-centered.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("main section button[aria-pressed]").first().click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("heading", { name: "Date & time", level: 2 }).waitFor();
  const reducedBookingAnimation = await page.locator(".booking-step-enter").evaluate((element) => getComputedStyle(element).animationName);
  assert.equal(reducedBookingAnimation, "none", "booking step slide should be disabled for reduced motion");
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto(baseUrl);
  await page.locator("#care").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const cardHeights = await page.locator("#care [data-reveal='card'] > a").evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
  assert.equal(cardHeights.length, 4);
  assert.ok(Math.max(...cardHeights) - Math.min(...cardHeights) < 1, `landing service cards should have equal heights: ${cardHeights.join(", ")}`);
  await page.screenshot({ path: ".audit/screenshots/landing-services-cards.png" });

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.locator("#smile-preview").scrollIntoViewIfNeeded();
  const handleColors = await page.locator("#smile-preview div[aria-hidden='true'] span.size-12").first().evaluate((element) => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor,
  }));
  assert.notEqual(handleColors.foreground, handleColors.background, "comparison handle arrows must contrast with the white handle in dark mode");
  await page.screenshot({ path: ".audit/screenshots/dark-comparison-handle.png" });
  assert.deepEqual(errors, [], "browser console should not report runtime errors");
  console.log("Admin demo gate and navigation checks passed.");
} finally {
  await browser.close();
}
