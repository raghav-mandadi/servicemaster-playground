# Codebase Concerns

**Analysis Date:** 2026-03-25

## Tech Debt

**Mock-only data layer — no real API surface:**
- Issue: All data comes from static JSON files imported at module load time. Every page imports from `src/data/mockDataLoader.ts` or `src/data/mockData.ts`. There is no API client, no fetch layer, and no async data loading.
- Files: `src/data/mockDataLoader.ts`, `src/data/mockData.ts`, `src/data/accounts.json`, `src/data/sites.json`, `src/data/events.json`, `src/data/users.json`, `src/data/templates.json`
- Impact: Adding a real backend requires replacing every data import across all pages simultaneously. No incremental migration path exists yet.
- Fix approach: The loader file (`src/data/mockDataLoader.ts`) already has a comment ("To swap for a real API: replace JSON imports with fetch calls and keep same assembly logic"). Wrap `buildHealthScores()` and `buildAccounts()` behind async data hooks first, then replace JSON imports with API calls.

**`trend` is hardcoded to `0` for every site:**
- Issue: `buildHealthScores()` in `src/data/mockDataLoader.ts` line 84 sets `trend: 0` for every `AccountHealthScore`. The UI renders trend arrows and delta values across multiple components, all of which show `+0` or always-green because `trend >= 0` evaluates true for zero.
- Files: `src/data/mockDataLoader.ts:84`, `src/components/health/admin/HealthBadge.tsx:59`, `src/components/health/admin/HealthDetail.tsx:137–138`, `src/components/health/admin/AccountHealthList.tsx:246–248`
- Impact: Trend indicators are misleading — they show green upward arrows on sites that may be declining.
- Fix approach: Compute trend by diffing current live score against a 30-day-ago computed score from the same event log, or store historical snapshots.

**`loggedBy` hardcoded to `'Current User'` in admin event forms:**
- Issue: `EventLogForm.tsx` line 86 always submits `loggedBy: 'Current User'` and `loggedByRole: 'cs'` regardless of the active user selected in the Health page UI. `HealthDetail.tsx` line 192 also hardcodes `by: 'Current User'` for event resolution tracking.
- Files: `src/components/health/admin/EventLogForm.tsx:86–87`, `src/components/health/admin/HealthDetail.tsx:192`
- Impact: Logged events show incorrect attribution. When a real auth layer is added this will need to thread the current user down into both components.
- Fix approach: Add `loggedBy` and `loggedByRole` as props to `EventLogForm` and pass the active user from `Health.tsx` where the user context already exists via `currentUser`.

**Dual `User` type mismatch — `src/types/index.ts` vs `src/data/users.json`:**
- Issue: `src/types/index.ts` defines `User` with `role: UserRole` typed as `'Admin' | 'Manager' | 'Rep'` and `status: UserStatus`. The `src/data/users.json` uses snake_case roles (`gm`, `ops_manager`, `supervisor`, `cs`, `sales`) with no `status` field. The `Users` page imports from `src/data/mockData.ts` which has a different set of users using the `UserRole` shape. Two parallel user datasets exist with incompatible schemas.
- Files: `src/types/index.ts`, `src/data/users.json`, `src/data/mockData.ts`, `src/pages/Health.tsx`, `src/pages/Users.tsx`
- Impact: The Users page and the Health page show different user lists. There is no shared identity layer. Adding real auth will require reconciling these schemas.
- Fix approach: Decide on a single user schema (prefer the `users.json` schema as it has `assignedSiteIds`), update `src/types/index.ts`, migrate `src/data/mockData.ts` to match, and update `Users.tsx` to use the unified source.

**`supply_delivery` event type is a stub:**
- Issue: `computeLiveScore()` in `src/utils/healthScoring.ts` line 170 has a `case 'supply_delivery'` block with a comment "neutral unless overdue — simplified for demo" and no implementation. It always contributes 0 impact regardless of state.
- Files: `src/utils/healthScoring.ts:169–172`, `src/docs/health-scoring.md:139`
- Impact: Supply delivery events cannot affect the health score even when overdue.
- Fix approach: Define overdue threshold (days since delivery expected), add a deduction config value to `ScoringConfig`, and implement the decay/penalty in the switch case.

