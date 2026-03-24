import React from 'react';

interface EmptyStateProps {
  branchName?: string;
  message?: string;
}

export default function EmptyState({ branchName, message }: EmptyStateProps) {
  return (
    <div className="text-board-text-muted flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mb-3 text-2xl opacity-40">📂</div>
        <div className="text-sm">
          {message ?? (
            <>
              No speckit content on <code className="text-board-text">{branchName ?? 'this branch'}</code>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
