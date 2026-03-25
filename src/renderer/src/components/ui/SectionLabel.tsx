import React from 'react';
import { cn } from '../../lib/utils.js';

interface SectionLabelProps {
  color?: string;
  sub?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function SectionLabel({
  color = 'text-board-text-muted',
  sub = false,
  className,
  children,
}: SectionLabelProps) {
  const base = cn(
    'font-semibold uppercase tracking-[0.05em]',
    color,
    sub ? 'text-[0.75rem]' : 'text-[1rem] mb-[10px]',
    className,
  );

  if (sub) {
    return <div className={base}>{children}</div>;
  }

  return <h3 className={base}>{children}</h3>;
}
