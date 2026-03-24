import React, { useState } from 'react';
import type { Comment } from '../../types/index.js';

interface CommentThreadProps {
  comments: Comment[];
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
}

export default function CommentThread({ comments, onUpdate, onDelete }: CommentThreadProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.content);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };
  const saveEdit = (id: string) => {
    onUpdate(id, editText);
    setEditingId(null);
  };

  return (
    <div>
      {comments.map((c) => (
        <div key={c.id} className="bg-board-surface border-board-border/25 mb-2 rounded-[6px] border p-[10px]">
          {editingId === c.id ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="border-board-accent bg-board-bg text-board-text box-border min-h-[40px] w-full resize-y rounded border p-[6px] font-[inherit] text-[0.82rem] focus-visible:outline-none"
              />
              <div className="mt-1 flex gap-[6px]">
                <button
                  onClick={() => saveEdit(c.id)}
                  className="text-board-green cursor-pointer border-none bg-transparent text-[0.7rem]"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-board-text-muted cursor-pointer border-none bg-transparent text-[0.7rem]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-board-text m-0 mb-[6px] text-[0.82rem]">{c.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-board-text-muted text-[0.68rem]">{c.createdAt}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="text-board-text-muted cursor-pointer border-none bg-transparent text-[0.68rem]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-board-red cursor-pointer border-none bg-transparent text-[0.68rem]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
