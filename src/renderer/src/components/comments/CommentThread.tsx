import React, { useState } from 'react';
import { theme } from '../../theme.js';
import type { Comment } from '../../types/index.js';

interface CommentThreadProps {
  comments: Comment[];
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
}

export default function CommentThread({ comments, onUpdate, onDelete }: CommentThreadProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startEdit = (c: Comment) => { setEditingId(c.id); setEditText(c.content); };
  const cancelEdit = () => { setEditingId(null); setEditText(''); };
  const saveEdit = (id: string) => { onUpdate(id, editText); setEditingId(null); };

  return (
    <div>
      {comments.map((c) => (
        <div key={c.id} style={{ marginBottom: '8px', padding: '10px', backgroundColor: theme.surface, borderRadius: '6px', border: `1px solid ${theme.border}40` }}>
          {editingId === c.id ? (
            <div>
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} style={{
                width: '100%', padding: '6px', border: `1px solid ${theme.accent}`, borderRadius: '4px',
                fontSize: '0.82rem', backgroundColor: theme.bg, color: theme.text, fontFamily: 'inherit',
                resize: 'vertical', minHeight: '40px', boxSizing: 'border-box', outline: 'none',
              }} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button onClick={() => saveEdit(c.id)} style={{ fontSize: '0.7rem', color: theme.green, background: 'none', border: 'none', cursor: 'pointer' }}>Save</button>
                <button onClick={cancelEdit} style={{ fontSize: '0.7rem', color: theme.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 6px', fontSize: '0.82rem', color: theme.text }}>{c.content}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: theme.textMuted }}>{c.createdAt}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(c)} style={{ fontSize: '0.68rem', color: theme.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => onDelete(c.id)} style={{ fontSize: '0.68rem', color: theme.red, background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
