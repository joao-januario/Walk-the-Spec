import React from 'react';
import { motion } from 'framer-motion';
import { getPhaseClasses } from '../../theme.js';
import { cn } from '../../lib/utils.js';
import { usePrevious } from '../../hooks/usePrevious.js';
import type { Project } from '../../types/index.js';

// Phase color hex values for Framer Motion animate (can't use CSS classes for interpolation)
const phaseColorHex: Record<string, string> = {
  specify: '#7aa2f7',
  plan: '#bb9af7',
  tasks: '#ff9e64',
  implement: '#9ece6a',
  review: '#7dcfff',
  unknown: '#565870',
};

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

  const prevPhase = usePrevious(project.phase);
  const justTransitioned = prevPhase !== undefined && prevPhase !== project.phase;
  const dotColor = phaseColorHex[project.phase] ?? phaseColorHex.unknown;

  return (
    <div
      onClick={onClick}
      className={cn(
        'mb-[2px] cursor-pointer rounded-lg border-l-[3px] px-[14px] py-[10px] transition-all duration-150',
        selected
          ? 'bg-board-surface-elevated shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
          : 'bg-transparent hover:-translate-y-px hover:bg-board-surface-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
        selected ? p.border : 'border-l-transparent',
      )}
      // Inline style required: borderImage gradient uses dynamic phase color that Tailwind can't express statically
      style={selected ? { borderImage: `linear-gradient(to bottom, ${dotColor}, transparent) 1` } : undefined}
    >
      <div className="flex items-center gap-2">
        <motion.span
          className="inline-block h-[10px] w-[10px] shrink-0 rounded-full"
          animate={justTransitioned
            ? { backgroundColor: dotColor, scale: [1, 1.3, 1], boxShadow: [`0 0 0 0 ${dotColor}00`, `0 0 12px 4px ${dotColor}88`, `0 0 0 0 ${dotColor}00`] }
            : { backgroundColor: dotColor }
          }
          transition={justTransitioned ? { duration: 0.8 } : { duration: 0.3 }}
        />
        <span className={cn('text-[0.9375rem] font-semibold', selected ? 'text-board-text-bright' : 'text-board-text')}>
          {project.name}
        </span>
      </div>
      <div className="mt-[2px] ml-4">
        {hasError ? (
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
  );
}
