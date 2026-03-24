/**
 * Gallery page to preview all mockups.
 * Navigate to /mockups in the dev server to view.
 *
 * The "Full App Layout" mockup takes over the whole screen (fixed position).
 * Click the × in the corner or press Escape to return to gallery.
 */
import React, { useState, useEffect } from 'react';
import BoardMockup from './board-mockup.js';
import SpecifyPhaseMockup from './specify-phase-mockup.js';
import PlanPhaseMockup from './plan-phase-mockup.js';
import ImplementPhaseMockup from './implement-phase-mockup.js';
import CommentsMockup from './comments-mockup.js';
import EditingMockup from './editing-mockup.js';

const MOCKUPS = [
  { name: 'Full App Layout', component: BoardMockup, fullscreen: true },
  { name: 'Specify Phase', component: SpecifyPhaseMockup },
  { name: 'Plan Phase', component: PlanPhaseMockup },
  { name: 'Implement Phase', component: ImplementPhaseMockup },
  { name: 'Comments', component: CommentsMockup },
  { name: 'Editing Controls', component: EditingMockup },
];

export default function MockupGallery() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (active !== null) {
    const m = MOCKUPS[active];
    const ActiveComponent = m.component;

    if (m.fullscreen) {
      return (
        <div>
          <ActiveComponent />
          <button
            onClick={() => setActive(null)}
            style={{
              position: 'fixed', top: '8px', right: '8px', zIndex: 200,
              width: '28px', height: '28px', borderRadius: '50%',
              border: '1px solid #565870', backgroundColor: '#222436', color: '#7982a9',
              cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Back to gallery (Esc)"
          >×</button>
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: '#1a1b26', minHeight: '100vh', color: '#c0caf5', padding: '24px' }}>
        <button
          onClick={() => setActive(null)}
          style={{ color: '#7aa2f7', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', marginBottom: '16px' }}
        >← Back to gallery</button>
        <ActiveComponent />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1a1b26', minHeight: '100vh', color: '#c0caf5', padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem', color: '#e0e6ff' }}>Mockup Gallery</h2>
      <p style={{ color: '#7982a9', fontSize: '0.85rem', marginBottom: '32px' }}>Click a mockup to preview. Press Esc to return.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {MOCKUPS.map((m, i) => (
          <div
            key={m.name}
            onClick={() => setActive(i)}
            style={{
              padding: '20px', borderRadius: '10px', cursor: 'pointer',
              backgroundColor: '#222436', border: '1px solid #363850',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7aa2f7'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#363850'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e0e6ff' }}>{m.name}</div>
            {m.fullscreen && <div style={{ fontSize: '0.7rem', color: '#7982a9', marginTop: '4px' }}>Full screen layout</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
