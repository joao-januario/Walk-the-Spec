import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';
import type { ArtifactType } from '../../types/index.js';

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
}

export default function ArtifactTabs({ available, active, onSelect }: ArtifactTabsProps) {
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
          {TAB_LABELS[type] ?? type}
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
