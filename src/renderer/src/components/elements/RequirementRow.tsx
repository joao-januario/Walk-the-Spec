import React from 'react';
import type { RequirementContent } from '../../types/index.js';
import CodeTag from '../ui/CodeTag.js';
import MarkdownContent from '../ui/MarkdownContent.js';

export default function RequirementRow({
  content,
  commentCount,
}: {
  content: RequirementContent;
  commentCount?: number;
}) {
  return (
    <div className="border-board-border/30 flex items-start gap-[10px] border-b py-[7px] transition-colors duration-150 hover:bg-board-surface-hover">
      <CodeTag color="accent">{content.id}</CodeTag>
      <MarkdownContent inline content={content.text} className="text-board-text flex-1 text-[1rem] leading-relaxed" />
      {(commentCount ?? 0) > 0 && (
        <span className="bg-board-yellow/20 text-board-yellow cursor-pointer rounded-full px-[6px] py-[1px] text-[0.75rem] whitespace-nowrap">
          💬 {commentCount}
        </span>
      )}
    </div>
  );
}
