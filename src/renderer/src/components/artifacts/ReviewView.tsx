import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils.js';
import { severityClasses, statusClasses } from '../../theme.js';
import CodeBlock from '../elements/CodeBlock.js';
import type { ReviewFinding, FindingSeverity, FindingStatus, HealSummary } from '../../types/index.js';

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="bg-board-border h-[6px] flex-1 overflow-hidden rounded-[3px]">
        <div
          className={cn(
            'h-full rounded-[3px] transition-[width] duration-300',
            pct === 100 ? 'bg-board-green' : 'bg-board-cyan',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-board-text-muted text-[0.8125rem] whitespace-nowrap">
        {done}/{total} ({pct}%)
      </span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const c = severityClasses[severity];
  return <span className={cn('rounded px-[7px] py-[1px] text-[0.75rem] font-bold', c.bg, c.text)}>{severity}</span>;
}

function StatusBadge({ status }: { status: FindingStatus }) {
  const c = statusClasses[status];
  return <span className={cn('rounded px-[7px] py-[1px] text-[0.75rem] font-semibold', c.bg, c.text)}>{c.label}</span>;
}

function FindingRow({ finding }: { finding: ReviewFinding }) {
  const hasDetail = finding.why || finding.gain || finding.codeBlocks.length > 0;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'border-board-border/20 border-b transition-colors duration-150',
        finding.status === 'FIXED' ? 'opacity-50' : 'opacity-100',
        hasDetail && 'hover:bg-board-surface-hover',
      )}
    >
      <div
        className={cn('flex items-start gap-[10px] py-2', hasDetail && 'cursor-pointer')}
        onClick={() => hasDetail && setExpanded(!expanded)}
      >
        <span className="text-board-text-muted w-5 text-right text-[0.8125rem]">#{finding.number}</span>
        <SeverityBadge severity={finding.severity} />
        <code className="text-board-cyan bg-board-cyan/[0.08] rounded-[3px] px-[5px] py-[1px] text-[0.8125rem] font-semibold">
          {finding.ruleId}
        </code>
        <div className="flex-1">
          <div
            className={cn(
              'text-[0.9375rem]',
              finding.status === 'FIXED' ? 'text-board-text-muted line-through' : 'text-board-text',
            )}
          >
            {finding.summary}
          </div>
          <div className="text-board-text-muted mt-[2px] text-[0.8125rem]">
            {finding.location}
          </div>
        </div>
        <StatusBadge status={finding.status} />
        {hasDetail && (
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="text-board-text-muted text-[0.8125rem]"
          >
            ▶
          </motion.span>
        )}
      </div>

      <AnimatePresence>
        {expanded && hasDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-board-surface-elevated border-board-border/10 mb-2 ml-[30px] rounded-md border-l-2 p-4">
              {finding.why && (
                <div className="mb-2">
                  <div className="text-board-purple text-[0.75rem] font-semibold tracking-[0.05em] uppercase">Why this severity</div>
                  <p className="text-board-text mt-0.5 text-[0.9375rem] leading-relaxed">{finding.why}</p>
                </div>
              )}
              {finding.gain && (
                <div className="mb-2">
                  <div className="text-board-green text-[0.75rem] font-semibold tracking-[0.05em] uppercase">What you gain</div>
                  <p className="text-board-text mt-0.5 text-[0.9375rem] leading-relaxed">{finding.gain}</p>
                </div>
              )}
              {finding.codeBlocks.length > 0 && (
                <div className="mt-2">
                  {finding.codeBlocks.map((block, i) => (
                    <CodeBlock key={i} code={block.code} language={block.language} label={block.label || undefined} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ReviewViewProps {
  findings: ReviewFinding[];
  healSummary: HealSummary | null;
}

export default function ReviewView({ findings, healSummary }: ReviewViewProps) {
  if (findings.length === 0) {
    return (
      <div className="py-[60px] text-center">
        <div className="mb-3 text-[2.5rem]">✅</div>
        <div className="text-board-green text-[1.1rem] font-semibold">Review passed — no issues found</div>
        <div className="text-board-text-muted mt-1 text-[0.9375rem]">Run `/speckit.conclude` to finalize the branch.</div>
      </div>
    );
  }

  const actionable = findings.filter((f) => f.severity !== 'NEEDS_REFACTOR');
  const fixed = actionable.filter((f) => f.status === 'FIXED');
  const manual = actionable.filter((f) => f.status === 'MANUAL');
  const isComplete = actionable.length > 0 && actionable.every((f) => f.status === 'FIXED');

  const refactorItems = findings.filter((f) => f.severity === 'NEEDS_REFACTOR');
  const actionableSeverities: FindingSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const grouped = new Map<FindingSeverity, ReviewFinding[]>();
  for (const sev of actionableSeverities) {
    const items = actionable.filter((f) => f.severity === sev);
    if (items.length > 0) grouped.set(sev, items);
  }

  return (
    <div>
      {actionable.length > 0 && (
        <div className="mb-6 max-w-[400px]">
          <div
            className={cn(
              'mb-1 text-[0.9375rem]',
              isComplete ? 'text-board-green font-semibold' : 'text-board-text-muted font-normal',
            )}
          >
            {isComplete ? '✓ All findings resolved' : `Heal progress: ${fixed.length}/${actionable.length} fixed`}
          </div>
          <ProgressBar done={fixed.length} total={actionable.length} />
          {manual.length > 0 && (
            <div className="text-board-red mt-1 text-[0.8125rem]">
              ⚠ {manual.length} finding{manual.length > 1 ? 's' : ''} require manual fix
            </div>
          )}
        </div>
      )}

      {healSummary && (
        <div className="bg-board-surface border-board-border text-board-text-muted mb-5 rounded-lg border px-[14px] py-[10px] text-[0.875rem]">
          <span className="font-semibold">Last heal</span>: {healSummary.date} — {healSummary.appliedCount} applied,{' '}
          {healSummary.skippedCount} skipped, {healSummary.revertedCount} reverted
        </div>
      )}

      {Array.from(grouped.entries()).map(([severity, items]) => (
        <section key={severity} className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <SeverityBadge severity={severity} />
            <span className="text-board-text-muted text-[0.875rem]">
              {items.length} finding{items.length > 1 ? 's' : ''}
            </span>
          </div>
          {items.map((f) => (
            <FindingRow key={f.number} finding={f} />
          ))}
        </section>
      ))}

      {refactorItems.length > 0 && (
        <section className="border-board-border mt-7 border-t pt-4">
          <div className="mb-2 flex items-center gap-2">
            <SeverityBadge severity="NEEDS_REFACTOR" />
            <span className="text-board-text-muted text-[0.875rem]">
              Tracked in Refactor Backlog — not blocking this branch
            </span>
          </div>
          {refactorItems.map((f) => (
            <FindingRow key={f.number} finding={f} />
          ))}
        </section>
      )}
    </div>
  );
}
