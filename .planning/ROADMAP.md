# Roadmap: ServiceMaster Health Monitoring Platform

## Overview

Three phases turn the current codebase into a consistent, tenant-aware app. Phase 1 removes dead code and unifies the data layer so every page reads from one source. Phase 2 adds tenant context, tags the JSON data, and filters every view to the active location. Phase 3 captures the final architecture in memory files so Claude can maintain awareness across future sessions.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Cleanup & Data Unification** - Remove dead code and consolidate all pages to a single data loader
- [ ] **Phase 2: Tenant Context** - Add React Context, JSON tenant tags, sidebar switcher, and per-page filtering
- [ ] **Phase 3: Project Memory** - Create CLAUDE.md and memory artifacts for session continuity

## Phase Details

### Phase 1: Cleanup & Data Unification
**Goal**: Every page reads from one clean data source with no orphaned code
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04
**Success Criteria** (what must be TRUE):
  1. All pages (Accounts, Health, Dashboard, Users) import exclusively from `mockDataLoader.ts` — no other data file imports
  2. The Accounts page and Health page show the same set of accounts with no discrepancies
  3. The Users page displays users from `users.json` with correct roles and `assignedSiteIds`; the old `mockData.ts` user list is gone
  4. `riskProfile` data reflects computed event history, not hardcoded JSON values
  5. The codebase has no imports or type references pointing to deleted survey screens
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Update User type in types/index.ts and remove survey types from types/health.ts
- [ ] 01-02-PLAN.md — Extend mockDataLoader.ts: derive riskProfile from events, add users/templates/recentActivity exports
- [ ] 01-03-PLAN.md — Migrate Users.tsx, Dashboard.tsx, Templates.tsx to mockDataLoader.ts; retire mockData.ts

### Phase 2: Tenant Context
**Goal**: Users can switch between Indianapolis and Chicago and see only that location's data everywhere
**Depends on**: Phase 1
**Requirements**: TENANT-01, TENANT-02, TENANT-03, TENANT-04, TENANT-05
**Success Criteria** (what must be TRUE):
  1. A tenant switcher appears in the bottom-left sidebar; clicking it toggles between Indianapolis and Chicago
  2. After switching tenants and refreshing the page, the previously selected tenant is still active
  3. Every page (Accounts, Health, Dashboard, Users) shows only data tagged to the active tenant — no cross-tenant records appear
  4. Switching tenants requires no prop-drilling; components access the active tenant through React Context
**Plans**: TBD
**UI hint**: yes

### Phase 3: Project Memory
**Goal**: CLAUDE.md and memory artifacts exist so any new session can understand the architecture without re-reading code
**Depends on**: Phase 2
**Requirements**: CTX-01, CTX-02
**Success Criteria** (what must be TRUE):
  1. `CLAUDE.md` exists at the project root and describes the data layer conventions, tenant model, component map, and architectural constraints
  2. Memory files under `.claude/projects/` capture the user profile, project context, and key decisions
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Cleanup & Data Unification | 1/3 | In Progress|  |
| 2. Tenant Context | 0/TBD | Not started | - |
| 3. Project Memory | 0/TBD | Not started | - |
