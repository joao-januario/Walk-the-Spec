import React from 'react';
import { theme } from '../../theme.js';
import type { Element, ReviewFinding, FindingSeverity, FindingStatus, HealSummary } from '../../types/index.js';

const SEVERITY_ORDER: FindingSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NEEDS_REFACTOR'];

const SEVERITY_COLORS: Record<FindingSeverity, { bg: string; text: string }> = {
  CRITICAL: { bg: `${theme.red}20`, text: theme.red },
  HIGH: { bg: `${theme.orange}20`, text: theme.orange },
  MEDIUM: { bg: `${theme.yellow}20`, text: theme.yellow },
  LOW: { bg: `${theme.textMuted}20`, text: theme.textMuted },
  NEEDS_REFACTOR: { bg: `${theme.purple}20`, text: theme.purple },
};

const STATUS_COLORS: Record<FindingStatus, { bg: string; text: string; label: string }> = {
  FIXED: { bg: `${theme.green}20`, text: theme.green, label: 'FIXED' },
  SKIPPED: { bg: `${theme.yellow}20`, text: theme.yellow, label: 'SKIPPED' },
  MANUAL: { bg: `${theme.red}20`, text: theme.red, label: 'MANUAL — needs manual fix' },
  unfixed: { bg: `${theme.border}40`, text: theme.textMuted, label: 'Unfixed' },
};

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', backgroundColor: theme.border, borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? theme.green : theme.cyan, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: theme.textMuted, whiteSpace: 'nowrap' }}>{done}/{total} ({pct}%)</span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const c = SEVERITY_COLORS[severity];
  return (
    <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: c.bg, color: c.text }}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: FindingStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, backgroundColor: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

function FindingRow({ finding }: { finding: ReviewFinding }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0',
      borderBottom: `1px solid ${theme.border}20`,
      opacity: finding.status === 'FIXED' ? 0.5 : 1,
    }}>
      <span style={{ fontSize: '0.7rem', color: theme.textMuted, width: '20px', textAlign: 'right' }}>#{finding.number}</span>
      <SeverityBadge severity={finding.severity} />
      <code style={{ fontSize: '0.7rem', fontWeight: 600, color: theme.cyan, backgroundColor: `${theme.cyan}15`, padding: '1px 5px', borderRadius: '3px' }}>
        {finding.ruleId}
      </code>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.82rem', color: finding.status === 'FIXED' ? theme.textMuted : theme.text, textDecoration: finding.status === 'FIXED' ? 'line-through' : 'none' }}>
          {finding.summary}
        </div>
        <div style={{ fontSize: '0.7rem', color: theme.textMuted, marginTop: '2px' }}>
          {finding.file}{finding.line ? `:${finding.line}` : ''}
        </div>
      </div>
      <StatusBadge status={finding.status} />
    </div>
  );
}

interface ReviewViewProps {
  findings: ReviewFinding[];
  healSummary: HealSummary | null;
}

export default function ReviewView({ findings, healSummary }: ReviewViewProps) {

  if (findings.length === 0) {
    // Clean review — success state
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
        <div style={{ fontSize: '1.1rem', color: theme.green, fontWeight: 600 }}>Review passed — no issues found</div>
        <div style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '4px' }}>Run `/speckit.conclude` to finalize the branch.</div>
      </div>
    );
  }

  // Progress: all actionable findings (everything except NEEDS_REFACTOR)
  const actionable = findings.filter((f) => f.severity !== 'NEEDS_REFACTOR');
  const fixed = actionable.filter((f) => f.status === 'FIXED');
  const manual = actionable.filter((f) => f.status === 'MANUAL');
  const isComplete = actionable.length > 0 && actionable.every((f) => f.status === 'FIXED');

  // Group actionable by severity (exclude NEEDS_REFACTOR)
  const refactorItems = findings.filter((f) => f.severity === 'NEEDS_REFACTOR');
  const actionableSeverities: FindingSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const grouped = new Map<FindingSeverity, ReviewFinding[]>();
  for (const sev of actionableSeverities) {
    const items = actionable.filter((f) => f.severity === sev);
    if (items.length > 0) grouped.set(sev, items);
  }

  return (
    <div>
      {/* Heal progress — all actionable findings */}
      {actionable.length > 0 && (
        <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
          <div style={{ fontSize: '0.82rem', color: isComplete ? theme.green : theme.textMuted, marginBottom: '4px', fontWeight: isComplete ? 600 : 400 }}>
            {isComplete ? '✓ All findings resolved' : `Heal progress: ${fixed.length}/${actionable.length} fixed`}
          </div>
          <ProgressBar done={fixed.length} total={actionable.length} />
          {manual.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: theme.red, marginTop: '4px' }}>
              ⚠ {manual.length} finding{manual.length > 1 ? 's' : ''} require manual fix
            </div>
          )}
        </div>
      )}

      {/* Heal summary stats */}
      {healSummary && (
        <div style={{ marginBottom: '20px', padding: '10px 14px', backgroundColor: theme.surface, borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '0.78rem', color: theme.textMuted }}>
          <span style={{ fontWeight: 600 }}>Last heal</span>: {healSummary.date} — {healSummary.appliedCount} applied, {healSummary.skippedCount} skipped, {healSummary.revertedCount} reverted
        </div>
      )}

      {/* Actionable findings grouped by severity */}
      {Array.from(grouped.entries()).map(([severity, items]) => (
        <section key={severity} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <SeverityBadge severity={severity} />
            <span style={{ fontSize: '0.78rem', color: theme.textMuted }}>{items.length} finding{items.length > 1 ? 's' : ''}</span>
          </div>
          {items.map((f) => <FindingRow key={f.number} finding={f} />)}
        </section>
      ))}

      {/* NEEDS_REFACTOR — separated, tracked in backlog */}
      {refactorItems.length > 0 && (
        <section style={{ marginTop: '28px', paddingTop: '16px', borderTop: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <SeverityBadge severity="NEEDS_REFACTOR" />
            <span style={{ fontSize: '0.78rem', color: theme.textMuted }}>Tracked in Refactor Backlog — not blocking this branch</span>
          </div>
          {refactorItems.map((f) => <FindingRow key={f.number} finding={f} />)}
        </section>
      )}
    </div>
  );
}
