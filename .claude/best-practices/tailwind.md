# Tailwind CSS Best Practices

Rules for Tailwind v4 usage, class ordering, theme configuration, and component patterns.
Applies to: `src/renderer/**/*.tsx`, `src/renderer/**/*.ts`, `src/renderer/src/index.css`

---

## TW01 — Class Ordering (Outside-In)

**Severity**: MEDIUM
**Rule**: MUST order utility classes: position/display → flex/grid children → spacing → sizing → typography → colors → borders → effects → transitions → interactivity.

**Detect**: Use `prettier-plugin-tailwindcss` for automatic enforcement. Flag files not covered by Prettier.

---

## TW02 — Prettier Plugin for Auto-Sorting

**Severity**: HIGH
**Rule**: MUST install and configure `prettier-plugin-tailwindcss` for automatic class sorting.

**Detect**: Check `.prettierrc` or `prettier.config.js` for the plugin. Flag if missing.

---

## TW03 — No Arbitrary Values When Utility Exists

**Severity**: HIGH
**Rule**: MUST NOT use arbitrary values (`[#hex]`, `[14px]`) when a built-in utility or `@theme` token covers the same value.

**Detect**: Flag `[#` hex arbitrary values in class strings. Flag pixel values like `[16px]` that map to spacing scale (4 = 16px).

```tsx
// WRONG
<div className="p-[16px] text-[#c0caf5]" />

// CORRECT
<div className="p-4 text-primary" />
```

---

## TW04 — No Mixed Inline Styles + Tailwind

**Severity**: HIGH
**Rule**: MUST NOT mix `style={{}}` with Tailwind `className` on the same element, except for truly dynamic computed values (progress bar %, CSS custom properties).

**Detect**: Flag elements that have both `style={{` and `className=` where the style contains static values.

```tsx
// WRONG
<div className="flex rounded-lg" style={{ padding: '10px', backgroundColor: '#222436' }} />

// CORRECT
<div className="flex rounded-lg p-2.5 bg-surface" />

// ACCEPTABLE — dynamic value
<div className="h-full rounded-sm bg-accent" style={{ width: `${pct}%` }} />
```

---

## TW05 — No Redundant or Conflicting Classes

**Severity**: HIGH
**Rule**: MUST NOT have two utilities targeting the same CSS property on the same element.

**Detect**: Flag duplicate property utilities (e.g., `p-4 p-6`, `text-sm text-lg`, `m-4 mt-4`).

---

## TW06 — No Dynamic Class Construction

**Severity**: CRITICAL
**Rule**: MUST NOT construct class names with string interpolation. Tailwind scans source files for complete class strings at build time.

**Detect**: Flag template literals in className that interpolate variables into class name fragments (e.g., `` `bg-${color}-500` ``).

```tsx
// WRONG
<div className={`bg-${color}-500`} />

// CORRECT — complete literals in a map
const colors = { error: 'bg-red-500', success: 'bg-green-500' } as const;
<div className={colors[status]} />
```

---

## TW07 — Define Tokens in @theme

**Severity**: HIGH
**Rule**: All design system tokens (colors, fonts, radii, spacing overrides) MUST be defined in the `@theme` block in the CSS entry point. Not scattered as arbitrary values.

**Detect**: Check `index.css` for `@theme` block. Flag custom hex values used in more than 2 components that aren't in `@theme`.

---

## TW08 — Semantic Color Names

**Severity**: MEDIUM
**Rule**: SHOULD use semantic color names (`text-primary`, `bg-surface`, `border-error`) not raw palette names.

**Detect**: Flag raw color names like `text-blue-400`, `bg-slate-800` when semantic alternatives exist in `@theme`.

---

## TW09 — Arbitrary Values Only for One-Offs

**Severity**: MEDIUM
**Rule**: SHOULD use arbitrary values only for one-off, truly unique measurements. If used more than twice, promote to `@theme`.

**Detect**: Flag the same arbitrary value appearing in 3+ files.

---

## TW10 — Components Over @apply

**Severity**: MEDIUM
**Rule**: SHOULD extract repeated class groups into React components, not `@apply` CSS rules.

