import { useState, useEffect } from 'react';

type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; version: string }
  | { status: 'downloading'; version: string }
  | { status: 'ready'; version: string };

export interface AutoUpdateHandle {
  state: UpdateState;
  install: () => void;
  dismiss: () => void;
  restart: () => void;
}

export function useAutoUpdate(): AutoUpdateHandle {
  const [state, setState] = useState<UpdateState>({ status: 'idle' });

  useEffect(() => {
    const unsubAvailable = window.api.onUpdateAvailable(({ version }) => {
      setState({ status: 'available', version });
    });

    const unsubDownloaded = window.api.onUpdateDownloaded(({ version }) => {
      setState({ status: 'ready', version });
    });

    return () => {
      unsubAvailable();
      unsubDownloaded();
    };
  }, []);

  const install = () => {
    if (state.status === 'available') {
      setState({ status: 'downloading', version: state.version });
      void window.api.installUpdate();
    }
  };

  const dismiss = () => {
    setState({ status: 'idle' });
  };

  const restart = () => {
    void window.api.restartForUpdate();
  };

  return { state, install, dismiss, restart };
}
