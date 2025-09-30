# Clockify Contract Hours Tracker – Design Guidelines

> **Design Tokens Reference**: All design decisions must reference the values defined in `/tokens.json`. Never hardcode fonts, colors, spacing, or other visual values.

---

## Core Design Principles

### 1. Consistency with Clockify

- Use the official blue-gray color palette (`global/blue-gray-color-palette`).
- Minimalist and professional styling.
- Keep focus on time tracking and contract analysis.

### 2. Data-Driven Design

- Prioritize clarity in data visualization.
- Use consistent color coding from tokens.
- Represent time in human-readable formats (e.g., "2h 30m" not "2.5h").

### 3. Responsive Layout

- **8px grid system**: All spacing must align to this system using Tailwind classes
- **Dashboard flexibility**: Widgets adapt from 4-column desktop to 1-column mobile layout
- **Chart responsiveness**: Ensure data visualization remains readable on all screen sizes

---

## React Architecture Patterns

### Custom Hooks Organization

- **Data hooks**: `useClockifyData`, `useClockifyApi` (API integration and state management)
- **UI hooks**: `useTheme`, `useNotifications` (UI behavior and user interactions)
- **Naming convention**: `use[Domain][Purpose]` (e.g., `useClockifyData`, `useNotifications`)

### State Management Patterns

```tsx
// ✅ Memoize expensive computations to prevent infinite re-renders
const effectiveTimeEntries = useMemo(() => {
  return settings.breakTimeSettings.showAdjustedTime ? adjustedTimeEntries : timeEntries;
}, [settings.breakTimeSettings.showAdjustedTime, adjustedTimeEntries, timeEntries]);

// ✅ Destructure hook returns for clarity
const { contracts, currentContract, updateContract } = useClockifyData();
```

### Dashboard Widget Development

```tsx
// ✅ Widget component pattern
interface [Name]WidgetProps {
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: Settings;
  // Widget-specific props
}

export function [Name]Widget({ currentContract, timeEntries, settings }: [Name]WidgetProps) {
  // Widget logic with proper data handling
}
```

### Error Handling Standards

- **API errors**: Display user-friendly messages with retry actions using Alert components
- **Graceful degradation**: Maintain core functionality when external APIs fail
- **Loading states**: Show appropriate status indicators using Badge and Loader2 components

---

## Design Token Usage

### Development Workflow: Tokens-First Approach

**When answering prompts or implementing features:**

1. **ALWAYS check `src/tokens.json` FIRST** for available design tokens
2. **Use existing tokens** if they match the design need
3. **Map tokens to CSS variables** in `globals.css` if semantic mapping is needed
4. **Implement using CSS variables** in components
5. **Only add new tokens** if no suitable token exists in `tokens.json`

### Three-Layer Design System Architecture

```
tokens.json (Design Decisions - CHECK FIRST)
    ↓
globals.css (Semantic Mapping - UPDATE IF NEEDED)
    ↓
Components (Implementation - USE CSS VARIABLES)
```

### Prompt Response Protocol

**Before implementing any design-related feature:**

1. **Reference `tokens.json`**: Check what colors, typography, spacing already exist
2. **Quote available tokens**: Show which tokens from `tokens.json` apply
3. **Map to CSS variables**: If new semantic meaning needed, add to `globals.css`
4. **Implement with variables**: Use `hsl(var(--token-name))` in components

**Example workflow:**

```
User asks for "error state styling" →
1. Check tokens.json: Found "basic-color-palette.red"
2. Check globals.css: Found "--error: #f44336" (already mapped)
3. Implement: background-color: hsl(var(--error))
```

### File Modification Decision Tree

**When do I modify which files?**

#### Modify `tokens.json` when:

- ❌ **RARELY** - Only when adding completely new base colors/typography
- ✅ New brand colors, new font families, new spacing scales
- ✅ Design system updates from design team/Figma

#### Modify `globals.css` when:

- ✅ **FREQUENTLY** - Adding semantic mappings from existing tokens
- ✅ Creating theme-aware color variations (light/dark mode)
- ✅ Adding component-specific semantic tokens
- ✅ Mapping `tokens.json` values to usable CSS variables

#### Modify component files when:

- ✅ **ALWAYS** - Implementing actual features and UI
- ✅ Using existing CSS variables for styling
- ✅ Never hardcoding colors/fonts/spacing

**Examples:**

```
Need success color → Check tokens.json → Use existing green → Map to --success in globals.css
Need chart colors → Check tokens.json → Use basic-color-palette → Already mapped to --chart-1 etc.
Need new feature → Check tokens.json → Use CSS variables → Implement in component
```

### Implementation Decision Guide

