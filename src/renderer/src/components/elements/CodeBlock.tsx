import React, { Suspense, useMemo } from 'react';
import hljs from 'highlight.js/lib/core';

// Register only languages commonly seen in spec artifacts.
// This cuts ~150KB vs importing all 200+ grammars.
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import graphql from 'highlight.js/lib/languages/graphql';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('go', go);
hljs.registerLanguage('graphql', graphql);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

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
