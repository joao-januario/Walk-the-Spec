import './utils/logger.js'; // Initialize electron-log before anything else — redirects console.* to file
import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc/handlers.js';
import { initConfigCache, loadConfig, saveConfig, getProjects, DEFAULT_SETTINGS, type SoundVolume, type AppSettings } from './config/config-manager.js';
import { watchProject, unwatchAll, type WatcherEvents } from './projects/file-watcher.js';
import { showCompletionNotification } from './notifications/os-notifier.js';
import { playNotificationSound } from './notifications/sound-player.js';
import { startNotifyServer, stopNotifyServer, type NotifyPayload } from './notifications/notify-server.js';
import { scanProject } from './projects/project-scanner.js';
import { detectPhase } from './phase/phase-detector.js';
import { normalizePathForComparison } from './utils/paths.js';
import { initAutoUpdater, checkForUpdatesManual } from './updater/auto-updater.js';
import fs from 'fs';

app.setAppUserModelId('com.speckit.walk-the-spec');

let mainWindow: BrowserWindow | null = null;

function sendToRenderer(channel: string, ...args: any[]) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
}

async function handleNotify(payload: NotifyPayload): Promise<void> {
  try {
    if (payload.status !== 'completed') return;

    const config = loadConfig();
    // Find project by matching path (normalized for cross-platform comparison)
    const project = config.projects.find(
      (p) => normalizePathForComparison(p.path) === normalizePathForComparison(payload.projectPath),
    );
    if (!project) {
      console.log(`[notifications] no project matched path ${payload.projectPath} - skipping`);
      return;
    }

    const scan = await scanProject(project.path);
    let tasksContent: string | undefined;
    if (scan.specDir && scan.artifactFiles.includes('tasks.md')) {
      try {
        tasksContent = await fs.promises.readFile(path.join(scan.specDir, 'tasks.md'), 'utf-8');
      } catch (err: unknown) {
        console.warn('[notifications] could not read tasks.md - phase detection may be imprecise:', err);
      }
    }
    const phase = detectPhase(scan.artifactFiles, tasksContent);
    const timestamp = new Date().toISOString();

    console.log(`[notifications] phase-changed: ${project.name} → ${phase} (${payload.command})`);

    sendToRenderer('phase-changed', {
      projectId: project.id,
      projectName: project.name,
      command: payload.command,
      phase,
      timestamp,
    });

    // Flash taskbar (Windows) or bounce dock icon (macOS) to grab attention
    if (mainWindow && !mainWindow.isFocused()) {
      mainWindow.flashFrame(true);
      if (process.platform === 'darwin') {
        app.dock?.bounce('informational');
      }
    }

    void playNotificationSound(config.settings.soundVolume, payload.command);

    if (config.settings.osNotifications) {
      showCompletionNotification({ projectName: project.name, command: payload.command, mainWindow });
    }
  } catch (err: unknown) {
    console.error('[notifications] notify error:', err);
  }
}

const watcherEvents: WatcherEvents = {
  onSpecsChanged: (projectId, files) => {
    sendToRenderer('specs-changed', { projectId, files, timestamp: new Date().toISOString() });
  },
  onBranchChanged: (projectId) => {
    sendToRenderer('branch-changed', { projectId, timestamp: new Date().toISOString() });
  },
  onGitIndexChanged: (_projectId) => {
    // No-op: repo-map generation removed
  },
  onError: (projectId, error) => {
    sendToRenderer('project-error', { projectId, error, timestamp: new Date().toISOString() });
  },
};

function startWatchingAll() {
  try {
    const config = loadConfig();
    for (const project of getProjects(config)) {
      watchProject(project.id, project.path, watcherEvents);
    }
  } catch {
    // Config may not exist yet
  }
}

export function startWatchingProject(projectId: string, projectPath: string) {
  watchProject(projectId, projectPath, watcherEvents);
}

export function stopWatchingProject(projectId: string) {
  const { unwatchProject } = require('./projects/file-watcher.js');
  unwatchProject(projectId);
}

// Theme menu items — matches the order in renderer/src/themes/themes.ts
const THEME_MENU_ITEMS: readonly { id: string; name: string; category: 'dark' | 'light' }[] = [
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', category: 'dark' },
  { id: 'radix-mauve', name: 'Radix Mauve', category: 'dark' },
  { id: 'dracula', name: 'Dracula', category: 'dark' },
  { id: 'tokyo-night', name: 'Tokyo Night', category: 'dark' },
  { id: 'one-dark', name: 'One Dark', category: 'dark' },
  { id: 'rose-pine', name: 'Rosé Pine', category: 'dark' },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', category: 'dark' },
  { id: 'solarized-dark', name: 'Solarized Dark', category: 'dark' },
  { id: 'solarized-light', name: 'Solarized Light', category: 'light' },
  { id: 'catppuccin-latte', name: 'Catppuccin Latte', category: 'light' },
];

