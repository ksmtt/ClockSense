# Clockify Contract Hours Tracker – Design Guidelines

> **Design Tokens Reference**: All design decisions use the build-time token processing system. Check `src/tokens.json` → Style Dictionary automatically generates CSS variables → Use `hsl(var(--variable-name))` in components.

---

## Core Design Principles

### 1. Consistency with Clockify

- Use the official blue-gray color palette from tokens.
- Minimalist and professional styling.
- Keep focus on time tracking and contract analysis.

### 2. Data-Driven Design

- Prioritize clarity in data visualization.
- Use consistent color coding from generated tokens.
- Represent time in human-readable formats (e.g., "2h 30m" not "2.5h").

### 3. Responsive Layout

- **8px grid system**: All spacing must align to this system using Tailwind classes
- **Dashboard flexibility**: Widgets adapt from 4-column desktop to 1-column mobile layout
- **Chart responsiveness**: Ensure data visualization remains readable on all screen sizes

---

## Build-Time Token Processing System

### How It Works

Our design system uses **Style Dictionary** to automatically convert JSON tokens to CSS variables:

```
src/tokens.json → build-tokens.mjs → src/styles/tokens.css
```

1. **Edit tokens**: Modify `src/tokens.json`
2. **Auto-rebuild**: File watching automatically regenerates CSS variables
3. **Use variables**: Reference generated variables in components

### Development Workflow

**Start development with automatic token rebuilding:**

```bash
npm run dev              # Runs token build + file watching + Vite dev server
npm run tokens:build     # Manual one-time token build
```

**Available CSS Variables** (auto-generated from tokens.json):

```css
/* Basic Colors */
--color-red: #f44336;
--color-green: #4caf50;
--color-light-blue: #03a9f4;
--color-orange: #ff9800;

/* Background Palette */
--bg-01: #f2f6f8; /* Lightest */
--bg-12: #12191d; /* Darkest */

/* Semantic Status Colors */
--status-success: #4caf50;
--status-error: #f44336;
--status-warning: #ff9800;
--status-info: #03a9f4;

/* Typography */
--font-size-hero: 24;
--font-weight-medium: 500;
--line-height-body: 21;

/* Alert Colors (Light & Dark Mode) */
--alert-light-success-alert-bg: #dbefdc;
--alert-dark-success-alert-bg: #18381a;
```

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

### Development Workflow: Build-Time Tokens

**When implementing any feature with styling:**

1. **Check `src/tokens.json`** for available tokens
2. **Use existing CSS variables** generated from tokens
3. **Add semantic mappings** in `globals.css` if needed
4. **Implement with CSS variables** in components
5. **Add new tokens to `tokens.json`** only if absolutely necessary

### Three-Layer Design System Architecture

```
src/tokens.json (Source of Truth)
    ↓ Style Dictionary Build
src/styles/tokens.css (Auto-generated CSS Variables)
    ↓ Semantic Mapping
src/styles/globals.css (Theme Integration)
    ↓ Implementation
Components (Use CSS Variables)
```

### Implementation Workflow

**Before implementing any design-related feature:**

1. **Check `src/tokens.json`**: See what tokens exist
2. **Check `src/styles/tokens.css`**: See generated CSS variables
3. **Check `src/styles/globals.css`**: See semantic mappings
4. **Implement**: Use `hsl(var(--variable-name))` in components

**Example workflow:**

```
User asks for "error state styling" →
1. Check tokens.json: Found "basic-color-palette.red": "#f44336"
2. Check tokens.css: Found "--color-red: #f44336" (auto-generated)
3. Check globals.css: Found "--error: #f44336" (semantic mapping)
4. Implement: background-color: hsl(var(--error))
```

### File Modification Decision Tree

**When do I modify which files?**

#### Modify `src/tokens.json` when:

- ✅ Adding completely new base colors or design values
- ✅ Design system updates from design team
- ✅ New semantic color categories needed
- ❌ **RARELY** - Most styling uses existing tokens

#### Modify `src/styles/globals.css` when:

- ✅ **FREQUENTLY** - Adding semantic mappings from generated tokens
- ✅ Creating theme-aware color variations (light/dark mode)
- ✅ Mapping generated CSS variables to semantic names
- ✅ Component-specific token mappings

#### Components use existing CSS variables:

- ✅ **ALWAYS** - Use existing CSS variables for styling
- ✅ `hsl(var(--color-name))` for colors
- ✅ `var(--font-size-hero)` for typography
- ❌ **NEVER** - Hardcode colors, fonts, or spacing

**Examples:**

```
Need success color → tokens.json has green → auto-generated --color-green → mapped to --success
Need chart colors → tokens.json has palette → auto-generated --color-* → mapped to --chart-1
Need status colors → tokens.json updated → generates --status-success → use directly
```

### Current Token Categories (Auto-Generated)

**From `src/tokens.json`, Style Dictionary generates these CSS variables:**

#### Basic Colors

```css
--color-red: #f44336;
--color-green: #4caf50;
--color-light-blue: #03a9f4;
--color-orange: #ff9800;
--color-purple: #9c27b0;
/* + more from basic-color-palette */
```

