import React, { useState } from 'react';
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
    <div className="bg-board-surface-alt border-board-border mt-2 max-w-[550px] rounded-lg border p-[14px]">
      <div className="mb-[10px] flex items-center justify-between">
        <span className="text-board-text-bright text-[0.82rem] font-semibold">
          Comments on <code className="text-board-accent text-[0.75rem]">{elementId}</code>
        </span>
        <button onClick={onClose} className="text-board-text-muted cursor-pointer border-none bg-transparent text-base">
          ×
        </button>
      </div>

      <CommentThread comments={comments} onUpdate={onUpdate} onDelete={onDelete} />

      <textarea
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
        placeholder="Add a comment..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
        }}
        className="border-board-border bg-board-bg text-board-text mt-[6px] box-border min-h-[50px] w-full resize-y rounded-[6px] border p-2 font-[inherit] text-[0.82rem] focus-visible:outline-none"
      />
      <div className="mt-[6px] flex items-center justify-between">
        <span className="text-board-text-muted text-[0.65rem]">Ctrl+Enter to submit</span>
        <button
          onClick={handleSubmit}
          className="bg-board-accent cursor-pointer rounded-[6px] border-none px-3 py-[5px] text-[0.78rem] font-semibold text-board-bg"
        >
          Add Comment
        </button>
      </div>
    </div>
  );
}
