import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils.js';
import { getInlineCodeColor } from '../../lib/inline-code-color.js';
import CodeBlock from '../elements/CodeBlock.js';

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

function renderInlineText(text: string): React.ReactNode[] {
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
      nodes.push(
        <code key={match.index} className={cn('rounded bg-board-surface-elevated px-1.5 py-0.5 text-[0.85em] font-mono', colorClass)}>
          {isHex && <span className="mr-1 inline-block h-[0.7em] w-[0.7em] rounded-sm border border-white/20" style={{ backgroundColor: code }} />}
          {code}
        </code>,
      );
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

// ── Component ──

interface MarkdownContentProps {
  content: string;
  inline?: boolean;
  className?: string;
}

export default function MarkdownContent({ content, inline, className }: MarkdownContentProps) {
  if (!content) return <span className={className} />;

  if (inline) {
    return <span className={className}>{renderInlineText(content)}</span>;
  }

  return (
    <div
      className={cn(
        'prose prose-invert max-w-none text-[0.9375rem] leading-relaxed',
        'prose-headings:text-board-text-bright',
        'prose-a:text-board-accent',
        'prose-strong:text-board-text-bright prose-strong:font-semibold',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-board-bg prose-pre:border prose-pre:border-board-border',
        'prose-blockquote:border-board-border prose-blockquote:text-board-text-muted',
        'prose-li:marker:text-board-text-muted',
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
            return (
              <code className={cn('rounded bg-board-surface-elevated px-1.5 py-0.5 text-[0.85em] font-mono', colorClass, codeClassName)} {...props}>
                {isHex && <span className="mr-1 inline-block h-[0.7em] w-[0.7em] rounded-sm border border-white/20" style={{ backgroundColor: text }} />}
                {children}
              </code>
            );
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
