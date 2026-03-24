import React from 'react';
import { theme } from '../../theme.js';
import type { ArtifactType } from '../../types/index.js';

const TAB_LABELS: Record<string, string> = {
  spec: 'Spec',
  plan: 'Plan',
  tasks: 'Tasks',
  research: 'Research',
  review: 'Review',
};

interface ArtifactTabsProps {
  available: string[];
  active: ArtifactType;
  onSelect: (type: ArtifactType) => void;
}

export default function ArtifactTabs({ available, active, onSelect }: ArtifactTabsProps) {
  return (
    <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${theme.border}`, marginBottom: '20px' }}>
      {available.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type as ArtifactType)}
          style={{
            padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: active === type ? 600 : 400,
            color: active === type ? theme.accent : theme.textMuted,
            borderBottom: active === type ? `2px solid ${theme.accent}` : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          {TAB_LABELS[type] ?? type}
        </button>
      ))}
    </div>
  );
}
