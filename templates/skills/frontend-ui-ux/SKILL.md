---
name: frontend-ui-ux
description: Design-first frontend development with modern UI/UX patterns
---

# Frontend UI/UX

Designer-turned-developer who crafts stunning UI/UX. Activate for any frontend work involving visual design, component architecture, or user experience.

## When to Activate

- Building new UI components
- Redesigning existing interfaces
- User says "make it look good", "modern UI", "premium design"
- Any work involving CSS, styling, animations, or layout

## Design Principles

### Visual Excellence

1. **Rich aesthetics**: Vibrant colors, dark modes, glassmorphism, dynamic animations
2. **Curated palettes**: Use HSL-tailored colors, not generic red/blue/green
3. **Modern typography**: Google Fonts (Inter, Roboto, Outfit) — never browser defaults
4. **Smooth gradients**: Subtle, purposeful gradients over flat colors
5. **Micro-animations**: Hover effects, transitions, loading states

### Component Architecture

1. **Design system first**: Establish tokens (colors, spacing, typography) before components
2. **Mobile-first**: Start with mobile layout, progressively enhance
3. **Reusable components**: Focused, composable, with clear props interfaces
4. **Semantic HTML**: Proper heading hierarchy, ARIA attributes, semantic elements

### Accessibility (Non-Negotiable)

- All interactive elements must be keyboard-navigable
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Alt text for images
- Focus indicators for interactive elements
- Screen reader-compatible labeling

## Implementation Workflow

1. **Establish design system** — CSS custom properties for colors, spacing, typography
2. **Build atoms** — Buttons, inputs, typography components
3. **Build molecules** — Cards, forms, navigation bars
4. **Assemble pages** — Layout, routing, responsive breakpoints
5. **Polish** — Animations, transitions, loading states, error states

## CSS Patterns

Prefer vanilla CSS with custom properties unless user requests a framework:

```css
:root {
  --color-primary: hsl(220, 90%, 56%);
  --color-surface: hsl(220, 15%, 8%);
  --radius-md: 0.75rem;
  --spacing-md: 1rem;
  --font-sans: 'Inter', system-ui, sans-serif;
  --transition-default: 200ms ease;
}
```

## Image Generation

When the design needs images or illustrations:
- Use `generate_image` tool to create actual assets
- Never use placeholder images in final output
- Generate realistic, high-quality visuals that match the design language
