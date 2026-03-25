# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
servicemaster/
├── src/
│   ├── main.tsx                    # React root mount
│   ├── App.tsx                     # BrowserRouter + all Routes
│   ├── index.css                   # Global CSS (Tailwind base)
│   ├── pages/                      # One file per top-level route
│   │   ├── Dashboard.tsx
│   │   ├── Accounts.tsx
│   │   ├── AccountDetail.tsx
│   │   ├── Health.tsx              # Most complex page — split-panel health dashboard
│   │   ├── Templates.tsx
│   │   ├── Users.tsx
│   │   └── Settings.tsx
│   ├── components/
│   │   ├── layout/                 # App shell (persistent chrome)
│   │   │   ├── AppLayout.tsx       # Sidebar + ContentHeader + <Outlet />
│   │   │   └── Sidebar.tsx         # Fixed left nav
│   │   ├── ui/                     # Primitive, stateless UI building blocks
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── StatusChip.tsx
│   │   │   ├── AlertBanner.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Tag.tsx
│   │   └── health/                 # Health-scoring domain components
│   │       ├── MobileApp.tsx       # Mobile section state machine
│   │       ├── PhoneFrame.tsx      # Phone chrome wrapper
│   │       ├── eventMeta.ts        # Event type metadata
│   │       ├── admin/              # Desktop admin views
│   │       │   ├── AccountHealthList.tsx
│   │       │   ├── HealthDetail.tsx
│   │       │   ├── EventList.tsx
│   │       │   ├── EventLogForm.tsx
│   │       │   ├── ScoreGauge.tsx
│   │       │   ├── ScoringRulesPanel.tsx
│   │       │   ├── WeeklyRecap.tsx
│   │       │   ├── WeeklyReportModal.tsx
│   │       │   ├── SignalRow.tsx
│   │       │   ├── ActionItems.tsx
│   │       │   └── HealthBadge.tsx
│   │       └── mobile/             # Field-staff mobile screens
│   │           ├── DealListScreen.tsx
│   │           ├── DealDetailScreen.tsx
│   │           ├── EventLogScreen.tsx
│   │           └── ContactScreen.tsx
│   ├── data/                       # Data layer — JSON sources + assembly + config
│   │   ├── mockDataLoader.ts       # Joins JSON → typed domain objects (API swap point)
│   │   ├── scoringConfig.ts        # ScoringConfig type + DEFAULT_SCORING_CONFIG
│   │   ├── mockData.ts             # Templates, users, recentActivity (inline arrays)
│   │   ├── accounts.json           # Account master records
│   │   ├── sites.json              # Deal/site records (include signals, tier, revenue)
│   │   ├── events.json             # HealthEvent log (all sites)
│   │   ├── users.json              # Field staff users with assignedSiteIds
│   │   └── templates.json          # Pricing templates
│   ├── types/                      # TypeScript domain contracts
│   │   ├── index.ts                # Account, Template, User, BuildingDetail, enums
│   │   └── health.ts               # AccountHealthScore, HealthEvent, HealthSignal,
│   │                               # survey types, helper functions, CRITERIA_META,
│   │                               # TIER_REQUIREMENTS constants
│   ├── utils/                      # Pure business logic utilities
│   │   └── healthScoring.ts        # computeLiveScore(), isInherentlyPositive(), decay tables
│   └── docs/                       # Internal documentation
│       └── health-scoring.md
├── index.html                      # Vite HTML entry — mounts #root, refs src/main.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── health-check-design-requirements.md   # Product requirements doc
├── health-check-scoring-values.md        # Scoring algorithm reference
└── dist/                           # Vite build output (committed, generated)
```

## Directory Purposes

**`src/pages/`:**
- Purpose: One component per client-side route; owns page-level state
- Contains: Route handler components, local UI state (search, filters, pagination, modals), data fetching via direct imports from `data/`
- Key files: `src/pages/Health.tsx` (most complex — scoring config, user impersonation, mobile modal)

**`src/components/layout/`:**
- Purpose: Persistent app shell rendered on every page
- Contains: `AppLayout.tsx` wraps all pages via React Router `<Outlet />`; `Sidebar.tsx` has the nav items array
- Key files: `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`

**`src/components/ui/`:**
- Purpose: Atomic, reusable presentational components with no business logic
- Contains: Buttons, inputs, chips, badges — all accept only primitive props
- Key files: `src/components/ui/Button.tsx`, `src/components/ui/StatusChip.tsx`

**`src/components/health/admin/`:**
- Purpose: Desktop admin views for health scoring — the primary product feature
- Contains: Split-panel list (`AccountHealthList`), detail pane (`HealthDetail`), event management, score visualization, weekly reports, scoring rules editor
- Key files: `src/components/health/admin/HealthDetail.tsx` (live re-scoring logic), `src/components/health/admin/AccountHealthList.tsx` (selection state, grouping)

**`src/components/health/mobile/`:**
- Purpose: Field-staff mobile screens rendered inside `MobileApp.tsx`; simulated phone UI
- Contains: Screen components for deal list, deal detail, event logging, contact
- Key files: `src/components/health/mobile/DealDetailScreen.tsx`, `src/components/health/mobile/EventLogScreen.tsx`

**`src/data/`:**
- Purpose: All application data; JSON files are the current source of truth
- Contains: JSON entity files, a loader that joins them (`mockDataLoader.ts`), scoring defaults (`scoringConfig.ts`), legacy inline mock data (`mockData.ts`)
- Key files: `src/data/mockDataLoader.ts` (documented API swap point), `src/data/scoringConfig.ts`

**`src/types/`:**
- Purpose: TypeScript interface definitions — import these when writing new code, never inline ad-hoc types
- Contains: All domain interfaces and enums used across layers
- Key files: `src/types/health.ts` (most complete — 238 lines; also exports helper functions like `getTierColors`)

**`src/utils/`:**
- Purpose: Pure functions with no React or side effects
- Contains: Only `healthScoring.ts` currently; the place for all future algorithmic logic
- Key files: `src/utils/healthScoring.ts`

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell; `<div id="root">` mount point
- `src/main.tsx`: React root creation
- `src/App.tsx`: Route table — all 7 routes defined here

**Configuration:**
- `vite.config.ts`: Vite build config (minimal — React plugin only)
- `tsconfig.json`: TypeScript config
- `tailwind.config.ts`: Tailwind theme (color tokens like `primary`, `text-subtle`, `border-card`)
- `src/data/scoringConfig.ts`: Health scoring weights and thresholds (admin-configurable at runtime)

**Core Logic:**
- `src/utils/healthScoring.ts`: Scoring engine — the only non-React business logic file
- `src/data/mockDataLoader.ts`: Data assembly and API swap point
- `src/types/health.ts`: Health domain type definitions including embedded constants

**Domain Feature:**
- `src/pages/Health.tsx`: Health dashboard page — top-level orchestrator
- `src/components/health/admin/HealthDetail.tsx`: Per-site detail with live re-scoring
- `src/components/health/MobileApp.tsx`: Mobile preview state machine

## Naming Conventions

**Files:**
- PascalCase for React component files: `AccountHealthList.tsx`, `HealthDetail.tsx`
- camelCase for non-component TypeScript modules: `mockDataLoader.ts`, `healthScoring.ts`, `scoringConfig.ts`
- camelCase for data files: `mockData.ts`, `eventMeta.ts`
- lowercase with hyphens for JSON data files: `accounts.json`, `sites.json`

**Directories:**
- lowercase: `pages/`, `components/`, `data/`, `types/`, `utils/`
- domain sub-directories by feature: `components/health/admin/`, `components/health/mobile/`

**Components:**
- Named exports only (no default exports for components): `export function AccountHealthList(...)`
- `App.tsx` is the one exception — default export for Vite's module system

**Types:**
- PascalCase interfaces: `AccountHealthScore`, `HealthEvent`, `ScoringConfig`
- Union type aliases in SCREAMING_SNAKE_CASE for constants: `CRITERIA_META`, `TIER_REQUIREMENTS`, `DEFAULT_SCORING_CONFIG`
- Discriminated unions for selection state: `HealthSelection`, `Section` (internal to `MobileApp`)

## Where to Add New Code

**New Page/Route:**
- Add page component: `src/pages/NewPage.tsx`
- Register route: `src/App.tsx` inside the `<Route element={<AppLayout />}>` block
- Add nav item: `src/components/layout/Sidebar.tsx` `navItems` array

**New Feature Component:**
- Domain-specific: `src/components/health/admin/` or `src/components/health/mobile/` depending on context
- Generic reusable UI: `src/components/ui/`
- New domain area: create `src/components/{domain}/`

**New Domain Types:**
- Health-related: add to `src/types/health.ts`
- Core entities (accounts, users, templates): add to `src/types/index.ts`

**New Business Logic:**
- Pure utility functions: `src/utils/` — create a new file per concern (e.g., `src/utils/accountScoring.ts`)

**New Data (mock):**
- JSON records: add to the appropriate file in `src/data/` (`accounts.json`, `sites.json`, `events.json`)
- New entity type: create `src/data/{entity}.json` and add assembly logic to `mockDataLoader.ts`
- Inline static data: `src/data/mockData.ts`

**New Scoring Config Parameters:**
- Add field to `ScoringConfig` interface in `src/data/scoringConfig.ts`
- Add default value to `DEFAULT_SCORING_CONFIG`
- Add scoring logic to `computeLiveScore` in `src/utils/healthScoring.ts`
- Add UI control to `src/components/health/admin/ScoringRulesPanel.tsx`

## Special Directories

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes (by `vite build`)
- Committed: Yes (present in repo, non-standard but intentional for this project)

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents consumed by planner/executor agents
- Generated: Yes (by `gsd:map-codebase`)
- Committed: Yes

**`.claude/`:**
- Purpose: Claude Code agent definitions and GSD command system
- Generated: No (authored)
- Committed: Yes (pending — shown as untracked in git status)

---

*Structure analysis: 2026-03-25*
