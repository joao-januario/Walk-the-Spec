import React from 'react';
import { getPhaseClasses } from '../../theme.js';
import { cn } from '../../lib/utils.js';
import { usePrevious } from '../../hooks/usePrevious.js';
import type { Project } from '../../types/index.js';

interface FeatureCardProps {
  project: Project;
  selected: boolean;
  onClick: () => void;
  onContextAction?: (action: 'refresh' | 'delete', project: Project) => void;
  loading?: boolean;
}

export default function FeatureCard({ project, selected, onClick, onContextAction, loading }: FeatureCardProps) {
  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number } | null>(null);
  const hasError = !!project.error;
  const p = hasError
    ? { bg: 'bg-board-red/20', text: 'text-board-red', dot: 'bg-board-red', border: 'border-board-red', label: 'Error' }
    : getPhaseClasses(project.phase);

  const prevPhase = usePrevious(project.phase);
  const justTransitioned = prevPhase !== undefined && prevPhase !== project.phase;
  const phaseVar = `var(--color-phase-${project.phase})`;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Close menu on any click outside
  React.useEffect(() => {
    if (!menuPos) return;
    const close = () => setMenuPos(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menuPos]);

  return (
    <>
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={cn(
        'mb-[2px] cursor-pointer rounded-lg border-l-[3px] px-[14px] py-[10px] transition-all duration-150',
        selected
          ? 'bg-board-surface-elevated shadow-card'
          : 'bg-transparent hover:-translate-y-px hover:bg-board-surface-hover hover:shadow-card-hover',
        selected ? p.border : 'border-l-transparent',
      )}
      style={selected ? { borderImage: `linear-gradient(to bottom, ${phaseVar}, transparent) 1` } : undefined}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-block h-[10px] w-[10px] shrink-0 rounded-full',
            justTransitioned && 'animate-[phase-pulse_0.8s_ease-out]',
          )}
          style={{ backgroundColor: phaseVar }}
        />
        <span className={cn('text-[0.9375rem] font-semibold', selected ? 'text-board-text-bright' : 'text-board-text')}>
          {project.name}
        </span>
      </div>
      <div className="mt-[2px] ml-4">
        {loading ? (
          <span className="text-board-text-muted text-[0.75rem] animate-pulse">Loading...</span>
        ) : hasError ? (
          <span className="text-board-red text-[0.75rem]">{project.error}</span>
        ) : (
          <>
            <span className={cn('text-[0.75rem] font-semibold tracking-[0.05em] uppercase', p.text)}>{p.label}</span>
            {project.hasSpeckitContent && (
              <span className="text-board-text-muted ml-[6px] text-[0.75rem]">{project.currentBranch}</span>
            )}
          </>
        )}
      </div>
    </div>

    {menuPos && (
      <div
        className="bg-board-surface border-board-border fixed z-50 min-w-[160px] rounded-lg border py-1 shadow-2xl"
        style={{ left: menuPos.x, top: menuPos.y }}
      >
        <button
          onClick={() => { setMenuPos(null); onContextAction?.('refresh', project); }}
          className="text-board-text hover:bg-board-surface-hover w-full cursor-pointer bg-transparent px-3 py-1.5 text-left text-[0.8125rem] transition-colors"
        >
          Refresh Specs
        </button>
        <button
          onClick={() => { setMenuPos(null); onContextAction?.('delete', project); }}
          className="text-board-red hover:bg-board-red/10 w-full cursor-pointer bg-transparent px-3 py-1.5 text-left text-[0.8125rem] transition-colors"
        >
          Remove Project
        </button>
      </div>
    )}
    </>
  );
}
