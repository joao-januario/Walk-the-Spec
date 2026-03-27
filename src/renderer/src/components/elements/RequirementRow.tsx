import React from 'react';
import type { RequirementContent } from '../../types/index.js';
import CodeTag from '../ui/CodeTag.js';
import MarkdownContent from '../ui/MarkdownContent.js';

export default function RequirementRow({ content }: { content: RequirementContent }) {
  return (
    <div className="border-board-border/30 flex items-start gap-[10px] border-b py-[10px] transition-colors duration-150 hover:bg-board-surface-hover">
      <CodeTag color="accent">{content.id}</CodeTag>
      <MarkdownContent inline content={content.text} className="text-board-text flex-1 text-[1.0625rem] leading-relaxed" />
    </div>
  );
}
