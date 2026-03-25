<!-- GSD:project-start source:PROJECT.md -->
## Project

**ServiceMaster Operations — Health Monitoring Platform**

A React SPA for ServiceMaster franchise operations, supporting two locations (Indianapolis and Chicago) as independent tenants. The app assists business operations with a focus on health monitoring — tracking account health scores, events, signals, and risk profiles across cleaning service sites. Admins switch between tenants from the sidebar; all data displayed is scoped to the active tenant.

**Core Value:** Every screen shows consistent, trustworthy data for the active location — no orphaned mock data, no cross-tenant leakage, no page showing different accounts than another.

### Constraints

- **Tech Stack**: React + TypeScript + Vite — no new frameworks or state libraries introduced this phase
- **Data**: Mock JSON only — no network calls, no backend setup
- **Tenant persistence**: Active tenant stored in `localStorage` so it survives page refresh
- **Backward compat**: Existing URL structure (`/health`, `/accounts`, etc.) unchanged
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.2 - All source files in `src/` (`tsconfig.json` target: ES2020, strict mode enabled)
- CSS - Global styles via `src/index.css` (minimal; Tailwind handles most styling)
## Runtime
- Browser (SPA) — no Node.js server runtime
- npm
- Lockfile: `package-lock.json` present
## Frameworks
- React 18.2 — UI rendering, component tree; entry at `src/main.tsx`
- React Router DOM 6.22 — Client-side routing; `BrowserRouter` wraps the entire app in `src/App.tsx`
- Tailwind CSS 3.4 — Utility-first CSS; config at `tailwind.config.ts` with custom design tokens (brand colors, shadows, font)
- PostCSS 8.4 — CSS processing pipeline; config at `postcss.config.js`
- Autoprefixer 10.4 — Browser prefix handling via PostCSS
- Vite 5.1 — Dev server and production bundler; config at `vite.config.ts`
- `@vitejs/plugin-react` 4.2 — Vite plugin enabling React fast refresh
## Key Dependencies
- `react-hook-form` 7.51 — Form state management; used in `src/components/health/admin/EventLogForm.tsx` and `src/pages/Settings.tsx`
- `@hookform/resolvers` 3.3 — Connects Zod schemas to react-hook-form
- `zod` 3.22 — Schema validation; paired with react-hook-form for form validation
- `@tanstack/react-table` 8.11 — Headless table primitives; used in account/health list views
- `lucide-react` 0.344 — Icon library; used throughout all pages and components
- No state management library (no Redux, Zustand, Jotai) — component-local `useState` and prop drilling only
- No data fetching library (no React Query, SWR) — all data is static JSON loaded at module init
## Configuration
- No `.env` files detected — no environment variables are required
- All data is local JSON files in `src/data/`; no API keys or secrets needed
- `tsconfig.json` — App TypeScript config (strict, noUnusedLocals, noUnusedParameters)
- `tsconfig.node.json` — Vite config TypeScript config
- `vite.config.ts` — Minimal config: React plugin only, no path aliases, no proxies
- `tailwind.config.ts` — Custom color system, font family, and box shadow tokens
## TypeScript Configuration
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
## Platform Requirements
- Node.js (version not pinned; no `.nvmrc` or `.node-version`)
- `npm run dev` — starts Vite dev server
- Static site output in `dist/` via `npm run build` (`tsc && vite build`)
- `npm run preview` — serves built output locally
- No server required; can be deployed to any static host (Netlify, Vercel, S3, etc.)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase matching the exported component name — `AccountHealthList.tsx`, `EventLogForm.tsx`, `StatusChip.tsx`
- Utility/data modules: camelCase — `healthScoring.ts`, `mockDataLoader.ts`, `scoringConfig.ts`
- Type files: camelCase noun — `health.ts`, `index.ts`
- Metadata/config constants: camelCase — `eventMeta.ts`
- JSON data files: camelCase — `accounts.json`, `sites.json`, `events.json`
- React components: PascalCase named exports — `export function AccountHealthList(...)`
- Event handlers: `handle` prefix — `handleSubmit`, `handleTypeSelect`, `handleSearchChange`
- Pure utility functions: camelCase verbs — `computeLiveScore`, `buildHealthScores`, `buildAccounts`, `getTimeDecayMultiplier`, `getTierFromScore`, `getTierColors`
- Predicate helpers: `is` prefix — `isInherentlyPositive`, `isDealSelected`, `isAccountSelected`
- Small private helpers: camelCase — `daysSince`, `worstTier`, `formatDate`, `formatWeekRange`
- camelCase throughout — `scoringConfig`, `tierFilter`, `firstRed`, `currentUserId`
- Aligned multi-assignment blocks use spaces for visual alignment (common in this codebase):
- Lookup constants: SCREAMING_SNAKE_CASE — `TIER_COLOR`, `TIER_ORDER`, `TIER_REQUIREMENTS`, `DECAY_TABLE`, `DEFAULT_SCORING_CONFIG`
- `type` for union strings and simple aliases — `type HealthTier = 'green' | 'yellow' | 'red'`
- `interface` for object shapes — `interface AccountHealthScore { ... }`, `interface HealthEvent { ... }`
- Props interfaces: ComponentName + `Props` suffix — `ButtonProps`, `InputProps`, `HealthDetailProps`
- Internal-only types (not exported): defined locally in the file — `type TierFilter`, `interface AccountGroup`
- Raw JSON shapes: `Raw` prefix — `RawSite`, `RawAccount`
- SCREAMING_SNAKE_CASE for configuration lookup tables — `TIER_COLOR`, `CHIP_CONFIG`, `SEVERITY_LABELS`, `OUTCOME_OPTIONS`
- PascalCase for arrays of UI metadata — `CRITERIA_META`, `EXTRA_CRITERIA_META`, `VISIT_SENTIMENT`
## Code Style
- No Prettier config detected — formatting is manual/editor-driven
- 2-space indentation throughout
- Single quotes for strings in TypeScript
- Trailing commas on multi-line object/array literals
- Pixel values for font sizes written as Tailwind arbitrary values: `text-[13px]`, `text-[16px]`, `text-[12px]`
- ESLint with `@typescript-eslint` parser (version 6)
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Run via: `npm run lint` — `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`
- TypeScript strict mode: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- `strict: true` in `tsconfig.json`
- `noUnusedLocals` and `noUnusedParameters` enforced
- `noFallthroughCasesInSwitch` enabled
- Type assertions used sparingly: `as HealthTier`, `as 1 | 2 | 3 | 4 | 5`, `as AccountStatus`
- Prefer `import type` for type-only imports — `import type { HealthEvent } from '../types/health'`
## Import Organization
- Relative paths only — no path aliases (`@/` or `~`) are configured
- Depth-aware: pages import from `../components/...`, components import from `../../../types/...`
- Explicit `import React from 'react'` only in UI primitive files (`Button.tsx`, `Input.tsx`) where `React.ButtonHTMLAttributes` is referenced
- All other files use named hook imports without the React default — `import { useState } from 'react'`
## Error Handling
- No try/catch blocks in the codebase — this is a frontend-only demo app with no async operations
- Validation is done inline before submit: `if (!selectedType || !description.trim()) return;`
- Disabled states communicate invalid conditions via `disabled` prop or conditional `canSubmit` boolean
- Optional chaining used defensively — `account?.accountName ?? site.accountId`, `accountDeals[0]?.tier`
- Nullish coalescing for fallbacks — `?? 'green'`, `?? null`, `?? ''`
## Logging
## Comments
## Function Design
- Destructured in function signature for components: `export function Button({ variant = 'primary', size = 'regular', ...props }: ButtonProps)`
- Pure functions take typed arguments directly: `computeLiveScore(events: HealthEvent[], config: ScoringConfig)`
- Components return JSX
- Pure helpers return typed values with explicit return types on complex functions: `: LiveScoreResult`, `: HealthTier`, `: AccountHealthScore[]`
- Simple helpers infer return type: `function daysSince(iso: string): number`
## Module Design
- Named exports only — no default exports for components (except `App.tsx` which is the root)
- Re-export pattern: `src/data/mockDataLoader.ts` exports pre-built static arrays alongside builder functions:
## Styling Conventions
- Custom pixel sizes via arbitrary values: `text-[13px]`, `rounded-[8px]`, `h-[56px]`
- Design token colors via custom Tailwind theme: `text-text-primary`, `bg-surface-page`, `border-border-card`, `text-status-danger`
- Raw hex colors via inline `style` prop when dynamic (tier color, active states): `style={{ color: TIER_COLOR[tier] }}`
- Tailwind class strings composed as template literals: `` `${base} ${variantClass} ${sizeClass} ${disabledClass} ${className}` ``
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- No backend server; all data is served from JSON files assembled at module load time
- Data layer is explicitly designed as a "swap point" — `mockDataLoader.ts` documents where fetch calls would replace JSON imports
- Health scoring logic lives in a pure utility function (`computeLiveScore`) that is called both at startup (to seed static exports) and live in React components for real-time updates
- Two distinct UI contexts co-exist: an admin desktop console and a field-staff mobile preview rendered inside a phone frame chrome
## Layers
- Purpose: Mount the React root and configure the router
- Location: `src/main.tsx`, `src/App.tsx`
- Contains: ReactDOM root creation, BrowserRouter, all top-level Routes
- Depends on: All page components, AppLayout
- Used by: `index.html` script tag
- Purpose: Persistent chrome (sidebar navigation, content header) wrapping all pages via React Router's `<Outlet />`
- Location: `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`
- Contains: Fixed sidebar (240px), sticky content header with route-derived title, overflow handling special-cased for `/health` routes
- Depends on: `mockDataLoader.ts` (for account name in the content header)
- Used by: All pages
- Purpose: Top-level route handlers; own their page-level state and compose domain components
- Location: `src/pages/`
- Contains: `Dashboard.tsx`, `Accounts.tsx`, `AccountDetail.tsx`, `Templates.tsx`, `Health.tsx`, `Users.tsx`, `Settings.tsx`
- Depends on: UI components, health components, data layer
- Used by: `App.tsx` route definitions
- Purpose: Desktop admin views for account health monitoring and event management
- Location: `src/components/health/admin/`
- Contains: `AccountHealthList.tsx`, `HealthDetail.tsx`, `EventList.tsx`, `EventLogForm.tsx`, `ScoreGauge.tsx`, `ScoringRulesPanel.tsx`, `WeeklyRecap.tsx`, `WeeklyReportModal.tsx`, `SignalRow.tsx`, `ActionItems.tsx`, `HealthBadge.tsx`
- Depends on: `types/health.ts`, `utils/healthScoring.ts`, `data/scoringConfig.ts`
- Used by: `pages/Health.tsx`, `pages/Accounts.tsx`
- Purpose: Simulated field-staff mobile app rendered inside a phone frame; fully client-side with local event state
- Location: `src/components/health/mobile/`, `src/components/health/MobileApp.tsx`, `src/components/health/PhoneFrame.tsx` (inferred)
- Contains: `MobileApp.tsx` (state machine with `Section` enum), `DealListScreen.tsx`, `DealDetailScreen.tsx`, `EventLogScreen.tsx`, `ContactScreen.tsx`
- Depends on: `types/health.ts`, `utils/healthScoring.ts`
- Used by: `pages/Health.tsx` (rendered inside a modal overlay)
- Purpose: Reusable, stateless presentational building blocks
- Location: `src/components/ui/`
- Contains: `Button.tsx`, `Input.tsx`, `SearchInput.tsx`, `StatusChip.tsx`, `AlertBanner.tsx`, `Badge.tsx`, `Tag.tsx`
- Depends on: Nothing (pure presentational)
- Used by: All pages and domain components
- Purpose: Source of truth for all app data; assembles typed objects from JSON at module import time
- Location: `src/data/`
- Contains: `mockDataLoader.ts` (join logic), `scoringConfig.ts` (default + type), `mockData.ts` (templates, users, activity), `accounts.json`, `sites.json`, `events.json`, `users.json`, `templates.json`
- Depends on: `utils/healthScoring.ts` (calls `computeLiveScore` during assembly)
- Used by: Pages and components that need entity data
- Purpose: Shared TypeScript contracts for all domain entities
- Location: `src/types/`
- Contains: `index.ts` (Account, Template, User, BuildingDetail, enums), `health.ts` (AccountHealthScore, HealthEvent, HealthSignal, survey types, helper functions and constants like `CRITERIA_META`, `TIER_REQUIREMENTS`)
- Depends on: Nothing
- Used by: All layers
- Purpose: Pure, side-effect-free business logic
- Location: `src/utils/`
- Contains: `healthScoring.ts` (exports `computeLiveScore`, `isInherentlyPositive`, time-decay logic)
- Depends on: `types/health.ts`, `data/scoringConfig.ts`
- Used by: `data/mockDataLoader.ts` (at build time), `components/health/admin/HealthDetail.tsx` (live re-scoring on event add/resolve), `components/health/MobileApp.tsx` (live mobile score)
## Data Flow
- No global state library (no Redux, Zustand, etc.)
- Module-level constants in `mockDataLoader.ts` serve as the read-only global data store
- Page-level `useState` for UI state (filters, selections, modals)
- `useMemo` for derived/computed data (filtered lists, live scores, sort orders)
- `ScoringConfig` state lives in `Health.tsx` and is passed to children via props
## Key Abstractions
- Purpose: Central DTO representing a single deal/site's complete health snapshot — score, tier, events, signals, risk profile, survey data, contact info
- Examples: `src/types/health.ts` (definition), `src/data/mockDataLoader.ts` (assembly), `src/pages/Health.tsx` (consumption)
- Pattern: Assembled from 3 JSON sources at load time; augmented with a live-computed score from `computeLiveScore`
- Purpose: Fully parameterized scoring engine. Base score = 100; events add/subtract via config-driven weights with time decay
- Examples: `src/data/scoringConfig.ts`, `src/utils/healthScoring.ts`
- Pattern: Pure function — same inputs always produce same outputs. Config is admin-editable at runtime via `ScoringRulesPanel`
- Purpose: Discriminated union (`{ type: 'account' } | { type: 'deal', dealId, accountId }`) that drives the split-panel detail view
- Examples: `src/components/health/admin/AccountHealthList.tsx`
- Pattern: Passed up from list to `Health.tsx`, then down to `HealthDetail` to determine what to render
- Purpose: `buildHealthScores()` and `buildAccounts()` join normalized JSON into typed domain objects; documented swap point for real API calls
- Examples: `src/data/mockDataLoader.ts`
- Pattern: Called once at module load; exports are module-level constants
## Entry Points
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`, which references `src/main.tsx` as an ES module
- Responsibilities: Create React root on `#root` div, wrap in `React.StrictMode`, render `<App />`
- Location: `src/App.tsx`
- Triggers: Called by `main.tsx`
- Responsibilities: Define all client-side routes under `AppLayout`; routes: `/`, `/accounts`, `/accounts/:id`, `/templates`, `/health`, `/users`, `/settings`
- Location: `src/pages/Health.tsx`
- Triggers: User navigates to `/health`
- Responsibilities: Owns scoring config state, user impersonation state, "My Sites" filter, mobile modal, scoring rules slide-over; composes `AccountHealthList` + `HealthDetail` in a split panel
## Error Handling
- Nullish coalescing (`??`) for missing data (e.g., `account?.accountName ?? site.accountId`)
- Optional chaining throughout component props
- TypeScript compilation catches type mismatches at build time
- No try/catch blocks — no async fetch calls exist to fail
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
