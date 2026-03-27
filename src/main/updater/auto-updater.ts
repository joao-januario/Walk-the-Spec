import { BrowserWindow, ipcMain } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

/**
 * Initialize the auto-updater. Checks GitHub Releases for a newer version
 * on startup and forwards lifecycle events to the renderer via IPC.
 *
 * Call once after the main window is created.
 */
export function initAutoUpdater(mainWindow: BrowserWindow): void {
  // Don't check for updates in dev mode — no published releases to find
  if (process.env.ELECTRON_RENDERER_URL) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-available', (info) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', { version: info.version });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded', { version: info.version });
    }
  });

  autoUpdater.on('error', (err) => {
    // Fail silently — FR-016: no internet or GitHub unreachable should not
    // surface errors to the user.
    console.log('[updater] update check failed (silent):', err.message);
  });

  // IPC handlers — renderer tells us what to do
  ipcMain.handle('update:install', async () => {
    await autoUpdater.downloadUpdate();
  });

  ipcMain.handle('update:restart', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  // Kick off the check
  void autoUpdater.checkForUpdates().catch(() => {
    // Silent — network may be unavailable
  });
}
