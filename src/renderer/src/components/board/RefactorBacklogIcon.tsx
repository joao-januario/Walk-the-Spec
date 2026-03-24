import React from 'react';
import { theme } from '../../theme.js';

interface RefactorBacklogIconProps {
  active: boolean;
  onClick: () => void;
}

export default function RefactorBacklogIcon({ active, onClick }: RefactorBacklogIconProps) {
  return (
    <button
      onClick={onClick}
      title="Refactor Backlog"
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        width: '100%', padding: '8px 14px',
        border: 'none', borderRadius: '6px',
        backgroundColor: active ? theme.surfaceHover : 'transparent',
        borderLeft: active ? `3px solid ${theme.purple}` : '3px solid transparent',
        color: active ? theme.purple : theme.textMuted,
        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
        textAlign: 'left',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = theme.surfaceHover; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span style={{ fontSize: '0.9rem' }}>🧹</span>
      <span>Refactor Backlog</span>
    </button>
  );
}