#### Background Palette

```css
--bg-01: #f2f6f8; /* Lightest blue-gray */
--bg-02: #e4eaee;
/* ... */
--bg-12: #12191d; /* Darkest blue-gray */
```

#### Primary Colors

```css
--primary: #03a9f4;
--primary-hover: #0288d1;
```

#### Status Colors (Semantic)

```css
--status-success: #4caf50;
--status-error: #f44336;
--status-warning: #ff9800;
--status-info: #03a9f4;
```

#### Typography

```css
--font-size-hero: 24;
--font-size-heading: 18;
--font-size-body: 14;
--font-weight-normal: 400;
--font-weight-medium: 500;
--line-height-hero: 34;
--line-height-body: 21;
```

#### Alert Colors (Light/Dark Modes)

```css
--alert-light-success-alert-bg: #dbefdc;
--alert-light-success-alert-text: #285b2a;
--alert-dark-success-alert-bg: #18381a;
--alert-dark-success-alert-text: #cde9ce;
/* + warning, error, info variants */
```

### Implementation Examples

**Using generated CSS variables in components:**

```css
/* ✅ Status colors - Use semantic variables */
.success-state {
  background-color: hsl(var(--status-success));
}
.error-state {
  background-color: hsl(var(--status-error));
}

/* ✅ Chart colors - Generated from tokens */
.chart-primary {
  fill: hsl(var(--color-light-blue));
}
.chart-secondary {
  fill: hsl(var(--color-green));
}

/* ✅ Background palette */
.card-background {
  background-color: hsl(var(--bg-01));
}
.header-background {
  background-color: hsl(var(--bg-10));
}

/* ✅ Typography - Use generated font variables */
.hero-title {
  font-size: calc(var(--font-size-hero) * 1px);
  font-weight: var(--font-weight-normal);
  line-height: calc(var(--line-height-hero) * 1px);
}
```

### Alert System Integration

Alert colors automatically adapt to light/dark themes using generated variables:

```css
/* Auto-generated from tokens.json alert palettes */
.alert-success {
  background-color: hsl(var(--alert-light-success-alert-bg));
  color: hsl(var(--alert-light-success-alert-text));
}

.dark .alert-success {
  background-color: hsl(var(--alert-dark-success-alert-bg));
  color: hsl(var(--alert-dark-success-alert-text));
}
```

### Typography System

Typography scales are auto-generated from `tokens.json` text-styles:

- **Hero Title**: 24px, normal weight, 34px line-height
- **Heading 2**: 18px, medium weight, 27px line-height
- **Body Text**: 14px, normal weight, 21px line-height
- **Label Text**: 14px, normal weight, 16px line-height
- **Button Text**: 14px, normal weight, 16px line-height, uppercase
- **Caption Text**: 12px, normal weight, 18px line-height

**Generated CSS variables for typography:**

```css
/* Font sizes - use with calc() for px values */
--font-size-hero: 24; /* calc(var(--font-size-hero) * 1px) = 24px */
--font-size-heading: 18;
--font-size-body: 14;

/* Font weights */
--font-weight-normal: 400;
--font-weight-medium: 500;

/* Line heights */
--line-height-hero: 34;
--line-height-body: 21;
```

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

### Adding New Tokens (Build-Time Process)

When you need new colors or design values:

1. **Add to `src/tokens.json`**:

   ```json
   {
     "global": {
       "semantic-color-palette": {
         "tertiary": {
           "value": "#9c27b0",
           "type": "color"
         }
       }
     }
   }
   ```

2. **Tokens auto-rebuild** (if dev server running):
   - File watching detects the change
   - Style Dictionary rebuilds `src/styles/tokens.css`
   - New CSS variable `--tertiary: #9c27b0` is generated

3. **Add semantic mapping in `globals.css`** (if needed):

   ```css
   :root {
     --tertiary: var(--color-tertiary); /* Reference auto-generated variable */
     --tertiary-foreground: #ffffff;
   }

   .dark {
     --tertiary: #ba68c8; /* Lighter for dark mode */
     --tertiary-foreground: #000000;
   }
   ```

4. **Use in components**:
   ```css
   background-color: hsl(var(--tertiary));
   ```

### Build Configuration

The build system automatically handles token transformation:

- **Input**: `src/tokens.json` (design tokens)
- **Processor**: `build-tokens.mjs` (Style Dictionary configuration)
- **Output**: `src/styles/tokens.css` (CSS variables)
- **Integration**: `src/styles/globals.css` imports tokens.css

**Transform Naming Convention:**

- `basic-color-palette.red` → `--color-red`
- `blue-gray-color-palette.bg-01` → `--bg-01`
- `semantic-color-palette.status-success` → `--status-success`
- `fontsize.hero` → `--font-size-hero`

### Development Commands

```bash
# Start development with automatic token rebuilding
npm run dev

# Manual token build (if needed)
npm run tokens:build

# Watch tokens only (without Vite)
npm run tokens:build:watch
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
