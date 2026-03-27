import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface CollapsibleSectionProps {
  id: string;
  heading: string;
  level: 'section' | 'subsection' | 'explainer';
  number?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  /** Extra content shown to the right of the heading (badges, progress bars, etc.) */
  trailing?: React.ReactNode;
  /** When true, show a comment icon in the heading row */
  commentEnabled?: boolean;
  /** Current comment text for this section */
  commentText?: string;
  /** Called when the user changes the comment text */
  onCommentChange?: (text: string) => void;
}

/**
 * Shared collapsible section used across all artifact tabs.
 *
 * - `section` level: large bright heading with optional numbered badge and accent left-border on content
 * - `subsection` level: card container with surface background, smaller heading
 * - `explainer` level: compact info box for "New to X?" callouts, collapsed by default
 */
export default function CollapsibleSection({
  id,
  heading,
  level,
  number,
  defaultOpen = true,
  children,
  trailing,
  commentEnabled,
  commentText,
  onCommentChange,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(level === 'explainer' ? false : defaultOpen);
  const [commentOpen, setCommentOpen] = useState(false);

  const hasComment = (commentText ?? '').trim().length > 0;

  const commentFooter = commentEnabled ? (
    <div className="mt-4 pt-2 border-t border-board-border/15">
      <button
        type="button"
        onClick={() => setCommentOpen(!commentOpen)}
        aria-expanded={commentOpen}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.8125rem] font-medium transition-colors',
          'bg-transparent border-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-cyan/60',
          hasComment
            ? 'text-board-cyan'
            : 'text-board-text-faint hover:text-board-text-muted',
        )}
      >
        <MessageSquare size={14} />
        {hasComment ? 'Edit feedback' : 'Add feedback'}
      </button>
      {commentOpen && (
        <textarea
          value={commentText ?? ''}
          onChange={(e) => onCommentChange?.(e.target.value)}
          placeholder="Add your feedback for this section..."
          className={cn(
            'w-full rounded-md border px-3 py-2 text-[0.875rem] leading-relaxed mt-2',
            'bg-board-bg border-board-border text-board-text',
            'placeholder:text-board-text-faint',
            'focus-visible:border-board-cyan focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-board-cyan/30',
            'resize-y min-h-[60px]',
          )}
          rows={3}
        />
      )}
    </div>
  ) : null;

  if (level === 'explainer') {
    return (
      <div className="bg-board-purple/[0.06] rounded-lg border border-board-purple/20 px-4 py-1 my-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full cursor-pointer items-center gap-2 bg-transparent border-none py-2 text-left"
        >
          <span className="text-board-purple text-[0.75rem] leading-none">
            {open ? '▼' : '▶'}
          </span>
          <span className="text-board-purple m-0 text-[0.875rem] font-semibold">
            {heading}
          </span>
        </button>
        {open && <div className="pb-3 pt-1">{children}</div>}
      </div>
    );
  }

  if (level === 'subsection') {
    return (
      <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full cursor-pointer items-center gap-2 bg-transparent border-none py-2 text-left"
        >
          <span className="text-board-text-muted text-[0.75rem] leading-none">
            {open ? '▼' : '▶'}
          </span>
          <h4 className="text-board-text-bright m-0 flex-1 text-[0.9375rem] font-semibold">
            {heading}
          </h4>
          {trailing}
        </button>
        {open && <div className="pb-4 pt-1">{children}{commentFooter}</div>}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center gap-3 bg-transparent border-none py-2.5 text-left"
      >
        <span className="text-board-text-muted text-[0.75rem] leading-none">
          {open ? '▼' : '▶'}
        </span>
        {number != null && (
          <span className="text-board-accent/70 text-[0.75rem] font-medium tabular-nums">
            {String(number).padStart(2, '0')}
          </span>
        )}
        <h3 className={cn(
          'm-0 flex-1 font-bold tracking-wide',
          'text-board-text-bright text-[1.125rem]',
        )}>
          {heading}
        </h3>
        {trailing}
      </button>
      {open && (
        <div className="border-board-accent/20 border-l-2 ml-[9px] pl-6 pb-4 pt-2">
          {children}
          {commentFooter}
        </div>
      )}
    </div>
  );
}
