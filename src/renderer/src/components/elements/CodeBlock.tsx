import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
}

export default function CodeBlock({ code, language, label }: CodeBlockProps) {
  return (
    <div className="my-2">
      {label && (
        <div className="text-board-text-muted mb-1 text-[0.7rem] font-semibold uppercase tracking-wide">
          {label}
        </div>
      )}
      <pre className="bg-board-bg border-board-border overflow-x-auto rounded-md border p-3">
        <code className="text-board-text text-[0.78rem] leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}
