import React, { useState } from 'react';
import { theme } from '../../theme.js';
import type { UserStoryContent, GWTScenario } from '../../types/index.js';

const PRIORITY_COLORS: Record<string, string> = { P1: '#f7768e', P2: '#ff9e64', P3: '#e0af68', P4: '#9ece6a', P5: '#7aa2f7' };

export default function UserStoryCard({ content }: { content: UserStoryContent }) {
  const [expanded, setExpanded] = useState(false);
  const color = PRIORITY_COLORS[content.priority] ?? theme.textMuted;

  return (
    <div style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '14px 16px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <span style={{ color: theme.textMuted, fontSize: '0.75rem' }}>{expanded ? '▼' : '▶'}</span>
        <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: `${color}20`, color }}>{content.priority}</span>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: theme.textBright }}>US{content.number} — {content.title}</span>
      </div>
      <p style={{ color: theme.text, fontSize: '0.8rem', margin: '6px 0 0 32px', lineHeight: 1.5 }}>{content.description}</p>

      {expanded && (
        <div style={{ marginTop: '12px', marginLeft: '32px' }}>
          {content.whyPriority && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>Why this priority</div>
              <p style={{ fontSize: '0.78rem', color: theme.text, margin: 0 }}>{content.whyPriority}</p>
            </div>
          )}
          {content.acceptanceScenarios.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>Acceptance Scenarios</div>
              {content.acceptanceScenarios.map((s: GWTScenario, i: number) => (
                <div key={i} style={{ fontSize: '0.78rem', color: theme.text, marginBottom: '4px', paddingLeft: '10px', borderLeft: `2px solid ${theme.border}` }}>
                  <span style={{ color: '#9ece6a', fontWeight: 600 }}>Given</span> {s.given},{' '}
                  <span style={{ color: '#ff9e64', fontWeight: 600 }}>When</span> {s.when},{' '}
                  <span style={{ color: '#7aa2f7', fontWeight: 600 }}>Then</span> {s.then}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
