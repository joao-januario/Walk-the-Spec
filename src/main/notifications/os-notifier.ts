import { Notification, type BrowserWindow } from 'electron';
import path from 'path';

export interface CompletionNotificationOpts {
  projectName: string;
  command: string;
  mainWindow: BrowserWindow | null;
}

export function showCompletionNotification({ projectName, command, mainWindow }: CompletionNotificationOpts): void {
  if (!Notification.isSupported()) {
    console.warn('[notifications] OS notifications not supported on this platform');
    return;
  }

  const notification = new Notification({
    title: 'Walk the Spec',
    body: `${command} completed — ${projectName}`,
    silent: true,
    icon: path.join(__dirname, '../../resources/icon.png'),
  });

  notification.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  notification.show();
}
