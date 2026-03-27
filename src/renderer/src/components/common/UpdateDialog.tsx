import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';
import type { AutoUpdateHandle } from '../../hooks/useAutoUpdate.js';

interface UpdateDialogProps {
  update: AutoUpdateHandle;
}

export default function UpdateDialog({ update }: UpdateDialogProps) {
  const { state, install, dismiss, restart } = update;

  if (state.status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-board-surface border-board-border w-[420px] rounded-xl border shadow-2xl"
      >
        {/* Header */}
        <div className="border-board-border border-b px-5 py-4">
          <h2 className="text-board-text-bright m-0 text-[1.125rem] font-semibold">
            {state.status === 'ready' ? 'Update Ready' : 'Update Available'}
          </h2>
          <p className="text-board-text-muted mt-1 text-[0.8125rem]">
            {state.status === 'ready'
              ? `Version ${state.version} has been downloaded and is ready to install.`
              : state.status === 'downloading'
                ? `Downloading version ${state.version}...`
                : `A new version of Walk the Spec is available: ${state.version}`}
          </p>
        </div>

        {/* Actions */}
        <div className="border-board-border flex justify-end gap-3 border-t px-5 py-3">
          {state.status === 'available' && (
            <>
              <button
                onClick={dismiss}
                className="text-board-text-muted hover:text-board-text cursor-pointer rounded-md bg-transparent px-4 py-1.5 text-[0.875rem] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={install}
                className={cn(
                  'rounded-md px-4 py-1.5 text-[0.875rem] font-semibold transition-colors cursor-pointer',
                  'bg-board-cyan/20 text-board-cyan border border-board-cyan/40 hover:bg-board-cyan/30',
                )}
              >
                Update
              </button>
            </>
          )}

          {state.status === 'downloading' && (
            <span className="text-board-text-muted text-[0.875rem]">Downloading...</span>
          )}

          {state.status === 'ready' && (
            <>
              <button
                onClick={dismiss}
                className="text-board-text-muted hover:text-board-text cursor-pointer rounded-md bg-transparent px-4 py-1.5 text-[0.875rem] transition-colors"
              >
                Later
              </button>
              <button
                onClick={restart}
                className={cn(
                  'rounded-md px-4 py-1.5 text-[0.875rem] font-semibold transition-colors cursor-pointer',
                  'bg-board-green/20 text-board-green border border-board-green/40 hover:bg-board-green/30',
                )}
              >
                Restart Now
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
