import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';
import TaskRow from '../elements/TaskRow.js';
import type { Element, TaskContent } from '../../types/index.js';

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="bg-board-border h-[5px] flex-1 overflow-hidden rounded-[3px]">
        <div
          className={cn(
            'h-full rounded-[3px] transition-[width] duration-300',
            pct === 100 ? 'bg-board-green' : 'bg-board-accent',
          )}
          style={{ width: `${pct}%` }} // dynamic: runtime value
        />
      </div>
      <span className="text-board-text-muted text-[0.8125rem] whitespace-nowrap">
        {done}/{total}
      </span>
    </div>
  );
}

interface TasksViewProps {
  elements: Element[];
  onToggleTask?: (taskId: string, checked: boolean) => void;
}

export default function TasksView({ elements, onToggleTask }: TasksViewProps) {
  const tasks = elements.filter((e) => e.type === 'task');

  // Group by phase, preserving file order
  const phaseOrder: string[] = [];
  const phases = new Map<string, Element[]>();
  for (const t of tasks) {
    const phase = (t.content as TaskContent).phase || 'Ungrouped';
    if (!phases.has(phase)) {
      phases.set(phase, []);
      phaseOrder.push(phase);
    }
    phases.get(phase)!.push(t);
  }

  // Sort: incomplete phases first, then completed phases
  const sortedPhases = phaseOrder.sort((a, b) => {
    const aDone = phases.get(a)!.every((e) => (e.content as TaskContent).checked);
    const bDone = phases.get(b)!.every((e) => (e.content as TaskContent).checked);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => (t.content as TaskContent).checked).length;

  // Completed phases are collapsed by default
  const [expandedDone, setExpandedDone] = useState<Set<string>>(new Set());
  const toggleDone = (phase: string) => {
    setExpandedDone((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  return (
    <div>
      {/* Overall progress */}
      <div className="mb-6 max-w-[350px]">
        <div className="text-board-text-muted mb-1 text-[0.875rem]">
          Overall: {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% ({completedTasks}/
          {totalTasks} tasks)
        </div>
        <ProgressBar done={completedTasks} total={totalTasks} />
      </div>

      {/* Phases: incomplete first, completed collapsed */}
      {sortedPhases.map((phaseName) => {
        const phaseElements = phases.get(phaseName)!;
        const done = phaseElements.filter((e) => (e.content as TaskContent).checked).length;
        const allDone = done === phaseElements.length;
        const isExpanded = !allDone || expandedDone.has(phaseName);

        return (
          <section key={phaseName} className="mb-4">
            <div
              className={cn('mb-[6px] flex items-center gap-[10px]', allDone ? 'cursor-pointer' : 'cursor-default')}
              onClick={() => {
                if (allDone) toggleDone(phaseName);
              }}
            >
              {allDone && <span className="text-board-text-muted text-[0.8125rem]">{isExpanded ? '▼' : '▶'}</span>}
              <h3 className={cn('m-0 text-[0.9375rem]', allDone ? 'text-board-text-muted' : 'text-board-text-bright')}>
                {phaseName}
              </h3>
              {allDone && <span className="text-board-green text-[0.75rem] font-bold">DONE</span>}
            </div>
            <div className="mb-[6px] max-w-[250px]">
              <ProgressBar done={done} total={phaseElements.length} />
            </div>
            {isExpanded &&
              phaseElements.map((e) => (
                <TaskRow key={e.id} content={e.content as TaskContent} onToggle={onToggleTask} />
              ))}
          </section>
        );
      })}
    </div>
  );
}
