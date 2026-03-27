# Styling Best Practices

Universal styling principles. `/spec.constitution` replaces this with project-specific guidelines.

## Principles

- **Consistency over novelty**: Use a design system or token set. Do not invent colors, spacing, or typography values ad hoc — derive them from a defined palette.
- **Readability first**: Body text must be high-contrast and legible for extended sessions. Never dim text for aesthetic reasons at the cost of readability.
- **Utility-first**: Prefer composable utility classes or tokens over one-off custom styles. Reduce the surface area of custom CSS.
- **Responsive by default**: Layouts should adapt to different viewport sizes. Test at multiple breakpoints before merging.
- **Accessibility**: Color choices must meet WCAG contrast ratios. Interactive elements must be keyboard-navigable and have visible focus indicators.

## Review Checklist

- [ ] Colors and spacing use design tokens, not arbitrary values
- [ ] Text contrast meets accessibility standards
- [ ] Layout works at common viewport sizes
- [ ] Interactive elements are keyboard-accessible
