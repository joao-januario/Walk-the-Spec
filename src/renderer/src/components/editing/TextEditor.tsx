import React, { useState } from 'react';

interface TextEditorProps {
  value: string;
  onSave: (newValue: string) => void;
}

export default function TextEditor({ value, onSave }: TextEditorProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  const save = () => {
    onSave(text);
    setEditing(false);
  };
  const cancel = () => {
    setText(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="border-board-border cursor-pointer border-b border-dashed pb-px"
        title="Click to edit"
      >
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-[5px]">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        className="border-board-accent bg-board-bg text-board-text rounded border px-[6px] py-[2px] font-[inherit] text-[inherit] focus-visible:outline-none"
      />
      <button onClick={save} className="text-board-green cursor-pointer border-none bg-transparent text-[0.75rem]">
        ✓
      </button>
      <button onClick={cancel} className="text-board-red cursor-pointer border-none bg-transparent text-[0.75rem]">
        ✗
      </button>
    </span>
  );
}
