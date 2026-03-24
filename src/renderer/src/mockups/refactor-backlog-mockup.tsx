/**
 * MOCKUP: Refactor Backlog — sidebar icon + backlog view in main content
 * Shows: sidebar with 🧹 icon at bottom, main content with entries grouped by branch,
 * empty state when no entries.
 */
import React, { useState } from 'react';

const t = {
  bg: '#1a1b26', surface: '#222436', surfaceHover: '#2a2c42', border: '#363850',
  text: '#c0caf5', muted: '#7982a9', bright: '#e0e6ff',
  accent: '#7aa2f7', purple: '#bb9af7', yellow: '#e0af68', green: '#9ece6a',
};

const MOCK_ENTRIES = [
  { id: 'RO-001', branch: '002-spec-board', rule: 'EA08', files: 'src/renderer/src/mockups/', description: 'Mockup files bundled in renderer build. Should be excluded or moved to dev-only directory.', status: 'Open' },
  { id: 'RO-002', branch: '002-spec-board', rule: 'EA02', files: 'src/main/ipc/handlers.ts', description: 'Multiple sync file reads in IPC handlers. Migrate to async fs.promises across all handlers.', status: 'Open' },
  { id: 'RO-003', branch: '003-review-heal-tracking', rule: 'ES06', files: 'src/main/ipc/handlers.ts', description: 'No argument validation on any IPC handler. Renderer is untrusted.', status: 'Open' },
];

function SidebarMockup({ backlogActive, onToggle }: { backlogActive: boolean; onToggle: () => void }) {
  return (
    <div style={{ width: '220px', minWidth: '220px', height: '100%', backgroundColor: t.bg, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', padding: '12px 8px' }}>
      <div style={{ padding: '4px 8px 16px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Projects</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: !backlogActive ? t.surfaceHover : 'transparent', borderLeft: !backlogActive ? `3px solid ${t.accent}` : '3px solid transparent', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7dcfff' }} />
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: t.bright }}>spec-board</span>
          </div>
          <div style={{ marginLeft: '16px', marginTop: '2px', fontSize: '0.65rem', fontWeight: 600, color: '#7dcfff', textTransform: 'uppercase' }}>Review</div>
        </div>
      </div>
      {/* Refactor Backlog icon — always at bottom */}
      <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: '8px', marginTop: '8px' }}>
        <button onClick={onToggle} style={{
          display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '8px 14px',
          border: 'none', borderRadius: '6px',
          backgroundColor: backlogActive ? t.surfaceHover : 'transparent',
          borderLeft: backlogActive ? `3px solid ${t.purple}` : '3px solid transparent',
          color: backlogActive ? t.purple : t.muted,
          cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, textAlign: 'left',
        }}>
          <span style={{ fontSize: '0.9rem' }}>🧹</span>
          <span>Refactor Backlog</span>
        </button>
      </div>
    </div>
  );
}

function BacklogViewMockup() {
  const byBranch = new Map<string, typeof MOCK_ENTRIES>();
  for (const e of MOCK_ENTRIES) {
    if (!byBranch.has(e.branch)) byBranch.set(e.branch, []);
    byBranch.get(e.branch)!.push(e);
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: t.bright }}>Refactor Backlog</h2>
      <p style={{ margin: '0 0 20px', fontSize: '0.78rem', color: t.muted }}>
        {MOCK_ENTRIES.length} items across {byBranch.size} branches
      </p>
      {Array.from(byBranch.entries()).map(([branch, items]) => (
        <section key={branch} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <code style={{ fontSize: '0.7rem', color: t.accent, backgroundColor: `${t.accent}15`, padding: '2px 6px', borderRadius: '4px' }}>{branch}</code>
            <span style={{ fontSize: '0.7rem', color: t.muted }}>{items.length} items</span>
          </div>
          {items.map((entry) => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${t.border}20` }}>
              <code style={{ fontSize: '0.65rem', fontWeight: 700, color: t.purple, backgroundColor: `${t.purple}15`, padding: '2px 6px', borderRadius: '4px' }}>{entry.id}</code>
              <code style={{ fontSize: '0.65rem', color: t.muted, backgroundColor: `${t.border}40`, padding: '1px 4px', borderRadius: '3px' }}>{entry.rule}</code>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', color: t.text }}>{entry.description}</div>
                <div style={{ fontSize: '0.7rem', color: t.muted, marginTop: '2px' }}>{entry.files}</div>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: `${t.yellow}20`, color: t.yellow }}>{entry.status}</span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export default function RefactorBacklogMockup() {
  const [backlogActive, setBacklogActive] = useState(true);

  return (
    <div style={{ display: 'flex', height: '500px', backgroundColor: t.bg, color: t.text, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${t.border}` }}>
      <SidebarMockup backlogActive={backlogActive} onToggle={() => setBacklogActive(!backlogActive)} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        {backlogActive ? <BacklogViewMockup /> : <div style={{ color: t.muted }}>Feature detail would show here</div>}
      </div>
    </div>
  );
}
