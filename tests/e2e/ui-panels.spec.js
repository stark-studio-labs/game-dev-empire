/**
 * UI Panels E2E Tests
 */
const { test, expect } = require('@playwright/test');
const { launchApp, resetToTitle, startNewGame } = require('./helpers');

let app, window;

test.beforeAll(async () => {
  ({ app, window } = await launchApp());
});

test.afterAll(async () => {
  if (app) await app.close();
});

test.beforeEach(async () => {
  await resetToTitle(window);
  await startNewGame(window, 'Panel Test Inc');
});

test('TopBar has speed control buttons', async () => {
  await expect(window.locator('.topbar__speed .speed-btn:has-text("||")')).toBeVisible();
  await expect(window.locator('.topbar__speed .speed-btn:has-text("1x")')).toBeVisible();
  await expect(window.locator('.topbar__speed .speed-btn:has-text("2x")')).toBeVisible();
  await expect(window.locator('.topbar__speed .speed-btn:has-text("4x")')).toBeVisible();
  await expect(window.locator('.topbar__speed .speed-btn:has-text("8x")')).toBeVisible();
});

test('TopBar has feature icon buttons', async () => {
  await expect(window.locator('.topbar__icons')).toBeVisible();
  await expect(window.locator('.topbar__icons .speed-btn:has-text("$")')).toBeVisible();
});

test('locked features are disabled at Garage level', async () => {
  const disabledCount = await window.evaluate(() => {
    const btns = document.querySelectorAll('.topbar__icons .speed-btn');
    let count = 0;
    btns.forEach(btn => { if (btn.disabled) count++; });
    return count;
  });
  expect(disabledCount).toBeGreaterThanOrEqual(4);
});

test('locked feature tooltip exists', async () => {
  const count = await window.locator('.topbar__tooltip').count();
  expect(count).toBeGreaterThan(0);
});

test('Finance panel opens and closes on click', async () => {
  const finBtn = window.locator('.topbar__icons .speed-btn:has-text("$")');
  await finBtn.click();
  // Finance Dashboard title is in a div inside the modal-overlay — verify panel opened
  const panel = window.locator('.modal-overlay');
  await expect(panel).toBeVisible({ timeout: 3000 });
  // Verify it's the finance panel by checking for unique content
  await expect(window.locator('text=Cash Over Time')).toBeVisible();
  // Close by pressing Escape (modal overlay intercepts topbar clicks)
  await window.keyboard.press('Escape');
  await expect(panel).not.toBeVisible({ timeout: 3000 });
});

test('Market panel opens and closes', async () => {
  const marketWrap = window.locator('.topbar__icon-wrap:has(.topbar__tooltip:has-text("Market Intelligence"))');
  const marketBtn = marketWrap.locator('.speed-btn');
  await marketBtn.click();
  // Market panel has h2 with "Market Intelligence"
  await expect(window.locator('h2:has-text("Market Intelligence")')).toBeVisible({ timeout: 3000 });
  // Close by pressing Escape
  await window.keyboard.press('Escape');
  await expect(window.locator('h2:has-text("Market Intelligence")')).not.toBeVisible({ timeout: 3000 });
});

test('Staff panel shows 1 founder', async () => {
  await window.locator('button:has-text("Staff")').first().click({ timeout: 3000 });
  await expect(window.locator('text=Founder')).toBeVisible({ timeout: 3000 });
});

test('Notification bell exists in TopBar', async () => {
  await expect(window.locator('button[title="Notification Center"]')).toBeVisible();
});