**`ScoringConfig` changes are not persisted:**
- Issue: The Scoring Rules panel (`src/components/health/admin/ScoringRulesPanel.tsx`) lets admins edit scoring config values, but `scoringConfig` state lives only in `Health.tsx` component state. It resets on every page refresh and is not shared with non-live-scoring sites.
- Files: `src/pages/Health.tsx:29`, `src/components/health/admin/ScoringRulesPanel.tsx`
- Impact: Admin scoring rule changes are ephemeral and invisible to non-live-scoring site display.
- Fix approach: Persist config to `localStorage` on change, load it as default on mount, and eventually sync to backend.

**`ActionItems` dismissal is purely local and not persisted:**
- Issue: `ActionItems.tsx` tracks dismissed items in a `Set<number>` local state keyed by array index. Dismissed items reappear on every render. The "Other…" resolution note is also discarded.
- Files: `src/components/health/admin/ActionItems.tsx:123–136`
- Impact: Resolved action items reappear every time the component remounts (e.g., switching between deals and back).
- Fix approach: Store dismissals in `localStorage` keyed by `dealId + item hash`, or integrate with a backend resolution endpoint.

**`riskProfile` data is static in `sites.json`:**
- Issue: `RiskProfile` fields (`eventCount12m`, `incidentCount12m`, `watchlist`, etc.) are hard-coded in `src/data/sites.json` and are not recomputed from the actual events in `src/data/events.json`. They can diverge from real event data as events are added.
- Files: `src/data/sites.json`, `src/types/health.ts:151–157`, `src/data/mockDataLoader.ts:83`
- Impact: Watchlist banners and risk counts shown in `HealthDetail.tsx` may not reflect the actual event log.
- Fix approach: Derive `riskProfile` dynamically in `buildHealthScores()` by filtering events for the relevant `dealId` within a 12-month window, matching the pattern already used for `score` and `tier`.

## Known Bugs

**`AccountDetail` silently falls back to `accounts[0]` on unknown route param:**
- Symptoms: Navigating to `/accounts/invalid-id` renders the first account's data instead of a 404 or error state.
- Files: `src/pages/AccountDetail.tsx:23`
- Trigger: Any direct URL with an unknown account ID.
- Workaround: None. The fallback is `?? accounts[0]`.

**Health page `expanded` set initialization captures accounts at mount, not after filter:**
- Symptoms: The `AccountHealthList` initializes its expanded set (`useState(() => ...)`) from the `accounts` prop on first render. If `filterMySites` is toggled after mount, previously-expanded accounts may remain in the set even when filtered out, causing stale expansion state.
- Files: `src/components/health/admin/AccountHealthList.tsx:41–48`
- Trigger: Toggle "My Sites" filter on the Health page after interacting with account groups.
- Workaround: None.

**`ResolveDropdown` portal position not updated on scroll:**
- Symptoms: The resolve dropdown in `ActionItems.tsx` calculates its absolute position once when it opens, using `getBoundingClientRect()`. If the user scrolls the container while the dropdown is open, the dropdown stays at the original position.
- Files: `src/components/health/admin/ActionItems.tsx:55–63`
- Trigger: Open a resolve dropdown, then scroll the action items area.
- Workaround: Close and reopen the dropdown.

**`eslint-disable-next-line react-hooks/exhaustive-deps` suppresses a legitimate dep in `ActionItems`:**
- Symptoms: `handleResolution` in `ActionItems.tsx` line 140 uses `useCallback` with an empty deps array and a lint suppression. The `dismiss` function called inside it closes over `cardState` via `updateCard`, which is not stable across renders.
- Files: `src/components/health/admin/ActionItems.tsx:140–147`
- Trigger: Rapid multi-card resolution interactions.
- Workaround: None actively.

## Security Considerations

