import React from 'react';
import DecisionSection from '../elements/DecisionSection.js';
import CodeBlock from '../elements/CodeBlock.js';
import type { Element, SectionContent, DecisionContent } from '../../types/index.js';

/** Render inline markdown: `code`, **bold**, and plain text */
function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  // Match backtick code spans and bold markers
  const regex = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      // Inline code
      parts.push(
        <code key={match.index} className="bg-board-bg text-board-cyan rounded px-1.5 py-0.5 text-[0.8em] font-mono">
          {match[1]}
        </code>
      );
    } else if (match[2] !== undefined) {
      // Bold
      parts.push(<strong key={match.index} className="text-board-text-bright font-semibold">{match[2]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}

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
          <p className="text-board-text text-[0.9375rem] leading-relaxed">
            <InlineMarkdown text={(summaryEl.content as SectionContent).content} />
          </p>
        </section>
      )}

      {/* New format: Technical Approach as prose */}
      {approachEl && (
        <section className="mb-7">
          <h3 className="text-board-text-muted mb-[10px] text-[1rem] font-semibold tracking-[0.05em] uppercase">
            Technical Approach
          </h3>
          <div className="text-board-text space-y-3 text-[0.9375rem] leading-relaxed">
            {(approachEl.content as SectionContent).content.split('\n\n').map((para, i) => (
              <p key={i}><InlineMarkdown text={para} /></p>
            ))}
          </div>
        </section>
      )}

      {/* Old format fallback: Technical Context key-value table */}
      {contextPairs.length > 0 && (
        <section className="mb-7">
          <h3 className="text-board-text-muted mb-[10px] text-[1rem] font-semibold tracking-[0.05em] uppercase">
            Technical Context
          </h3>
          <div className="bg-board-surface border-board-border rounded-lg border px-4 py-[14px]">
            {contextPairs.map(([key, value]) => (
              <div key={key} className="flex gap-4 py-1">
                <span className="text-board-text-muted w-[140px] shrink-0 text-[0.875rem] font-semibold">{key}</span>
                <span className="text-board-text text-[0.9375rem]">{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {decisions.length > 0 && (
        <section className="mb-7">
          <h3 className="text-board-text-muted mb-[10px] text-[1rem] font-semibold tracking-[0.05em] uppercase">
            Architecture Decisions
          </h3>
          {decisions.map((e) => (
            <DecisionSection key={e.id} content={e.content as DecisionContent} />
          ))}
        </section>
      )}

      {/* Project Structure / Files Modified */}
      {structureEl && (
        <section>
          <h3 className="text-board-text-muted mb-[10px] text-[1rem] font-semibold tracking-[0.05em] uppercase">
            Files Modified
          </h3>
          <CodeBlock code={(structureEl.content as SectionContent).content} language="text" />
        </section>
      )}
    </div>
  );
}
