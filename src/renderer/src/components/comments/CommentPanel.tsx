import React, { useState } from 'react';
import { theme } from '../../theme.js';
import CommentThread from './CommentThread.js';
import type { Comment } from '../../types/index.js';

interface CommentPanelProps {
  elementId: string;
  comments: Comment[];
  onAdd: (content: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onClose: () => void;
}

export default function CommentPanel({ elementId, comments, onAdd, onUpdate, onDelete, onClose }: CommentPanelProps) {
  const [newText, setNewText] = useState('');

  const handleSubmit = () => {
    if (!newText.trim()) return;
    onAdd(newText.trim());
    setNewText('');
  };

  return (
    <div style={{
      backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}`,
      borderRadius: '8px', padding: '14px', marginTop: '8px', maxWidth: '550px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: theme.textBright }}>
          Comments on <code style={{ fontSize: '0.75rem', color: theme.accent }}>{elementId}</code>
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '1rem' }}>×</button>
      </div>

      <CommentThread comments={comments} onUpdate={onUpdate} onDelete={onDelete} />

      <textarea
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
        placeholder="Add a comment..."
        onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
        style={{
          width: '100%', padding: '8px', border: `1px solid ${theme.border}`, borderRadius: '6px',
          fontSize: '0.82rem', resize: 'vertical', minHeight: '50px', fontFamily: 'inherit',
          backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box', outline: 'none',
          marginTop: '6px',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
        <span style={{ fontSize: '0.65rem', color: theme.textMuted }}>Ctrl+Enter to submit</span>
        <button onClick={handleSubmit} style={{
          padding: '5px 12px', border: 'none', borderRadius: '6px',
          backgroundColor: theme.accent, color: '#1a1b26', cursor: 'pointer',
          fontSize: '0.78rem', fontWeight: 600,
        }}>Add Comment</button>
      </div>
    </div>
  );
}
