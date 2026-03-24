import React, { useState } from 'react';
import { theme } from '../../theme.js';

interface TextEditorProps {
  value: string;
  onSave: (newValue: string) => void;
}

export default function TextEditor({ value, onSave }: TextEditorProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  const save = () => { onSave(text); setEditing(false); };
  const cancel = () => { setText(value); setEditing(false); };

  if (!editing) {
    return (
      <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', borderBottom: `1px dashed ${theme.border}`, paddingBottom: '1px' }} title="Click to edit">
        {value}
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
        style={{ padding: '2px 6px', border: `1px solid ${theme.accent}`, borderRadius: '4px', fontSize: 'inherit', fontFamily: 'inherit', outline: 'none', backgroundColor: theme.bg, color: theme.text }}
      />
      <button onClick={save} style={{ fontSize: '0.75rem', color: theme.green, background: 'none', border: 'none', cursor: 'pointer' }}>✓</button>
      <button onClick={cancel} style={{ fontSize: '0.75rem', color: theme.red, background: 'none', border: 'none', cursor: 'pointer' }}>✗</button>
    </span>
  );
}
