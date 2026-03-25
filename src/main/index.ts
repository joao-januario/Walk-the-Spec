import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc/handlers.js';
import { loadConfig, getProjects } from './config/config-manager.js';
import { watchProject, unwatchAll, type WatcherEvents } from './projects/file-watcher.js';

let mainWindow: BrowserWindow | null = null;

function sendToRenderer(channel: string, ...args: any[]) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: '#121113',
    titleBarStyle: 'hiddenInset',
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
  startWatchingAll();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  unwatchAll();
  if (process.platform !== 'darwin') app.quit();
});
