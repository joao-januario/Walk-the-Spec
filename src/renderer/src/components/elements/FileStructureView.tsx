import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { getOperationClasses } from '../../theme.js';
import type { FileStructureSection, FileStructureEntry } from '../../types/index.js';

interface FileStructureViewProps {
  sections: FileStructureSection[];
}

function EntryRow({ entry }: { entry: FileStructureEntry }): JSX.Element {
  const op = getOperationClasses(entry.operation);

  return (
    <div
      className={cn(
        'flex items-baseline gap-2 border-l-2 py-1 pl-3 pr-2',
        op.border,
        op.bg,
      )}
    >
      <FileText size={13} className="shrink-0 translate-y-[1px] text-board-text-faint" />
      <span className="min-w-0 flex-1 font-mono text-[0.8125rem] leading-snug">
        <span className="text-board-text-subtle">{entry.directory}</span>
        <span className="text-board-text-bright font-medium">{entry.filename}</span>
      </span>
      {op.label && (
        <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide', op.text, op.bg || 'bg-board-border/20')}>
          {op.label}
        </span>
      )}
      {entry.comment && (
        <span className="shrink-0 text-[0.75rem] text-board-text-faint max-w-[40%] truncate">
          {entry.comment}
        </span>
      )}
    </div>
  );
}

function SectionGroup({ section }: { section: FileStructureSection }): JSX.Element {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg border border-board-border/30 bg-board-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-2 text-left"
      >
        <span className="text-board-text-muted text-[0.75rem] leading-none">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="flex-1 text-[0.875rem] font-semibold text-board-text-bright">
          {section.title}
        </span>
        <span className="rounded-full bg-board-border/30 px-2 py-0.5 text-[0.6875rem] font-medium tabular-nums text-board-text-muted">
          {section.entries.length}
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-px border-t border-board-border/20 pb-1 pt-1">
          {section.entries.map((entry, i) => (
            <EntryRow key={`${entry.filePath}-${i}`} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileStructureView({ sections }: FileStructureViewProps): JSX.Element {
  if (sections.length === 0) return <></>;

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section, i) => (
        <SectionGroup key={`${section.title}-${i}`} section={section} />
      ))}
    </div>
  );
}
