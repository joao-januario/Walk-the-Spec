import React, { useState, useEffect } from 'react';
import { theme } from '../../theme.js';
import type { RefactorEntry } from '../../types/index.js';
import * as api from '../../services/api.js';

interface RefactorBacklogViewProps {
  projectId: string;
}

export default function RefactorBacklogView({ projectId }: RefactorBacklogViewProps) {
  const [entries, setEntries] = useState<RefactorEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getRefactorBacklog(projectId)
      .then((data) => setEntries(data.entries))
      .catch((err: unknown) => { console.error('Failed to load refactor backlog:', err); setEntries([]); })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>Loading backlog...</div>;
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.4 }}>🧹</div>
        <div style={{ fontSize: '0.9rem', color: theme.textMuted }}>No refactor items</div>
        <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginTop: '4px' }}>
          Architectural debt from `/speckit.review` will appear here.
        </div>
      </div>
    );
  }

  // Group by branch
  const byBranch = new Map<string, RefactorEntry[]>();
  for (const e of entries) {
    if (!byBranch.has(e.branch)) byBranch.set(e.branch, []);
    byBranch.get(e.branch)!.push(e);
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: theme.textBright }}>Refactor Backlog</h2>
      <p style={{ margin: '0 0 20px', fontSize: '0.78rem', color: theme.textMuted }}>
        {entries.length} item{entries.length > 1 ? 's' : ''} across {byBranch.size} branch{byBranch.size > 1 ? 'es' : ''}
      </p>

      {Array.from(byBranch.entries()).map(([branch, items]) => (
        <section key={branch} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <code style={{ fontSize: '0.7rem', color: theme.accent, backgroundColor: `${theme.accent}15`, padding: '2px 6px', borderRadius: '4px' }}>
              {branch}
            </code>
            <span style={{ fontSize: '0.7rem', color: theme.textMuted }}>{items.length} item{items.length > 1 ? 's' : ''}</span>
          </div>
          {items.map((entry) => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${theme.border}20` }}>
              <code style={{ fontSize: '0.65rem', fontWeight: 700, color: theme.purple, backgroundColor: `${theme.purple}15`, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                {entry.id}
              </code>
              <code style={{ fontSize: '0.65rem', color: theme.textMuted, backgroundColor: `${theme.border}40`, padding: '1px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                {entry.rule}
              </code>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', color: theme.text }}>{entry.description}</div>
                <div style={{ fontSize: '0.7rem', color: theme.textMuted, marginTop: '2px' }}>{entry.files}</div>
              </div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
                backgroundColor: entry.status === 'Open' ? `${theme.yellow}20` : `${theme.green}20`,
                color: entry.status === 'Open' ? theme.yellow : theme.green,
              }}>
                {entry.status}
              </span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
