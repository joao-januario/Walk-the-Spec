import React from 'react';
import { cn } from '../../lib/utils.js';

interface RefactorBacklogIconProps {
  active: boolean;
  onClick: () => void;
}

export default function RefactorBacklogIcon({ active, onClick }: RefactorBacklogIconProps) {
  return (
    <button
      onClick={onClick}
      title="Refactor Backlog"
      className={cn(
        'flex w-full cursor-pointer items-center gap-[6px] rounded-[6px] border-l-[3px] border-none px-[14px] py-2 text-left text-[0.78rem] font-medium',
        active
          ? 'bg-board-surface-hover border-board-purple text-board-purple'
          : 'text-board-text-muted hover:bg-board-surface-hover border-l-transparent bg-transparent',
      )}
    >
      <span className="text-[0.9rem]">🧹</span>
      <span>Refactor Backlog</span>
    </button>
  );
}
