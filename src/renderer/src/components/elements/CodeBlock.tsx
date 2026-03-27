import React, { Suspense, useMemo } from 'react';
import hljs from 'highlight.js';

const LazyMermaidBlock = React.lazy(() => import('./MermaidBlock.js'));

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
}

function MermaidFallback() {
  return (
    <div className="my-2 flex items-center justify-center rounded-md border border-board-border bg-board-bg p-8">
      <span className="text-board-text-muted text-sm">Loading diagram...</span>
    </div>
  );
}

export default function CodeBlock({ code, language, label }: CodeBlockProps) {
  const isMermaid = language === 'mermaid';

  const highlighted = useMemo(() => {
    if (isMermaid) return null;
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language });
      }
      return hljs.highlightAuto(code);
    } catch {
      return null;
    }
  }, [code, language, isMermaid]);

  return (
    <div className="my-2">
      {label && (
        <div className="text-board-text-muted mb-1 text-[0.875rem] font-semibold uppercase tracking-wide">
          {label}
        </div>
      )}
      {isMermaid ? (
        <Suspense fallback={<MermaidFallback />}>
          <LazyMermaidBlock code={code} />
        </Suspense>
      ) : (
        <pre className="bg-board-bg border-board-border overflow-x-auto rounded-md border p-3 font-mono">
          {highlighted ? (
            <code
              className="hljs font-mono text-[0.875rem] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlighted.value }}
            />
          ) : (
            <code className="text-board-text font-mono text-[0.875rem] leading-relaxed">
              {code}
            </code>
          )}
        </pre>
      )}
    </div>
  );
}
