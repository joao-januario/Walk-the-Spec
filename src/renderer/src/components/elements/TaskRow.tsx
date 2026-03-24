import React from 'react';
import { cn } from '../../lib/utils.js';
import type { TaskContent } from '../../types/index.js';

interface TaskRowProps {
  content: TaskContent;
  onToggle?: (taskId: string, checked: boolean) => void;
}

export default function TaskRow({ content, onToggle }: TaskRowProps) {
  const handleChange = () => {
    if (onToggle) onToggle(content.id, !content.checked);
  };

  return (
    <div className="border-board-border/[0.12] flex items-center gap-2 border-b py-[5px]">
      <input
        type="checkbox"
        checked={content.checked}
        onChange={handleChange}
        className={cn('accent-board-accent', onToggle ? 'cursor-pointer' : 'cursor-default')}
        readOnly={!onToggle}
      />
      <code className="text-board-text-muted bg-board-border/25 rounded-[3px] px-1 py-px text-[0.65rem] font-semibold">
        {content.id}
      </code>
      {content.parallel && (
        <span className="text-board-purple bg-board-purple/20 rounded-[3px] px-1 text-[0.6rem] font-bold">P</span>
      )}
      {content.userStory && (
        <span className="text-board-accent bg-board-accent/20 rounded-[3px] px-1 text-[0.6rem] font-bold">
          {content.userStory}
        </span>
      )}
      <span
        className={cn('text-[0.82rem]', content.checked ? 'text-board-text-muted line-through' : 'text-board-text')}
      >
        {content.description}
      </span>
    </div>
  );
}
