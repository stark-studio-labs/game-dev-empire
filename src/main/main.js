const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// ── Logging ──────────────────────────────────────────────────
const logPath = path.join(app.getPath('userData'), 'tech-empire.log');
const logStream = { lines: [] };

function log(level, msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${msg}`;
  logStream.lines.push(line);
  console.log(line);
  // Write to file (append)
  try {
    fs.appendFileSync(logPath, line + '\n');
  } catch (e) { /* ignore */ }
}

function createWindow() {
  log('INFO', 'Creating main window...');
  log('INFO', `App path: ${app.getAppPath()}`);
  log('INFO', `__dirname: ${__dirname}`);
  log('INFO', `User data: ${app.getPath('userData')}`);
  log('INFO', `Log file: ${logPath}`);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Tech Empire',
    backgroundColor: '#0d1117',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Allow loading CDN scripts (React, Tailwind, Babel)
      webSecurity: true,
    },
  });

  const indexPath = path.join(__dirname, '..', 'renderer', 'index.html');
  log('INFO', `Loading: ${indexPath}`);
  log('INFO', `File exists: ${fs.existsSync(indexPath)}`);

  mainWindow.loadFile(indexPath);

  // Log renderer errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log('ERROR', `Page failed to load: ${errorCode} ${errorDescription}`);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    log(levels[level] || 'LOG', `[renderer] ${message}`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log('INFO', 'Page loaded successfully');
  });

  // Open DevTools in dev mode or if --dev flag
  if (process.argv.includes('--dev') || !app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  log('INFO', `Tech Empire v${require('../../package.json').version} starting`);
  log('INFO', `Packaged: ${app.isPackaged}`);
  log('INFO', `Platform: ${process.platform} ${process.arch}`);
  createWindow();
});

app.on('window-all-closed', () => {
  log('INFO', 'All windows closed, quitting');
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