// Reading font menu items — matches the order in renderer/src/themes/fonts.ts
const FONT_MENU_ITEMS: readonly { id: string; name: string }[] = [
  { id: 'inter', name: 'Inter' },
  { id: 'system', name: 'System Default' },
  { id: 'atkinson', name: 'Atkinson Hyperlegible' },
  { id: 'ibm-plex', name: 'IBM Plex Sans' },
  { id: 'source-sans', name: 'Source Sans' },
  { id: 'nunito', name: 'Nunito' },
  { id: 'geist', name: 'Geist' },
  { id: 'jetbrains-mono', name: 'JetBrains Mono' },
];

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 20;

function changeFontSize(delta: number) {
  const config = loadConfig();
  const current = config.settings.fontSize;
  const next = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, current + delta));
  if (next === current) return;
  config.settings = { ...config.settings, fontSize: next };
  void saveConfig(config);
  sendToRenderer('settings-changed', { fontSize: next });
  buildMenu();
}

function resetFontSize() {
  const config = loadConfig();
  config.settings = { ...config.settings, fontSize: DEFAULT_SETTINGS.fontSize };
  void saveConfig(config);
  sendToRenderer('settings-changed', { fontSize: DEFAULT_SETTINGS.fontSize });
  buildMenu();
}

function buildMenu() {
  const config = loadConfig();
  const currentSize = config.settings.fontSize;

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(process.platform === 'darwin'
      ? [{ role: 'appMenu' as const }]
      : []),
    { role: 'fileMenu' as const },
    { role: 'editMenu' as const },
    {
      label: 'View',
      submenu: [
        {
          label: `Increase Font Size`,
          accelerator: 'CmdOrCtrl+=',
          enabled: currentSize < MAX_FONT_SIZE,
          click: () => changeFontSize(1),
        },
        {
          label: `Decrease Font Size`,
          accelerator: 'CmdOrCtrl+-',
          enabled: currentSize > MIN_FONT_SIZE,
          click: () => changeFontSize(-1),
        },
        {
          label: `Reset Font Size (${DEFAULT_SETTINGS.fontSize}px)`,
          accelerator: 'CmdOrCtrl+0',
          click: () => resetFontSize(),
        },
        { type: 'separator' as const },
        {
          label: `Current: ${currentSize}px`,
          enabled: false,
        },
        { type: 'separator' as const },
        {
          label: 'Reading Font',
          submenu: FONT_MENU_ITEMS.map((font) => ({
            label: font.name,
            type: 'radio' as const,
            checked: config.settings.readingFont === font.id,
            click: () => {
              const c = loadConfig();
              c.settings = { ...c.settings, readingFont: font.id };
              void saveConfig(c);
              sendToRenderer('settings-changed', { readingFont: font.id });
              buildMenu();
            },
          })),
        },
        { type: 'separator' as const },
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
      ],
    },
    {
      label: 'Notifications',
      submenu: [
        { label: 'Sound Volume', enabled: false },
        ...(['high', 'medium', 'low', 'off'] as const).map((level) => ({
          label: level.charAt(0).toUpperCase() + level.slice(1),
          type: 'radio' as const,
          checked: config.settings.soundVolume === level,
          click: () => {
            const c = loadConfig();
            c.settings = { ...c.settings, soundVolume: level as SoundVolume };
            void saveConfig(c);
            sendToRenderer('settings-changed', { soundVolume: level });
            buildMenu();
          },
        })),
        { type: 'separator' as const },
        {
          label: 'OS Notifications',
          type: 'checkbox' as const,
          checked: config.settings.osNotifications,
          click: () => {
            const c = loadConfig();
            const next = !c.settings.osNotifications;
            c.settings = { ...c.settings, osNotifications: next };
            void saveConfig(c);
            sendToRenderer('settings-changed', { osNotifications: next });
            buildMenu();
          },
        },
      ],
    },
    {
      label: 'Theme',
      submenu: [
        ...THEME_MENU_ITEMS.map((theme) => ({
          label: theme.name,
          type: 'radio' as const,
          checked: config.settings.theme === theme.id,
          click: () => {
            const c = loadConfig();
            c.settings = { ...c.settings, theme: theme.id };
            void saveConfig(c);
            sendToRenderer('settings-changed', { theme: theme.id });
            buildMenu();
          },
        })),
      ],
    },
    { role: 'windowMenu' as const },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => checkForUpdatesManual(),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    show: false,
    backgroundColor: '#121113',
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Defer non-critical startup work until window is visible
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();

    // These run after the window is showing — they don't block first render
    buildMenu();
    startWatchingAll();
    startNotifyServer(handleNotify);
    if (mainWindow) initAutoUpdater(mainWindow);
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Critical path: init config cache + register IPC handlers + create window
  await initConfigCache();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  unwatchAll();
  stopNotifyServer();
  if (process.platform !== 'darwin') app.quit();
});
