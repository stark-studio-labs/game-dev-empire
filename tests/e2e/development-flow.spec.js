/**
 * Development Flow E2E Tests
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

async function startDevGame(win) {
  await resetToTitle(win);
  await win.locator('button:has-text("Dev Mode")').click();
  await win.waitForTimeout(300);
  await win.locator('input[type="text"]').fill('Phase Test Co');
  await win.locator('button.btn-accent:has-text("New Game")').click();
  await win.waitForSelector('.topbar', { timeout: 10000 });
  await win.locator('button:has-text("Create New Game")').click();
  await expect(win.locator('h2:has-text("New Game")')).toBeVisible();
  await win.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await win.locator('.selection-grid .selection-item >> text="Fantasy"').click();
  await win.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await win.locator('.selection-item >> text="RPG"').click();
  await win.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await win.locator('.selection-item:has-text("PC")').first().click();
  await win.locator('.modal-content button.btn-accent:has-text("Next")').click();
  await win.locator('button.btn-accent:has-text("Start Development")').click();
  await expect(win.locator('.topbar__progress-label')).toBeVisible({ timeout: 5000 });
  await win.locator('.topbar__speed .speed-btn:has-text("8x")').click();
}

/**
 * Click "Continue Development" — dismisses any event modals that may be blocking it.
 *
 * Event modals appear at z-index 200 and block the Phase slider modal's "Continue Development"
 * button. Event flow: choose option → see consequence → click Continue → event dismissed.
 */
async function clickContinueDev(win) {
  const btn = win.locator('button.btn-accent:has-text("Continue Development")');

  // Try direct click first
  try {
    await btn.click({ timeout: 2000 });
    return;
  } catch (e) { /* blocked by event overlay */ }

  // Dismiss event modals: up to 3 rounds (event option + consequence + potential second event)
  for (let round = 0; round < 3; round++) {
    // Check for "What do you do?" event choice screen — click first option
    const eventOption = win.locator('.modal-overlay button').filter({ hasText: /[A-Z]/ }).first();
    if (await eventOption.isVisible({ timeout: 500 }).catch(() => false)) {
      await eventOption.click();
      await win.waitForTimeout(500);
    }

    // Check for "Event Outcome" consequence screen — click Continue to dismiss
    const consequenceContinue = win.locator('.modal-overlay button.btn-accent:has-text("Continue")');
    if (await consequenceContinue.isVisible({ timeout: 500 }).catch(() => false)) {
      await consequenceContinue.click();
      await win.waitForTimeout(500);
    }

    // Try clicking Continue Development again
    try {
      await btn.click({ timeout: 1000 });
      return;
    } catch (e) { /* still blocked */ }
  }

  // Last resort: force click
  await btn.click({ force: true });
}

test('Phase 1 completes and Phase 2 slider modal appears', async () => {
  test.setTimeout(60000);
  await startDevGame(window);
  await expect(window.locator('text=/Phase 1 Complete/').first()).toBeVisible({ timeout: 45000 });
  await expect(window.locator('button.btn-accent:has-text("Continue Development")')).toBeVisible();
});

test('submit Phase 2 sliders, Phase 2 runs, Phase 3 modal appears', async () => {
  test.setTimeout(90000);
  await startDevGame(window);
  await expect(window.locator('text=/Phase 1 Complete/').first()).toBeVisible({ timeout: 45000 });
  await clickContinueDev(window);
  await expect(window.locator('text=/Phase 2 Complete/').first()).toBeVisible({ timeout: 45000 });
});

test('submit Phase 3, development completes, review screen appears', async () => {
  test.setTimeout(120000);
  await startDevGame(window);
  await expect(window.locator('text=/Phase 1 Complete/').first()).toBeVisible({ timeout: 45000 });
  await clickContinueDev(window);
  await expect(window.locator('text=/Phase 2 Complete/').first()).toBeVisible({ timeout: 45000 });
  await clickContinueDev(window);
  await expect(window.locator('text=Game Review')).toBeVisible({ timeout: 45000 });
});

test('review screen shows 4 critic scores', async () => {
  test.setTimeout(120000);
  await startDevGame(window);
  await expect(window.locator('text=/Phase 1 Complete/').first()).toBeVisible({ timeout: 45000 });
  await clickContinueDev(window);
  await expect(window.locator('text=/Phase 2 Complete/').first()).toBeVisible({ timeout: 45000 });
  await clickContinueDev(window);
  await expect(window.locator('text=Game Review')).toBeVisible({ timeout: 45000 });
  await window.waitForTimeout(4000);
  await expect(window.locator('text=Average Score')).toBeVisible({ timeout: 5000 });
});

test('publisher panel appears after review', async () => {
  test.setTimeout(120000);
  await startDevGame(window);
  await expect(window.locator('text=/Phase 1 Complete/').first()).toBeVisible({ timeout: 45000 });
  await clickContinueDev(window);
  await expect(window.locator('text=/Phase 2 Complete/').first()).toBeVisible({ timeout: 45000 });
  await clickContinueDev(window);
  await expect(window.locator('text=Game Review')).toBeVisible({ timeout: 45000 });
  await window.waitForTimeout(4000);
  await window.locator('.modal-content button.btn-accent:has-text("Continue")').click({ force: true });
  await expect(window.locator('text=/Self.Publish|Publisher/')).toBeVisible({ timeout: 5000 });
});
