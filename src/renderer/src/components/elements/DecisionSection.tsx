import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DecisionContent } from '../../types/index.js';

/** Render inline markdown: `code`, **bold**, and plain text */
function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(
        <code key={match.index} className="bg-board-bg text-board-cyan rounded px-1.5 py-0.5 text-[0.8em] font-mono">
          {match[1]}
        </code>
      );
    } else if (match[2] !== undefined) {
      parts.push(<strong key={match.index} className="text-board-text-bright font-semibold">{match[2]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}

/** Render multi-paragraph text with inline markdown */
function RichText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split('\n\n');
  if (paragraphs.length <= 1) {
    return <p className={className}><InlineMarkdown text={text} /></p>;
  }
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {paragraphs.map((para, i) => (
        <p key={i}><InlineMarkdown text={para} /></p>
      ))}
    </div>
  );
}

export default function DecisionSection({ content }: { content: DecisionContent }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-board-surface border-board-border mb-2 rounded-lg border transition-colors duration-150 hover:border-board-border-hover">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between px-4 py-3"
      >
        <span className="text-board-text-bright text-[0.9375rem] font-semibold">{content.heading}</span>
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-board-text-muted text-xs"
        >
          ▶
        </motion.span>
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
            <div className="border-board-border/25 border-t px-4 pb-3.5">
              <div className="mt-2.5">
                <div className="text-board-purple text-[0.75rem] font-semibold tracking-[0.05em] uppercase">Decision</div>
                <RichText text={content.content} className="text-board-text my-1 text-[0.9375rem]" />
              </div>
              {content.rationale && (
                <div>
                  <div className="text-board-purple text-[0.75rem] font-semibold tracking-[0.05em] uppercase">
                    Rationale
                  </div>
                  <RichText text={content.rationale} className="text-board-text my-1 text-[0.9375rem]" />
                </div>
              )}
              {content.alternatives && (
                <div>
                  <div className="text-board-text-muted text-[0.75rem] font-semibold tracking-[0.05em] uppercase">
                    Alternatives
                  </div>
                  <RichText text={content.alternatives} className="text-board-text-muted mt-1 text-[0.875rem]" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
