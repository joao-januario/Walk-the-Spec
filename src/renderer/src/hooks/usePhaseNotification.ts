import { useEffect } from 'react';

/**
 * Listens for phase-changed events from the main process.
 * Audio playback has been moved to the main process (sound-player.ts)
 * for proper OS audio integration (Volume Mixer visibility, cross-platform support).
 */
export function usePhaseNotification(): void {
  useEffect(() => {
    const unsubPhase = window.api.onPhaseChanged(() => {
      // Audio is now handled by main process — this hook is retained
      // for future UI-side reactions to phase changes (e.g., toast in-app).
    });

    return () => {
      unsubPhase();
    };
  }, []);
}
