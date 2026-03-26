import React from 'react';
import { cn } from '../../lib/utils.js';
import type { TaskContent } from '../../types/index.js';
import CodeTag from '../ui/CodeTag.js';
import MarkdownContent from '../ui/MarkdownContent.js';

interface TaskRowProps {
  content: TaskContent;
  onToggle?: (taskId: string, checked: boolean) => void;
}

export default function TaskRow({ content, onToggle }: TaskRowProps) {
  const handleChange = () => {
    if (onToggle) onToggle(content.id, !content.checked);
  };

  return (
    <div className="border-board-border/20 flex items-center gap-2 border-b py-[7px] last:border-b-0">
      <input
        type="checkbox"
        checked={content.checked}
        onChange={handleChange}
        className={cn('accent-board-accent', onToggle ? 'cursor-pointer' : 'cursor-default')}
        readOnly={!onToggle}
      />
      <CodeTag color="muted" size="sm">{content.id}</CodeTag>
      {content.parallel && (
        <span className="text-board-purple bg-board-purple/20 rounded-[3px] px-1 text-[0.6rem] font-bold">P</span>
      )}
      {content.userStory && (
        <span className="text-board-accent bg-board-accent/20 rounded-[3px] px-1 text-[0.6rem] font-bold">
          {content.userStory}
        </span>
      )}
      <MarkdownContent
        inline
        content={content.description}
        className={cn('text-[1rem] leading-relaxed', content.checked ? 'text-board-text-muted line-through' : 'text-board-text')}
      />
    </div>
  );
}
