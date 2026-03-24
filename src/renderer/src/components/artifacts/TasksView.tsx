import React, { useState } from 'react';
import { theme } from '../../theme.js';
import TaskRow from '../elements/TaskRow.js';
import type { Element, TaskContent } from '../../types/index.js';

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '5px', backgroundColor: theme.border, borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? theme.green : theme.accent, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: theme.textMuted, whiteSpace: 'nowrap' }}>{done}/{total}</span>
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
      if (next.has(phase)) next.delete(phase); else next.add(phase);
      return next;
    });
  };

  return (
    <div>
      {/* Overall progress */}
      <div style={{ marginBottom: '24px', maxWidth: '350px' }}>
        <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginBottom: '4px' }}>
          Overall: {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% ({completedTasks}/{totalTasks} tasks)
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
          <section key={phaseName} style={{ marginBottom: '16px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', cursor: allDone ? 'pointer' : 'default' }}
              onClick={() => { if (allDone) toggleDone(phaseName); }}
            >
              {allDone && (
                <span style={{ color: theme.textMuted, fontSize: '0.7rem' }}>{isExpanded ? '▼' : '▶'}</span>
              )}
              <h3 style={{ margin: 0, fontSize: '0.88rem', color: allDone ? theme.textMuted : theme.textBright }}>{phaseName}</h3>
              {allDone && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: theme.green }}>DONE</span>}
            </div>
            <div style={{ marginBottom: '6px', maxWidth: '250px' }}>
              <ProgressBar done={done} total={phaseElements.length} />
            </div>
            {isExpanded && phaseElements.map((e) => (
              <TaskRow key={e.id} content={e.content as TaskContent} onToggle={onToggleTask} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
