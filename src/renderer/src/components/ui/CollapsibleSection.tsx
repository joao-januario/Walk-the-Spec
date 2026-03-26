import React, { useState } from 'react';
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
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(level === 'explainer' ? false : defaultOpen);

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
        {open && <div className="pb-4 pt-1">{children}</div>}
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
          <span className="text-board-accent text-[0.75rem] font-medium tabular-nums opacity-50">
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
        </div>
      )}
    </div>
  );
}
