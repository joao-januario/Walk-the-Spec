/**
 * MOCKUP: Editing Controls — Dark theme
 */
import React, { useState } from 'react';

const t = {
  bg: '#1a1b26', surface: '#222436', border: '#363850',
  text: '#c0caf5', muted: '#7982a9', bright: '#e0e6ff',
  accent: '#7aa2f7', green: '#9ece6a', red: '#f7768e', yellow: '#e0af68',
};

function InlineTextEditor({ initial }: { initial: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);

  if (!editing) {
    return (
      <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', borderBottom: `1px dashed ${t.border}`, paddingBottom: '1px' }} title="Click to edit">
        {value}
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false); if (e.key === 'Escape') { setValue(initial); setEditing(false); } }}
        style={{ padding: '2px 6px', border: `1px solid ${t.accent}`, borderRadius: '4px', fontSize: 'inherit', fontFamily: 'inherit', outline: 'none', backgroundColor: t.bg, color: t.text }}
      />
      <button onClick={() => setEditing(false)} style={{ fontSize: '0.75rem', color: t.green, background: 'none', border: 'none', cursor: 'pointer' }}>✓</button>
      <button onClick={() => { setValue(initial); setEditing(false); }} style={{ fontSize: '0.75rem', color: t.red, background: 'none', border: 'none', cursor: 'pointer' }}>✗</button>
    </span>
  );
}

function Checkbox() {
  const [checked, setChecked] = useState(false);
  return <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} style={{ accentColor: t.accent, cursor: 'pointer', width: '15px', height: '15px' }} />;
}

function PriorityDrop() {
  const [v, setV] = useState('P2');
  return (
    <select value={v} onChange={(e) => setV(e.target.value)} style={{
      padding: '2px 6px', border: `1px solid ${t.border}`, borderRadius: '4px',
      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', backgroundColor: t.surface, color: t.text,
    }}>
      {['P1', 'P2', 'P3', 'P4', 'P5'].map((p) => <option key={p} value={p}>{p}</option>)}
    </select>
  );
}

function StaleNotification() {
  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', padding: '12px 18px',
      backgroundColor: `${t.yellow}15`, border: `1px solid ${t.yellow}40`, borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontSize: '0.82rem', color: t.yellow,
      display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '380px', zIndex: 200,
    }}>
      <span style={{ fontSize: '1.1rem' }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>File updated externally</div>
        <div style={{ fontSize: '0.75rem', marginTop: '2px', color: t.text }}>tasks.md was modified. Edit discarded, view reloaded.</div>
      </div>
      <button style={{ background: 'none', border: 'none', color: t.yellow, cursor: 'pointer', fontSize: '1rem', marginLeft: '6px' }}>×</button>
    </div>
  );
}

export default function EditingMockup() {
  const [showNotif, setShowNotif] = useState(true);

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.15rem', color: t.bright, marginBottom: '24px' }}>Editing Controls</h2>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', marginBottom: '10px' }}>Task Checkbox Toggle</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
          <Checkbox />
          <code style={{ fontSize: '0.65rem', color: t.muted, backgroundColor: `${t.border}40`, padding: '1px 4px', borderRadius: '3px' }}>T007</code>
          <span style={{ fontSize: '0.82rem', color: t.text }}>Implement markdown parser</span>
        </div>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', marginBottom: '10px' }}>Inline Text Edit (Click to Edit)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '6px 0' }}>
          <code style={{ fontSize: '0.7rem', fontWeight: 700, color: t.accent, backgroundColor: `${t.accent}15`, padding: '2px 6px', borderRadius: '4px' }}>FR-001</code>
          <span style={{ fontSize: '0.82rem', color: t.text }}>
            System MUST <InlineTextEditor initial="allow users to register project paths" />
          </span>
        </div>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', marginBottom: '10px' }}>Priority Dropdown</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
          <PriorityDrop />
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: t.bright }}>US2 — Drill Into Feature Artifacts</span>
        </div>
      </section>

      <section>
        <h3 style={{ fontSize: '0.85rem', color: t.muted, textTransform: 'uppercase', marginBottom: '10px' }}>Stale Edit Notification</h3>
        <button onClick={() => setShowNotif(true)} style={{ padding: '5px 12px', border: `1px solid ${t.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', backgroundColor: 'transparent', color: t.text }}>
          Show notification
        </button>
      </section>

      {showNotif && <StaleNotification />}
    </div>
  );
}
