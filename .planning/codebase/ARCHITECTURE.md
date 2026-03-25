# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Single-Page Application (SPA) with client-side routing and a static mock data layer

**Key Characteristics:**
- No backend server; all data is served from JSON files assembled at module load time
- Data layer is explicitly designed as a "swap point" — `mockDataLoader.ts` documents where fetch calls would replace JSON imports
- Health scoring logic lives in a pure utility function (`computeLiveScore`) that is called both at startup (to seed static exports) and live in React components for real-time updates
- Two distinct UI contexts co-exist: an admin desktop console and a field-staff mobile preview rendered inside a phone frame chrome

## Layers

**Entry / Bootstrap:**
- Purpose: Mount the React root and configure the router
- Location: `src/main.tsx`, `src/App.tsx`
- Contains: ReactDOM root creation, BrowserRouter, all top-level Routes
- Depends on: All page components, AppLayout
- Used by: `index.html` script tag

**Shell / Layout:**
- Purpose: Persistent chrome (sidebar navigation, content header) wrapping all pages via React Router's `<Outlet />`
- Location: `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`
- Contains: Fixed sidebar (240px), sticky content header with route-derived title, overflow handling special-cased for `/health` routes
- Depends on: `mockDataLoader.ts` (for account name in the content header)
- Used by: All pages

**Pages:**
- Purpose: Top-level route handlers; own their page-level state and compose domain components
- Location: `src/pages/`
- Contains: `Dashboard.tsx`, `Accounts.tsx`, `AccountDetail.tsx`, `Templates.tsx`, `Health.tsx`, `Users.tsx`, `Settings.tsx`
- Depends on: UI components, health components, data layer
- Used by: `App.tsx` route definitions

**Domain Components — Admin Health:**
- Purpose: Desktop admin views for account health monitoring and event management
- Location: `src/components/health/admin/`
- Contains: `AccountHealthList.tsx`, `HealthDetail.tsx`, `EventList.tsx`, `EventLogForm.tsx`, `ScoreGauge.tsx`, `ScoringRulesPanel.tsx`, `WeeklyRecap.tsx`, `WeeklyReportModal.tsx`, `SignalRow.tsx`, `ActionItems.tsx`, `HealthBadge.tsx`
- Depends on: `types/health.ts`, `utils/healthScoring.ts`, `data/scoringConfig.ts`
- Used by: `pages/Health.tsx`, `pages/Accounts.tsx`

**Domain Components — Mobile Preview:**
- Purpose: Simulated field-staff mobile app rendered inside a phone frame; fully client-side with local event state
- Location: `src/components/health/mobile/`, `src/components/health/MobileApp.tsx`, `src/components/health/PhoneFrame.tsx` (inferred)
- Contains: `MobileApp.tsx` (state machine with `Section` enum), `DealListScreen.tsx`, `DealDetailScreen.tsx`, `EventLogScreen.tsx`, `ContactScreen.tsx`
- Depends on: `types/health.ts`, `utils/healthScoring.ts`
- Used by: `pages/Health.tsx` (rendered inside a modal overlay)

**Primitive UI Components:**
- Purpose: Reusable, stateless presentational building blocks
- Location: `src/components/ui/`
- Contains: `Button.tsx`, `Input.tsx`, `SearchInput.tsx`, `StatusChip.tsx`, `AlertBanner.tsx`, `Badge.tsx`, `Tag.tsx`
- Depends on: Nothing (pure presentational)
- Used by: All pages and domain components

**Data Layer:**
- Purpose: Source of truth for all app data; assembles typed objects from JSON at module import time
- Location: `src/data/`
- Contains: `mockDataLoader.ts` (join logic), `scoringConfig.ts` (default + type), `mockData.ts` (templates, users, activity), `accounts.json`, `sites.json`, `events.json`, `users.json`, `templates.json`
- Depends on: `utils/healthScoring.ts` (calls `computeLiveScore` during assembly)
- Used by: Pages and components that need entity data

**Types:**
- Purpose: Shared TypeScript contracts for all domain entities
- Location: `src/types/`
- Contains: `index.ts` (Account, Template, User, BuildingDetail, enums), `health.ts` (AccountHealthScore, HealthEvent, HealthSignal, survey types, helper functions and constants like `CRITERIA_META`, `TIER_REQUIREMENTS`)
- Depends on: Nothing
- Used by: All layers

**Utilities:**
- Purpose: Pure, side-effect-free business logic
- Location: `src/utils/`
- Contains: `healthScoring.ts` (exports `computeLiveScore`, `isInherentlyPositive`, time-decay logic)
- Depends on: `types/health.ts`, `data/scoringConfig.ts`
- Used by: `data/mockDataLoader.ts` (at build time), `components/health/admin/HealthDetail.tsx` (live re-scoring on event add/resolve), `components/health/MobileApp.tsx` (live mobile score)

## Data Flow

**Initial Data Load (static path):**