**After checking `tokens.json`, choose the right implementation method:**

**Use CSS variables for:**

- **Theme-dependent values**: Colors that change between light/dark modes
- **Chart colors**: `--chart-1` through `--chart-8` (with light/dark variations)
- **Semantic colors**: `--success`, `--warning`, `--error`, `--info`
- **Component tokens**: `--radius`, `--primary`, `--background`, etc.
- **Interactive states**: Hover, focus, active state colors

**Use direct token access for:**

- **Static design decisions**: Font families, fixed spacing values
- **Build-time constants**: Breakpoint values, animation durations
- **Design tool integration**: When generating CSS from Figma tokens
- **Documentation**: Showing available token values in comments

### Color Implementation Layers

#### Layer 1: Design Tokens (`tokens.json`)

Raw color definitions from your design system:

```js
tokens.global["basic-color-palette"]["green"].value; // #4caf50
tokens.global["primary-color-palette"]["primary"].value; // #03a9f4
```

#### Layer 2: Semantic CSS Variables (`globals.css`)

Theme-aware semantic tokens mapped from design tokens:

```css
/* Semantic colors - automatically adapt to light/dark */
--success: #4caf50; /* Green from tokens.json */
--warning: #ff9800; /* Orange from tokens.json */
--error: #f44336; /* Red from tokens.json */
--info: #03a9f4; /* Light Blue from tokens.json */

/* Chart colors - consistent data visualization */
--chart-1: #03a9f4; /* Maps to tokens.json light-blue */
--chart-2: #4caf50; /* Maps to tokens.json green */
```

#### Layer 3: Component Implementation

Use semantic CSS variables in components:

```css
/* ✅ Preferred - Semantic and theme-aware */
background-color: hsl(var(--success));
color: hsl(var(--chart-1));
border-color: hsl(var(--primary));
```

### Alert Colors by Mode

Alert colors use specific palettes for optimal contrast:

```js
// Light mode alerts - from tokens.json
tokens.global["alert-color-palette-light-mode"]["success-alert-bg"].value;

// Dark mode alerts - from tokens.json
tokens.global["alert-color-palette-dark-mode"]["success-alert-bg"].value;
```

### Typography

- Font family: `tokens.global.fontfamilies.roboto.value` (Roboto).
- Use text styles under `text-styles`:
  - `hero-title` (24px, normal weight, 34px line-height)
  - `heading-2` (18px, medium weight, 27px line-height)
  - `body-text` (14px, normal weight, 21px line-height)
  - `label-text` (14px, normal weight, 16px line-height)
  - `button-text` (14px, normal weight, 16px line-height, uppercase)
  - `caption-text` (12px, normal weight, 18px line-height)

**Individual font tokens available:**

- Font sizes: `tokens.global.fontsize[key].value` (hero, heading, body, label, button, caption)
- Font weights: `tokens.global.fontweights[key].value` (normal: 400, medium: 500)
- Line heights: `tokens.global.lineheights[key].value`

### Typography Implementation Priority

1. **HTML semantic elements** automatically receive token-based typography (h1, h2, p, etc.)
2. **Custom utility classes** for specific use cases (`text-caption`)
3. **Override with Tailwind** only when component defaults conflict
4. **Never use** hardcoded font sizes, weights, or line-heights

**Override examples for component defaults:**

```tsx
// Override ShadCN button defaults that conflict with design system
<Button className="normal-case font-normal">No Uppercase</Button>

// Override typography when semantic HTML doesn't match visual hierarchy
<h2 className="text-base font-normal">Custom sized heading</h2>

// Use custom utilities for specific design patterns
<p className="text-caption text-muted-foreground">Helper text</p>

// Maintain semantic HTML while overriding visual styling
<h1 className="text-lg">Smaller hero title</h1>
```

**Component library considerations:**

- ShadCN components may have their own typography defaults
- Always explicitly override conflicting styles with token-based classes
- Preserve semantic HTML structure while adjusting visual presentation

### Spacing and Layout

