import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
    fontSize: '16px',
  },
});

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
}

/** Strip fixed dimensions and max-width so the SVG scales to fill the lightbox container.
 *  viewBox is preserved — the browser uses it with the default preserveAspectRatio
 *  (xMidYMid meet) to center and fit the diagram. */
function prepareLightboxSvg(raw: string): string {
  return raw
    .replace(/(<svg[^>]*)\s+style="[^"]*"/g, '$1')
    .replace(/(<svg[^>]*)\s+width="[^"]*"/g, '$1 width="100%"')
    .replace(/(<svg[^>]*)\s+height="[^"]*"/g, '$1 height="100%"');
}

function DiagramLightbox({ svg, onClose }: { svg: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(5, Math.max(0.5, z + delta)));
  }, []);

  const lightboxSvg = prepareLightboxSvg(svg);
  const zoomPercent = `${zoom * 100}%`;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-board-bg/95 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <div
        className="h-[90vh] w-[90vw] overflow-auto rounded-lg border border-board-border bg-board-surface p-6"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        <div
          style={{ minWidth: zoomPercent, minHeight: zoomPercent }}
          dangerouslySetInnerHTML={{ __html: lightboxSvg }}
        />
      </div>
    </div>,
    document.body,
  );
}

function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const closeLightbox = useCallback(() => setFullscreen(false), []);

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
    <>
      <div
        className="group relative my-2 cursor-zoom-in overflow-x-auto rounded-md border border-board-border bg-board-bg p-4"
        onClick={() => setFullscreen(true)}
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-board-surface-elevated/90 px-3 py-1 text-xs text-board-text-muted">
            Click to expand
          </span>
        </div>
      </div>
      {fullscreen && <DiagramLightbox svg={svg} onClose={closeLightbox} />}
    </>
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