1. `src/main.tsx` imports `App.tsx`, triggering all module-level imports
2. `mockDataLoader.ts` imports `accounts.json`, `sites.json`, `events.json` synchronously
3. `buildHealthScores()` and `buildAccounts()` are called once, joining JSON records and calling `computeLiveScore()` per site
4. Named exports `accountHealthScores` and `accounts` are cached as module-level constants
5. Pages and components import these directly — no prop drilling from root

**Live Re-scoring (health admin path):**

1. User opens `Health` page; `accountHealthScores` is read from the module cache
2. Admin adds a new event via `EventLogForm` inside `HealthDetail`
3. `HealthDetail` holds local event state (`localEvents`) merged with seed events
4. `computeLiveScore(mergedEvents, scoringConfig)` is called inside a `useMemo` hook on every event state change
5. Updated score and tier re-render the `ScoreGauge` and signal rows in place
6. `ScoringRulesPanel` lets admin edit `ScoringConfig`; the updated config is passed down to `HealthDetail` via props, triggering another `useMemo` recompute

**Mobile Preview Path:**

1. Admin clicks "Phone Preview" in `HealthDetail` — `Health.tsx` toggles `showPhoneModal`
2. `MobileApp` receives the currently selected account's `AccountHealthScore[]`
3. Field staff can log new events (`handleEventSubmit`) — stored in `localEvents` state inside `MobileApp`
4. Status updates (resolve/in-progress) stored in `mobileOverrides` map keyed by event ID
5. Merged event list is scored live via `computeLiveScore` inside a `useMemo`
6. All mobile state is ephemeral — resets when modal closes

**State Management:**
- No global state library (no Redux, Zustand, etc.)
- Module-level constants in `mockDataLoader.ts` serve as the read-only global data store
- Page-level `useState` for UI state (filters, selections, modals)
- `useMemo` for derived/computed data (filtered lists, live scores, sort orders)
- `ScoringConfig` state lives in `Health.tsx` and is passed to children via props

## Key Abstractions

**`AccountHealthScore`:**
- Purpose: Central DTO representing a single deal/site's complete health snapshot — score, tier, events, signals, risk profile, survey data, contact info
- Examples: `src/types/health.ts` (definition), `src/data/mockDataLoader.ts` (assembly), `src/pages/Health.tsx` (consumption)
- Pattern: Assembled from 3 JSON sources at load time; augmented with a live-computed score from `computeLiveScore`

**`ScoringConfig` + `computeLiveScore`:**
- Purpose: Fully parameterized scoring engine. Base score = 100; events add/subtract via config-driven weights with time decay
- Examples: `src/data/scoringConfig.ts`, `src/utils/healthScoring.ts`
- Pattern: Pure function — same inputs always produce same outputs. Config is admin-editable at runtime via `ScoringRulesPanel`

**`HealthSelection`:**
- Purpose: Discriminated union (`{ type: 'account' } | { type: 'deal', dealId, accountId }`) that drives the split-panel detail view
- Examples: `src/components/health/admin/AccountHealthList.tsx`
- Pattern: Passed up from list to `Health.tsx`, then down to `HealthDetail` to determine what to render

**`mockDataLoader` assembly functions:**
- Purpose: `buildHealthScores()` and `buildAccounts()` join normalized JSON into typed domain objects; documented swap point for real API calls
- Examples: `src/data/mockDataLoader.ts`
- Pattern: Called once at module load; exports are module-level constants

## Entry Points

**Application Bootstrap:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`, which references `src/main.tsx` as an ES module
- Responsibilities: Create React root on `#root` div, wrap in `React.StrictMode`, render `<App />`

**Router:**
- Location: `src/App.tsx`
- Triggers: Called by `main.tsx`
- Responsibilities: Define all client-side routes under `AppLayout`; routes: `/`, `/accounts`, `/accounts/:id`, `/templates`, `/health`, `/users`, `/settings`

**Health Page (most complex entry point):**
- Location: `src/pages/Health.tsx`
- Triggers: User navigates to `/health`
- Responsibilities: Owns scoring config state, user impersonation state, "My Sites" filter, mobile modal, scoring rules slide-over; composes `AccountHealthList` + `HealthDetail` in a split panel

## Error Handling

**Strategy:** Minimal — this is a prototype/demo application with no error boundaries or async operations

**Patterns:**
- Nullish coalescing (`??`) for missing data (e.g., `account?.accountName ?? site.accountId`)
- Optional chaining throughout component props
- TypeScript compilation catches type mismatches at build time
- No try/catch blocks — no async fetch calls exist to fail

## Cross-Cutting Concerns

**Logging:** None — console-only in development via browser devtools
**Validation:** TypeScript types only; no runtime schema validation (no Zod, Yup, etc.)
**Authentication:** None — user "impersonation" in Health page is a UI demo toggle, not real auth

---

*Architecture analysis: 2026-03-25*
