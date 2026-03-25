import React from 'react';
import { cn } from '../../lib/utils.js';

const colorMap = {
  accent: 'text-board-accent bg-board-accent/15',
  cyan: 'text-board-cyan bg-board-cyan/15',
  green: 'text-board-green bg-board-green/15',
  purple: 'text-board-purple bg-board-purple/15',
  muted: 'text-board-text-muted bg-board-border/25',
} as const;

const sizeMap = {
  sm: 'text-[0.65rem] px-1 py-px',
  md: 'text-[0.8125rem] px-1.5 py-0.5',
} as const;

type CodeTagColor = keyof typeof colorMap;
type CodeTagSize = keyof typeof sizeMap;

interface CodeTagProps {
  color?: CodeTagColor;
  size?: CodeTagSize;
  className?: string;
  children: React.ReactNode;
}

export default function CodeTag({ color = 'accent', size = 'md', className, children }: CodeTagProps) {
  return (
    <code className={cn('rounded font-bold whitespace-nowrap', colorMap[color], sizeMap[size], className)}>
      {children}
    </code>
  );
}
