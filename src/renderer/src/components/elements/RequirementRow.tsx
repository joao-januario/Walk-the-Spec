import React from 'react';
import type { RequirementContent } from '../../types/index.js';

export default function RequirementRow({
  content,
  commentCount,
}: {
  content: RequirementContent;
  commentCount?: number;
}) {
  return (
    <div className="border-board-border/30 flex items-start gap-[10px] border-b py-[7px]">
      <code className="text-board-accent bg-board-accent/10 rounded px-[6px] py-[2px] text-xs font-bold whitespace-nowrap">
        {content.id}
      </code>
      <span className="text-board-text flex-1 text-[0.82rem]">{content.text}</span>
      {(commentCount ?? 0) > 0 && (
        <span className="bg-board-yellow/20 text-board-yellow cursor-pointer rounded-full px-[6px] py-[1px] text-[0.65rem] whitespace-nowrap">
          💬 {commentCount}
        </span>
      )}
    </div>
  );
}
