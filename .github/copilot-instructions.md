# Copilot Instructions for ClockSense

> React TypeScript application for Clockify contract hours tracking with time analysis and data visualization.

## 🚀 Quick Reference

### Design System Workflow

1. **Check tokens first** → `src/tokens.json` (source of truth)
2. **Use semantic CSS variables** → `src/styles/globals.css`
3. **Never hardcode** → Always use `hsl(var(--variable-name))`
4. **Auto-rebuilding** → Tokens rebuild automatically on save

### Key Files Structure

```
src/tokens.json              → Design tokens (colors, typography, spacing)
src/styles/globals.css       → CSS variables + Tailwind integration
src/styles/tokens.css        → Auto-generated from tokens.json
src/components/ui/           → ShadCN components (DO NOT MODIFY)
src/components/dashboard/    → Custom dashboard widgets
src/guidelines/Guidelines.md → Detailed patterns & architecture
```

### Available Token Categories

- **Colors**: `--color-red`, `--color-green`, `--status-success`, `--chart-1`
- **Backgrounds**: `--bg-01` through `--bg-12` (blue-gray palette)
- **Typography**: `--font-size-hero`, `--font-weight-medium`, `--line-height-body`
- **Alerts**: `--alert-success-bg`, `--alert-error-text` (light/dark modes)

### Component Patterns

- **Widgets**: `[Name]Widget` in `src/components/dashboard/widgets/`
- **Hooks**: `use[Domain][Purpose]` (e.g., `useClockifyData`, `useNotifications`)
- **Props**: Always define TypeScript interfaces

---

## Core Implementation Guidelines

### 1. Design Token Integration

**Build System**: Style Dictionary automatically converts `src/tokens.json` to CSS variables

```css
/* ✅ Use semantic variables */
background-color: hsl(var(--status-success));
color: hsl(var(--text-high-emphasis));

/* ❌ Never hardcode */
background-color: #4caf50;
color: rgba(0, 0, 0, 0.87);
```

### 2. Component Architecture

- **ShadCN UI**: Use components from `src/components/ui/`
- **Custom widgets**: Create in `src/components/dashboard/widgets/`
- **Responsive design**: 8px grid system, mobile-first approach
- **Error handling**: Include loading states and error boundaries

### 3. Clockify API Integration

- **Authentication**: Primary `x-addon-token`, fallback `X-Api-Key`
- **Rate limits**: 50 requests/second per workspace
- **Scopes**: Update `public/manifest.json` when adding new API features
- **Documentation**: https://docs.clockify.me/

---

## When Making Changes

### Design/Styling Workflow

1. **Search tokens.json** for existing colors/values
2. **Reference available CSS variables** in globals.css
3. **Add semantic mappings** if needed (e.g., `--status-warning: var(--color-orange)`)
4. **Implement with CSS variables** in components
5. **Test responsiveness** across breakpoints

### File Modification Rules

- ✅ **Modify**: Dashboard widgets, hooks, custom components
- ❌ **DO NOT modify**: `src/components/ui/` (ShadCN), `src/components/figma/`
- ⚠️ **Update carefully**: `public/manifest.json` (only add required scopes)

### Review Checklist (for major changes)

- [ ] Used existing tokens from `tokens.json`
- [ ] Followed three-layer design system (tokens → CSS vars → components)
- [ ] Maintained responsive design patterns
- [ ] Added proper TypeScript types
- [ ] Included loading/error states
- [ ] Updated manifest scopes if needed

---

## Development Environment

### Token Development

```bash
npm run dev              # Auto-rebuilds tokens + starts dev server
npm run tokens:build     # Manual token build
```

### Project Structure

- **Design tokens**: `src/tokens.json` → `src/styles/tokens.css` (auto-generated)
- **Tailwind integration**: `src/styles/globals.css` maps CSS variables
- **Components**: Organized by domain (dashboard, ui, figma)

---

_For detailed architecture patterns, see `src/guidelines/Guidelines.md`_
