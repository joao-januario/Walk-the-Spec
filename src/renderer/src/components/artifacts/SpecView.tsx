import React, { useState } from 'react';
import { theme } from '../../theme.js';
import UserStoryCard from '../elements/UserStoryCard.js';
import RequirementRow from '../elements/RequirementRow.js';
import CommentBadge from '../elements/CommentBadge.js';
import CommentPanel from '../comments/CommentPanel.js';
import type { Element, UserStoryContent, RequirementContent, SuccessCriterionContent, Comment } from '../../types/index.js';

interface SpecViewProps {
  elements: Element[];
  comments: Comment[];
  onAddComment: (elementId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export default function SpecView({ elements, comments, onAddComment, onUpdateComment, onDeleteComment }: SpecViewProps) {
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);

  const stories = elements.filter((e) => e.type === 'user-story');
  const requirements = elements.filter((e) => e.type === 'requirement');
  const criteria = elements.filter((e) => e.type === 'success-criterion');

  const getCommentsFor = (elementId: string) => comments.filter((c) => c.elementId === elementId);

  return (
    <div>
      {stories.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '0.85rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 600 }}>User Stories</h3>
          {stories.map((e) => (
            <div key={e.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1 }}><UserStoryCard content={e.content as UserStoryContent} /></div>
                <div style={{ paddingTop: '16px' }}>
                  <CommentBadge count={e.commentCount} onClick={() => setOpenCommentId(openCommentId === e.id ? null : e.id)} />
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
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '0.85rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 600 }}>Functional Requirements</h3>
          {requirements.map((e) => (
            <div key={e.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                <div style={{ flex: 1 }}><RequirementRow content={e.content as RequirementContent} commentCount={e.commentCount} /></div>
                <div style={{ paddingTop: '7px' }}>
                  <CommentBadge count={e.commentCount} onClick={() => setOpenCommentId(openCommentId === e.id ? null : e.id)} />
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
          <h3 style={{ fontSize: '0.85rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 600 }}>Success Criteria</h3>
          {criteria.map((e) => {
            const sc = e.content as SuccessCriterionContent;
            return (
              <div key={e.id} style={{ display: 'flex', gap: '10px', padding: '7px 0', borderBottom: `1px solid ${theme.border}30` }}>
                <code style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.green, backgroundColor: `${theme.green}15`, padding: '2px 6px', borderRadius: '4px' }}>{sc.id}</code>
                <span style={{ fontSize: '0.82rem', color: theme.text }}>{sc.text}</span>
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
          <section style={{ marginTop: '28px', opacity: 0.7 }}>
            <h3 style={{ fontSize: '0.85rem', color: theme.yellow, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 600 }}>
              Stale Comments (element removed)
            </h3>
            {Array.from(grouped.entries()).map(([elementId, cmts]) => (
              <div key={elementId} style={{ marginBottom: '12px', padding: '10px', backgroundColor: `${theme.yellow}08`, borderRadius: '6px', border: `1px solid ${theme.yellow}20` }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.yellow, marginBottom: '6px' }}>
                  {elementId} <span style={{ fontWeight: 400, color: theme.textMuted }}>(no longer in artifact)</span>
                </div>
                {cmts.map((c) => (
                  <div key={c.id} style={{ fontSize: '0.78rem', color: theme.textMuted, marginBottom: '2px', paddingLeft: '10px' }}>
                    [{c.createdAt}] {c.content}
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
