import React from 'react';
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
    <div className="border-board-border mb-5 flex border-b">
      {available.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type as ArtifactType)}
          className={cn(
            '-mb-px cursor-pointer border-b-2 border-none bg-transparent px-[18px] py-2 text-[0.8rem]',
            active === type
              ? 'text-board-accent border-board-accent font-semibold'
              : 'text-board-text-muted border-transparent font-normal',
          )}
        >
          {TAB_LABELS[type] ?? type}
        </button>
      ))}
    </div>
  );
}
