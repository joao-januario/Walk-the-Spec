import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';
import UserStoryCard from '../elements/UserStoryCard.js';
import RequirementRow from '../elements/RequirementRow.js';
import CommentBadge from '../elements/CommentBadge.js';
import CommentPanel from '../comments/CommentPanel.js';
import CodeTag from '../ui/CodeTag.js';
import SectionLabel from '../ui/SectionLabel.js';
import MarkdownContent from '../ui/MarkdownContent.js';
import type {
  Element,
  UserStoryContent,
  RequirementContent,
  SuccessCriterionContent,
  Comment,
} from '../../types/index.js';

interface SpecViewProps {
  elements: Element[];
  comments: Comment[];
  onAddComment: (elementId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export default function SpecView({
  elements,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: SpecViewProps) {
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);

  const stories = elements.filter((e) => e.type === 'user-story');
  const requirements = elements.filter((e) => e.type === 'requirement');
  const criteria = elements.filter((e) => e.type === 'success-criterion');

  const getCommentsFor = (elementId: string) => comments.filter((c) => c.elementId === elementId);

  return (
    <div>
      {stories.length > 0 && (
        <section className="mb-7">
          <SectionLabel>User Stories</SectionLabel>
          {stories.map((e) => (
            <div key={e.id}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <UserStoryCard content={e.content as UserStoryContent} />
                </div>
                <div className="pt-4">
                  <CommentBadge
                    count={e.commentCount}
                    onClick={() => setOpenCommentId(openCommentId === e.id ? null : e.id)}
                  />
                </div>
              </div>
              {openCommentId === e.id && (
                <CommentPanel
                  elementId={e.id}
                  comments={getCommentsFor(e.id)}
                  onAdd={(content) => onAddComment(e.id, content)}
                  onUpdate={onUpdateComment}
                  onDelete={onDeleteComment}
                  onClose={() => setOpenCommentId(null)}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {requirements.length > 0 && (
        <section className="mb-7">
          <SectionLabel>Functional Requirements</SectionLabel>
          {requirements.map((e, index) => (
            <div key={e.id}>
              {index > 0 && index % 5 === 0 && (
                <div className="border-board-border/15 my-2 border-t" />
              )}
              <div className="flex items-start gap-1">
                <div className="flex-1">
                  <RequirementRow content={e.content as RequirementContent} commentCount={e.commentCount} />
                </div>
                <div className="pt-[7px]">
                  <CommentBadge
                    count={e.commentCount}
                    onClick={() => setOpenCommentId(openCommentId === e.id ? null : e.id)}
                  />
                </div>
              </div>
              {openCommentId === e.id && (
                <CommentPanel
                  elementId={e.id}
                  comments={getCommentsFor(e.id)}
                  onAdd={(content) => onAddComment(e.id, content)}
                  onUpdate={onUpdateComment}
                  onDelete={onDeleteComment}
                  onClose={() => setOpenCommentId(null)}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {criteria.length > 0 && (
        <section>
          <SectionLabel>Success Criteria</SectionLabel>
          {criteria.map((e, index) => {
            const sc = e.content as SuccessCriterionContent;
            return (
              <div key={e.id}>
                {index > 0 && index % 5 === 0 && (
                  <div className="border-board-border/15 my-2 border-t" />
                )}
                <div className="border-board-border/20 flex items-start gap-[10px] border-b py-[10px]">
                  <CodeTag color="green">{sc.id}</CodeTag>
                  <MarkdownContent inline content={sc.text} className="text-board-text flex-1 text-[0.9375rem] leading-relaxed" />
                </div>
              </div>
            );
          })}
        </section>
      )}
      {/* Stale comments — referencing elements no longer in the artifact */}
      {(() => {
        const elementIds = new Set(elements.map((e) => e.id));
        const stale = comments.filter((c) => !elementIds.has(c.elementId));
        if (stale.length === 0) return null;

        const grouped = new Map<string, typeof stale>();
        for (const c of stale) {
          if (!grouped.has(c.elementId)) grouped.set(c.elementId, []);
          grouped.get(c.elementId)!.push(c);
        }

        return (
          <section className="mt-7 opacity-70">
            <SectionLabel color="text-board-yellow">Stale Comments (element removed)</SectionLabel>
            {Array.from(grouped.entries()).map(([elementId, cmts]) => (
              <div
                key={elementId}
                className="bg-board-yellow/[0.03] border-board-yellow/20 mb-3 rounded-[6px] border p-[10px]"
              >
                <div className="text-board-yellow mb-[6px] text-[0.8125rem] font-semibold">
                  {elementId} <span className="text-board-text-muted font-normal">(no longer in artifact)</span>
                </div>
                {cmts.map((c) => (
                  <div key={c.id} className="text-board-text-muted mb-[2px] pl-[10px] text-[0.875rem]">
                    [{c.createdAt}] <MarkdownContent inline content={c.content} />
                  </div>
                ))}
              </div>
            ))}
          </section>
        );
      })()}
    </div>
  );
}
