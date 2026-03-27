import React from 'react';
import CollapsibleSection from '../ui/CollapsibleSection.js';
import CodeTag from '../ui/CodeTag.js';
import MarkdownContent from '../ui/MarkdownContent.js';
import type { Element, DecisionContent } from '../../types/index.js';

interface ResearchViewProps {
  elements: Element[];
  commentEnabled: boolean;
  getComment: (heading: string) => string;
  onCommentChange: (heading: string, text: string) => void;
}

export default function ResearchView({ elements, commentEnabled, getComment, onCommentChange }: ResearchViewProps) {
  const decisions = elements.filter((e) => e.type === 'decision');

  return (
    <div className="space-y-7">
      {decisions.map((e, idx) => {
        const d = e.content as DecisionContent;
        return (
          <CollapsibleSection
            key={e.id}
            id={`research-${e.id}`}
            heading={d.heading}
            level="section"
            number={idx + 1}
            commentEnabled={commentEnabled}
            commentText={getComment(d.heading)}
            onCommentChange={(text) => onCommentChange(d.heading, text)}
          >
            <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-3">
              <div>
                <CodeTag color="purple" className="mb-2">DECISION</CodeTag>
                <MarkdownContent content={d.content} className="mt-2" />
              </div>
              {d.rationale && (
                <div className="border-t border-board-border/20 pt-3 mt-3">
                  <CodeTag color="purple" className="mb-2">RATIONALE</CodeTag>
                  <MarkdownContent content={d.rationale} className="mt-2" />
                </div>
              )}
              {d.alternatives && (
                <div className="border-t border-board-border/20 pt-3 mt-3">
                  <CodeTag color="muted" className="mb-2">ALTERNATIVES</CodeTag>
                  <MarkdownContent content={d.alternatives} className="mt-2 text-board-text-muted" />
                </div>
              )}
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
