import React, { useMemo, useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#1a191b',
    primaryColor: '#70b8ff',
    primaryTextColor: '#eeeef0',
    primaryBorderColor: '#49474e',
    lineColor: '#625f69',
    secondaryColor: '#baa7ff',
    tertiaryColor: '#2b292d',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
}

function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    mermaid.render(id, code)
      .then((result) => setSvg(result.svg))
      .catch((err) => setError(String(err)));
  }, [code]);

  if (error) {
    return (
      <pre className="bg-board-bg border-board-border overflow-x-auto rounded-md border p-3">
        <code className="text-board-red text-[0.875rem]">{error}</code>
      </pre>
    );
  }

  return (
    <div
      className="my-2 overflow-x-auto rounded-md border border-board-border bg-board-bg p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
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
        <MermaidDiagram code={code} />
      ) : (
        <pre className="bg-board-bg border-board-border overflow-x-auto rounded-md border p-3">
          {highlighted ? (
            <code
              className="hljs text-[0.875rem] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlighted.value }}
            />
          ) : (
            <code className="text-board-text text-[0.875rem] leading-relaxed">
              {code}
            </code>
          )}
        </pre>
      )}
    </div>
  );
}
