import React, { useState } from 'react';
import type { DecisionContent } from '../../types/index.js';

export default function DecisionSection({ content }: { content: DecisionContent }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-board-surface border-board-border mb-2 rounded-lg border">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between px-4 py-3"
      >
        <span className="text-board-text-bright text-sm font-semibold">{content.heading}</span>
        <span className="text-board-text-muted text-xs">{expanded ? '▼' : '▶'}</span>
      </div>
      {expanded && (
        <div className="border-board-border/25 border-t px-4 pb-3.5">
          <div className="mt-2.5">
            <div className="text-board-purple text-[0.65rem] font-semibold tracking-[0.05em] uppercase">Decision</div>
            <p className="text-board-text my-1 text-[0.82rem]">{content.content}</p>
          </div>
          {content.rationale && (
            <div>
              <div className="text-board-purple text-[0.65rem] font-semibold tracking-[0.05em] uppercase">
                Rationale
              </div>
              <p className="text-board-text my-1 text-[0.82rem]">{content.rationale}</p>
            </div>
          )}
          {content.alternatives && (
            <div>
              <div className="text-board-text-muted text-[0.65rem] font-semibold tracking-[0.05em] uppercase">
                Alternatives
              </div>
              <p className="text-board-text-muted mt-1 text-[0.78rem]">{content.alternatives}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
