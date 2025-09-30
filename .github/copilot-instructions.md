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
- **MANIFEST UPDATES**: When adding features that require Clockify API access, update `public/manifest.json` scopes accordingly

## Clockify Integration Management

### API Functionality Reference

**When implementing Clockify API features:**

1. **API Documentation** - Use https://docs.clockify.me/ for comprehensive API reference
2. **Authentication** - Prioritize `x-addon-token` (addon deployment) over `X-Api-Key` (development fallback)
   - **Primary**: Use `x-addon-token` from URL parameters when deployed as Clockify addon
   - **Fallback**: Use `X-Api-Key` for local development when addon token unavailable
   - Implementation already handles this priority in `ClockifyApiService.makeRequest()`
3. **Rate Limiting** - 50 requests per second per addon per workspace via x-addon-token
4. **Regional APIs** - Use appropriate base URLs (global, EU, USA, UK, AU regions)
5. **API Categories Available:**
   - **User Management**: Profile, memberships, custom fields, team managers
   - **Time Tracking**: Time entries, start/stop timer, bulk operations
   - **Project Management**: Projects, tasks, estimates, memberships
   - **Workspace**: Settings, users, cost/hourly rates
   - **Reporting**: Detailed, summary, weekly reports with filtering
   - **Time Off**: Policies, requests, balances (PTO system)
   - **Invoicing**: Invoice creation, payments, expense tracking
   - **Scheduling**: Assignments, recurring schedules, capacity planning
   - **Webhooks**: Real-time notifications for workspace events

### Manifest Configuration

**When modifying code that impacts Clockify integration:**

1. **Check required scopes** - Review what Clockify API endpoints your code uses
2. **Update manifest scopes** - Add only necessary scopes to `public/manifest.json`
3. **Follow Clockify schema v1.3** - Reference: https://dev-docs.marketplace.cake.com/clockify/build/manifest.html
4. **Settings structure** - Use both tab-level and group-level settings as per Clockify docs
5. **Valid scopes only** - Use scopes from official Clockify documentation

**Available Clockify Scopes** (use only what's needed):

- `TIME_ENTRY_READ/WRITE`, `USER_READ/WRITE`, `PROJECT_READ/WRITE`
- `TAG_READ/WRITE`, `REPORTS_READ/WRITE`, `WORKSPACE_READ/WRITE`
- `CLIENT_READ/WRITE`, `TASK_READ/WRITE`, `CUSTOM_FIELDS_READ/WRITE`
- Full list: https://dev-docs.marketplace.cake.com/clockify/build/manifest.html#scopes

## When Making Changes

1. **Check `src/tokens.json` FIRST** for existing design tokens before implementing
2. **Quote available tokens** from tokens.json that apply to the request
3. **Map to CSS variables** in `globals.css` if new semantic meaning is needed
4. **Use CSS variables** in component implementation (never hardcode)
5. **Reference design patterns** from `src/guidelines/Guidelines.md`
6. Ensure responsive design and accessibility
7. **Include loading states and error handling** in component design (I can review code for proper state handling)
8. **Update manifest scopes** if adding new Clockify API functionality
9. Maintain consistent naming conventions

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
