# Requirements: ServiceMaster Health Monitoring Platform

**Defined:** 2026-03-25
**Core Value:** Every screen shows consistent, trustworthy data for the active location

## v1 Requirements

### Tenant

- [ ] **TENANT-01**: User can switch between Indianapolis and Chicago tenants from the sidebar
- [ ] **TENANT-02**: Active tenant is persisted to localStorage and restored on page refresh
- [ ] **TENANT-03**: All pages and components display only data belonging to the active tenant
- [ ] **TENANT-04**: Accounts and sites in JSON data are tagged with a tenant identifier (indianapolis | chicago)
- [ ] **TENANT-05**: Tenant context is provided via React Context so all components can access the active tenant without prop drilling

### Data

- [x] **DATA-01**: All pages (Accounts, Health, Dashboard, Users) import from a single data loader (`mockDataLoader.ts`) — no parallel data sources
- [ ] **DATA-02**: Accounts displayed on the Accounts page match exactly the accounts displayed on the Health page
- [x] **DATA-03**: User data consolidated to a single schema — `users.json` is the canonical source; `mockData.ts` user list retired
- [x] **DATA-04**: `riskProfile` fields derived dynamically from events rather than hardcoded in `sites.json`

### Cleanup

- [x] **CLEAN-01**: Orphaned imports and type references from deleted mobile survey screens removed (ComplaintForm, CriteriaConfirm, CriteriaSelect, CriterionRate, FeedbackForm, GutCheck, HomeScreen, PostJobIntro, RecurringSurvey, ThankYou, WelcomeScreen)
- [x] **CLEAN-02**: Unused types in `src/types/health.ts` related to deleted survey flow removed or clearly marked as deferred
- [ ] **CLEAN-03**: `src/data/healthMockData.ts` removed if unused (deleted in git status)
- [x] **CLEAN-04**: Dead exports and unused constants from `src/data/mockData.ts` cleaned up

### Context

- [ ] **CTX-01**: `CLAUDE.md` created with architectural overview, data layer conventions, tenant model, and component map so Claude maintains awareness across sessions
- [ ] **CTX-02**: Memory files created under `.claude/projects/` capturing user profile, project context, and key decisions

## v2 Requirements

### Data

- **DATA-V2-01**: Async data hooks wrapping `buildHealthScores()` and `buildAccounts()` — prep for API swap-in
- **DATA-V2-02**: `trend` field computed dynamically by diffing current score against 30-day-ago score
- **DATA-V2-03**: `ScoringConfig` persisted to localStorage on change

### Cleanup

- **CLEAN-V2-01**: `supply_delivery` event type scoring implemented with overdue penalty
- **CLEAN-V2-02**: `ActionItems` dismissal persisted to localStorage
- **CLEAN-V2-03**: `loggedBy` bound to active user context instead of hardcoded 'Current User'

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real backend / API integration | Future milestone — data layer swap-in |
| Authentication / route guards | Future milestone |
| Settings page implementation | Not health monitoring scope |
| Test coverage | Dedicated testing phase |
| `AccountDetail` 404 handling | Minor — not blocking health monitoring |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TENANT-01 | Phase 2 | Pending |
| TENANT-02 | Phase 2 | Pending |
| TENANT-03 | Phase 2 | Pending |
| TENANT-04 | Phase 2 | Pending |
| TENANT-05 | Phase 2 | Pending |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 1 | Complete |
| CLEAN-01 | Phase 1 | Complete |
| CLEAN-02 | Phase 1 | Complete |
| CLEAN-03 | Phase 1 | Pending |
| CLEAN-04 | Phase 1 | Complete |
| CTX-01 | Phase 3 | Pending |
| CTX-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after initial definition*
