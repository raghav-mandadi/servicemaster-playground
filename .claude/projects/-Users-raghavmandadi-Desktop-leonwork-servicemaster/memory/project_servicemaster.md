---
name: ServiceMaster Project Context
description: Core project context — what we're building, current milestone, key architectural decisions
type: project
---

## Project

ServiceMaster franchise operations app — React SPA for health monitoring across two franchise territories: **Indianapolis** and **Chicago**.

**Current milestone:** Foundational cleanup + tenant architecture (3 phases)

## Phase Status (as of 2026-03-25)

- **Phase 1 — Cleanup & Data Unification**: Not started
  - Remove dead code from deleted mobile survey screens
  - Unify all pages to import from `mockDataLoader.ts` only
  - Consolidate user schema to `users.json` as canonical source
  - Derive `riskProfile` dynamically from events

- **Phase 2 — Tenant Context**: Not started
  - Indianapolis / Chicago as two tenants
  - React Context for tenant state
  - Sidebar switcher (bottom-left, near profile/logout)
  - All data tagged by tenant; pages filter to active tenant
  - Persisted to localStorage

- **Phase 3 — Project Memory**: Not started
  - CLAUDE.md already created (committed 2026-03-25)
  - Memory files need populating

## Key Architecture Points

- Stack: React 18, TypeScript, Vite, React Router v6, Tailwind CSS — no backend
- Data layer: `src/data/mockDataLoader.ts` is the single data import point
- No global state library — module-level constants serve as read-only store
- Canonical user source: `src/data/users.json` (not `mockData.ts`)
- Canonical account/site source: `accounts.json` + `sites.json` via `mockDataLoader.ts`

## Planning Files

- `.planning/PROJECT.md` — full project context
- `.planning/REQUIREMENTS.md` — 15 v1 requirements
- `.planning/ROADMAP.md` — 3-phase roadmap
- `.planning/STATE.md` — current phase state
- `.planning/config.json` — YOLO mode, coarse granularity, plan_check + verifier enabled
