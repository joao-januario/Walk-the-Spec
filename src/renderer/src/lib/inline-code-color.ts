// Detect inline code category for semantic color-coding.
// Shared by MarkdownContent's block mode (react-markdown) and inline mode (regex rendering).

export function getInlineCodeColor(text: string): string {
  // File paths: contain / or \ with file-like structure
  if (/[/\\]/.test(text) && /\.[a-z]{1,4}$|\/$/i.test(text)) return 'text-board-green';
  // CSS custom properties: --var-name
  if (/^--[a-z]/.test(text)) return 'text-board-cyan';
  // Tailwind utilities: bg-*, text-*, border-*, prose-*, shadow-*
  if (/^(bg|text|border|prose|shadow|hover|focus)-/.test(text)) return 'text-board-cyan';
  // CLI commands: npm, git, npx, etc.
  if (/^(npm|git|npx|pnpm|yarn|curl)\s/.test(text)) return 'text-board-orange';
  // Slash commands: /speckit.plan, /speckit.review
  if (/^\/[a-z]/.test(text)) return 'text-board-orange';
  // React components: PascalCase or <Component>
  if (/^<[A-Z]/.test(text) || /^[A-Z][a-z]+[A-Z]/.test(text)) return 'text-board-purple';
  // Function calls: name()
  if (/\(.*\)$/.test(text)) return 'text-board-purple';
  // Hex colors: show with a small swatch
  if (/^#[0-9a-fA-F]{3,8}$/.test(text)) return 'text-board-yellow';
  // Default
  return 'text-board-cyan';
}
