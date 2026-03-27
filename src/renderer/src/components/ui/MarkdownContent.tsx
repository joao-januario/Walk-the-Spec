import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils.js';
import { getInlineCodeColor } from '../../lib/inline-code-color.js';
import { useGlossary } from '../../context/GlossaryContext.js';
import CodeBlock from '../elements/CodeBlock.js';
import Tooltip from './Tooltip.js';

// ── Inline mode: RFC 2119 keywords + metrics + backtick code ──

const keywordColors: Record<string, string> = {
  'MUST NOT': 'text-board-orange font-semibold',
  MUST: 'text-board-orange font-semibold',
  'SHALL NOT': 'text-board-orange font-semibold',
  SHALL: 'text-board-orange font-semibold',
  'SHOULD NOT': 'text-board-yellow font-semibold',
  SHOULD: 'text-board-yellow font-semibold',
  MAY: 'text-board-green font-semibold',
};

const metricClass = 'text-board-cyan font-medium';

const INLINE_RE = new RegExp(
  [
    '`[^`]+`',
    'MUST NOT|SHOULD NOT|SHALL NOT',
    'MUST|SHOULD|SHALL',
    'MAY(?=[\\s.,;:)]|$)',
    '\\d+\\.?\\d*:\\d+',
    '\\d+%',
    '\\d+\\+',
    '\\d+\\s*(?:seconds?|minutes?|hours?|days?|weeks?|months?)(?=[\\s.,;:)]|$)',
    '(?<=^|\\s)(?:Zero|zero)(?=\\s)',
  ].join('|'),
  'g',
);

function wrapWithGlossary(codeText: string, codeNode: React.ReactElement, glossary: Record<string, string>): React.ReactNode {
  const definition = glossary[codeText];
  if (!definition) return codeNode;
  return (
    <Tooltip content={definition} side="bottom">
      <span className="cursor-help underline decoration-dotted decoration-board-accent/60 underline-offset-2">
        {codeNode}
      </span>
    </Tooltip>
  );
}

function renderInlineText(text: string, glossary: Record<string, string> = {}): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const seg = match[0];

    if (seg.startsWith('`') && seg.endsWith('`')) {
      const code = seg.slice(1, -1);
      const colorClass = getInlineCodeColor(code);
      const isHex = /^#[0-9a-fA-F]{3,8}$/.test(code);
      const codeNode = (
        <code key={match.index} className={cn('rounded bg-board-surface-elevated px-1.5 py-0.5 text-[0.85em] font-mono', colorClass)}>
          {isHex && <span className="mr-1 inline-block h-[0.7em] w-[0.7em] rounded-sm border border-white/20" style={{ backgroundColor: code }} />}
          {code}
        </code>
      );
      nodes.push(wrapWithGlossary(code, codeNode, glossary));
    } else if (seg in keywordColors) {
      nodes.push(<span key={match.index} className={keywordColors[seg]}>{seg}</span>);
    } else {
      nodes.push(<span key={match.index} className={metricClass}>{seg}</span>);
    }
    lastIndex = match.index + seg.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  INLINE_RE.lastIndex = 0;
  return nodes;
}

// ── Callout labels rendered as pills instead of bold text ──

const CALLOUT_LABELS: Record<string, { color: string; bg: string }> = {
  "What's happening here": { color: 'text-board-cyan', bg: 'bg-board-cyan/15' },
  'The key insight': { color: 'text-board-yellow', bg: 'bg-board-yellow/15' },
  'The pattern to take away': { color: 'text-board-green', bg: 'bg-board-green/15' },
  'Why this matters': { color: 'text-board-cyan', bg: 'bg-board-cyan/15' },
  'Why': { color: 'text-board-orange', bg: 'bg-board-orange/15' },
  'Approach': { color: 'text-board-accent', bg: 'bg-board-accent/15' },
  'Tradeoffs': { color: 'text-board-yellow', bg: 'bg-board-yellow/15' },
  'Line-by-line': { color: 'text-board-purple', bg: 'bg-board-purple/15' },
  'File': { color: 'text-board-accent', bg: 'bg-board-accent/15' },
};

// ── Component ──

interface MarkdownContentProps {
  content: string;
  inline?: boolean;
  className?: string;
}

export default function MarkdownContent({ content, inline, className }: MarkdownContentProps) {
  const glossary = useGlossary();
  if (!content) return <span className={className} />;

  if (inline) {
    return <span className={className}>{renderInlineText(content, glossary)}</span>;
  }

  return (
    <div
      className={cn(
        'prose max-w-none text-[1.0625rem] leading-relaxed text-board-text',
        'prose-headings:text-board-text-bright',
        'prose-p:text-board-text',
        'prose-a:text-board-accent',
        'prose-strong:text-board-text-bright prose-strong:font-semibold',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-board-bg prose-pre:border prose-pre:border-board-border',
        'prose-blockquote:border-board-border prose-blockquote:text-board-text-muted',
        'prose-li:text-board-text prose-li:marker:text-board-text-muted',
        'prose-hr:border-board-border',
        'prose-th:text-board-text-bright',
        'prose-td:text-board-text',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children, ...props }) {
            const langMatch = /language-(\w+)/.exec(codeClassName ?? '');
            const text = String(children).replace(/\n$/, '');
            if (langMatch) {
              return <div className="not-prose"><CodeBlock code={text} language={langMatch[1]} /></div>;
            }
            const colorClass = getInlineCodeColor(text);
            const isHex = /^#[0-9a-fA-F]{3,8}$/.test(text);
            const codeNode = (
              <code className={cn('rounded bg-board-surface-elevated px-1.5 py-0.5 text-[0.85em] font-mono', colorClass, codeClassName)} {...props}>
                {isHex && <span className="mr-1 inline-block h-[0.7em] w-[0.7em] rounded-sm border border-white/20" style={{ backgroundColor: text }} />}
                {children}
              </code>
            );
            return wrapWithGlossary(text, codeNode, glossary) as React.ReactElement;
          },
          p({ children, ...props }) {
            // Detect paragraphs that contain ONLY a file path in backticks
            // (e.g., `src/main/parser/summary-parser.ts` on its own line)
            const childArray = React.Children.toArray(children);
            if (childArray.length === 1) {
              const child = childArray[0];
              if (React.isValidElement(child) && child.props?.className?.includes('text-board-green')) {
                const text = String(child.props.children ?? '');
                if (/[/\\]/.test(text) && /\.[a-z]{1,4}$/i.test(text)) {
                  return (
                    <div className="not-prose mt-4 mb-1">
                      <span className="inline-flex items-center gap-1.5 rounded bg-board-green/10 px-2 py-0.5 text-[0.8rem] font-mono text-board-green">
                        <span className="opacity-50">&#128196;</span>
                        {text}
                      </span>
                    </div>
                  );
                }
              }
            }
            return <p {...props}>{children}</p>;
          },
          strong({ children, ...props }) {
            const text = String(children);
            const style = CALLOUT_LABELS[text];
            if (style) {
              return (
                <span className="block mt-4 mb-1 first:mt-0 not-prose">
                  <span className={cn('rounded px-1 py-px text-[0.7rem] font-bold', style.color, style.bg)}>
                    {text.toUpperCase()}
                  </span>
                </span>
              );
            }
            return <strong {...props}>{children}</strong>;
          },
          a({ href, children, ...props }) {
            return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
