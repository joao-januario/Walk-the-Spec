import React from 'react';
import DecisionSection from '../elements/DecisionSection.js';
import type { Element, DecisionContent } from '../../types/index.js';

export default function ResearchView({ elements }: { elements: Element[] }) {
  const decisions = elements.filter((e) => e.type === 'decision');

  return (
    <div>
      {decisions.map((e) => <DecisionSection key={e.id} content={e.content as DecisionContent} />)}
    </div>
  );
}
