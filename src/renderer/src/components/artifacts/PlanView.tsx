import React from 'react';
import DecisionSection from '../elements/DecisionSection.js';
import CodeBlock from '../elements/CodeBlock.js';
import SectionLabel from '../ui/SectionLabel.js';
import MarkdownContent from '../ui/MarkdownContent.js';
import type { Element, SectionContent, DecisionContent } from '../../types/index.js';

export default function PlanView({ elements }: { elements: Element[] }) {
  const sections = elements.filter((e) => e.type === 'section');
  const decisions = elements.filter((e) => e.type === 'decision');

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

  return (
    <div>
      {summaryEl && (
        <section className="mb-6">
          <MarkdownContent content={(summaryEl.content as SectionContent).content} />
        </section>
      )}

      {approachEl && (
        <section className="mb-7">
          <SectionLabel>Technical Approach</SectionLabel>
          <MarkdownContent content={(approachEl.content as SectionContent).content} />
        </section>
      )}

      {contextPairs.length > 0 && (
        <section className="mb-7">
          <SectionLabel>Technical Context</SectionLabel>
          <div className="bg-board-surface border-board-border rounded-lg border px-4 py-[14px]">
            {contextPairs.map(([key, value]) => (
              <div key={key} className="flex gap-4 py-1">
                <span className="text-board-text-muted w-[140px] shrink-0 text-[0.875rem] font-semibold">{key}</span>
                <MarkdownContent inline content={value} className="text-board-text text-[0.9375rem]" />
              </div>
            ))}
          </div>
        </section>
      )}

      {decisions.length > 0 && (
        <section className="mb-7">
          <SectionLabel>Architecture Decisions</SectionLabel>
          {decisions.map((e) => (
            <DecisionSection key={e.id} content={e.content as DecisionContent} />
          ))}
        </section>
      )}

      {structureEl && (
        <section>
          <SectionLabel>Files Modified</SectionLabel>
          <CodeBlock code={(structureEl.content as SectionContent).content} language="text" />
        </section>
      )}
    </div>
  );
}
