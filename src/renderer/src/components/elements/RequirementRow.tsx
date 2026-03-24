import React from 'react';
import { theme } from '../../theme.js';
import type { RequirementContent } from '../../types/index.js';

export default function RequirementRow({ content, commentCount }: { content: RequirementContent; commentCount?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 0', borderBottom: `1px solid ${theme.border}30` }}>
      <code style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.accent, backgroundColor: `${theme.accent}15`, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
        {content.id}
      </code>
      <span style={{ fontSize: '0.82rem', color: theme.text, flex: 1 }}>{content.text}</span>
      {(commentCount ?? 0) > 0 && (
        <span style={{ fontSize: '0.65rem', backgroundColor: '#e0af6820', color: '#e0af68', padding: '1px 6px', borderRadius: '9999px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
          💬 {commentCount}
        </span>
      )}
    </div>
  );
}
