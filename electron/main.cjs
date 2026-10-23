const { app, BrowserWindow, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const isDev = !app.isPackaged;

// The app is entirely 2D. Software rendering avoids black Electron windows on
// Windows systems with problematic Chromium/driver combinations.
app.disableHardwareAcceleration();

function writeStartupLog(message) {
  try {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(path.join(app.getPath('userData'), 'startup.log'), line, 'utf8');
  } catch {
    // Diagnostics must never prevent the app from opening.
  }
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#0a0c10',
    title: 'AoE2 Coach',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    writeStartupLog('Main window ready to show.');
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    writeStartupLog(`Renderer loaded: ${mainWindow.webContents.getURL()}`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    writeStartupLog(`Renderer failed to load (${errorCode}): ${errorDescription} - ${validatedURL}`);
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    writeStartupLog(`Renderer console [${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    writeStartupLog(`Renderer process ended: ${details.reason} (exit ${details.exitCode})`);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isAppUrl = isDev ? url.startsWith('http://127.0.0.1:5173') : url.startsWith('file://');

    if (!isAppUrl) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173').catch((error) => {
      writeStartupLog(`Unable to open development app: ${error.stack || error.message}`);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html')).catch((error) => {
      writeStartupLog(`Unable to open packaged app: ${error.stack || error.message}`);
    });
  }
}

app.whenReady().then(() => {
  writeStartupLog(`Starting AoE2 Coach ${app.getVersion()} (${isDev ? 'development' : 'packaged'}).`);
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
