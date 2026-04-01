/**
 * Shared helpers for Playwright Electron E2E tests.
 *
 * Architecture: Each test file launches ONE Electron instance in beforeAll
 * (with increased timeout). Individual tests reset state via page reload
 * using resetToTitle() — much faster and more reliable than relaunching Electron.
 */
const { _electron: electron, expect } = require('@playwright/test');
const path = require('path');

const MAIN_JS = path.resolve(__dirname, '..', '..', 'src', 'main', 'main.js');

// Electron launch can be slow on macOS — give it generous time
const LAUNCH_TIMEOUT = 60000;

/**
 * Launch the Electron app and return { app, window }.
 * Waits for React to fully render before returning.
 */
async function launchApp() {
  // Kill any orphan Electron processes from previous test files
  try {
    const { execFileSync } = require('child_process');
    execFileSync('pkill', ['-f', 'Electron.*main.js'], { stdio: 'ignore' });
  } catch (e) { /* ignore — pkill returns non-zero when no processes found */ }
  // Brief pause to let OS release display resources
  await new Promise(r => setTimeout(r, 1500));

  const app = await electron.launch({ args: [MAIN_JS] });
  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  // Wait for React to render into #root
  await window.waitForFunction(() => {
    const root = document.getElementById('root');
    return root && root.children.length > 0;
  }, null, { timeout: LAUNCH_TIMEOUT });
  return { app, window };
}

/**
 * Reset the app to a clean title screen by clearing state and reloading.
 */
async function resetToTitle(window) {
  await window.evaluate(() => {
    localStorage.clear();
  });
  await window.reload();
  await window.waitForLoadState('domcontentloaded');
  await window.waitForFunction(() => {
    const root = document.getElementById('root');
    return root && root.children.length > 0;
  }, null, { timeout: 15000 });
  await window.waitForSelector('text=TECH EMPIRE', { timeout: 10000 });
}

/**
 * From the title screen, type a company name and click New Game to enter the game screen.
 */
async function startNewGame(window, companyName = 'Test Studio') {
  const input = window.locator('input[type="text"]');
  await input.fill(companyName);
  await window.locator('button.btn-accent:has-text("New Game")').click();
  await window.waitForSelector('.topbar', { timeout: 10000 });
}

module.exports = { launchApp, resetToTitle, startNewGame, MAIN_JS, LAUNCH_TIMEOUT };
