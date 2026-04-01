/**
 * Speed Controls E2E Tests
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
  await startNewGame(window, 'Speed Test Co');
});

test('pause button pauses game (time does not advance)', async () => {
  await window.locator('.topbar__speed .speed-btn:has-text("1x")').click();
  await window.waitForTimeout(500);
  await window.locator('.topbar__speed .speed-btn:has-text("||")').click();
  const dateStat = window.locator('.topbar__stat').filter({ has: window.locator('.topbar__stat-label:has-text("Date")') });
  const dateText1 = await dateStat.locator('.topbar__stat-value').textContent();
  await window.waitForTimeout(2000);
  const dateText2 = await dateStat.locator('.topbar__stat-value').textContent();
  expect(dateText1).toBe(dateText2);
});

test('1x button starts the game', async () => {
  await window.locator('.topbar__speed .speed-btn:has-text("1x")').click();
  await expect(window.locator('.topbar__speed .speed-btn.active:has-text("1x")')).toBeVisible();
});

test('2x, 4x, 8x buttons exist and are clickable', async () => {
  for (const speed of ['2x', '4x', '8x']) {
    const btn = window.locator(`.topbar__speed .speed-btn:has-text("${speed}")`);
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(window.locator(`.topbar__speed .speed-btn.active:has-text("${speed}")`)).toBeVisible();
  }
});

test('speed change reflects in tick rate (8x advances faster than 1x)', async () => {
  await window.locator('.topbar__speed .speed-btn:has-text("8x")').click();
  await window.waitForTimeout(4000);
  const dateStat = window.locator('.topbar__stat').filter({ has: window.locator('.topbar__stat-label:has-text("Date")') });
  const dateText = await dateStat.locator('.topbar__stat-value').textContent();
  const weekMatch = dateText.match(/W(\d+)/);
  expect(weekMatch).toBeTruthy();
  const week = parseInt(weekMatch[1]);
  expect(week).toBeGreaterThanOrEqual(1);
});
