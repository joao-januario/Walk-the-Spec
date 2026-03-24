import React from 'react';
import { theme } from '../../theme.js';

interface EmptyStateProps {
  branchName?: string;
  message?: string;
}

export default function EmptyState({ branchName, message }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textMuted }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.4 }}>📂</div>
        <div style={{ fontSize: '0.9rem' }}>
          {message ?? (
            <>No speckit content on <code style={{ color: theme.text }}>{branchName ?? 'this branch'}</code></>
          )}
        </div>
      </div>
    </div>
  );
}
