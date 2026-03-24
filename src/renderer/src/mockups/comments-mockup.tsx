/**
 * MOCKUP: Comment Panel — Dark theme
 */
import React, { useState } from 'react';

const t = {
  bg: '#1a1b26', surface: '#222436', surfaceAlt: '#1e2030', border: '#363850',
  text: '#c0caf5', muted: '#7982a9', bright: '#e0e6ff', accent: '#7aa2f7',
  yellow: '#e0af68',
};

const COMMENTS = [
  { id: '1', content: 'This requirement seems too broad. Consider splitting into registration and validation.', time: '2026-03-24 10:30' },
  { id: '2', content: 'Should we also validate that the path is not a network drive?', time: '2026-03-24 11:15' },
];

function Badge({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return (
    <button onClick={onClick} style={{ fontSize: '0.7rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '4px', padding: '1px 6px', cursor: 'pointer' }}>💬</button>
  );
  return (
    <button onClick={onClick} style={{ fontSize: '0.65rem', fontWeight: 600, color: t.yellow, backgroundColor: `${t.yellow}20`, border: 'none', borderRadius: '9999px', padding: '2px 8px', cursor: 'pointer' }}>
      💬 {count}
    </button>
  );
}

function Panel({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const [text, setText] = useState('');
  return (
    <div style={{ backgroundColor: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '14px', marginTop: '8px', marginLeft: '28px', maxWidth: '550px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: t.bright }}>
          Comments on <code style={{ fontSize: '0.75rem', color: t.accent }}>{elementId}</code>
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: '1rem' }}>×</button>
      </div>
      {COMMENTS.map((c) => (
        <div key={c.id} style={{ marginBottom: '8px', padding: '10px', backgroundColor: t.surface, borderRadius: '6px', border: `1px solid ${t.border}40` }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.82rem', color: t.text }}>{c.content}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: t.muted }}>{c.time}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ fontSize: '0.68rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
              <button style={{ fontSize: '0.68rem', color: '#f7768e', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      ))}
      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        style={{ width: '100%', padding: '8px', border: `1px solid ${t.border}`, borderRadius: '6px', fontSize: '0.82rem', resize: 'vertical', minHeight: '50px', fontFamily: 'inherit', backgroundColor: t.bg, color: t.text, boxSizing: 'border-box', outline: 'none', marginTop: '6px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
        <button style={{ padding: '5px 12px', border: 'none', borderRadius: '6px', backgroundColor: t.accent, color: '#1a1b26', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Add Comment</button>
      </div>
    </div>
  );
}

export default function CommentsMockup() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.15rem', color: t.bright, marginBottom: '16px' }}>Comments Mockup</h2>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${t.border}30` }}>
        <code style={{ fontSize: '0.7rem', fontWeight: 700, color: t.accent, backgroundColor: `${t.accent}15`, padding: '2px 6px', borderRadius: '4px' }}>FR-001</code>
        <span style={{ fontSize: '0.82rem', color: t.text, flex: 1 }}>System MUST allow users to register project paths</span>
        <Badge count={2} onClick={() => setOpen(!open)} />
      </div>
      {open && <Panel elementId="FR-001" onClose={() => setOpen(false)} />}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${t.border}30` }}>
        <code style={{ fontSize: '0.7rem', fontWeight: 700, color: t.accent, backgroundColor: `${t.accent}15`, padding: '2px 6px', borderRadius: '4px' }}>FR-002</code>
        <span style={{ fontSize: '0.82rem', color: t.text, flex: 1 }}>System MUST detect the currently checked-out branch</span>
        <Badge count={0} onClick={() => {}} />
      </div>
    </div>
  );
}
