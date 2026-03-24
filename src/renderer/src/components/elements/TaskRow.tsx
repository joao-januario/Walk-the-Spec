import React from 'react';
import { theme } from '../../theme.js';
import type { TaskContent } from '../../types/index.js';

interface TaskRowProps {
  content: TaskContent;
  onToggle?: (taskId: string, checked: boolean) => void;
}

export default function TaskRow({ content, onToggle }: TaskRowProps) {
  const handleChange = () => {
    if (onToggle) onToggle(content.id, !content.checked);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: `1px solid ${theme.border}20` }}>
      <input
        type="checkbox"
        checked={content.checked}
        onChange={handleChange}
        style={{ accentColor: theme.accent, cursor: onToggle ? 'pointer' : 'default' }}
        readOnly={!onToggle}
      />
      <code style={{ fontSize: '0.65rem', fontWeight: 600, color: theme.textMuted, backgroundColor: `${theme.border}40`, padding: '1px 4px', borderRadius: '3px' }}>
        {content.id}
      </code>
      {content.parallel && (
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: theme.purple, backgroundColor: `${theme.purple}20`, padding: '0px 4px', borderRadius: '3px' }}>P</span>
      )}
      {content.userStory && (
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: theme.accent, backgroundColor: `${theme.accent}20`, padding: '0px 4px', borderRadius: '3px' }}>{content.userStory}</span>
      )}
      <span style={{ fontSize: '0.82rem', color: content.checked ? theme.textMuted : theme.text, textDecoration: content.checked ? 'line-through' : 'none' }}>
        {content.description}
      </span>
    </div>
  );
}
