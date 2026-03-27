# ServiceMaster Operations — Health Monitoring Platform

## What This Is

A React SPA for ServiceMaster franchise operations, supporting two locations (Indianapolis and Chicago) as independent tenants. The app assists business operations with a focus on health monitoring — tracking account health scores, events, signals, and risk profiles across cleaning service sites. Admins switch between tenants from the sidebar; all data displayed is scoped to the active tenant.

## Core Value

Every screen shows consistent, trustworthy data for the active location — no orphaned mock data, no cross-tenant leakage, no page showing different accounts than another.

## Requirements

### Validated

- ✓ Health scoring engine (`computeLiveScore`) — computes per-site scores from events with time decay and tier classification — existing
- ✓ Admin health dashboard — `AccountHealthList`, `HealthDetail`, `EventList`, `EventLogForm`, `ScoreGauge`, `ScoringRulesPanel`, `WeeklyRecap`, `WeeklyReportModal` — existing
- ✓ Mobile field-staff preview — `MobileApp`, `DealListScreen`, `DealDetailScreen`, `EventLogScreen` inside phone frame modal — existing
- ✓ Core pages — Dashboard, Accounts, AccountDetail, Templates, Health, Users — existing
- ✓ Sidebar navigation with `AppLayout` shell — existing
- ✓ JSON-based mock data layer (`accounts.json`, `sites.json`, `events.json`, `users.json`) — existing
- ✓ Single data source — all pages import from `mockDataLoader.ts` only; `mockData.ts` retired — Phase 1
- ✓ Unified User schema — `users.json` canonical, `FieldRole` type, `assignedSiteIds` — Phase 1
- ✓ Computed `riskProfile` — derived from events dynamically, not hardcoded in `sites.json` — Phase 1
- ✓ Dead code removed — survey types, orphaned references from deleted mobile screens — Phase 1

### Active

- [ ] Tenant context — React context providing the active tenant (Indianapolis | Chicago); persisted to localStorage; accessible to all pages and components
- [ ] Tenant switcher UI — Bottom-left sidebar element (near profile/logout area) to switch between Indianapolis and Chicago
- [ ] Tenant-tagged data — Accounts and sites in JSON assigned to a tenant field; app filters all data to active tenant automatically
- [ ] Unified data source — All pages (Accounts, Health, Dashboard, Users) import from the same single data loader; no duplicate or parallel datasets
- [ ] Dead code removal — Orphaned type references, unused imports, and stale references from deleted mobile survey screens cleaned up
- [ ] CLAUDE.md + memory files — Project context document and memory artifacts so Claude maintains architectural awareness across sessions

### Out of Scope

- Real backend / API integration — This phase is mock-data only; API swap-in is a future milestone
- Authentication / route guards — No login gate this phase
- Settings page implementation — Placeholder remains; not this milestone
- `supply_delivery` scoring implementation — Stub stays; full implementation deferred
- ScoringConfig persistence — localStorage persistence of scoring config deferred
- Test coverage — Unit tests for scoring engine deferred to a dedicated testing phase

## Context

**Stack:** React 18, TypeScript, Vite, React Router v6, Tailwind CSS. No backend. No global state library — module-level constants in `mockDataLoader.ts` serve as the read-only data store.

**Data layer design:** `src/data/mockDataLoader.ts` is the documented swap point. `buildHealthScores()` and `buildAccounts()` join JSON at module load time and export named constants. The plan is to keep this pattern and wrap it in async hooks when the API layer arrives.

**Two user schemas exist today:** `src/types/index.ts` defines `User` with `UserRole` ('Admin' | 'Manager' | 'Rep'), while `src/data/users.json` uses snake_case roles (`gm`, `ops_manager`, `supervisor`, `cs`, `sales`). The `users.json` schema is the canonical one (has `assignedSiteIds`). The `mockData.ts` user list needs to be retired in favor of `users.json`.

**Deleted screens:** Several mobile survey screens were deleted (`ComplaintForm`, `CriteriaConfirm`, `CriteriaSelect`, `CriterionRate`, `FeedbackForm`, `GutCheck`, `HomeScreen`, `PostJobIntro`, `RecurringSurvey`, `ThankYou`, `WelcomeScreen`). Their type definitions and imports may still be referenced in the codebase.

**Tenant model:** Indianapolis and Chicago are two franchise territories. They share the same data schema but have separate accounts, sites, users, and events. Switching tenant reloads the filtered view — no data crosses tenant boundaries in the UI.

## Constraints

- **Tech Stack**: React + TypeScript + Vite — no new frameworks or state libraries introduced this phase
- **Data**: Mock JSON only — no network calls, no backend setup
- **Tenant persistence**: Active tenant stored in `localStorage` so it survives page refresh
- **Backward compat**: Existing URL structure (`/health`, `/accounts`, etc.) unchanged

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tenant via React Context | Avoids prop drilling; all pages need tenant access; no state library needed | — Pending |
| `users.json` as canonical user schema | Has `assignedSiteIds`, more complete; `mockData.ts` users are a subset | — Pending |
| Keep `mockDataLoader.ts` as single import point | Existing swap-point pattern is sound; all pages should import from here only | — Pending |
| Assign tenant field in JSON, filter at loader | Keeps filtering logic in one place; components stay tenant-unaware | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-25 after Phase 1 completion*
