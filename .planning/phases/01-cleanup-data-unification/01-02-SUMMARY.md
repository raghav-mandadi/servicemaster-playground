---
phase: 01-cleanup-data-unification
plan: 02
subsystem: data
tags: [typescript, data-layer, mock-data, risk-profile, users, templates]

# Dependency graph
requires:
  - phase: 01-cleanup-data-unification-01
    provides: "Canonical User type (userId/FieldRole/assignedSiteIds) and cleaned health types"
provides:
  - "mockDataLoader.ts exports users (from users.json), templates (inline), recentActivity (inline)"
  - "riskProfile computed from events.json data — no longer read from sites.json"
  - "Single import point for all app data: accountHealthScores, accounts, users, templates, recentActivity"
affects: [03-page-migration, all pages importing from mockData.ts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "riskProfile derivation: events12m filter -> incidentCount12m -> watchlist (>= 2) at load time in buildHealthScores()"
    - "users.json cast to User[] via as assertion — safe because types match exactly (userId, name, email, role: FieldRole, assignedSiteIds)"
    - "templates and recentActivity defined inline in mockDataLoader.ts as named exports — no secondary JSON file needed"

key-files:
  created: []
  modified:
    - src/data/mockDataLoader.ts

key-decisions:
  - "Do not read riskProfile from sites.json — compute from events.json at load time so it's always consistent with event data"
  - "Use inline template data (copied from mockData.ts) rather than templates.json — templates.json is scoring config, not service templates"
  - "Define ActivityItem interface inline in mockDataLoader.ts — no separate type file needed for this simple shape"
  - "watchlist threshold is incidentCount12m >= 2 (complaint or sensitive_event types only)"

patterns-established:
  - "Event-derived riskProfile: all risk metrics computed from the events array, not stored in sites.json"
  - "mockDataLoader.ts as single import point: pages import only from this file, not mockData.ts"

requirements-completed: [DATA-01, DATA-04, CLEAN-04]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 01 Plan 02: Data Layer Migration Summary

**mockDataLoader.ts extended to single source of truth: users from users.json, templates/recentActivity inline, and riskProfile computed dynamically from events.json instead of passthrough from sites.json**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-25T10:35:42Z
- **Completed:** 2026-03-25T10:37:10Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Replaced `riskProfile: site.riskProfile` passthrough with dynamic computation from existing `events` array: `eventCount12m`, `incidentCount12m`, `lastEventAt`, `watchlist` (>= 2 incidents), `watchlistReason`
- Removed `riskProfile` field from `RawSite` interface — sites.json's riskProfile field is now ignored by the loader
- Added `import usersJson from './users.json'` and exported `users: User[]` via safe `as User[]` cast
- Added inline `templates: Template[]` export (migrated data from mockData.ts, same field values)
- Added `ActivityItem` interface and `recentActivity: ActivityItem[]` export (migrated from mockData.ts)
- TypeScript compiles cleanly for mockDataLoader.ts; expected errors confined to mockData.ts and Users.tsx (deferred to Plan 03)

## Task Commits

Each task was committed atomically:

1. **Task 1: Derive riskProfile dynamically in buildHealthScores()** - `718ed16` (feat)
2. **Task 2: Add users, templates, and recentActivity exports** - `d5b2b95` (feat)

## Files Created/Modified

- `src/data/mockDataLoader.ts` - Added riskProfile computation, users/templates/recentActivity exports, usersJson import, User+Template type imports

## Decisions Made

- Computed riskProfile from events — event data already available in `events` constant inside `buildHealthScores()`, so no second pass over events.json is needed; computation is a simple filter chain
- Used inline template data from mockData.ts rather than templates.json because templates.json is a scoring config schema, not the service template list the UI expects
- Defined `ActivityItem` interface locally in mockDataLoader.ts — no justification for a separate type file for a 3-field shape
- `watchlist` threshold is `incidentCount12m >= 2` matching the comment in the `RiskProfile` interface in health.ts

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — this plan adds data exports only. All exports provide real data from JSON or migrated inline values. No placeholder values flow to UI.

## Next Phase Readiness

- `mockDataLoader.ts` now exports all 5 entity types needed by pages
- Plan 03 (page migration) can drop `import { users } from '../data/mockData'` and `import { templates } from '../data/mockData'` and replace with `mockDataLoader.ts` imports
- TypeScript will automatically validate correctness when Plan 03 updates `Users.tsx` and other pages — the `FieldRole` type constraint will catch any residual old-schema usage

## Self-Check: PASSED

- src/data/mockDataLoader.ts: FOUND
- 01-02-SUMMARY.md: FOUND
- Commit 718ed16 (Task 1): FOUND
- Commit d5b2b95 (Task 2): FOUND

---
*Phase: 01-cleanup-data-unification*
*Completed: 2026-03-25*
