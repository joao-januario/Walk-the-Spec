/**
 * MOCKUP: Full App Layout — Persistent sidebar + main content
 * Dark mode with colorful accents. No top bar.
 * Sidebar always shows all projects with phase status. 1-click switching.
 */
import React, { useState } from 'react';

// --- Theme ---
const theme = {
  bg: '#1a1b26',          // deep navy, not pure black
  surface: '#222436',     // card/panel surface
  surfaceHover: '#2a2c42',
  border: '#363850',
  text: '#c0caf5',        // soft lavender-white
  textMuted: '#7982a9',
  textBright: '#e0e6ff',
  accent: '#7aa2f7',      // blue
  phase: {
    specify:   { bg: '#7aa2f720', text: '#7aa2f7', dot: '#7aa2f7', label: 'Specify' },
    plan:      { bg: '#bb9af720', text: '#bb9af7', dot: '#bb9af7', label: 'Plan' },
    tasks:     { bg: '#ff9e6420', text: '#ff9e64', dot: '#ff9e64', label: 'Tasks' },
    implement: { bg: '#9ece6a20', text: '#9ece6a', dot: '#9ece6a', label: 'Implement' },
    unknown:   { bg: '#56587020', text: '#565870', dot: '#565870', label: '—' },
  } as Record<string, { bg: string; text: string; dot: string; label: string }>,
};

const MOCK_PROJECTS = [
  { id: '1', name: 'spec-board', branch: '002-spec-board', phase: 'specify', summary: 'Web dashboard for speckit artifacts', hasContent: true },
  { id: '2', name: 'api-gateway', branch: '005-rate-limiting', phase: 'implement', summary: 'Rate limiting middleware', hasContent: true },
  { id: '3', name: 'mobile-app', branch: '012-push-notifs', phase: 'plan', summary: 'Push notification system', hasContent: true },
  { id: '4', name: 'data-pipeline', branch: 'main', phase: 'unknown', summary: '', hasContent: false },
  { id: '5', name: 'auth-service', branch: '003-oauth', phase: 'tasks', summary: 'OAuth2 migration', hasContent: true },
];

// --- Mock detail content (reused from specify-phase mockup) ---
const MOCK_STORIES = [
  {
    number: 1, title: 'Register a Project and Browse Features', priority: 'P1',
    description: 'A developer registers project paths and sees feature cards on the board.',
    scenarios: [
      { given: 'a developer has multiple local projects', when: 'they register each project path', then: 'each project with speckit content appears as a feature card' },
    ],
  },
  {
    number: 2, title: 'Drill Into Feature Artifacts', priority: 'P1',
    description: 'A developer clicks a feature card and sees phase-adaptive views with drill-down.',
    scenarios: [
      { given: 'a feature in the Specify phase', when: 'the developer opens it', then: 'user stories and requirements are the primary content' },
    ],
  },
];

const MOCK_REQUIREMENTS = [
  { id: 'FR-001', text: 'System MUST allow users to register one or more local project paths', comments: 2 },
  { id: 'FR-002', text: 'System MUST detect the currently checked-out branch', comments: 0 },
  { id: 'FR-003', text: 'System MUST display each project\'s active feature as a card', comments: 1 },
];

// --- Sidebar ---
function PhaseDot({ phase }: { phase: string }) {
  const p = theme.phase[phase] ?? theme.phase.unknown;
  return <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.dot, flexShrink: 0 }} />;
}

function ProjectItem({ project, selected, onClick }: {
  project: typeof MOCK_PROJECTS[0]; selected: boolean; onClick: () => void;
}) {
  const p = theme.phase[project.phase] ?? theme.phase.unknown;
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 14px',
        cursor: 'pointer',
        borderRadius: '8px',
        backgroundColor: selected ? theme.surfaceHover : 'transparent',
        borderLeft: selected ? `3px solid ${p.dot}` : '3px solid transparent',
        marginBottom: '2px',
        transition: 'all 0.12s',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.backgroundColor = theme.surfaceHover; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PhaseDot phase={project.phase} />
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selected ? theme.textBright : theme.text }}>
          {project.name}
        </span>
      </div>
      <div style={{ marginLeft: '16px', marginTop: '2px' }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 600, color: p.text,
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {p.label}
        </span>
        {project.hasContent && (
          <span style={{ fontSize: '0.65rem', color: theme.textMuted, marginLeft: '6px' }}>
            {project.branch}
          </span>
        )}
      </div>
    </div>
  );
}

