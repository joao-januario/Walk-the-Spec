import React from 'react';
import CodeBlock from '../elements/CodeBlock.js';
import FileStructureView from '../elements/FileStructureView.js';
import CollapsibleSection from '../ui/CollapsibleSection.js';
import CodeTag from '../ui/CodeTag.js';
import MarkdownContent from '../ui/MarkdownContent.js';
import type { Element, SectionContent, DecisionContent, FileStructureContent } from '../../types/index.js';

interface PlanViewProps {
  elements: Element[];
  commentEnabled: boolean;
  getComment: (heading: string) => string;
  onCommentChange: (heading: string, text: string) => void;
}

export default function PlanView({ elements, commentEnabled, getComment, onCommentChange }: PlanViewProps) {
  const sections = elements.filter((e) => e.type === 'section');
  const decisions = elements.filter((e) => e.type === 'decision');
  const fileStructureEl = elements.find((e) => e.type === 'file-structure');

  const summaryEl = sections.find((e) => e.id === 'Summary');
  const approachEl = sections.find((e) => e.id === 'Technical Approach');
  const contextEl = sections.find((e) => e.id === 'Technical Context');
  const structureEl = sections.find((e) => e.id === 'Project Structure');

  // Old format fallback: parse key-value pairs from JSON
  let contextPairs: [string, string][] = [];
  if (!approachEl && contextEl) {
    try {
      const obj = JSON.parse((contextEl.content as SectionContent).content);
      contextPairs = Object.entries(obj);
    } catch {
      /* ignore */
    }
  }

  let num = 0;

  return (
    <div className="space-y-5">
      {summaryEl && (
        <CollapsibleSection
          id="plan-summary"
          heading="Summary"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('Summary')}
          onCommentChange={(text) => onCommentChange('Summary', text)}
        >
          <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-3">
            <MarkdownContent content={(summaryEl.content as SectionContent).content} />
          </div>
        </CollapsibleSection>
      )}

      {approachEl && (
        <CollapsibleSection
          id="plan-approach"
          heading="Technical Approach"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('Technical Approach')}
          onCommentChange={(text) => onCommentChange('Technical Approach', text)}
        >
          <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-3">
            <MarkdownContent content={(approachEl.content as SectionContent).content} />
          </div>
        </CollapsibleSection>
      )}

      {contextPairs.length > 0 && (
        <CollapsibleSection
          id="plan-context"
          heading="Technical Context"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('Technical Context')}
          onCommentChange={(text) => onCommentChange('Technical Context', text)}
        >
          <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-3">
            {contextPairs.map(([key, value]) => (
              <div key={key} className="flex gap-4 py-1">
                <span className="text-board-text-muted w-[140px] shrink-0 text-[0.875rem] font-semibold">{key}</span>
                <MarkdownContent inline content={value} className="text-board-text text-[1rem]" />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {decisions.length > 0 && (
        <CollapsibleSection
          id="plan-decisions"
          heading="Architecture Decisions"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('Architecture Decisions')}
          onCommentChange={(text) => onCommentChange('Architecture Decisions', text)}
        >
          <div className="space-y-3">
            {decisions.map((e) => {
              const d = e.content as DecisionContent;
              return (
                <CollapsibleSection
                  key={e.id}
                  id={`plan-decision-${e.id}`}
                  heading={d.heading}
                  level="subsection"
                  commentEnabled={commentEnabled}
                  commentText={getComment(d.heading)}
                  onCommentChange={(text) => onCommentChange(d.heading, text)}
                >
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
                </CollapsibleSection>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {fileStructureEl && (
        <CollapsibleSection
          id="plan-structure"
          heading="Files Modified"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('Files Modified')}
          onCommentChange={(text) => onCommentChange('Files Modified', text)}
        >
          <FileStructureView sections={(fileStructureEl.content as FileStructureContent).sections} />
        </CollapsibleSection>
      )}

      {structureEl && !fileStructureEl && (
        <CollapsibleSection
          id="plan-structure"
          heading="Files Modified"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('Files Modified')}
          onCommentChange={(text) => onCommentChange('Files Modified', text)}
        >
          <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-3">
            <CodeBlock code={(structureEl.content as SectionContent).content} language="text" />
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
