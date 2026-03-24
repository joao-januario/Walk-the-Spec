import React from 'react';
import { theme } from '../../theme.js';

interface CommentBadgeProps {
  count: number;
  onClick: () => void;
}

export default function CommentBadge({ count, onClick }: CommentBadgeProps) {
  if (count === 0) {
    return (
      <button onClick={onClick} style={{
        fontSize: '0.7rem', color: theme.textMuted, background: 'none',
        border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '1px 6px', cursor: 'pointer',
      }}>💬</button>
    );
  }

  return (
    <button onClick={onClick} style={{
      fontSize: '0.65rem', fontWeight: 600, color: theme.yellow,
      backgroundColor: `${theme.yellow}20`, border: 'none', borderRadius: '9999px',
      padding: '2px 8px', cursor: 'pointer',
    }}>
      💬 {count}
    </button>
  );
}