function Sidebar({ projects, selectedId, onSelect, onAdd }: {
  projects: typeof MOCK_PROJECTS; selectedId: string; onSelect: (id: string) => void; onAdd: () => void;
}) {
  return (
    <div style={{
      width: '220px', minWidth: '220px', height: '100vh',
      backgroundColor: theme.bg, borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', padding: '12px 8px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '4px 8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Projects
        </span>
        <button
          onClick={onAdd}
          title="Add project"
          style={{
            width: '22px', height: '22px', border: `1px solid ${theme.border}`, borderRadius: '6px',
            backgroundColor: 'transparent', color: theme.textMuted, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}
        >+</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {projects.map((p) => (
          <ProjectItem key={p.id} project={p} selected={p.id === selectedId} onClick={() => onSelect(p.id)} />
        ))}
      </div>
    </div>
  );
}

// --- Main content area (Specify phase example) ---
function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = { P1: '#f7768e', P2: '#ff9e64', P3: '#e0af68' };
  return (
    <span style={{
      padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700,
      backgroundColor: `${colors[priority] ?? theme.textMuted}20`,
      color: colors[priority] ?? theme.textMuted,
    }}>
      {priority}
    </span>
  );
}

function UserStoryCard({ story }: { story: typeof MOCK_STORIES[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '14px 16px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <span style={{ color: theme.textMuted, fontSize: '0.75rem' }}>{expanded ? '▼' : '▶'}</span>
        <PriorityBadge priority={story.priority} />
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: theme.textBright }}>
          US{story.number} — {story.title}
        </span>
      </div>
      <p style={{ color: theme.text, fontSize: '0.8rem', margin: '6px 0 0 32px', lineHeight: 1.5 }}>{story.description}</p>
      {expanded && (
        <div style={{ marginTop: '10px', marginLeft: '32px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>Acceptance Scenarios</div>
          {story.scenarios.map((s, i) => (
            <div key={i} style={{ fontSize: '0.78rem', color: theme.text, marginBottom: '4px', paddingLeft: '10px', borderLeft: `2px solid ${theme.border}` }}>
              <span style={{ color: '#9ece6a', fontWeight: 600 }}>Given</span> {s.given},{' '}
              <span style={{ color: '#ff9e64', fontWeight: 600 }}>When</span> {s.when},{' '}
              <span style={{ color: '#7aa2f7', fontWeight: 600 }}>Then</span> {s.then}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RequirementRow({ req }: { req: typeof MOCK_REQUIREMENTS[0] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 0', borderBottom: `1px solid ${theme.border}30` }}>
      <code style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.accent, backgroundColor: `${theme.accent}15`, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
        {req.id}
      </code>
      <span style={{ fontSize: '0.82rem', color: theme.text, flex: 1 }}>{req.text}</span>
      {req.comments > 0 && (
        <span style={{ fontSize: '0.65rem', backgroundColor: '#e0af6820', color: '#e0af68', padding: '1px 6px', borderRadius: '9999px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
          💬 {req.comments}
        </span>
      )}
    </div>
  );
}

const TABS = ['Spec', 'Plan', 'Tasks', 'Research'];

function MainContent({ project }: { project: typeof MOCK_PROJECTS[0] }) {
  const [activeTab, setActiveTab] = useState('Spec');
  const p = theme.phase[project.phase] ?? theme.phase.unknown;

  if (!project.hasContent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textMuted }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.4 }}>📂</div>
          <div style={{ fontSize: '0.9rem' }}>No speckit content on <code style={{ color: theme.text }}>{project.branch}</code></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Feature header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: theme.textBright }}>{project.summary || project.name}</h2>
          <span style={{
            padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
            backgroundColor: p.bg, color: p.text,
          }}>{p.label}</span>
        </div>
        <div style={{ color: theme.textMuted, fontSize: '0.75rem', marginTop: '4px' }}>
          <code style={{ fontSize: '0.7rem', color: theme.text }}>{project.branch}</code>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${theme.border}`, marginBottom: '20px' }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? theme.accent : theme.textMuted,
            borderBottom: activeTab === tab ? `2px solid ${theme.accent}` : '2px solid transparent',
            marginBottom: '-1px',
          }}>{tab}</button>
        ))}
      </div>

      {/* Content (Specify phase hero) */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.9rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 600 }}>User Stories</h3>
        {MOCK_STORIES.map((s) => <UserStoryCard key={s.number} story={s} />)}
      </section>

      <section>
        <h3 style={{ fontSize: '0.9rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 600 }}>Requirements</h3>
        {MOCK_REQUIREMENTS.map((r) => <RequirementRow key={r.id} req={r} />)}
      </section>
    </div>
  );
}

// --- Add Project Dialog ---
function AddProjectDialog({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: theme.surface, borderRadius: '12px', padding: '24px', width: '420px',
        border: `1px solid ${theme.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: theme.textBright }}>Add Project</h3>
        <label style={{ display: 'block', fontSize: '0.8rem', color: theme.textMuted, marginBottom: '4px' }}>Project Path</label>
        <input
          type="text"
          placeholder="/home/user/my-project"
          style={{
            width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: '6px',
            fontSize: '0.85rem', boxSizing: 'border-box', backgroundColor: theme.bg, color: theme.text,
            outline: 'none',
          }}
        />
        <div style={{ color: theme.textMuted, fontSize: '0.7rem', marginTop: '4px' }}>Must be a git repository</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={onClose} style={{
            padding: '7px 14px', border: `1px solid ${theme.border}`, borderRadius: '6px',
            backgroundColor: 'transparent', color: theme.text, cursor: 'pointer', fontSize: '0.8rem',
          }}>Cancel</button>
          <button style={{
            padding: '7px 14px', border: 'none', borderRadius: '6px',
            backgroundColor: theme.accent, color: '#1a1b26', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
          }}>Add</button>
        </div>
      </div>
    </div>
  );
}

// --- Full Layout ---
export default function BoardMockup() {
  const [selectedId, setSelectedId] = useState('1');
  const [showDialog, setShowDialog] = useState(false);
  const selected = MOCK_PROJECTS.find((p) => p.id === selectedId)!;

  return (
    <div style={{
      display: 'flex', height: '100vh', backgroundColor: theme.bg, color: theme.text,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: 'fixed', inset: 0, zIndex: 100,
    }}>
      <Sidebar
        projects={MOCK_PROJECTS}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={() => setShowDialog(true)}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        <MainContent project={selected} />
      </div>
      {showDialog && <AddProjectDialog onClose={() => setShowDialog(false)} />}
    </div>
  );
}
