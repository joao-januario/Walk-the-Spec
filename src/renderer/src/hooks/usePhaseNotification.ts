import { useEffect, useState, useCallback } from 'react';
import type { ArtifactType } from '../types/index.js';

const COMMAND_COMMENTABLE_TABS: Record<string, ArtifactType[]> = {
  'spec.specify': ['spec'],
  'spec.clarify': ['spec'],
  'spec.plan': ['plan', 'research'],
  'spec.implement': ['summary'],
  'spec.review': ['review'],
};

const STORAGE_KEY = 'walk-the-spec:lastCommand';

export interface PhaseNotificationState {
  commentableTabs: ArtifactType[];
  lastCommand: string | null;
}

/**
 * Listens for phase-changed events from the main process.
 * Tracks the last completed command and derives which artifact tabs are commentable.
 * Persists to sessionStorage so state survives hot reloads.
 */
export function usePhaseNotification(): PhaseNotificationState {
  const [lastCommand, setLastCommand] = useState<string | null>(
    () => sessionStorage.getItem(STORAGE_KEY),
  );
  const [commentableTabs, setCommentableTabs] = useState<ArtifactType[]>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (COMMAND_COMMENTABLE_TABS[stored] ?? []) : [];
  });

  const handlePhaseChanged = useCallback((payload: { command: string }) => {
    setLastCommand(payload.command);
    setCommentableTabs(COMMAND_COMMENTABLE_TABS[payload.command] ?? []);
    sessionStorage.setItem(STORAGE_KEY, payload.command);
  }, []);

  useEffect(() => {
    const unsubPhase = window.api.onPhaseChanged(handlePhaseChanged);
    return () => {
      unsubPhase();
    };
  }, [handlePhaseChanged]);

  return { commentableTabs, lastCommand };
}
