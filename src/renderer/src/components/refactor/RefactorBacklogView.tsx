import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils.js';
import type { RefactorEntry } from '../../types/index.js';
import * as api from '../../services/api.js';
import CodeTag from '../ui/CodeTag.js';
import MarkdownContent from '../ui/MarkdownContent.js';

interface RefactorBacklogViewProps {
  projectId: string;
}

export default function RefactorBacklogView({ projectId }: RefactorBacklogViewProps) {
  const [entries, setEntries] = useState<RefactorEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getRefactorBacklog(projectId)
      .then((data) => setEntries(data.entries))
      .catch((err: unknown) => {
        console.error('Failed to load refactor backlog:', err);
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return <div className="text-board-text-muted text-[0.85rem]">Loading backlog...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="py-[60px] text-center">
        <div className="mb-3 text-[2rem] opacity-40">🧹</div>
        <div className="text-board-text-muted text-[0.9rem]">No refactor items</div>
        <div className="text-board-text-muted mt-1 text-[0.78rem]">
          Architectural debt from `/speckit.review` will appear here.
        </div>
      </div>
    );
  }

  // Group by branch
  const byBranch = new Map<string, RefactorEntry[]>();
  for (const e of entries) {
    if (!byBranch.has(e.branch)) byBranch.set(e.branch, []);
    byBranch.get(e.branch)!.push(e);
  }

  return (
    <div>
      <h2 className="text-board-text-bright m-0 mb-1 text-[1.2rem]">Refactor Backlog</h2>
      <p className="text-board-text-muted m-0 mb-5 text-[0.78rem]">
        {entries.length} item{entries.length > 1 ? 's' : ''} across {byBranch.size} branch
        {byBranch.size > 1 ? 'es' : ''}
      </p>

      {Array.from(byBranch.entries()).map(([branch, items]) => (
        <section key={branch} className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <CodeTag color="accent">{branch}</CodeTag>
            <span className="text-board-text-muted text-[0.7rem]">
              {items.length} item{items.length > 1 ? 's' : ''}
            </span>
          </div>
          {items.map((entry) => (
            <div key={entry.id} className="border-board-border/20 flex items-start gap-[10px] border-b py-2">
              <CodeTag color="purple" size="sm">{entry.id}</CodeTag>
              <CodeTag color="muted" size="sm">{entry.rule}</CodeTag>
              <div className="flex-1">
                <div className="text-board-text text-[0.82rem]">
                  <MarkdownContent inline content={entry.description} />
                </div>
                <div className="text-board-text-muted mt-[2px] text-[0.7rem]">
                  <MarkdownContent inline content={entry.files} />
                </div>
              </div>
              <span
                className={cn(
                  'rounded px-[6px] py-[1px] text-[0.65rem] font-semibold',
                  entry.status === 'Open'
                    ? 'bg-board-yellow/20 text-board-yellow'
                    : 'bg-board-green/20 text-board-green',
                )}
              >
                {entry.status}
              </span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
