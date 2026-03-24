import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';
import { getPriorityClasses } from '../../theme.js';
import type { UserStoryContent, GWTScenario } from '../../types/index.js';

export default function UserStoryCard({ content }: { content: UserStoryContent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-board-surface border-board-border mb-2 rounded-lg border px-4 py-[14px]">
      <div className="flex cursor-pointer items-center gap-[10px]" onClick={() => setExpanded(!expanded)}>
        <span className="text-board-text-muted text-xs">{expanded ? '▼' : '▶'}</span>
        <span
          className={cn('rounded px-[7px] py-[1px] text-[0.65rem] font-bold', getPriorityClasses(content.priority))}
        >
          {content.priority}
        </span>
        <span className="text-board-text-bright text-sm font-semibold">
          US{content.number} — {content.title}
        </span>
      </div>
      <p className="text-board-text mt-[6px] mb-0 ml-8 text-sm leading-[1.5]">{content.description}</p>

      {expanded && (
        <div className="mt-3 ml-8">
          {content.whyPriority && (
            <div className="mb-[10px]">
              <div className="text-board-text-muted mb-1 text-xs font-semibold uppercase">Why this priority</div>
              <p className="text-board-text m-0 text-[0.78rem]">{content.whyPriority}</p>
            </div>
          )}
          {content.acceptanceScenarios.length > 0 && (
            <div>
              <div className="text-board-text-muted mb-[6px] text-xs font-semibold uppercase">Acceptance Scenarios</div>
              {content.acceptanceScenarios.map((s: GWTScenario, i: number) => (
                <div key={i} className="text-board-text border-board-border mb-1 border-l-2 pl-[10px] text-[0.78rem]">
                  <span className="text-board-green font-semibold">Given</span> {s.given},{' '}
                  <span className="text-board-orange font-semibold">When</span> {s.when},{' '}
                  <span className="text-board-accent font-semibold">Then</span> {s.then}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
