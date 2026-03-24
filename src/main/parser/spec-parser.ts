import type { Root, Heading, List, ListItem, Paragraph, Strong, Text } from 'mdast';
import { visit } from 'unist-util-visit';
import { parseMarkdown } from './markdown-parser.js';

export interface GWTScenario {
  given: string;
  when: string;
  then: string;
}

export interface UserStory {
  number: number;
  title: string;
  priority: string;
  description: string;
  whyPriority: string;
  independentTest: string;
  acceptanceScenarios: GWTScenario[];
}

export interface Requirement {
  id: string;
  text: string;
}

export interface SuccessCriterion {
  id: string;
  text: string;
}

export interface Entity {
  name: string;
  description: string;
}

export interface SpecParseResult {
  userStories: UserStory[];
  requirements: Requirement[];
  successCriteria: SuccessCriterion[];
  edgeCases: string[];
  entities: Entity[];
}

export function parseSpec(content: string): SpecParseResult {
  const tree = parseMarkdown(content);
  return {
    userStories: extractUserStories(tree),
    requirements: extractBoldIdItems(tree, 'Functional Requirements', /^FR-\d+$/),
    successCriteria: extractBoldIdItems(tree, 'Measurable Outcomes', /^SC-\d+$/),
    edgeCases: extractEdgeCases(tree),
    entities: extractEntities(tree),
  };
}

function getTextContent(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'strong') return `**${node.children.map(getTextContent).join('')}**`;
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}

function extractUserStories(tree: Root): UserStory[] {
  const stories: UserStory[] = [];
  const headings: { node: Heading; index: number }[] = [];

  tree.children.forEach((node, index) => {
    if (node.type === 'heading' && node.depth === 3) {
      const text = getTextContent(node);
      const match = text.match(/User Story (\d+)\s*-\s*(.+?)\s*\(Priority:\s*(P\d+)\)/);
      if (match) {
        headings.push({ node, index });
      }
    }
  });

  for (const { node, index } of headings) {
    const text = getTextContent(node);
    const match = text.match(/User Story (\d+)\s*-\s*(.+?)\s*\(Priority:\s*(P\d+)\)/)!;
    const number = parseInt(match[1], 10);
    const title = match[2].trim();
    const priority = match[3];

    // Collect content until next h3 or thematic break
    let description = '';
    let whyPriority = '';
    let independentTest = '';
    const scenarios: GWTScenario[] = [];

    for (let i = index + 1; i < tree.children.length; i++) {
      const child = tree.children[i];
      if (child.type === 'heading' && child.depth <= 3) break;
      if (child.type === 'thematicBreak') break;

      if (child.type === 'paragraph') {
        const pText = getTextContent(child);
        if (pText.startsWith('**Why this priority**:')) {
          whyPriority = pText.replace(/^\*\*Why this priority\*\*:\s*/, '');
        } else if (pText.startsWith('**Independent Test**:')) {
          independentTest = pText.replace(/^\*\*Independent Test\*\*:\s*/, '');
        } else if (!description && !pText.startsWith('**')) {
          description = pText;
        }
      }

      if (child.type === 'list') {
        for (const item of (child as List).children) {
          const itemText = getTextContent(item);
          const gwtMatch = itemText.match(/\*\*Given\*\*\s+(.+?),\s*\*\*When\*\*\s+(.+?),\s*\*\*Then\*\*\s+(.+)/);
          if (gwtMatch) {
            scenarios.push({
              given: gwtMatch[1].trim(),
              when: gwtMatch[2].trim(),
              then: gwtMatch[3].trim(),
            });
          }
        }
      }
    }

    stories.push({
      number,
      title,
      priority,
      description,
      whyPriority,
      independentTest,
      acceptanceScenarios: scenarios,
    });
  }

  return stories;
}

function extractBoldIdItems(tree: Root, sectionName: string, idPattern: RegExp): { id: string; text: string }[] {
  const items: { id: string; text: string }[] = [];

  // Find the heading for this section
  let inSection = false;
  for (const child of tree.children) {
    if (child.type === 'heading') {
      const headingText = getTextContent(child);
      if (headingText.includes(sectionName)) {
        inSection = true;
        continue;
      }
      if (inSection && child.depth <= 3) {
        inSection = false;
      }
    }

    if (inSection && child.type === 'list') {
      for (const item of (child as List).children) {
        const itemText = getTextContent(item);
        // Pattern: **FR-001**: text
        const match = itemText.match(/\*\*([A-Z]+-\d+)\*\*:\s*(.+)/);
        if (match && idPattern.test(match[1])) {
          items.push({ id: match[1], text: match[2].trim() });
        }
      }
    }
  }

  return items;
}

function extractEdgeCases(tree: Root): string[] {
  const cases: string[] = [];
  let inEdgeCases = false;

  for (const child of tree.children) {
    if (child.type === 'heading') {
      const text = getTextContent(child);
      if (text.includes('Edge Cases')) {
        inEdgeCases = true;
        continue;
      }
      if (inEdgeCases && child.depth <= 3) {
        inEdgeCases = false;
      }
    }

    if (inEdgeCases && child.type === 'list') {
      for (const item of (child as List).children) {
        cases.push(getTextContent(item).trim());
      }
    }
  }

  return cases;
}

function extractEntities(tree: Root): Entity[] {
  const entities: Entity[] = [];
  let inEntities = false;

  for (const child of tree.children) {
    if (child.type === 'heading') {
      const text = getTextContent(child);
      if (text.includes('Key Entities')) {
        inEntities = true;
        continue;
      }
      if (inEntities && child.depth <= 3) {
        inEntities = false;
      }
    }

    if (inEntities && child.type === 'list') {
      for (const item of (child as List).children) {
        const text = getTextContent(item);
        const match = text.match(/\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
          entities.push({ name: match[1], description: match[2].trim() });
        }
      }
    }
  }

  return entities;
}
