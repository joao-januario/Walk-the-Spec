import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc/handlers.js';
import { loadConfig, saveConfig, getProjects, DEFAULT_SETTINGS, type SoundVolume } from './config/config-manager.js';
import { watchProject, unwatchAll, type WatcherEvents } from './projects/file-watcher.js';
import { showCompletionNotification } from './notifications/os-notifier.js';
import { playNotificationSound } from './notifications/sound-player.js';
import { startNotifyServer, stopNotifyServer, type NotifyPayload } from './notifications/notify-server.js';
import { scanProject } from './projects/project-scanner.js';
import { detectPhase } from './phase/phase-detector.js';
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
    // Find project by matching path
    const normalise = (p: string) => p.replace(/\\/g, '/').toLowerCase();
    const project = config.projects.find(
      (p) => normalise(p.path) === normalise(payload.projectPath),
    );
    if (!project) {
      console.log(`[notifications] no project matched path ${payload.projectPath} — skipping`);
      return;
    }

    const scan = scanProject(project.path);
    let tasksContent: string | undefined;
    if (scan.specDir && scan.artifactFiles.includes('tasks.md')) {
      try {
        tasksContent = await fs.promises.readFile(path.join(scan.specDir, 'tasks.md'), 'utf-8');
      } catch (err: unknown) {
        console.warn('[notifications] could not read tasks.md — phase detection may be imprecise:', err);
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

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 20;

function changeFontSize(delta: number) {
  const config = loadConfig();
  const current = config.settings.fontSize;
  const next = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, current + delta));
  if (next === current) return;
  config.settings = { ...config.settings, fontSize: next };
  saveConfig(undefined, config);
  sendToRenderer('settings-changed', { fontSize: next });
  buildMenu();
}

function resetFontSize() {
  const config = loadConfig();
  config.settings = { ...config.settings, fontSize: DEFAULT_SETTINGS.fontSize };
  saveConfig(undefined, config);
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
            saveConfig(undefined, c);
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
            saveConfig(undefined, c);
            sendToRenderer('settings-changed', { osNotifications: next });
            buildMenu();
          },
        },
      ],
    },
    { role: 'windowMenu' as const },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: '#121113',
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
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

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
  buildMenu();
  startWatchingAll();
  startNotifyServer(handleNotify);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  unwatchAll();
  stopNotifyServer();
  if (process.platform !== 'darwin') app.quit();
});