**No authentication or authorization:**
- Risk: The app has no login gate, no session management, and no route guards. All routes are publicly accessible. The "View As" user switcher in `Health.tsx` is purely presentational — switching users only changes the filter, not any permission boundary.
- Files: `src/App.tsx`, `src/pages/Health.tsx:30–35`
- Current mitigation: None.
- Recommendations: Before any production deployment, add an auth provider (e.g., Supabase Auth, Auth0) and protect routes via a guard component wrapping the `<Route element={<AppLayout />}>` parent.

**User PII exposed in client-side JSON:**
- Risk: `src/data/users.json` contains employee names, emails, roles, and site assignment lists. `src/data/accounts.json` contains client contact names, phone numbers, emails, and addresses. All of this is bundled into the client JS bundle.
- Files: `src/data/users.json`, `src/data/accounts.json`
- Current mitigation: Data is demo/mock only.
- Recommendations: Move all PII to server-side API responses behind authentication before production use. Never ship real contact data in the frontend bundle.

**`loggedBy` field accepts arbitrary free-text with no validation:**
- Risk: `EventLogForm.tsx` hardcodes `'Current User'` but the field is typed as a plain string on `HealthEvent`. When this is made dynamic, unsanitized user input would be stored and displayed in the event log.
- Files: `src/components/health/admin/EventLogForm.tsx:86`, `src/types/health.ts:111`
- Current mitigation: Currently hardcoded, so not exploitable.
- Recommendations: Bind `loggedBy` to the authenticated user identity from auth context rather than any user-supplied string.

## Performance Bottlenecks

**All JSON loaded synchronously at module import time:**
- Problem: `accounts.json`, `sites.json`, and `events.json` are all imported synchronously via static `import` at the top of `src/data/mockDataLoader.ts`. `buildHealthScores()` and `buildAccounts()` run eagerly when the module is first loaded, including `computeLiveScore` for all 54 sites.
- Files: `src/data/mockDataLoader.ts:10–18`, `src/data/mockDataLoader.ts:142–144`
- Cause: Static module-level exports (`accountHealthScores`, `accounts`) ensure the full computation runs before any component mounts.
- Improvement path: Move to lazy loading with `import()` or replace with async fetch hooks so computation is deferred and data can be paginated server-side.

**`computeLiveScore` runs for all 54 sites on every `buildHealthScores()` call:**
- Problem: Every call to `buildHealthScores()` (currently called once at module load) iterates all sites and runs the full event-scoring loop for each. If this were called reactively (e.g., on config change), it would recompute all 54 scores synchronously on the main thread.
- Files: `src/data/mockDataLoader.ts:68–105`, `src/utils/healthScoring.ts`
- Cause: No memoization or per-site caching exists. `ScoringConfig` changes in `Health.tsx` only affect the single selected deal's live display, not the list — but a future refactor that passes `scoringConfig` into `buildHealthScores` would trigger this.
- Improvement path: Add per-deal memoization keyed by `(dealId, configHash, eventCount)`.

**`AccountHealthList` groups and sorts on every render:**
- Problem: The grouping logic in `AccountHealthList.tsx` builds a fresh `grouped` array from scratch on every render using a `for` loop with nested `.filter()` calls. This runs O(n²) over accounts.
- Files: `src/components/health/admin/AccountHealthList.tsx:51–67`
- Cause: The grouping is not wrapped in `useMemo`.
- Improvement path: Wrap the grouping and sort in `useMemo([accounts])`.

**`WeeklyRecap` and `WeeklyReportModal` duplicate date-bucketing logic:**
- Problem: Both `src/components/health/admin/WeeklyRecap.tsx` and `src/components/health/admin/WeeklyReportModal.tsx` implement near-identical `getISOWeekStart`, `buildWeekGroups`/`buildWeeks`, and `formatDate` functions independently.
- Files: `src/components/health/admin/WeeklyRecap.tsx:11–50`, `src/components/health/admin/WeeklyReportModal.tsx:14–55`
- Cause: No shared utility module for date bucketing.
- Improvement path: Extract to `src/utils/dateUtils.ts` and import in both components.

## Fragile Areas

