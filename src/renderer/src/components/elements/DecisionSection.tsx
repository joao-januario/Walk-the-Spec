import React, { useState } from 'react';
import type { DecisionContent } from '../../types/index.js';
import SectionLabel from '../ui/SectionLabel.js';
import MarkdownContent from '../ui/MarkdownContent.js';

export default function DecisionSection({ content }: { content: DecisionContent }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-board-surface border-board-border mb-2 rounded-lg border transition-colors duration-150 hover:border-board-border-hover">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between px-4 py-3"
      >
        <span className="text-board-text-bright text-[0.9375rem] font-semibold">{content.heading}</span>
        <span
          className="text-board-text-muted inline-block text-xs transition-transform duration-150"
          style={{ transform: `rotate(${expanded ? 90 : 0}deg)` }}
        >
          ▶
        </span>
      </div>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-200 ease-out"
        style={{
          gridTemplateRows: expanded ? '1fr' : '0fr',
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="border-board-border/25 border-t px-4 pb-3.5">
            <div className="mt-2.5">
              <SectionLabel sub color="text-board-purple">Decision</SectionLabel>
              <MarkdownContent content={content.content} className="my-1" />
            </div>
            {content.rationale && (
              <div>
                <SectionLabel sub color="text-board-purple">Rationale</SectionLabel>
                <MarkdownContent content={content.rationale} className="my-1" />
              </div>
            )}
            {content.alternatives && (
              <div>
                <SectionLabel sub>Alternatives</SectionLabel>
                <MarkdownContent content={content.alternatives} className="mt-1 text-board-text-muted" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
