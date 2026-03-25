---
phase: quick
plan: 260325-5fu
subsystem: health-page
tags: [ui-cleanup, state-lift, localStorage, events, delete]
dependency_graph:
  requires: []
  provides: [live-reactive-scores, persistent-events, event-deletion, clean-event-data]
  affects: [Health.tsx, HealthDetail.tsx, AccountHealthList.tsx, EventList.tsx, events.json]
tech_stack:
  added: []
  patterns: [state-lifting, localStorage-persistence, useMemo-derived-state]
key_files:
  created: []
  modified:
    - src/data/events.json
    - src/pages/Health.tsx
    - src/components/health/admin/AccountHealthList.tsx
    - src/components/health/admin/HealthDetail.tsx
    - src/components/health/admin/EventList.tsx
decisions:
  - eventsMap keyed by dealId; initialized from localStorage with fallback to events.json
  - eventOverrides (in-progress/resolved status) kept as ephemeral local state in DealDetail — not persisted
  - Delete is immediate with no confirmation dialog per plan spec
  - liveAccountScores computed via useMemo in Health.tsx; replaces static accountHealthScores for all rendering
metrics:
  duration: ~12 minutes
  completed: "2026-03-25"
  tasks_completed: 2
  files_changed: 5
---

# Phase quick Plan 260325-5fu: Health Page Cleanup Summary

**One-liner:** Health page cleanup — trend markers removed, event state lifted to Health.tsx with localStorage persistence and live score reactivity, event deletion added.

## Tasks Completed

| # | Task | Commit | Key Changes |
|---|------|--------|-------------|
| 1 | Clear non-Lakewood events, remove trend markers, add delete to EventList | 73bd2c4 | events.json trimmed to 15 events; trend span removed from AccountHealthList and AccountSummary; Trash2 delete button added in expanded EventCard |
| 2 | Lift event state to Health.tsx for live reactivity and localStorage persistence | 47e0dfe | eventsMap state + localStorage hydration in Health.tsx; liveAccountScores useMemo; DealDetail receives events prop; onAddEvent/onDeleteEvent callbacks lifted |

## What Was Built

**events.json cleanup:** Trimmed from 188 events to exactly 15 events covering only Lakewood Office Park deal IDs (deal-001: 7 events, deal-002: 6 events, deal-006: 2 events). All other sites start with zero events.

**Trend markers removed:** The trend arrow `<span>` (`↑`/`↓` with delta value) was removed from AccountHealthList deal rows and from the AccountSummary deal list in HealthDetail. Only the score number remains.

**Event state lifted:** `eventsMap` (`Record<string, HealthEvent[]>`) now lives in Health.tsx. It initializes from `localStorage` (key `sm_health_events`) with fallback to `events.json` grouped by dealId. A `useEffect` persists on every change. `liveAccountScores` is a `useMemo` that maps `accountHealthScores` through `computeLiveScore(eventsMap[dealId], scoringConfig)`, meaning the left-panel list updates immediately when events are added or deleted.

**Event deletion:** `onDelete` prop added to `EventListProps` and `EventCardProps`. A `Trash2` button labeled "Delete event" appears at the bottom of the expanded card panel. Clicking it calls `onDeleteEvent` which filters the event from `eventsMap`, immediately updating the score in the sidebar.

**DealDetail simplified:** Removed `localEvents` state. Now receives `events` from parent and calls `onAddEvent`/`onDeleteEvent` callbacks. `eventOverrides` (in-progress/resolved status) stays local since those are ephemeral UI states that don't need persistence.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data flows are wired. Deletions and additions are reflected in both the event list and the live score immediately.

## Self-Check

- [x] `src/data/events.json` — 15 events, all dealId in [deal-001, deal-002, deal-006]
- [x] `src/pages/Health.tsx` — eventsMap state + localStorage + liveAccountScores
- [x] `src/components/health/admin/AccountHealthList.tsx` — trend markers removed
- [x] `src/components/health/admin/HealthDetail.tsx` — new props wired, DealDetail simplified
- [x] `src/components/health/admin/EventList.tsx` — onDelete prop + Trash2 button
- [x] Commits 73bd2c4 and 47e0dfe verified in git log
- [x] `npm run build` passes with 0 TypeScript errors

## Self-Check: PASSED
