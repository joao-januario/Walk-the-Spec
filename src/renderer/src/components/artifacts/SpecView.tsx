import React from 'react';
import UserStoryCard from '../elements/UserStoryCard.js';
import RequirementRow from '../elements/RequirementRow.js';
import CodeTag from '../ui/CodeTag.js';
import CollapsibleSection from '../ui/CollapsibleSection.js';
import MarkdownContent from '../ui/MarkdownContent.js';
import type {
  Element,
  UserStoryContent,
  RequirementContent,
  SuccessCriterionContent,
} from '../../types/index.js';

interface SpecViewProps {
  elements: Element[];
  commentEnabled: boolean;
  getComment: (heading: string) => string;
  onCommentChange: (heading: string, text: string) => void;
}

export default function SpecView({
  elements,
  commentEnabled,
  getComment,
  onCommentChange,
}: SpecViewProps) {
  const stories = elements.filter((e) => e.type === 'user-story');
  const requirements = elements.filter((e) => e.type === 'requirement');
  const criteria = elements.filter((e) => e.type === 'success-criterion');

  let num = 0;

  return (
    <div className="space-y-7">
      {stories.length > 0 && (
        <CollapsibleSection
          id="spec-stories"
          heading="User Stories"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('User Stories')}
          onCommentChange={(text) => onCommentChange('User Stories', text)}
        >
          {stories.map((e) => (
            <div key={e.id}>
              <UserStoryCard content={e.content as UserStoryContent} />
            </div>
          ))}
        </CollapsibleSection>
      )}

      {requirements.length > 0 && (
        <CollapsibleSection
          id="spec-requirements"
          heading="Functional Requirements"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('Functional Requirements')}
          onCommentChange={(text) => onCommentChange('Functional Requirements', text)}
        >
          {requirements.map((e, index) => (
            <div key={e.id}>
              {index > 0 && index % 5 === 0 && (
                <div className="border-board-border/15 my-2 border-t" />
              )}
              <RequirementRow content={e.content as RequirementContent} />
            </div>
          ))}
        </CollapsibleSection>
      )}

      {criteria.length > 0 && (
        <CollapsibleSection
          id="spec-criteria"
          heading="Success Criteria"
          level="section"
          number={++num}
          commentEnabled={commentEnabled}
          commentText={getComment('Success Criteria')}
          onCommentChange={(text) => onCommentChange('Success Criteria', text)}
        >
          {criteria.map((e, index) => {
            const sc = e.content as SuccessCriterionContent;
            return (
              <div key={e.id}>
                {index > 0 && index % 5 === 0 && (
                  <div className="border-board-border/15 my-2 border-t" />
                )}
                <div className="border-board-border/20 flex items-start gap-[10px] border-b py-[10px]">
                  <CodeTag color="green">{sc.id}</CodeTag>
                  <MarkdownContent inline content={sc.text} className="text-board-text flex-1 text-[1.0625rem] leading-relaxed" />
                </div>
              </div>
            );
          })}
        </CollapsibleSection>
      )}
    </div>
  );
}
