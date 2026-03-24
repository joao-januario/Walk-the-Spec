import React from 'react';
import { theme, getPhaseColors } from '../../theme.js';
import type { Project } from '../../types/index.js';

interface FeatureCardProps {
  project: Project;
  selected: boolean;
  onClick: () => void;
}

export default function FeatureCard({ project, selected, onClick }: FeatureCardProps) {
  const hasError = !!project.error;
  const p = hasError ? { bg: `${theme.red}20`, text: theme.red, dot: theme.red, label: 'Error' } : getPhaseColors(project.phase);

  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 14px',
        cursor: 'pointer',
        borderRadius: '8px',
        backgroundColor: selected ? theme.surfaceHover : 'transparent',
        borderLeft: selected ? `3px solid ${p.dot}` : '3px solid transparent',
        marginBottom: '2px',
        transition: 'all 0.12s',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.backgroundColor = theme.surfaceHover; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.backgroundColor = selected ? theme.surfaceHover : 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.dot, flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selected ? theme.textBright : theme.text }}>
          {project.name}
        </span>
      </div>
      <div style={{ marginLeft: '16px', marginTop: '2px' }}>
        {hasError ? (
          <span style={{ fontSize: '0.65rem', color: theme.red }}>{project.error}</span>
        ) : (
          <>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: p.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {p.label}
            </span>
            {project.hasSpeckitContent && (
              <span style={{ fontSize: '0.65rem', color: theme.textMuted, marginLeft: '6px' }}>
                {project.currentBranch}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
