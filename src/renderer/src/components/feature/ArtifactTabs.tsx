import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';
import { getPhaseClasses } from '../../theme.js';
import type { ArtifactType, Phase } from '../../types/index.js';

const TAB_LABELS: Record<string, string> = {
  spec: 'Spec',
  plan: 'Plan',
  tasks: 'Tasks',
  research: 'Research',
  review: 'Review',
};

interface ArtifactTabsProps {
  available: string[];
  active: ArtifactType;
  onSelect: (type: ArtifactType) => void;
  heroTab?: ArtifactType;
  phase?: Phase;
}

export default function ArtifactTabs({ available, active, onSelect, heroTab, phase }: ArtifactTabsProps) {
  const phaseClasses = phase ? getPhaseClasses(phase) : null;

  return (
    <div className="border-board-border relative mb-5 flex border-b">
      {available.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type as ArtifactType)}
          className={cn(
            'relative -mb-px cursor-pointer border-b-2 border-none bg-transparent px-[18px] py-2 text-[0.9375rem] transition-colors duration-150',
            active === type
              ? 'text-board-accent font-semibold'
              : 'text-board-text-muted font-normal hover:text-board-text hover:-translate-y-px',
            active === type ? 'border-transparent' : 'border-transparent',
          )}
        >
          <span className="flex items-center gap-[6px]">
            {TAB_LABELS[type] ?? type}
            {heroTab === type && phaseClasses && (
              <motion.span
                layoutId="hero-dot"
                className={cn('inline-block h-[7px] w-[7px] rounded-full', phaseClasses.dot)}
                style={{ boxShadow: `0 0 6px 1px var(--color-phase-${phase})` }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </span>
          {active === type && (
            <motion.div
              layoutId="tab-indicator"
              className="bg-board-accent absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-[1px]"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