**Detect**: Flag `@apply` in CSS files (except `@layer base` global styles). Suggest component extraction instead.

---

## TW11 — Use cn() Utility

**Severity**: MEDIUM
**Rule**: SHOULD use a `cn()` utility (clsx + tailwind-merge) for conditional and composable classes.

**Detect**: Flag components that use ternary expressions in className without `cn()` where class conflicts could occur.

---

## TW12 — No @apply for Component Styling

**Severity**: HIGH
**Rule**: MUST NOT use `@apply` to create component-level CSS classes. `@apply` is only acceptable for global base styles (`@layer base`) or third-party element overrides.

**Detect**: Flag `@apply` outside of `@layer base` blocks.

---

## TW13 — Variant Maps for Multi-State

**Severity**: MEDIUM
**Rule**: SHOULD use lookup objects/maps for components with multiple visual variants rather than long ternary chains.

**Detect**: Flag className with 3+ nested ternaries. Suggest variant map.

---

## TW14 — sr-only for Icon-Only Elements

**Severity**: HIGH
**Rule**: MUST use `sr-only` class for visually hidden but screen-reader-accessible text on any interactive element that relies on icons alone.

**Detect**: Flag `<button>` elements containing only an icon/emoji with no `sr-only` span or `aria-label`.

---

## TW15 — focus-visible Over focus

**Severity**: HIGH
**Rule**: MUST use `focus-visible:` instead of `focus:` for keyboard focus indicators.

**Detect**: Flag `focus:ring`, `focus:outline` without corresponding `focus-visible:` variant.

---

## TW16 — ARIA with State Variants

**Severity**: MEDIUM
**Rule**: MUST pair ARIA attributes with Tailwind state variants for dynamic UI (e.g., `aria-expanded:`, `disabled:`).

**Detect**: Flag interactive elements with JS-toggled visibility that don't use ARIA attributes.

---

## TW17 — Minimum Touch Targets

**Severity**: MEDIUM
**Rule**: SHOULD ensure interactive elements have at least 44x44px touch targets (`min-w-11 min-h-11`).

**Detect**: Flag small buttons/links without `min-w-` or `min-h-` constraints.

---

## TW18 — No dark: in Dark-Only App

**Severity**: HIGH
**Rule**: MUST NOT use `dark:` variant prefix in this project. Spec Board is exclusively dark-themed — the dark palette IS the base.

**Detect**: Flag any `dark:` class usage.

---

## TW19 — Opacity Modifiers Over Extra Tokens

**Severity**: MEDIUM
**Rule**: SHOULD use Tailwind's opacity syntax (`bg-accent/20`) rather than defining separate tokens for every opacity variant.

**Detect**: Flag `@theme` tokens that are just opacity variants of existing tokens (e.g., `--color-accent-bg: #7aa2f720`).

---

## TW20 — Base Dark Styles on html/body

**Severity**: MEDIUM
**Rule**: SHOULD set base styles (background, text color, font, antialiasing) on `html` or `body` in `@layer base`.

**Detect**: Check CSS entry for `@layer base` with `html` or `body` styles. Flag if missing.

---

## TW21 — No Old @tailwind Directives

**Severity**: CRITICAL
**Rule**: MUST NOT use `@tailwind base`, `@tailwind components`, `@tailwind utilities` in Tailwind v4. Use `@import "tailwindcss"`.

**Detect**: Flag any `@tailwind` directive in CSS files.

---

## TW22 — Single CSS Entry Point

**Severity**: HIGH
**Rule**: MUST import Tailwind CSS from a single entry point file, imported once in the renderer entry.

**Detect**: Flag multiple files importing `tailwindcss` or the CSS entry file.

---

## TW23 — JS Hover Handlers Replaced

**Severity**: HIGH
**Rule**: MUST NOT use `onMouseEnter`/`onMouseLeave` JS event handlers for styling hover effects. Use Tailwind `hover:` variant instead.

**Detect**: Flag `onMouseEnter` and `onMouseLeave` props that modify `style` or `className` for hover effects.

```tsx
// WRONG
<div
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2c42'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
/>

// CORRECT
<div className="bg-transparent hover:bg-surface-hover" />
```
