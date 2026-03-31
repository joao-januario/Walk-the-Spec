import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { cn } from '../../lib/utils.js';
import { getPhaseClasses } from '../../theme.js';
import type { ArtifactType, Phase } from '../../types/index.js';

const TAB_LABELS: Record<string, string> = {
  spec: 'Spec',
  plan: 'Plan',
  tasks: 'Tasks',
  research: 'Research',
  summary: 'Summary',
  'deep-dives': 'Deep Dives',
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (activeBtn) {
      setIndicator({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [active]);

  useLayoutEffect(updateIndicator, [updateIndicator]);

  return (
    <div className="border-board-border relative mb-5 flex items-center border-b">
      <div className="relative flex flex-1" ref={containerRef}>
        {available.map((type) => (
          <button
            key={type}
            data-tab={type}
            onClick={() => onSelect(type as ArtifactType)}
            className={cn(
              'relative -mb-px cursor-pointer border-b-2 border-none bg-transparent px-[18px] py-2 text-[0.9375rem] transition-colors duration-150',
              active === type
                ? 'text-board-accent font-semibold'
                : 'text-board-text-muted font-normal hover:text-board-text hover:-translate-y-px',
              'border-transparent',
            )}
          >
            <span className="flex items-center gap-[6px]">
              {TAB_LABELS[type] ?? type}
              {heroTab === type && phaseClasses && (
                <span
                  className={cn('inline-block h-[7px] w-[7px] rounded-full transition-all duration-300', phaseClasses.dot)}
                  style={{ boxShadow: `0 0 6px 1px var(--color-phase-${phase})` }}
                />
              )}
            </span>
          </button>
        ))}
        <div
          className="bg-board-accent absolute bottom-[-1px] h-[2px] rounded-[1px] transition-all duration-200 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>
    </div>
  );
}
