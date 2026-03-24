/**
 * MOCKUP: Plan Phase Detail — Dark theme
 * Hero: Design decisions + technical context
 */
import React, { useState } from 'react';

const t = {
  bg: '#1a1b26', surface: '#222436', border: '#363850',
  text: '#c0caf5', muted: '#7982a9', bright: '#e0e6ff', accent: '#bb9af7',
};

const CTX = [
  { key: 'Language', value: 'TypeScript 5.x' },
  { key: 'Dependencies', value: 'React 19, Express, chokidar, ws, unified/remark' },
  { key: 'Storage', value: 'Filesystem only' },
  { key: 'Testing', value: 'Vitest' },
  { key: 'Type', value: 'Web app (Node.js + React SPA)' },
];

const DECISIONS = [
  {
    heading: 'Markdown Parsing Strategy',
    decision: 'Hybrid — remark for reading, positional string splicing for writing.',
    rationale: 'remark gives typed mdast AST with position data. For writes, use offsets for surgical splicing to preserve formatting.',
    alternatives: ['marked — no write path', 'Pure regex — fragile for hierarchy'],
  },
  {
    heading: 'File Watching',
    decision: 'Chokidar v5 with application-level debounce.',
    rationale: 'Zero native deps. Direct .git/HEAD watching. awaitWriteFinish for rapid writes.',
    alternatives: ['@parcel/watcher — native addon friction', 'fs.watch — inconsistent cross-platform'],
  },
  {
    heading: 'Comment File Format',
    decision: 'Per-artifact markdown files in comments/ directory.',
    rationale: 'Claude reads markdown naturally. Element IDs as H2 headings, timestamped bullets.',
    alternatives: ['JSON — not human-readable', 'Inline markers — pollutes artifacts'],
  },
];

function Decision({ d }: { d: typeof DECISIONS[0] }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: '8px', marginBottom: '8px' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: t.bright }}>{d.heading}</span>
        <span style={{ color: t.muted, fontSize: '0.75rem' }}>{open ? '▼' : '▶'}</span>
      </div>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${t.border}40` }}>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decision</div>
            <p style={{ fontSize: '0.82rem', color: t.text, margin: '4px 0 10px' }}>{d.decision}</p>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rationale</div>
            <p style={{ fontSize: '0.82rem', color: t.text, margin: '4px 0 10px' }}>{d.rationale}</p>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alternatives</div>
            <ul style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
              {d.alternatives.map((a, i) => <li key={i} style={{ fontSize: '0.78rem', color: t.muted, marginBottom: '2px' }}>{a}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanPhaseMockup() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', color: t.bright }}>Plan Phase — Hero Content</h2>
        <span style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#bb9af720', color: '#bb9af7' }}>Plan</span>
      </div>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Technical Context</h3>
        <div style={{ backgroundColor: t.surface, borderRadius: '8px', padding: '14px 16px', border: `1px solid ${t.border}` }}>
          {CTX.map((c) => (
            <div key={c.key} style={{ display: 'flex', padding: '4px 0', gap: '16px' }}>
              <span style={{ width: '120px', fontSize: '0.78rem', fontWeight: 600, color: t.muted, flexShrink: 0 }}>{c.key}</span>
              <span style={{ fontSize: '0.82rem', color: t.text }}>{c.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Design Decisions</h3>
        {DECISIONS.map((d) => <Decision key={d.heading} d={d} />)}
      </section>
    </div>
  );
}
