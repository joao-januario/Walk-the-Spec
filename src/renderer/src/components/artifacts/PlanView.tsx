import React from 'react';
import DecisionSection from '../elements/DecisionSection.js';
import type { Element, SectionContent, DecisionContent } from '../../types/index.js';

export default function PlanView({ elements }: { elements: Element[] }) {
  const sections = elements.filter((e) => e.type === 'section');
  const decisions = elements.filter((e) => e.type === 'decision');

  const summaryEl = sections.find((e) => e.id === 'Summary');
  const contextEl = sections.find((e) => e.id === 'Technical Context');
  let contextPairs: [string, string][] = [];
  if (contextEl) {
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
          <p className="text-board-text text-[0.88rem] leading-relaxed">
            {(summaryEl.content as SectionContent).content}
          </p>
        </section>
      )}

      {contextPairs.length > 0 && (
        <section className="mb-7">
          <h3 className="text-board-text-muted mb-[10px] text-[0.85rem] font-semibold tracking-[0.05em] uppercase">
            Technical Context
          </h3>
          <div className="bg-board-surface border-board-border rounded-lg border px-4 py-[14px]">
            {contextPairs.map(([key, value]) => (
              <div key={key} className="flex gap-4 py-1">
                <span className="text-board-text-muted w-[140px] shrink-0 text-[0.78rem] font-semibold">{key}</span>
                <span className="text-board-text text-[0.82rem]">{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {decisions.length > 0 && (
        <section>
          <h3 className="text-board-text-muted mb-[10px] text-[0.85rem] font-semibold tracking-[0.05em] uppercase">
            Design Decisions
          </h3>
          {decisions.map((e) => (
            <DecisionSection key={e.id} content={e.content as DecisionContent} />
          ))}
        </section>
      )}
    </div>
  );
}
