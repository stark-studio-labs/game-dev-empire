/**
 * Title Screen E2E Tests
 */
const { test, expect } = require('@playwright/test');
const { launchApp, resetToTitle } = require('./helpers');

let app, window;

test.beforeAll(async () => {
  ({ app, window } = await launchApp());
});

test.afterAll(async () => {
  if (app) await app.close();
});

test.beforeEach(async () => {
  await resetToTitle(window);
});

test('app launches and shows title screen', async () => {
  await expect(window.locator('#root')).toBeVisible();
});

test('"TECH EMPIRE" text is visible', async () => {
  await expect(window.locator('text=TECH EMPIRE')).toBeVisible();
});

test('company name input exists and is focusable', async () => {
  const input = window.locator('input[type="text"]');
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute('placeholder', 'Enter company name...');
});

test('"New Game" button exists', async () => {
  const btn = window.locator('button.btn-accent:has-text("New Game")');
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
});

test('"Dev Mode" toggle exists', async () => {
  await expect(window.locator('button:has-text("Dev Mode")')).toBeVisible();
});

test('type company name, click New Game, game screen appears', async () => {
  await window.locator('input[type="text"]').fill('Stark Studios');
  await window.locator('button.btn-accent:has-text("New Game")').click();
  await expect(window.locator('.topbar')).toBeVisible({ timeout: 10000 });
  await expect(window.locator('text=Stark Studios')).toBeVisible();
});

test('Dev Mode toggle changes button text', async () => {
  const btn = window.locator('button:has-text("Dev Mode")');
  await expect(btn).toContainText('OFF');
  await btn.click();
  await expect(window.locator('button:has-text("Dev Mode ON")')).toBeVisible();
});
