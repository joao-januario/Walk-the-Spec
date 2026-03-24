import React from 'react';
import { theme } from '../../theme.js';
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
    } catch { /* ignore */ }
  }

  return (
    <div>
      {summaryEl && (
        <section style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '0.88rem', color: theme.text, lineHeight: 1.6 }}>{(summaryEl.content as SectionContent).content}</p>
        </section>
      )}

      {contextPairs.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '0.85rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 600 }}>Technical Context</h3>
          <div style={{ backgroundColor: theme.surface, borderRadius: '8px', padding: '14px 16px', border: `1px solid ${theme.border}` }}>
            {contextPairs.map(([key, value]) => (
              <div key={key} style={{ display: 'flex', padding: '4px 0', gap: '16px' }}>
                <span style={{ width: '140px', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, flexShrink: 0 }}>{key}</span>
                <span style={{ fontSize: '0.82rem', color: theme.text }}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {decisions.length > 0 && (
        <section>
          <h3 style={{ fontSize: '0.85rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 600 }}>Design Decisions</h3>
          {decisions.map((e) => <DecisionSection key={e.id} content={e.content as DecisionContent} />)}
        </section>
      )}
    </div>
  );
}
