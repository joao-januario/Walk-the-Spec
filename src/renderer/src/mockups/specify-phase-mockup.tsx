/**
 * MOCKUP: Specify Phase Detail (standalone view of the specify hero content)
 * Dark theme. Shows user stories + requirements as hero content.
 */
import React, { useState } from 'react';

const t = {
  bg: '#1a1b26', surface: '#222436', border: '#363850',
  text: '#c0caf5', muted: '#7982a9', bright: '#e0e6ff', accent: '#7aa2f7',
};

const STORIES = [
  {
    number: 1, title: 'Register a Project and Browse Features', priority: 'P1',
    description: 'A developer registers project paths and sees feature cards with phase status.',
    scenarios: [
      { given: 'multiple local projects', when: 'they register each path', then: 'each project appears as a feature card' },
      { given: 'a registered project', when: 'the developer switches branches', then: 'the card reflects the new branch' },
    ],
  },
  {
    number: 2, title: 'Drill Into Feature Artifacts', priority: 'P1',
    description: 'Developer clicks a feature and sees phase-adaptive views with drill-down.',
    scenarios: [
      { given: 'a feature in Specify phase', when: 'opened', then: 'user stories and requirements are primary' },
    ],
  },
  {
    number: 3, title: 'Annotate and Comment on Elements', priority: 'P2',
    description: 'Developer adds inline comments to elements, stored as speckit-compatible files.',
    scenarios: [
      { given: 'any artifact element', when: 'developer clicks annotate', then: 'comment input appears' },
    ],
  },
];

const REQS = [
  { id: 'FR-001', text: 'Allow users to register project paths, persisted in ~/.spec-board/config.json', comments: 2 },
  { id: 'FR-002', text: 'Detect checked-out branch and read speckit artifacts from filesystem', comments: 0 },
  { id: 'FR-003', text: 'Display each project\'s active feature as a card with branch, phase, summary', comments: 1 },
  { id: 'FR-004', text: 'Parse speckit markdown artifacts into structured data', comments: 0 },
  { id: 'FR-005', text: 'Render spec user stories as navigable cards with priority and criteria', comments: 0 },
];

const SC = [
  { id: 'SC-001', text: 'Register and see board within 10 seconds' },
  { id: 'SC-002', text: 'Navigate to any element in 3 clicks or fewer' },
];

function Priority({ p }: { p: string }) {
  const c: Record<string, string> = { P1: '#f7768e', P2: '#ff9e64', P3: '#e0af68' };
  return <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: `${c[p] ?? t.muted}20`, color: c[p] ?? t.muted }}>{p}</span>;
}

function Story({ s }: { s: typeof STORIES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '14px 16px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <span style={{ color: t.muted, fontSize: '0.75rem' }}>{open ? '▼' : '▶'}</span>
        <Priority p={s.priority} />
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: t.bright }}>US{s.number} — {s.title}</span>
      </div>
      <p style={{ color: t.text, fontSize: '0.8rem', margin: '6px 0 0 32px' }}>{s.description}</p>
      {open && (
        <div style={{ marginTop: '10px', marginLeft: '32px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: t.muted, textTransform: 'uppercase', marginBottom: '6px' }}>Acceptance Scenarios</div>
          {s.scenarios.map((sc, i) => (
            <div key={i} style={{ fontSize: '0.78rem', color: t.text, marginBottom: '4px', paddingLeft: '10px', borderLeft: `2px solid ${t.border}` }}>
              <span style={{ color: '#9ece6a', fontWeight: 600 }}>Given</span> {sc.given},{' '}
              <span style={{ color: '#ff9e64', fontWeight: 600 }}>When</span> {sc.when},{' '}
              <span style={{ color: '#7aa2f7', fontWeight: 600 }}>Then</span> {sc.then}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SpecifyPhaseMockup() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', color: t.bright }}>Specify Phase — Hero Content</h2>
        <span style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#7aa2f720', color: '#7aa2f7' }}>Specify</span>
      </div>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>User Stories</h3>
        {STORIES.map((s) => <Story key={s.number} s={s} />)}
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Functional Requirements</h3>
        {REQS.map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 0', borderBottom: `1px solid ${t.border}30` }}>
            <code style={{ fontSize: '0.7rem', fontWeight: 700, color: t.accent, backgroundColor: `${t.accent}15`, padding: '2px 6px', borderRadius: '4px' }}>{r.id}</code>
            <span style={{ fontSize: '0.82rem', color: t.text, flex: 1 }}>{r.text}</span>
            {r.comments > 0 && <span style={{ fontSize: '0.65rem', backgroundColor: '#e0af6820', color: '#e0af68', padding: '1px 6px', borderRadius: '9999px' }}>💬 {r.comments}</span>}
          </div>
        ))}
      </section>

      <section>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Success Criteria</h3>
        {SC.map((s) => (
          <div key={s.id} style={{ display: 'flex', gap: '10px', padding: '7px 0', borderBottom: `1px solid ${t.border}30` }}>
            <code style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ece6a', backgroundColor: '#9ece6a15', padding: '2px 6px', borderRadius: '4px' }}>{s.id}</code>
            <span style={{ fontSize: '0.82rem', color: t.text }}>{s.text}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
