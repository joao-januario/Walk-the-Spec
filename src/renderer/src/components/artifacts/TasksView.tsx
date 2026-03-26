import React from 'react';
import { cn } from '../../lib/utils.js';
import CollapsibleSection from '../ui/CollapsibleSection.js';
import TaskRow from '../elements/TaskRow.js';
import type { Element, TaskContent } from '../../types/index.js';

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="bg-board-border h-[5px] w-[150px] overflow-hidden rounded-[3px]">
        <div
          className={cn(
            'h-full rounded-[3px] transition-[width] duration-300',
            pct === 100 ? 'bg-board-green' : 'bg-board-accent',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-board-text-muted text-[0.8125rem] whitespace-nowrap">
        {done}/{total}
      </span>
      {pct === 100 && <span className="text-board-green text-[0.75rem] font-bold">DONE</span>}
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

  return (
    <div>
      {/* Overall progress */}
      <div className="bg-board-surface rounded-lg border border-board-border/50 mb-6 px-4 py-3 max-w-[400px]">
        <div className="text-board-text-muted mb-1.5 text-[0.875rem]">
          Overall: {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% ({completedTasks}/
          {totalTasks} tasks)
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-board-border h-[5px] flex-1 overflow-hidden rounded-[3px]">
            <div
              className={cn(
                'h-full rounded-[3px] transition-[width] duration-300',
                completedTasks === totalTasks ? 'bg-board-green' : 'bg-board-accent',
              )}
              style={{ width: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%` }}
            />
          </div>
          <span className="text-board-text-muted text-[0.8125rem] whitespace-nowrap">
            {completedTasks}/{totalTasks}
          </span>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-5">
        {sortedPhases.map((phaseName, idx) => {
          const phaseElements = phases.get(phaseName)!;
          const done = phaseElements.filter((e) => (e.content as TaskContent).checked).length;
          const allDone = done === phaseElements.length;

          return (
            <CollapsibleSection
              key={phaseName}
              id={`tasks-${phaseName}`}
              heading={phaseName}
              level="section"
              number={idx + 1}
              defaultOpen={!allDone}
              trailing={<ProgressBar done={done} total={phaseElements.length} />}
            >
              <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-1">
                {phaseElements.map((e, index) => (
                  <div key={e.id}>
                    {index > 0 && index % 5 === 0 && (
                      <div className="border-board-border/15 my-1 border-t" />
                    )}
                    <TaskRow content={e.content as TaskContent} onToggle={onToggleTask} />
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          );
        })}
      </div>
    </div>
  );
}
