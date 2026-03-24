import React from 'react';

interface CommentBadgeProps {
  count: number;
  onClick: () => void;
}

export default function CommentBadge({ count, onClick }: CommentBadgeProps) {
  if (count === 0) {
    return (
      <button
        onClick={onClick}
        aria-label="Toggle comments"
        className="text-board-text-muted border-board-border cursor-pointer rounded border bg-transparent px-1.5 py-px text-xs"
      >
        💬
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={`Toggle comments (${count})`}
      className="text-board-yellow bg-board-yellow/20 cursor-pointer rounded-full border-none px-2 py-0.5 text-[0.65rem] font-semibold"
    >
      💬 {count}
    </button>
  );
}
