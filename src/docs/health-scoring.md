# Health Scoring Module — Technical Reference

**Version:** 2.0
**Scope:** Janitorial sites
**Last Updated:** 2026-03-23
**Source of truth:** `health-check-scoring-values.md` (Devin's Excel) + `health-check-design-requirements.md`

---

## Overview

The Health Scoring module gives ServiceMaster employees a real-time view of site health. Each site has a score (0–100) computed from a log of employee-reported events. Supervisors and CS staff log events directly; the score updates immediately.

**Admin console:** Split-panel — left = site list + drill-down detail; right = field staff mobile preview.

---

## Data Hierarchy

```
Parent Company (optional grouping)
  └── Site  ← atomic unit of health scoring (one physical place, one supervisor, one score)
```

- All scoring happens at the **site** level; parent company is a roll-up view only.
- One site = one `AccountHealthScore` record in the data layer.
- Multiple sites can share a parent company (`accountId`).

---

## Scoring Model

**Base score: 100 points.** Events add or subtract from this base. Score is clamped to 0–100.

### Tier Thresholds (configurable)
| Score | Tier | Label |
|---|---|---|
| ≥ 70 | Green | Healthy |
| 40–69 | Yellow | Needs Attention |
| 0–39 | Red | At Risk |

### Incident Override
Any open `sensitive_event` with outcome `'red'` forces the tier to Red regardless of numeric score. The score is still computed accurately but the displayed tier is locked until resolved.

---

## System-Wide Time Decay

Per `health-check-scoring-values.md` §4, all events (except window-based ones) have their impact reduced as they age. This is a multiplier applied to the base deduction/bonus.

| Days Old | Multiplier |
|---|---|
| 1 | 1.00 |
| 30 | 0.90 |
| 45 | 0.80 |
| 60 | 0.60 |
| 90 | 0.40 |
| 180 | 0.15 |
| 360 | 0.10 |

Values between control points are linearly interpolated.

**Applies to:** complaints, customer/SM requests, customer visits, QC inspections, project outcomes.
**Does NOT apply to:** `sensitive_event` (uses its own linear decay), `new_cleaner`, `new_contact` (window-based).

The decay multiplier can be toggled off per template in the Scoring Rules panel.

---

## Event Types & Scoring Rules

### Complaint
- Severity: Low / Medium / High
- Open complaint → flat deduction × time decay multiplier
- Default deductions: Low −8, Medium −12, High −18 pts
- Complaints persist and remain visible even after a positive visit

### Sensitive Event
- Set by ops manager only; no forced subtype pick list
- Impact level: **Red** (forces tier override + deduction), **Yellow** (deduction only), **None** (record only)
- Deduction decays linearly to 0 over `sensitiveEventDecayDays` (default: 30 days)
- Red outcome triggers `incidentOverride = true` → tier locked to Red until resolved
- Default: Red −15, Yellow −8

### Customer Request / SM Request
- Per open/overdue request: Customer −6, SM −5
- Impact reduced by time decay multiplier as request ages

### New Cleaner Assigned
Window-based (per scoring doc §9). Configurable day thresholds:

| Window | Default Range | Deduction |
|---|---|---|
| Red | 0–7 days | −12 |
| Yellow | 7–44 days | −6 |
| Green | > 44 days | 0 |

> **Design note:** New cleaner was previously modeled as 0–15d/15–30d. Updated to match Devin's Excel (0–7d Red is the correct field experience window).

### New Contact Person
Window-based (per scoring doc §10). **Longest automatic Red trigger in the system.**

| Window | Default Range | Deduction |
|---|---|---|
| Red | 0–59 days | −10 |
| Yellow | 60–89 days | −5 |
| Green | > 89 days | 0 |

> **Design note:** New contact was previously modeled as 0–30d/30–60d. Updated to match Devin's Excel — high churn risk justifies the extended Red window.

### Customer Visit
5-tier sentiment scale (ops manager+ only; supervisor cannot log this event type):

| Sentiment | Value | Default Impact |
|---|---|---|
| Super Positive | `super_positive` | +10 |
| Positive | `positive` | +5 |
| Neutral | `neutral` | 0 |
| Negative | `negative` | −8 |
| Super Negative | `super_negative` | −15 |

Impact reduced by time decay as visit ages. **A positive visit does NOT suppress open complaints** — complaints remain visible and continue affecting the score.

### QC Inspection
Per scoring doc §3 thresholds:

| Score | Status | Default Impact |
|---|---|---|
| ≥ 86 | Pass (Green) | +5 |
| 70–85 | Needs Attention (Yellow) | −3 |
| ≤ 69 | Fail (Red) | −10 |

Impact reduced by time decay until next inspection.

### Project Outcome
Positive +5, Negative −10. Time decay applies.

### Supply Delivery
Neutral in current model (impact = 0 unless overdue — simplified for demo).

---

## Resolution Bonus

When any open event is marked resolved, a configurable bonus is added to the score (default: +4 pts). Resolution does not remove the event from history — it remains visible in the Activity Log with a "Resolved" indicator.

---

## Live Scoring

Sites with `liveScoring: true` compute their score in real-time from the event log rather than using a static stored score. This is used for the Broadway Tower demo deal and will be the model for all sites once the backend is connected.

The score reacts immediately to:
- New event logged
- Event resolved
- Scoring Rules config changed

---

## Scoring Configuration (Template System)

All scoring values are stored in `ScoringConfig` and editable via the **Scoring Rules** slide-over panel. Changes take effect immediately on all live-scored sites. This is the default template — franchises can build their own.

Key configurable fields:
- Tier thresholds (green/yellow cutoff scores)
- All deduction/bonus amounts
- New cleaner Red/Yellow day windows
- New contact Red/Yellow day windows
- Sensitive event decay days
- Time decay toggle (on/off)

---

## Unresolved Items (from scoring doc)

- [ ] Full weighting formula for combining sub-type weights (1–4) into a 0–100 score — Devin to share
- [ ] Complaint volume penalty formula (e.g. 3 complaints in 60 days) — TBD, to be added as a separate scoring input
- [ ] "No Data / Caution" tier — for sites with insufficient activity to produce a reliable score (do not render as Green)
- [ ] Staleness weight adjustment — accounts with no logged activity should drift downward; exact formula TBD

---

## File Structure

```
src/
  docs/
    health-scoring.md              ← This file (technical reference)
  pages/
    Health.tsx                     ← Main split-panel page + Scoring Rules state
  components/
    health/
      PhoneFrame.tsx               ← iPhone device frame
      MobileApp.tsx                ← Field staff mobile app (deals → detail → log event)
      eventMeta.ts                 ← EVENT_META: icons, labels, colors per event type
      mobile/
        DealListScreen.tsx         ← Mobile: list of assigned sites
        DealDetailScreen.tsx       ← Mobile: site detail + recent events
        EventLogScreen.tsx         ← Mobile: log event wrapper
        ContactScreen.tsx          ← Mobile: contact us
      admin/
        AccountHealthList.tsx      ← Sidebar: grouped site list with tier filter
        HealthDetail.tsx           ← Detail panel: score, activity log, signals
        ScoreGauge.tsx             ← Circular score gauge
        SignalRow.tsx              ← Signal row with status dot
        EventList.tsx              ← Activity log: open/resolved events, expand to details
        EventLogForm.tsx           ← Shared log-event form (desktop + mobile)
        ScoringRulesPanel.tsx      ← Admin slide-over for editing scoring config
  types/
    health.ts                      ← AccountHealthScore, HealthEvent, HealthTier, etc.
  data/
    healthMockData.ts              ← Mock accounts, sites, events
    scoringConfig.ts               ← ScoringConfig interface + DEFAULT_SCORING_CONFIG
  utils/
    healthScoring.ts               ← computeLiveScore() — pure scoring engine
```