- **8px grid system**: `p-4` (16px), `gap-6` (24px), `m-3` (12px) - align all elements to this system
- **Responsive breakpoints**: `sm:` (640px+), `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)
- **Dashboard grid**: Use `GridDashboard` component with configurable cell sizes (default 80px)

---

## Extending the Design System

### Adding New Semantic Tokens

When you need new semantic colors or tokens:

1. **Add to `tokens.json`** (if it's a new base color):

   ```json
   "new-color-palette": {
     "tertiary": {
       "value": "#9c27b0",
       "type": "color"
     }
   }
   ```

2. **Map to CSS variables in `globals.css`**:

   ```css
   :root {
     --tertiary: #9c27b0; /* From tokens.json */
     --tertiary-foreground: #ffffff;
   }

   .dark {
     --tertiary: #ba68c8; /* Lighter for dark mode */
     --tertiary-foreground: #000000;
   }
   ```

3. **Use in components**:
   ```css
   background-color: hsl(var(--tertiary));
   color: hsl(var(--tertiary-foreground));
   ```

### Chart Color Extension

To add more chart colors beyond `--chart-8`:

```css
--chart-9: #e91e63; /* Pink from tokens.json */
--chart-10: #795548; /* Brown from tokens.json */
```

### Component-Specific Token Patterns

For specialized components, create scoped semantic tokens:

```css
/* Dashboard-specific tokens */
--dashboard-grid-bg: hsl(var(--muted) / 0.1);
--dashboard-widget-border: hsl(var(--border));

/* Timeline-specific tokens */
--timeline-line: hsl(var(--muted-foreground));
--timeline-marker: hsl(var(--primary));
```

---

## Component Guidelines

### Buttons

- Variants: Primary, Secondary, Tertiary (derived from color tokens).
- Limit one primary button per section.
- Sizes should align with 8px base spacing.

### Cards

- **Use CSS variables for theme-dependent styling:**
  ```css
  background-color: hsl(var(--card));
  border-color: hsl(var(--border));
  border-radius: calc(var(--radius) - 2px);
  ```
- **Use Tailwind for static layout:** `p-6` (24px padding), `space-y-4`
- **Consistent visual hierarchy:** Card shadows and borders adapt to light/dark themes

### Alerts

- **Use CSS variables for theme-appropriate colors:**
  ```css
  background-color: hsl(var(--destructive) / 0.1);
  color: hsl(var(--destructive-foreground));
  border-color: hsl(var(--destructive));
  ```
- **Include dismiss functionality** with proper focus management
- **Non-disruptive placement** using toast notifications or inline alerts

---

## Charts and Data Visualization

- **Use CSS chart color variables**: `--chart-1` through `--chart-8` (available in both light and dark modes)
- **Chart color variations available**:
  - Primary: `--chart-1`, `--chart-2`, etc.
  - Light variations: `--chart-1-light`, `--chart-2-light`, etc.
  - Dark variations: `--chart-1-dark`, `--chart-2-dark`, etc.
- Maintain consistent color mapping across related charts.
- Chart types:
  - Line → trends over time
  - Bar → period comparisons
  - Donut/Pie → distribution analysis
  - Progress → completion status

---

## Accessibility

### Screen Reader Support

- Semantic HTML elements only.
- Provide ARIA attributes.
- Charts must include alt text or summaries.

### Keyboard Navigation

- All interactive elements must be focusable.
- Logical tab order.
- Clear focus indicators.

### Color and Contrast

- Maintain WCAG AA compliance.
- Do not rely on color alone for meaning.

---

## Performance and Optimization

### Data Loading

- Use efficient fetching with pagination.
- Cache frequently accessed data.
- Optimize chart rendering.

### Component Optimization

- Use `React.memo` for pure components.
- Memoize expensive calculations.
- Proper dependency arrays in hooks.

### Error Handling

- Show user-friendly error messages.
- Provide retry mechanisms.
- Keep core functionality available even if API fails.

### Loading States

- **API operations**: Use `Loader2` icon with `animate-spin` for active sync states
- **Component loading**: Use Badge components with status indicators (`<Loader2 className="w-3 h-3 animate-spin" />`)
- **Data placeholders**: Use skeleton screens for chart and widget loading states
- **Handle offline**: Maintain core functionality with cached data when API fails

---

## File Organization Standards

### Project Structure

```
/components
  /dashboard          - Dashboard layout and grid system components
    /widgets         - Individual dashboard widgets (QuickStatsWidget, etc.)
  /ui                - ShadCN components (do not modify)
  /figma             - Figma imports (do not modify)
/hooks               - Custom React hooks for data and UI behavior
/services            - External API integration (clockifyApi.ts)
/constants           - Static configuration (chartColors.ts)
/guidelines          - Design system documentation
```

### Naming Conventions

- **Widgets**: Suffix with `Widget` (e.g., `QuickStatsWidget`, `ContractProgressWidget`)
- **Hooks**: Prefix with `use` + domain + purpose (e.g., `useClockifyData`, `useNotifications`)
- **Services**: Descriptive names with domain (e.g., `clockifyApi`, `dataExport`)
- **Types**: PascalCase interfaces (e.g., `TimeEntry`, `Contract`, `DashboardLayout`)
- **Components**: PascalCase, descriptive names (e.g., `WidgetConfigurationPanel`)

---

# End of Guidelines
