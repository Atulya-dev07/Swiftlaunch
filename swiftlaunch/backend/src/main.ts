import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Providers
import { ProviderRegistry } from './providers/ProviderRegistry.js';
import { AppProvider } from './providers/AppProvider.js';
import { CalculatorProvider } from './providers/CalculatorProvider.js';
import { FileProvider } from './providers/FileProvider.js';
import { ClipboardProvider } from './providers/ClipboardProvider.js';

// Database
import { initDatabase, closeDatabase } from './db/schema.js';
import { DbQueries } from './db/queries.js';

// IPC
import { registerIpcHandlers } from './ipc/handlers.js';

// Window Manager
import { HotkeyManager } from './window-manager/HotkeyManager.js';
import { WindowSnapper } from './window-manager/WindowSnapper.js';

// Plugin Host
import { PluginLoader } from './plugin-host/PluginLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function getPreloadPath(): string {
  const cjsPath = path.join(__dirname, '../preload/index.cjs');
  if (fs.existsSync(cjsPath)) {
    return cjsPath;
  }
  const jsPath = path.join(__dirname, '../preload/index.js');
  if (fs.existsSync(jsPath)) {
    return jsPath;
  }
  const mjsPath = path.join(__dirname, '../preload/index.mjs');
  if (fs.existsSync(mjsPath)) {
    return mjsPath;
  }
  return path.join(__dirname, '../preload/index.cjs');
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: true,
    center: true,
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const devUrl = process.env['ELECTRON_RENDERER_URL'] || 'http://localhost:5173';
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }

  mainWindow.on('blur', () => {
    mainWindow?.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // ── 1. Initialize Database ─────────────────────────────────────────
  const dbDir = app.getPath('userData');
  const db = initDatabase(dbDir);
  const dbQueries = new DbQueries(db);

  // ── 2. Initialize Providers ────────────────────────────────────────
  const registry = new ProviderRegistry();

  const appProvider = new AppProvider();
  const calculatorProvider = new CalculatorProvider();
  const fileProvider = new FileProvider();
  const clipboardProvider = new ClipboardProvider();

  // Wire clipboard persistence to DB
  clipboardProvider.setDbCallback((entry) => {
    dbQueries.addClipboardEntry(entry.content, entry.type);
  });

  // Wire file provider warning callback
  fileProvider.setWarningCallback((msg) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('PROVIDER_WARNING', msg);
    }
  });

  registry.register(appProvider);
  registry.register(calculatorProvider);
  registry.register(fileProvider);
  registry.register(clipboardProvider);

  // ── 3. Initialize Plugin Host & Window Snapper ───────────────────
  const pluginDir = path.join(app.getPath('userData'), 'plugins');
  const pluginLoader = new PluginLoader(pluginDir);
  const windowSnapper = new WindowSnapper();

  // ── 4. Register IPC Handlers BEFORE loading BrowserWindow ────────
  registerIpcHandlers({
    registry,
    clipboardProvider,
    dbQueries,
    pluginLoader,
    windowSnapper
  });

  // ── 5. Initialize Providers and Plugins ─────────────────────────
  await registry.initializeAll();
  await pluginLoader.loadAll();

  // ── 6. Create Window AFTER IPC handlers are registered ───────────
  createWindow();

  // ── 7. Register Global Hotkeys ──────────────────────────────────
  const hotkeyManager = new HotkeyManager('Alt+Space');
  hotkeyManager.setWindowCallbacks(
    () => mainWindow,
    () => createWindow()
  );
  hotkeyManager.register();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // ── Cleanup on quit ─────────────────────────────────────────────
  app.on('will-quit', () => {
    hotkeyManager.unregisterAll();
    registry.disposeAll();
    pluginLoader.disposeAll();
    closeDatabase();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
