/**
 * Game Creation Wizard E2E Tests
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
  await startNewGame(window, 'Wizard Test Co');
});

test('click Create New Game opens wizard', async () => {
  await window.locator('button:has-text("Create New Game")').click();
  await expect(window.locator('h2:has-text("New Game")')).toBeVisible({ timeout: 5000 });
});

test('Step 1: type game title and click Next', async () => {
  await window.locator('button:has-text("Create New Game")').click();
  await expect(window.locator('text=Game Title')).toBeVisible();
  const titleInput = window.locator('.modal-content input[type="text"]');
  await titleInput.fill('Stellar Conquest');
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await expect(window.locator('text=Choose Topic')).toBeVisible();
});

test('Step 2: topic grid shows Tier 1 items (30), click one, Next', async () => {
  await window.locator('button:has-text("Create New Game")').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await expect(window.locator('text=Choose Topic')).toBeVisible();
  await expect(window.locator('text=/Showing 30 of 85/')).toBeVisible();
  await window.locator('.selection-grid .selection-item >> text="Fantasy"').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await expect(window.locator('text=Choose Genre')).toBeVisible();
});

test('Step 3: genre grid shows 6 items, click one, Next', async () => {
  await window.locator('button:has-text("Create New Game")').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await window.locator('.selection-grid .selection-item >> text="Fantasy"').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await expect(window.locator('text=Choose Genre')).toBeVisible();
  const genres = ['Action', 'Adventure', 'RPG', 'Simulation', 'Strategy', 'Casual'];
  for (const g of genres) {
    await expect(window.locator(`.selection-item >> text="${g}"`)).toBeVisible();
  }
  await window.locator('.selection-item >> text="RPG"').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await expect(window.locator('text=Target Audience')).toBeVisible();
});

test('Step 4: platform/audience/size selection, Next', async () => {
  await window.locator('button:has-text("Create New Game")').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await window.locator('.selection-grid .selection-item >> text="Fantasy"').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await window.locator('.selection-item >> text="Action"').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await expect(window.locator('text=Target Audience')).toBeVisible();
  await expect(window.locator('text=Game Size')).toBeVisible();
  await window.locator('.selection-item:has-text("PC")').first().click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await expect(window.locator('text=/Phase 1/').first()).toBeVisible();
});

test('Step 5: sliders appear and Start Development works', async () => {
  await window.locator('button:has-text("Create New Game")').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await window.locator('.selection-grid .selection-item >> text="Horror"').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await window.locator('.selection-item >> text="Action"').click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await window.locator('.selection-item:has-text("PC")').first().click();
  await window.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await expect(window.locator('text=/Phase 1/').first()).toBeVisible();
  const sliders = window.locator('.modal-content input[type="range"]');
  await expect(sliders).toHaveCount(3);
  await window.locator('button.btn-accent:has-text("Start Development")').click();
  // Game starts developing — progress label appears in TopBar
  await expect(window.locator('.topbar__progress-label')).toBeVisible({ timeout: 5000 });
});
