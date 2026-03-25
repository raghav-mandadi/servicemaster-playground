---
phase: quick-260325-cop
plan: "01"
subsystem: health-admin
tags: [event-logging, modal, site-picker, portal]
dependency_graph:
  requires: []
  provides: [GlobalEventLogModal, Health.Log-Event-button]
  affects: [src/pages/Health.tsx, src/components/health/admin/HealthDetail.tsx]
tech_stack:
  added: []
  patterns: [two-step-modal, createPortal, event-state-lifting]
key_files:
  created:
    - src/components/health/admin/GlobalEventLogModal.tsx
  modified:
    - src/pages/Health.tsx
    - src/components/health/admin/HealthDetail.tsx
decisions:
  - Store modal-added events in Health.tsx as Record<dealId, HealthEvent[]> passed to HealthDetail via extraEventsByDeal prop — avoids global state and keeps HealthDetail the single source of truth for its activity log
  - Pass liveAccountScores (full unfiltered list) to GlobalEventLogModal so all sites are always searchable regardless of My Sites filter toggle
  - Back button in step 2 preserves query state so returning to step 1 restores the filtered site list without re-typing
metrics:
  duration_minutes: 8
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_changed: 3
---

# Quick Task 260325-cop: Add Top-Level Event Logger Modal with Site Picker Summary

**One-liner:** Two-step portal modal (site search picker + EventLogForm) wired to a teal "Log Event" button in the Health page top bar, with events surfacing in the selected site's Activity Log.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create GlobalEventLogModal component | 8ecc014 | src/components/health/admin/GlobalEventLogModal.tsx (created) |
| 2 | Wire Log Event button into Health.tsx top bar | d7e7baf | src/pages/Health.tsx, src/components/health/admin/HealthDetail.tsx |

## What Was Built

**GlobalEventLogModal** (`src/components/health/admin/GlobalEventLogModal.tsx`):
- Step 1: Scrollable site list with real-time search filtering by account name or primary contact name (case-insensitive)
- Each row shows tier dot, account name, deal name + contact name, and a tier badge (color-coded per TIER_COLOR map)
- Empty-state message when no sites match the query
- Step 2: EventLogForm rendered for the selected site, with breadcrumb pill showing "accountName · dealName"
- Back button returns to step 1 with query preserved (no state reset)
- X button and backdrop click both close the modal
- Submit handler assembles a full HealthEvent (id, dealId, loggedAt) and calls onAddEvent, then onClose

**Health.tsx changes:**
- Added `Plus` to lucide-react imports; added `GlobalEventLogModal` import; added `import type { HealthEvent }` import
- New state: `showGlobalLogEvent`, `modalEventsByDeal: Record<string, HealthEvent[]>`
- `liveAccountScores` constant (alias for unfiltered `accountHealthScores`) passed to modal
- `handleAddEvent(dealId, event)` prepends event to per-deal array in `modalEventsByDeal`
- Top bar right side: teal "Log Event" button before "Scoring Rules" button, both wrapped in a flex row
- GlobalEventLogModal rendered conditionally at bottom of return

**HealthDetail.tsx changes:**
- Added `extraEventsByDeal?: Record<string, HealthEvent[]>` prop to `HealthDetailProps` interface
- `DealDetail` receives `extraEvents: HealthEvent[]` prop (default `[]`)
- `allEvents` useMemo now prepends `extraEvents` so events logged via the global modal appear in the Activity Log immediately when the user selects that site

## Deviations from Plan

### Auto-added Functionality

**1. [Rule 2 - Missing critical functionality] Pass modal events to HealthDetail activity log**
- **Found during:** Task 2
- **Issue:** Plan described `handleAddEvent` and `liveAccountScores` in Health.tsx but did not specify how modal-added events would appear in the Activity Log (success criterion 9 requires them to appear)
- **Fix:** Added `extraEventsByDeal` prop to HealthDetail and `extraEvents` prop to DealDetail; prepend extraEvents in allEvents useMemo
- **Files modified:** src/components/health/admin/HealthDetail.tsx
- **Commit:** d7e7baf

## Known Stubs

None — all data flows from the real liveAccountScores array; submitted events are fully formed HealthEvent objects that appear in the Activity Log immediately.

## Self-Check: PASSED

- [x] `src/components/health/admin/GlobalEventLogModal.tsx` exists
- [x] Commit 8ecc014 exists
- [x] Commit d7e7baf exists
- [x] `npm run build` passes (tsc + vite build, 0 errors)
