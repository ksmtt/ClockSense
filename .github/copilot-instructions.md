# Copilot Instructions for Clockify Contract Hours Tracker

## Project Context

This is a React TypeScript application for tracking contract hours using the Clockify API. The application focuses on time analysis, contract management, and data visualization.

## Core Guidelines

**Always follow the comprehensive design guidelines in `src/guidelines/Guidelines.md`** which includes:

- React Architecture Patterns
- Design Token Usage (from `src/tokens.json`)
- Component Guidelines
- Typography Implementation Priority
- Charts and Data Visualization standards
- File Organization Standards

## Development Workflow

**For every prompt involving design/styling:**

1. **Reference `src/tokens.json`** - Check what tokens already exist
2. **Use existing tokens** - Don't create new colors if suitable ones exist
3. **Map semantically** - Add CSS variables in `globals.css` if needed
4. **Implement with variables** - Use `hsl(var(--token-name))` in components
5. **Document token usage** - Show which tokens from `src/tokens.json` were used

**Example Response Pattern:**

```
Found these relevant tokens in src/tokens.json:
- basic-color-palette.green (#4caf50) for success states
- primary-color-palette.primary (#03a9f4) for primary actions

Using existing CSS variables:
- hsl(var(--success)) - mapped from tokens.json green
- hsl(var(--primary)) - mapped from tokens.json primary
```

## Key Development Principles

### 1. Three-Layer Design System

- **NEVER hardcode** colors, fonts, spacing, or visual values
- **Layer 1**: Design tokens in `src/tokens.json` (source of truth)
- **Layer 2**: Semantic CSS variables in `globals.css` (theme-aware mapping)
- **Layer 3**: Component implementation (use CSS variables)
- **Use CSS variables for:**
  - **Theme-dependent values**: Colors, chart colors (`--chart-1` through `--chart-8`)
  - **Semantic colors**: `--success`, `--warning`, `--error`, `--info`
  - **Global design tokens**: Component radii (`--radius`), shadows
  - **Brand colors**: Primary, secondary, accent colors
- **Use Tailwind classes for:** Static spacing (`p-4`), typography (`text-lg`), layout utilities

### 2. Code Quality Standards

- Follow React best practices with proper hooks and memoization
- Use TypeScript strictly with proper type definitions
- Implement proper error handling and loading states
- Maintain responsive design with 8px grid system

### 3. Component Architecture

- Use ShadCN UI components from `src/components/ui/`
- Create dashboard widgets in `src/components/dashboard/widgets/`
- Follow naming conventions: `[Name]Widget`, `use[Domain][Purpose]`
- Implement proper prop interfaces for all components

### 4. Data Management

- Use custom hooks: `useClockifyData`, `useClockifyApi`, `useNotifications`
- Implement proper loading states and error handling
- Cache data efficiently and handle offline scenarios

## File Modification Guidelines

- **DO NOT MODIFY**: `src/components/ui/` (ShadCN components)
- **DO NOT MODIFY**: `src/components/figma/` (Figma imports)
- **FOLLOW STRUCTURE**: Maintain organized file structure as documented

## When Making Changes

1. **Check `src/tokens.json` FIRST** for existing design tokens before implementing
2. **Quote available tokens** from tokens.json that apply to the request
3. **Map to CSS variables** in `globals.css` if new semantic meaning is needed
4. **Use CSS variables** in component implementation (never hardcode)
5. **Reference design patterns** from `src/guidelines/Guidelines.md`
6. Ensure responsive design and accessibility
7. Test loading states and error scenarios
8. Maintain consistent naming conventions

## Review & Validation Protocol

**Include a review section for significant changes only:**

### When to Include Review:

- ✅ **Multiple file modifications** (2+ files changed)
- ✅ **New components or widgets** created
- ✅ **Design system changes** (tokens, CSS variables, guidelines)
- ✅ **Major feature implementation** (new hooks, services, complex logic)
- ❌ **Simple edits** (typo fixes, small text changes, minor styling tweaks)
- ❌ **Single line changes** or basic updates

### Review Format:

```markdown
## 🔍 Review & Validation

- ✅ **Tokens**: Used existing tokens from tokens.json: [list which ones]
- ✅ **Architecture**: Followed three-layer design system (tokens → CSS vars → components)
- ✅ **Consistency**: Matches established patterns in guidelines.md
- ✅ **Responsive**: Implements 8px grid system and responsive breakpoints
- ✅ **Accessibility**: Proper semantic HTML and ARIA patterns
- ⚠️ **Consider**: [any concerns, alternatives, or potential improvements]
- 📋 **Manual Testing**: [what user should verify in browser]
```

---

_For detailed implementation patterns, always refer to `src/guidelines/Guidelines.md`_
