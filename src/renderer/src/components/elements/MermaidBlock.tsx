import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Deferred mermaid loading — the library is ~8.5MB of JS across 15+ diagram
// engines. We only pay that cost when a mermaid code block is actually rendered.
let mermaidInstance: typeof import('mermaid')['default'] | null = null;

async function getMermaid() {
  if (!mermaidInstance) {
    const m = await import('mermaid');
    mermaidInstance = m.default;
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background:          '#13131a',
        mainBkg:             '#2a2a35',
        nodeBorder:          '#4e4e62',
        clusterBkg:          '#13131a',
        clusterBorder:       '#3a3a4a',
        primaryColor:        '#2a2a35',
        primaryTextColor:    '#e2e2f0',
        primaryBorderColor:  '#4e4e62',
        lineColor:           '#9898b0',
        secondaryColor:      '#2a2a35',
        tertiaryColor:       '#2a2a35',
        edgeLabelBackground: '#13131a',
        titleColor:          '#e2e2f0',
        nodeTextColor:       '#e2e2f0',
        fillType0: '#2a2a35',
        fillType1: '#2a2a35',
        fillType2: '#2a2a35',
        fillType3: '#2a2a35',
        fillType4: '#2a2a35',
        fillType5: '#2a2a35',
        fillType6: '#2a2a35',
        fillType7: '#2a2a35',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize:   '14px',
      },
    });
  }
  return mermaidInstance;
}

/** Strip fixed dimensions so the SVG scales to fill the lightbox container. */
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
        className="h-[90vh] w-[90vw] overflow-auto rounded-lg border border-board-border p-6"
        style={{ background: '#13131a' }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        <div
          className="mermaid-diagram"
          style={{ minWidth: zoomPercent, minHeight: zoomPercent }}
          dangerouslySetInnerHTML={{ __html: lightboxSvg }}
        />
      </div>
    </div>,
    document.body,
  );
}

export default function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const closeLightbox = useCallback(() => setFullscreen(false), []);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    getMermaid()
      .then((m) => m.render(id, code))
      .then((result) => { if (!cancelled) setSvg(result.svg); })
      .catch((err) => { if (!cancelled) setError(String(err)); });
    return () => { cancelled = true; };
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
        className="group relative my-2 cursor-zoom-in overflow-x-auto rounded-md border border-board-border p-4"
        style={{ background: '#13131a' }}
        onClick={() => setFullscreen(true)}
      >
        <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />
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
