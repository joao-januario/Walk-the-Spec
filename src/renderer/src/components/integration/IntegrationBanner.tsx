import React from 'react';
import { cn } from '../../lib/utils.js';
import type { IntegrationState } from '../../types/index.js';

interface IntegrationBannerProps {
  integrationState: IntegrationState;
}

const BANNER_CONFIG: Partial<Record<IntegrationState, { text: string; color: string; bgColor: string; borderColor: string }>> = {
  'needs-constitution': {
    text: 'Integration complete — run /spec.constitution to configure for this project',
    color: 'text-board-yellow',
    bgColor: 'bg-board-yellow/10',
    borderColor: 'border-board-yellow/30',
  },
  'outdated': {
    text: 'Scaffold outdated — re-integrate to update',
    color: 'text-board-orange',
    bgColor: 'bg-board-orange/10',
    borderColor: 'border-board-orange/30',
  },
};

export default function IntegrationBanner({ integrationState }: IntegrationBannerProps) {
  const config = BANNER_CONFIG[integrationState];
  if (!config) return null;

  return (
    <div className={cn('mb-4 rounded-md border px-3 py-2 text-[0.8125rem]', config.color, config.bgColor, config.borderColor)}>
      {config.text}
    </div>
  );
}
