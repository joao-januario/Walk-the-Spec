import { execFile } from 'child_process';
import path from 'path';
import type { SoundVolume } from '../config/config-manager.js';

const VOLUME_MAP: Record<Exclude<SoundVolume, 'off'>, number> = {
  high: 1.0,
  medium: 0.5,
  low: 0.2,
};

/** Maps spec command suffixes to their phase sound files. */
const PHASE_SOUNDS: Record<string, string> = {
  specify: 'specify.wav',
  clarify: 'clarify.wav',
  plan: 'plan.wav',
  implement: 'implement.wav',
  review: 'review.wav',
  heal: 'heal.wav',
  conclude: 'conclude.wav',
};

const DEFAULT_SOUND = 'plan.wav';

function getSoundPath(command: string): string {
  // command is like "spec.implement" — extract the phase after the dot
  const phase = command.split('.').pop() ?? '';
  const file = PHASE_SOUNDS[phase] ?? DEFAULT_SOUND;
  // __dirname resolves to out/main/ after electron-vite bundling
  return path.join(__dirname, '../../resources/sounds', file);
}

function playWindows(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = `(New-Object System.Media.SoundPlayer '${filePath.replace(/'/g, "''")}').PlaySync()`;
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function playMacOS(filePath: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile('afplay', [filePath, '-v', String(volume)], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function playNotificationSound(volume: SoundVolume, command: string): Promise<void> {
  if (volume === 'off') {
    console.log('[sound-player] volume is off — skipping playback');
    return;
  }

  const filePath = getSoundPath(command);
  const numericVolume = VOLUME_MAP[volume];

  console.log(`[sound-player] playing ${path.basename(filePath)} for ${command} at volume=${volume} (${numericVolume})`);

  try {
    if (process.platform === 'win32') {
      await playWindows(filePath);
    } else if (process.platform === 'darwin') {
      await playMacOS(filePath, numericVolume);
    } else {
      console.warn(`[sound-player] unsupported platform: ${process.platform} — skipping audio`);
      return;
    }
    console.log('[sound-player] playback completed');
  } catch (err: unknown) {
    console.error('[sound-player] playback failed:', err);
  }
}
