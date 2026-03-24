import React, { useState } from 'react';
import { theme } from '../../theme.js';
import type { DecisionContent } from '../../types/index.js';

export default function DecisionSection({ content }: { content: DecisionContent }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px', marginBottom: '8px' }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: theme.textBright }}>{content.heading}</span>
        <span style={{ color: theme.textMuted, fontSize: '0.75rem' }}>{expanded ? '▼' : '▶'}</span>
      </div>
      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${theme.border}40` }}>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: theme.purple, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decision</div>
            <p style={{ fontSize: '0.82rem', color: theme.text, margin: '4px 0 10px' }}>{content.content}</p>
          </div>
          {content.rationale && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: theme.purple, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rationale</div>
              <p style={{ fontSize: '0.82rem', color: theme.text, margin: '4px 0 10px' }}>{content.rationale}</p>
            </div>
          )}
          {content.alternatives && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alternatives</div>
              <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: '4px 0 0' }}>{content.alternatives}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
