import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils.js';
import { getPriorityClasses, getPriorityMeta } from '../../theme.js';
import Tooltip from '../ui/Tooltip.js';
import SectionLabel from '../ui/SectionLabel.js';
import MarkdownContent from '../ui/MarkdownContent.js';
import type { UserStoryContent, GWTScenario } from '../../types/index.js';

function buildTooltipContent(priority: string, whyPriority: string): React.ReactNode {
  const meta = getPriorityMeta(priority);
  const rationale = whyPriority
    ? whyPriority.length > 200 ? whyPriority.slice(0, 200) + '…' : whyPriority
    : meta.description;

  return (
    <div>
      <div className="text-board-text-bright mb-1 font-semibold">★ {meta.label}</div>
      <div className="text-board-text text-[0.8125rem] leading-relaxed">{rationale}</div>
    </div>
  );
}

export default function UserStoryCard({ content }: { content: UserStoryContent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-board-surface border-board-border mb-2 rounded-lg border px-4 py-[14px] transition-colors duration-150 hover:border-board-border-hover">
      <div className="flex cursor-pointer items-center gap-[10px]" onClick={() => setExpanded(!expanded)}>
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-board-text-muted text-xs"
        >
          ▶
        </motion.span>
        <Tooltip content={buildTooltipContent(content.priority, content.whyPriority)}>
          <span
            className={cn('rounded px-[7px] py-[1px] text-[0.75rem] font-bold', getPriorityClasses(content.priority))}
          >
            {content.priority}
          </span>
        </Tooltip>
        <span className="text-board-text-bright text-[1rem] font-semibold">
          US{content.number} — {content.title}
        </span>
      </div>
      <div className="mt-[6px] ml-8">
        <MarkdownContent content={content.description} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-board-surface mt-3 ml-8 rounded-md border border-board-border/30 p-4">
              {content.whyPriority && (
                <div className="mb-[10px]">
                  <SectionLabel sub color="text-board-purple" className="mb-1">Why this priority</SectionLabel>
                  <MarkdownContent content={content.whyPriority} />
                </div>
              )}
              {content.acceptanceScenarios.length > 0 && (
                <div>
                  <SectionLabel sub className="mb-[6px]">Acceptance Scenarios</SectionLabel>
                  {content.acceptanceScenarios.map((s: GWTScenario, i: number) => (
                    <div key={i} className="text-board-text border-board-border mb-1.5 border-l-2 pl-[10px] text-[1rem] leading-relaxed">
                      <span className="text-board-green font-semibold">Given</span>{' '}
                      <MarkdownContent inline content={s.given} />,{' '}
                      <span className="text-board-orange font-semibold">When</span>{' '}
                      <MarkdownContent inline content={s.when} />,{' '}
                      <span className="text-board-accent font-semibold">Then</span>{' '}
                      <MarkdownContent inline content={s.then} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
