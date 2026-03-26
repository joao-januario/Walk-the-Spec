import React from 'react';
import CollapsibleSection from '../ui/CollapsibleSection.js';
import MarkdownContent from '../ui/MarkdownContent.js';
import type { Element, SectionContent } from '../../types/index.js';

const FENCE_OPEN = /^```/;
const H3_LINE = /^### /;
const H3_PREFIX = /^###\s+/;
const H4_LINE = /^#### /;
const H4_PREFIX = /^####\s+/;

interface SubSection {
  heading: string;
  content: string;
}

/**
 * Split a markdown string at a heading level, respecting fenced code blocks.
 * Returns a preamble (content before the first heading) and an array of subsections.
 */
function splitAtHeadingLevel(
  markdown: string,
  linePattern: RegExp,
  prefixPattern: RegExp,
): { preamble: string; subs: SubSection[] } {
  const lines = markdown.split('\n');
  const subs: SubSection[] = [];
  let preambleLines: string[] = [];
  let currentHeading: string | null = null;
  let currentLines: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (FENCE_OPEN.test(line)) inFence = !inFence;

    if (!inFence && linePattern.test(line)) {
      if (currentHeading !== null) {
        subs.push({ heading: currentHeading, content: currentLines.join('\n').trim() });
      }
      currentHeading = line.replace(prefixPattern, '');
      currentLines = [];
    } else if (currentHeading !== null) {
      currentLines.push(line);
    } else {
      preambleLines.push(line);
    }
  }

  if (currentHeading !== null) {
    subs.push({ heading: currentHeading, content: currentLines.join('\n').trim() });
  }

  return { preamble: preambleLines.join('\n').trim(), subs };
}

/** Render markdown content, splitting any H4 headings into explainer callouts */
function SubSectionContent({ content, parentId }: { content: string; parentId: string }) {
  const { preamble, subs: explainers } = splitAtHeadingLevel(content, H4_LINE, H4_PREFIX);

  return (
    <>
      {preamble && <MarkdownContent content={preamble} />}
      {explainers.map((ex) => (
        <CollapsibleSection
          key={`${parentId}:::${ex.heading}`}
          id={`${parentId}:::${ex.heading}`}
          heading={ex.heading}
          level="explainer"
        >
          <MarkdownContent content={ex.content} />
        </CollapsibleSection>
      ))}
    </>
  );
}

interface SummaryViewProps {
  elements: Element[];
  commentEnabled: boolean;
  getComment: (heading: string) => string;
  onCommentChange: (heading: string, text: string) => void;
}

export default function SummaryView({ elements, commentEnabled, getComment, onCommentChange }: SummaryViewProps) {
  const sections = elements.filter((e) => e.type === 'section');

  if (sections.length === 0) {
    return (
      <div className="text-board-text-muted py-8 text-center text-[0.9375rem]">
        Summary has no content yet.
      </div>
    );
  }

  return (
    <article className="space-y-5">
      {sections.map((el, idx) => {
        const section = el.content as SectionContent;
        const { preamble, subs } = splitAtHeadingLevel(section.content, H3_LINE, H3_PREFIX);

        return (
          <CollapsibleSection
            key={el.id}
            id={el.id}
            heading={section.heading}
            level="section"
            number={idx + 1}
            commentEnabled={subs.length === 0 ? commentEnabled : false}
            commentText={subs.length === 0 ? getComment(section.heading) : undefined}
            onCommentChange={subs.length === 0 ? (text) => onCommentChange(section.heading, text) : undefined}
          >
            {preamble && subs.length === 0 && (
              <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-3">
                <SubSectionContent content={preamble} parentId={el.id} />
              </div>
            )}

            {preamble && subs.length > 0 && (
              <div className="bg-board-surface rounded-lg border border-board-border/50 px-4 py-3 mb-4">
                <SubSectionContent content={preamble} parentId={el.id} />
              </div>
            )}

            {subs.length > 0 && (
              <div className="space-y-3">
                {subs.map((sub) => {
                  const subId = `${el.id}::${sub.heading}`;
                  return (
                    <CollapsibleSection
                      key={subId}
                      id={subId}
                      heading={sub.heading}
                      level="subsection"
                      commentEnabled={commentEnabled}
                      commentText={getComment(sub.heading)}
                      onCommentChange={(text) => onCommentChange(sub.heading, text)}
                    >
                      <SubSectionContent content={sub.content} parentId={subId} />
                    </CollapsibleSection>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>
        );
      })}
    </article>
  );
}
