/**
 * MOCKUP: Implement Phase Detail — Dark theme
 * Hero: Task progress grouped by phase
 */
import React from 'react';

const t = {
  bg: '#1a1b26', surface: '#222436', border: '#363850',
  text: '#c0caf5', muted: '#7982a9', bright: '#e0e6ff',
  green: '#9ece6a', blue: '#7aa2f7', purple: '#bb9af7', orange: '#ff9e64',
};

const PHASES = [
  {
    name: 'Phase 1: Setup', tasks: [
      { id: 'T001', desc: 'Create monorepo structure', checked: true, parallel: false, story: null },
      { id: 'T002', desc: 'Initialize backend project', checked: true, parallel: true, story: null },
      { id: 'T003', desc: 'Initialize frontend project', checked: true, parallel: true, story: null },
    ],
  },
  {
    name: 'Phase 2: Foundational', tasks: [
      { id: 'T006', desc: 'Create test fixtures', checked: true, parallel: false, story: null },
      { id: 'T007', desc: 'Express server bootstrap', checked: true, parallel: false, story: null },
      { id: 'T008', desc: 'TDD: Config manager tests', checked: true, parallel: true, story: null },
      { id: 'T009', desc: 'Implement config manager', checked: true, parallel: true, story: null },
      { id: 'T012', desc: 'TDD: Markdown parser tests', checked: false, parallel: false, story: null },
      { id: 'T013', desc: 'Implement markdown parser', checked: false, parallel: false, story: null },
    ],
  },
  {
    name: 'Phase 4: US1 — Register & Browse (P1) MVP', tasks: [
      { id: 'T036', desc: 'Implement projects routes', checked: false, parallel: false, story: 'US1' },
      { id: 'T037', desc: 'Implement features route', checked: false, parallel: false, story: 'US1' },
      { id: 'T039', desc: 'Implement BoardView', checked: false, parallel: true, story: 'US1' },
      { id: 'T040', desc: 'Implement FeatureCard', checked: false, parallel: true, story: 'US1' },
    ],
  },
];

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '5px', backgroundColor: `${t.border}`, borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? t.green : t.blue, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: t.muted, whiteSpace: 'nowrap' }}>{done}/{total}</span>
    </div>
  );
}

function TaskRow({ task }: { task: typeof PHASES[0]['tasks'][0] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: `1px solid ${t.border}20` }}>
      <input type="checkbox" checked={task.checked} readOnly style={{ accentColor: t.blue, cursor: 'pointer' }} />
      <code style={{ fontSize: '0.65rem', fontWeight: 600, color: t.muted, backgroundColor: `${t.border}40`, padding: '1px 4px', borderRadius: '3px' }}>{task.id}</code>
      {task.parallel && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: t.purple, backgroundColor: `${t.purple}20`, padding: '0px 4px', borderRadius: '3px' }}>P</span>}
      {task.story && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: t.blue, backgroundColor: `${t.blue}20`, padding: '0px 4px', borderRadius: '3px' }}>{task.story}</span>}
      <span style={{ fontSize: '0.82rem', color: task.checked ? t.muted : t.text, textDecoration: task.checked ? 'line-through' : 'none' }}>{task.desc}</span>
    </div>
  );
}

export default function ImplementPhaseMockup() {
  const total = PHASES.reduce((s, p) => s + p.tasks.length, 0);
  const done = PHASES.reduce((s, p) => s + p.tasks.filter((t) => t.checked).length, 0);

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', color: t.bright }}>Implement Phase — Hero Content</h2>
        <span style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#9ece6a20', color: t.green }}>Implement</span>
      </div>

      <div style={{ marginBottom: '24px', maxWidth: '350px' }}>
        <div style={{ fontSize: '0.78rem', color: t.muted, marginBottom: '4px' }}>
          Overall: {Math.round((done / total) * 100)}% ({done}/{total} tasks)
        </div>
        <ProgressBar done={done} total={total} />
      </div>

      {PHASES.map((phase) => {
        const d = phase.tasks.filter((t) => t.checked).length;
        return (
          <section key={phase.name} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '0.88rem', color: t.bright }}>{phase.name}</h3>
              {d === phase.tasks.length && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: t.green }}>DONE</span>}
            </div>
            <div style={{ marginBottom: '6px', maxWidth: '250px' }}><ProgressBar done={d} total={phase.tasks.length} /></div>
            {phase.tasks.map((task) => <TaskRow key={task.id} task={task} />)}
          </section>
        );
      })}
    </div>
  );
}
