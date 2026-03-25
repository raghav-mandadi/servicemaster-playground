# Health Check Scoring Values
**Source:** Health_Check_Scoring.xlsx (Devin's weighted scoring system)
**Version:** 1.0
**Last Updated:** 2026-03-23
**Audience:** Claude Code — use this to implement scoring logic and configure default template values

---

## How to use this file

This document translates Devin's Excel lookup tables into implementable scoring rules. All values here represent the **default template** — the proven system built from 30+ years of franchise operations experience. These values should be:
- Stored as configurable defaults in the template system
- Editable by admins per the template builder (see design requirements doc)
- The starting point for any new franchise that subscribes

---

## 1. Activity Categories & Sub-Types

There are 4 main activity categories. Each has sub-types with individual weights.

### Category Codes
| Code | Category Name |
|---|---|
| V | Visit |
| S | Survey |
| Q | QC (Quality Check) |
| I | IAC (Internal Account Check) |

---

### Visits (V)
Visits are scored by the ServiceMaster employee. They assign a G / Y / R score.

| Sub-Type Code | Description | Weight |
|---|---|---|
| V1 | Visit — In Person | 3 |
| V2 | Visit — Phone | 3 |
| V3 | Visit — Email | 1 |
| V4 | Visit — Sales | 2 |

---

### Surveys (S)

| Sub-Type Code | Description | Weight |
|---|---|---|
| S1 | Survey — Corporate NPS | 2 |
| S2 | Survey — In House | 3 |
| S3 | *(reserved/unlabeled)* | — |

---

### Quality Checks / QC (Q)

| Sub-Type Code | Description | Weight |
|---|---|---|
| Q1 | QC — CQI (Cleaning Quality Inspection) | 2 |
| Q2 | QC — Customer Complaint | 3 |
| Q3 | QC — Customer Request | 2 |
| Q4 | QC — Manager Request | 1 |

---

### IAC — Internal Account Check (I)

| Sub-Type Code | Description | Weight |
|---|---|---|
| I1 | IAC — New Cleaner | 3 |
| I2 | IAC — Alarm | 1 |
| I3 | IAC — Risk Level | 4 |
| I4 | IAC — New Contact Person | 4 |

---

## 2. Score Value Lookup (G / Y / R)

Used for mapping numeric scores to color thresholds.

| Value | Color |
|---|---|
| 1 | R (Red) |
| 2 | Y (Yellow) |
| 3 | G (Green) |
| No Data | Caution |

---

## 3. CQI / Survey Score → Color Threshold

Maps a percentage score (0–100) to a Red / Yellow / Green status.

| Score % | Color |
|---|---|
| 100 | G |
| 99 | G |
| 98 | G |
| 97 | G |
| 96 | G |
| 95 | G |
| 94 | G |
| 93 | G |
| 92 | G |
| 91 | G |
| 90 | G |
| 89 | G |
| 88 | G |
| 87 | G |
| 86 | G |
| **85** | **Y** |
| 84 | Y |
| 83 | Y |
| 82 | Y |
| 81 | Y |
| 80 | Y |
| 79 | Y |
| 78 | Y |
| 77 | Y |
| 76 | Y |
| 75 | Y |
| 74 | Y |
| 73 | Y |
| 72 | Y |
| 71 | Y |
| 70 | Y |
| **69** | **R** |
| 68 and below | R |

**Summary thresholds:**
- Green: 86–100%
- Yellow: 70–85%
- Red: 0–69%

---

## 4. System-Wide Strength — Time Decay Weights

As issues get older, their contribution to the health score is reduced. This applies system-wide to how much weight an event carries based on how many days ago it occurred.

| Days Passed | Date Weight (multiplier) |
|---|---|
| 1 | 1.00 |
| 30 | 0.90 |
| 45 | 0.80 |
| 60 | 0.60 |
| 90 | 0.40 |
| 180 | 0.15 |
| 360 | 0.10 |

> Events older than 360 days carry a weight of 0.10 — still present but minimal impact.

---

## 5. Survey / CQI Score Weight — Time Decay

Survey and CQI scores are also reduced in influence as time passes.

| Days Ago | Weight Reduction |
|---|---|
| 1 | 0.95 |
| 30 | 0.90 |
| 60 | 0.85 |
| 90 | 0.85 |
| 120 | 0.75 |
| 150 | 0.70 |
| 180 | 0.60 |
| 360 | 0.20 |

---

## 6. Customer Complaints — Color by Age

Tracks the color status based on days since the **1st complaint** and days since the **2nd complaint**.

### 1st Complaint (days since logged)
| Days Since 1st Complaint | Color |
|---|---|
| 0 | G |
| 30 | Y |
| 60 | Y |
| 90 | G |
| 120 | G |
| 180 | G |

### 2nd Complaint (days since logged)
| Days Since 2nd Complaint | Color |
|---|---|
| 0 | G |
| 30 | R |
| 60 | R |
| 90 | Y |
| 120 | G |
| 180 | G |

> **Note:** A second complaint drives the status to Red for up to 60 days, then recovers to Yellow, then Green. A first complaint alone goes Yellow briefly then recovers.

---

## 7. Customer Requests — Color by Age

### 1st Request (days since logged)
| Days Since 1st Request | Color |
|---|---|
| 0 | G |
| 30 | Y |
| 60 | G |
| 90 | G |
| 120 | G |
| 180 | G |

### 2nd Request (days since logged)
| Days Since 2nd Request | Color |
|---|---|
| 0 | G |
| 30 | Y |
| 60 | G |
| 90 | G |
| 120 | G |
| 180 | G |

> Requests are treated more leniently than complaints — Yellow at 30 days if unresolved, then recovers.

---

## 8. ServiceMaster Manager Requests — Color by Age

| Days Since Request | Color |
|---|---|
| 0 | G |
| 30 | Y |
| 60 | G |
| 90 | G |
| 120 | G |
| 180 | G |

---

## 9. New S/M Cleaner in Account — Color by Age

When a new cleaner is assigned to a site, the account is elevated to Red immediately and gradually recovers.

| Days Since New Cleaner | Color |
|---|---|
| 0 | R |
| 7 | Y |
| 30 | Y |
| 45 | G |
| 60 | G |
| 90 | G |
| 120 | G |
| 150 | G |
| 180 | G |

> **Red for first 7 days.** Yellow for days 7–44. Green from day 45 onward if no other issues.

---

## 10. New Customer Contact Person — Color by Age

When a new contact person is identified at the client site, the account goes Red immediately. This is a high churn-risk event.

| Days Since New Contact | Color |
|---|---|
| 1 | R |
| 20 | R |
| 30 | R |
| 45 | R |
| 60 | Y |
| 90 | G |
| 120 | G |
| 150 | G |
| 180 | G |

> **Red for first 60 days.** Yellow for days 60–89. Green from day 90 onward if no other issues. This is the longest-lasting automatic red trigger in the system.

---

## 11. Days Since Last RYG Was Logged — Overall Weight Adjustment

If no health check event has been logged recently, the overall score is adjusted downward. This ensures stale accounts don't stay artificially green.

| Days Since Last Log | Weight Adjustment |
|---|---|
| 1 | 3.00 |
| 15 | 2.50 |
| 30 | 2.00 |
| 45 | 1.50 |
| 90 | 1.00 |
| 75 | 1.00 |
| 90 | 1.00 |
| 120 | 1.00 |
| 150 | 0.50 |
| 180 | 0.50 |
| 210 | 0.25 |
| 240 | 0.25 |
| 270 | 0.25 |
| 300 | 0.25 |
| 330 | 0.25 |
| 360 | 0.25 |

> The longer an account goes without any logged activity, the less weight is applied to any existing score — nudging it toward a "Caution" state.

---

## 12. Designer / Developer Notes

### What "No Data" means
The spreadsheet uses a "No Data / Caution" state. This should be surfaced in the UI distinctly from Green — it means the account has not had enough activity logged to produce a reliable score. Do not let it render as Green.

### Complaint volume matters separately
The color-by-age tables above cover *time-based decay per complaint*. But the total number of complaints over a rolling window (30/60/90 days) is a **separate scoring input** — referenced in the discovery meeting but the exact weighting formula is still TBD (Devin to share). Implement the time-decay tables now; the volume penalty formula will be added in a future update.

### Sub-type weights are relative
The weights (1–4) in Section 1 are relative importance values within their category, not absolute point values. How they combine into a final score requires the full formula from Devin's weighting document (pending).

### Unresolved items
- [ ] Devin to share full weighting formula (how sub-type weights combine into a 0–100 score)
- [ ] Confirm whether complaint volume (e.g. 3 complaints in 60 days) has its own separate point penalty beyond the per-complaint time decay

---

## 13. Implementation Status (as of 2026-03-23)

### ✅ Implemented
- **§4 Time decay multiplier** — Applied to complaints, requests, visits, QC inspections, project outcomes via `getTimeDecayMultiplier()` using linear interpolation. Toggle in Scoring Rules panel.
- **§9 New Cleaner windows** — Corrected to Red 0–7d, Yellow 7–44d, Green 45+d (was incorrectly 0–15d/15–30d). Both windows are now configurable in Scoring Rules panel.
- **§10 New Contact windows** — Corrected to Red 0–59d, Yellow 60–89d, Green 90+d (was incorrectly 0–30d/30–60d). Both windows configurable.
- **§3 CQI thresholds** — Correct: ≥86 = Pass (Green), 70–85 = Needs Attention (Yellow), ≤69 = Fail (Red).
- **Sensitive event decay** — Decay window (days) is now configurable (default: 30). Previously hardcoded.
- **All scoring values configurable** — `ScoringConfig` + Scoring Rules admin panel. Includes time windows, deductions, bonuses, thresholds.

### ⏳ Pending
- **Full sub-type weighting formula** — How weights (1–4) from §1 combine into a 0–100 score. Current model uses flat point deductions per event type.
- **Complaint volume formula** — Volume-based penalty (e.g. 3 complaints in 60 days) is separate from per-complaint decay. Formula TBD.
- **"No Data / Caution" tier** — 4th tier for sites with insufficient activity. Not yet implemented.
- **Staleness weight** (§11) — Score degradation for sites with no logged activity. Curves defined; formula for combining with score TBD.
- **Survey/CQI score weight decay** (§5) — Separate decay curve for CQI scores (not the same as the event age decay in §4). TBD once full formula is confirmed.

---

*Increment version number and update Last Updated date when any values are revised.*
