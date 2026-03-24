import React from 'react';
import { getPhaseClasses } from '../../theme.js';
import { cn } from '../../lib/utils.js';
import type { Project } from '../../types/index.js';

interface FeatureCardProps {
  project: Project;
  selected: boolean;
  onClick: () => void;
}

export default function FeatureCard({ project, selected, onClick }: FeatureCardProps) {
  const hasError = !!project.error;
  const p = hasError
    ? { bg: 'bg-board-red/20', text: 'text-board-red', dot: 'bg-board-red', border: 'border-board-red', label: 'Error' }
    : getPhaseClasses(project.phase);

  return (
    <div
      onClick={onClick}
      className={cn(
        'mb-[2px] cursor-pointer rounded-lg border-l-[3px] px-[14px] py-[10px] transition-all duration-[120ms]',
        selected ? 'bg-board-surface-hover' : 'hover:bg-board-surface-hover bg-transparent',
        selected ? p.border : 'border-l-transparent',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', p.dot)} />
        <span className={cn('text-[0.85rem] font-semibold', selected ? 'text-board-text-bright' : 'text-board-text')}>
          {project.name}
        </span>
      </div>
      <div className="mt-[2px] ml-4">
        {hasError ? (
          <span className="text-board-red text-[0.65rem]">{project.error}</span>
        ) : (
          <>
            <span className={cn('text-[0.65rem] font-semibold tracking-[0.05em] uppercase', p.text)}>{p.label}</span>
            {project.hasSpeckitContent && (
              <span className="text-board-text-muted ml-[6px] text-[0.65rem]">{project.currentBranch}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