**`mockDataLoader.ts` pre-built exports are module-level singletons:**
- Files: `src/data/mockDataLoader.ts:142–144`
- Why fragile: `accountHealthScores` and `accounts` are computed once when the module is first imported and then frozen for the lifetime of the session. Any page that adds a new event (via `localEvents` state in `HealthDetail`) operates on a local copy that never propagates back to the singleton. The list sidebar and the detail panel can display divergent data.
- Safe modification: Keep local event state within `HealthDetail` component and recompute derived scores locally as currently done. Do not reference the singleton scores from within `HealthDetail`.
- Test coverage: None. No tests exist for the data assembly or scoring engine.

**`AccountDetail` relies on URL param matching against mock data IDs:**
- Files: `src/pages/AccountDetail.tsx:23`
- Why fragile: `accounts.find(a => a.id === id)` silently falls back to `accounts[0]` when the param doesn't match. Any change to the ID schema in mock data breaks navigation without any visible error.
- Safe modification: Add explicit null handling and render a "Not found" state instead of falling back.
- Test coverage: None.

**`Health.tsx` user ID hardcoded as initial state:**
- Files: `src/pages/Health.tsx:30`
- Why fragile: `useState<string>('user-004')` hardcodes a specific user ID from `users.json`. If the JSON is restructured or IDs change, the page silently falls back to `usersJson[0]`.
- Safe modification: Use the first user in the list as default rather than a magic ID string.
- Test coverage: None.

## Scaling Limits

**Static JSON data layer:**
- Current capacity: Works for the ~54 sites and ~20 accounts in the current mock dataset.
- Limit: Browser memory and bundle size limit growth. At 500+ sites, the initial JSON parse and scoring loop would cause noticeable startup latency.
- Scaling path: Replace static JSON with paginated API endpoints. Implement server-side scoring or cache computed scores.

**No state management library:**
- Current capacity: Local `useState` per component works for the current scope.
- Limit: Once real API integration is added, sharing data (e.g., a newly logged event appearing in both the sidebar list and the detail panel) will require prop drilling or context, which will be complex given the current component tree depth.
- Scaling path: Introduce React Query (already installed as `react-hook-form` is present — check if TanStack Query is available) or a lightweight global store (Zustand) to cache API responses and share mutations.

## Missing Critical Features

**No 404 / error boundary handling:**
- Problem: No error boundaries exist anywhere in the component tree. A runtime error in any component would crash the entire app with a blank screen. No 404 route is defined in `src/App.tsx`.
- Blocks: Safe production deployment.

**No loading states:**
- Problem: All data is synchronously available from the mock layer, so no loading UI exists. When the API layer is added, every data-consuming page will need skeleton or spinner states added.
- Blocks: API integration work.

**Settings page is entirely unimplemented:**
- Problem: `src/pages/Settings.tsx` renders placeholder text ("coming soon") for all sections except General. General form has no submit handler — the "Save Changes" button renders but calls no function.
- Files: `src/pages/Settings.tsx:54–58`
- Blocks: Any admin configuration features (Notifications, Integrations, Billing).

**CriterionRating / survey flow types defined but not used in active screens:**
- Problem: `src/types/health.ts` defines `PreJobSurveyResponse`, `PostJobSurveyResponse`, `CriterionRating`, and survey-related interfaces. None of the active screen components read `recentSurveys` or `preJobSurveys` from `AccountHealthScore` in the admin view. The mobile flow's old survey screens were deleted (noted in git status as deleted files).
- Files: `src/types/health.ts:59–85`, `src/types/health.ts:197–198`
- Blocks: Survey-driven health scoring features.

## Test Coverage Gaps

**Zero application tests:**
- What's not tested: The entire application — scoring engine, data assembly, UI components, routing.
- Files: All of `src/`
- Risk: The scoring engine (`src/utils/healthScoring.ts`) contains the core business logic for tier classification, incident overrides, time decay, and window-based penalties. Bugs here directly affect the data users base decisions on. Any refactor is risky without a test harness.
- Priority: High — start with unit tests for `computeLiveScore` in `src/utils/healthScoring.ts` and `buildHealthScores` / `buildAccounts` in `src/data/mockDataLoader.ts`, as these are pure functions with no DOM dependencies.

---

*Concerns audit: 2026-03-25*
