import { useEffect, useRef } from 'react';

export type SoundVolume = 'high' | 'medium' | 'low' | 'off';

export const VOLUME_MAP: Record<SoundVolume, number> = {
  high: 1.0,
  medium: 0.5,
  low: 0.2,
  off: 0,
} as const;

export function usePhaseNotification(): void {
  const volumeRef = useRef<SoundVolume>('medium');

  useEffect(() => {
    // Load initial settings
    window.api.getSettings().then((settings: { soundVolume?: SoundVolume }) => {
      volumeRef.current = settings.soundVolume ?? 'medium';
    }).catch((err: unknown) => {
      console.warn('[notifications] failed to load settings:', err);
    });

    // Listen for settings changes
    const unsubSettings = window.api.onSettingsChanged((data: { soundVolume?: SoundVolume }) => {
      if (data.soundVolume !== undefined) {
        volumeRef.current = data.soundVolume;
      }
    });

    // Listen for phase-changed (command completion) events
    const unsubPhase = window.api.onPhaseChanged(() => {
      const volume = volumeRef.current;
      if (volume === 'off') return;

      const audio = new Audio('./sounds/notify.ogg');
      audio.volume = VOLUME_MAP[volume];
      audio.play().catch(() => {});
    });

    return () => {
      unsubSettings();
      unsubPhase();
    };
  }, []);
}
