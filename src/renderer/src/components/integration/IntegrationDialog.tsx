import React from 'react';
import { cn } from '../../lib/utils.js';
import type { IntegrationPlan } from '../../types/index.js';

interface IntegrationDialogProps {
  plan: IntegrationPlan;
  onConfirm: () => void;
  onCancel: () => void;
  executing: boolean;
}

export default function IntegrationDialog({ plan, onConfirm, onCancel, executing }: IntegrationDialogProps) {
  const createFiles = plan.files.filter((f) => f.action === 'create');
  const overwriteFiles = plan.files.filter((f) => f.action === 'overwrite');
  const preserveFiles = plan.files.filter((f) => f.action === 'preserve');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-board-surface border-board-border max-h-[80vh] w-[560px] animate-[dialog-in_0.15s_ease-out] overflow-hidden rounded-xl border shadow-2xl">
        {/* Header */}
        <div className="border-board-border border-b px-5 py-4">
          <h2 className="text-board-text-bright m-0 text-[1.125rem] font-semibold">Integrate Speckit</h2>
          <p className="text-board-text-muted mt-1 text-[0.8125rem]">
            This will bootstrap the speckit scaffold into the project. Files at speckit-owned paths will be overwritten.
          </p>
        </div>

        {/* File list */}
        <div className="max-h-[50vh] overflow-y-auto px-5 py-3">
          {/* Summary counts */}
          <div className="mb-3 flex gap-4 text-[0.8125rem]">
            <span className="text-board-green">{plan.createCount} create</span>
            {plan.overwriteCount > 0 && (
              <span className="text-board-orange">{plan.overwriteCount} overwrite</span>
            )}
            {plan.preserveCount > 0 && (
              <span className="text-board-text-muted">{plan.preserveCount} preserve</span>
            )}
          </div>

          {plan.specsWillBeWiped && (
            <div className="text-board-orange bg-board-orange/10 border-board-orange/30 mb-3 rounded-md border px-3 py-2 text-[0.8125rem]">
              Existing <code>.claude/specs/</code> will be wiped (clean slate).
            </div>
          )}

          {!plan.claudeMdExists && (
            <div className="text-board-cyan bg-board-cyan/10 border-board-cyan/30 mb-3 rounded-md border px-3 py-2 text-[0.8125rem]">
              A new <code>CLAUDE.md</code> will be created from template.
            </div>
          )}

          {/* Create */}
          {createFiles.length > 0 && (
            <FileSection
              title="Will be created"
              files={createFiles.map((f) => f.relativePath)}
              color="text-board-green"
            />
          )}

          {/* Overwrite */}
          {overwriteFiles.length > 0 && (
            <FileSection
              title="Will be overwritten"
              files={overwriteFiles.map((f) => f.relativePath)}
              color="text-board-orange"
            />
          )}

          {/* Preserve */}
          {preserveFiles.length > 0 && (
            <FileSection
              title="Will be preserved"
              files={preserveFiles.map((f) => f.relativePath)}
              color="text-board-text-muted"
            />
          )}
        </div>

        {/* Actions */}
        <div className="border-board-border flex justify-end gap-3 border-t px-5 py-3">
          <button
            onClick={onCancel}
            disabled={executing}
            className="text-board-text-muted hover:text-board-text cursor-pointer rounded-md bg-transparent px-4 py-1.5 text-[0.875rem] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={executing}
            className={cn(
              'rounded-md px-4 py-1.5 text-[0.875rem] font-semibold transition-colors cursor-pointer',
              'bg-board-cyan/20 text-board-cyan border border-board-cyan/40 hover:bg-board-cyan/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {executing ? 'Integrating...' : 'Confirm Integration'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FileSection({ title, files, color }: { title: string; files: string[]; color: string }) {
  const [expanded, setExpanded] = React.useState(files.length <= 10);

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn('text-[0.8125rem] font-semibold bg-transparent border-none cursor-pointer p-0', color)}
      >
        {expanded ? '▾' : '▸'} {title} ({files.length})
      </button>
      {expanded && (
        <div className="mt-1 ml-3 space-y-0.5">
          {files.map((f) => (
            <div key={f} className="text-board-text font-mono text-[0.75rem]">{f}</div>
          ))}
        </div>
      )}
    </div>
  );
}
