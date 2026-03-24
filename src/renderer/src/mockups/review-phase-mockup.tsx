/**
 * MOCKUP: Review Phase — Findings display with progress tracking
 * Shows: progress bar for actionable findings, severity groups, status badges,
 * NEEDS_REFACTOR separated at bottom with "tracked in backlog" label,
 * clean review success state, heal summary stats.
 */
import React from 'react';

const t = {
  bg: '#1a1b26', surface: '#222436', border: '#363850',
  text: '#c0caf5', muted: '#7982a9', bright: '#e0e6ff',
  red: '#f7768e', orange: '#ff9e64', yellow: '#e0af68',
  green: '#9ece6a', purple: '#bb9af7', cyan: '#7dcfff',
};

const MOCK_FINDINGS = [
  { num: 1, rule: 'ES04', severity: 'CRITICAL', file: 'src/preload/index.ts', line: 5, summary: 'Raw ipcRenderer exposed in onSpecsChanged', status: 'FIXED' },
  { num: 2, rule: 'EA02', severity: 'CRITICAL', file: 'src/main/ipc/handlers.ts', line: 20, summary: 'Uses readFileSync in handler', status: 'FIXED' },
  { num: 3, rule: 'RT03', severity: 'HIGH', file: 'src/renderer/src/components/feature/FeatureDetail.tsx', line: 42, summary: 'Uses any type for elements', status: 'MANUAL' },
  { num: 4, rule: 'TS04', severity: 'HIGH', file: 'src/main/parser/spec-parser.ts', line: 65, summary: 'Non-null assertion without guard', status: 'FIXED' },
  { num: 5, rule: 'RT11', severity: 'MEDIUM', file: 'src/renderer/src/components/board/BoardView.tsx', line: 1, summary: 'Component exceeds 150 lines', status: 'unfixed' },
  { num: 6, rule: 'TT02', severity: 'LOW', file: 'tests/unit/parser/plan-parser.test.ts', line: 8, summary: 'Test name too vague', status: 'unfixed' },
  { num: 7, rule: 'EA08', severity: 'NEEDS_REFACTOR', file: 'src/renderer/src/mockups/', line: null, summary: 'Mockup files bundled in renderer — move to dev-only directory', status: 'tracked' },
];

const SEV_COLORS: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: `${t.red}20`, text: t.red },
  HIGH: { bg: `${t.orange}20`, text: t.orange },
  MEDIUM: { bg: `${t.yellow}20`, text: t.yellow },
  LOW: { bg: `${t.muted}20`, text: t.muted },
  NEEDS_REFACTOR: { bg: `${t.purple}20`, text: t.purple },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  FIXED: { bg: `${t.green}20`, text: t.green, label: 'FIXED' },
  MANUAL: { bg: `${t.red}20`, text: t.red, label: 'MANUAL — needs manual fix' },
  unfixed: { bg: `${t.border}40`, text: t.muted, label: 'Unfixed' },
  tracked: { bg: `${t.purple}20`, text: t.purple, label: 'Tracked in backlog' },
};

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', backgroundColor: t.border, borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? t.green : t.cyan, borderRadius: '3px' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: t.muted }}>{done}/{total} ({pct}%)</span>
    </div>
  );
}

function FindingRow({ f }: { f: typeof MOCK_FINDINGS[0] }) {
  const sev = SEV_COLORS[f.severity];
  const st = STATUS_COLORS[f.status];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${t.border}20`, opacity: f.status === 'FIXED' ? 0.5 : 1 }}>
      <span style={{ fontSize: '0.7rem', color: t.muted, width: '20px', textAlign: 'right' }}>#{f.num}</span>
      <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: sev.bg, color: sev.text }}>{f.severity}</span>
      <code style={{ fontSize: '0.7rem', fontWeight: 600, color: t.cyan, backgroundColor: `${t.cyan}15`, padding: '1px 5px', borderRadius: '3px' }}>{f.rule}</code>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.82rem', color: f.status === 'FIXED' ? t.muted : t.text, textDecoration: f.status === 'FIXED' ? 'line-through' : 'none' }}>{f.summary}</div>
        <div style={{ fontSize: '0.7rem', color: t.muted, marginTop: '2px' }}>{f.file}{f.line ? `:${f.line}` : ''}</div>
      </div>
      <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, backgroundColor: st.bg, color: st.text }}>{st.label}</span>
    </div>
  );
}

export default function ReviewPhaseMockup() {
  const actionable = MOCK_FINDINGS.filter((f) => f.severity !== 'NEEDS_REFACTOR');
  const refactorItems = MOCK_FINDINGS.filter((f) => f.severity === 'NEEDS_REFACTOR');
  const fixed = actionable.filter((f) => f.status === 'FIXED');
  const manual = actionable.filter((f) => f.status === 'MANUAL');

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', color: t.bright }}>Review Phase</h2>
        <span style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: `${t.cyan}20`, color: t.cyan }}>Review</span>
      </div>

      {/* Heal progress — all actionable findings */}
      <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <div style={{ fontSize: '0.82rem', color: t.muted, marginBottom: '4px' }}>
          Heal progress: {fixed.length}/{actionable.length} fixed
        </div>
        <ProgressBar done={fixed.length} total={actionable.length} />
        {manual.length > 0 && (
          <div style={{ fontSize: '0.75rem', color: t.red, marginTop: '4px' }}>⚠ {manual.length} finding{manual.length > 1 ? 's' : ''} require manual fix</div>
        )}
      </div>

      {/* Heal summary stats */}
      <div style={{ marginBottom: '20px', padding: '10px 14px', backgroundColor: t.surface, borderRadius: '8px', border: `1px solid ${t.border}`, fontSize: '0.78rem', color: t.muted }}>
        <span style={{ fontWeight: 600 }}>Last heal</span>: 2026-03-24 — 3 applied, 0 skipped, 1 reverted
      </div>

      {/* Actionable findings grouped by severity */}
      {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => {
        const items = actionable.filter((f) => f.severity === sev);
        if (items.length === 0) return null;
        const sevColor = SEV_COLORS[sev];
        return (
          <section key={sev} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: sevColor.bg, color: sevColor.text }}>{sev}</span>
              <span style={{ fontSize: '0.78rem', color: t.muted }}>{items.length} finding{items.length > 1 ? 's' : ''}</span>
            </div>
            {items.map((f) => <FindingRow key={f.num} f={f} />)}
          </section>
        );
      })}

      {/* NEEDS_REFACTOR — separated, tracked in backlog */}
      {refactorItems.length > 0 && (
        <section style={{ marginTop: '28px', paddingTop: '16px', borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: `${t.purple}20`, color: t.purple }}>NEEDS_REFACTOR</span>
            <span style={{ fontSize: '0.78rem', color: t.muted }}>Tracked in Refactor Backlog — not blocking this branch</span>
          </div>
          {refactorItems.map((f) => <FindingRow key={f.num} f={f} />)}
        </section>
      )}
    </div>
  );
}
