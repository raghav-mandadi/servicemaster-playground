# Health Scoring System — Reference Skill

You are working on the ServiceMaster Clean health scoring system. This file is the single source of truth for all scoring rules, signal thresholds, tier definitions, and architecture decisions. Apply these rules exactly when implementing or modifying any health scoring feature.

---

## 1. Framework Overview

Health scoring operates at two levels: **portfolio** (dashboard) and **per-account/deal**. It surfaces as a Red / Yellow / Green tier backed by a numeric score (0–100).

**Three systems read from one event source (HealthEvents table):**
1. **Health scoring** — computes tier + numeric score per account and deal (current state)
2. **Task generation** — creates operational tasks for service staff (response)
3. **Reporting and prevention** — surfaces historical patterns (trend intelligence)

**Key principle:** A resolved incident does not erase history. `HealthEvents` is a permanent audit log — never delete records. Score decay and resolution affect current state only.

---

## 2. Score Tiers

| Tier   | Range  | Meaning                               |
|--------|--------|---------------------------------------|
| Green  | 70–100 | Healthy, no action needed             |
| Yellow | 40–69  | Needs attention — watch closely       |
| Red    | 0–39   | At risk — OR immediate incident flag  |

**Incident override:** Any open `HealthEvent` with `category: 'incident' | 'sensitive_event'` forces the account to **Red immediately**, regardless of numeric score. The score is still computed. Override clears when `resolvedAt` is set on the event AND no other open incidents remain.

---

## 3. Score Dimensions (Weighted Composite)

| Dimension           | What it measures                               | Primary signal source              |
|---------------------|------------------------------------------------|------------------------------------|
| `serviceQuality`    | Incident rate, customer satisfaction, repeats  | HealthEvents (tickets, incidents)  |
| `contractHealth`    | Deal stage, renewal proximity, value trend     | HubSpot deals via CRM adapter      |
| `activityRecency`   | Last service date, last deal activity          | HubSpot deal activity              |
| `customerEngagement`| Contact frequency, responsiveness             | HubSpot contacts and activity      |
| `issueResolution`   | Open vs. resolved events, task completion rate | HealthEvents + ServiceTasks        |

Weights are configurable — new accounts without feedback history should not be penalized for missing signals.

---

## 4. Account Tiers (Revenue-Based)

Accounts are assigned to one of five tiers based strictly on monthly recurring revenue.

| Tier   | Monthly Revenue  |
|--------|-----------------|
| Tier 1 | $10,001+        |
| Tier 2 | $2,501 – $10,000|
| Tier 3 | $1,001 – $2,500 |
| Tier 4 | $551 – $1,000   |
| Tier 5 | $0 – $550       |

---

## 5. Tier-Based Activity Requirements

### Customer Visits — Annual Requirements

| Tier   | In-Person | Phone | Email | Total / Year |
|--------|-----------|-------|-------|--------------|
| Tier 1 | 12        | 0     | 0     | 12           |
| Tier 2 | 9         | 3     | 0     | 12           |
| Tier 3 | 6         | 3     | 3     | 12           |
| Tier 4 | 3         | 5     | 4     | 12           |
| Tier 5 | 1         | 3     | 8     | 12           |

**Role expectations:**
- In-Person Visits: Janitorial Operations Manager
- Phone Visits: Operations Manager or Sales
- Email Touches: Operations, Sales, or Shared Services

Annual targets translate to rolling 30-day thresholds for automation (divide by 12).

### Quality Control (QC) Frequency

| Tier        | Frequency                         |
|-------------|-----------------------------------|
| Tier 1      | 2 quality inspections per month   |
| Tiers 2–4   | 1 quality inspection per month    |
| Tier 5      | 1 quality inspection every 2 months |

### Supply Delivery Frequency

| Tier      | Frequency                                              |
|-----------|--------------------------------------------------------|
| Tier 1    | Weekly supply deliveries                               |
| Tier 2    | Monthly supply deliveries                              |
| Tiers 3–5 | Supplies delivered during quality control (QC) visits  |

> Tier-based activity measures **frequency only**, not outcome quality.

---

## 6. The 15 Score Inputs

This is the definitive input list for **janitorial accounts only**. The list is stable — weighting and thresholds can evolve without changing the inputs themselves.

---

### A. Reactive & Risk Signals (Problem-Driven)

#### 1. Customer Complaint (Single Instance)
- **Definition:** Any individual negative feedback about cleaning quality or service delivery
- **Source:** Manual input into HubSpot ticket (in-person, phone, text, email)
- **Key fields:** date logged, due date, severity (low / medium / high), account, contact
- **Health impact:**
  - Each open complaint negatively impacts the score
  - Higher severity = greater negative impact
  - Overdue complaints increase negative impact further

#### 2. Complaint Volume (Multiple Complaints Over Time)
- **Definition:** Aggregate count of complaints over a rolling time window
- **Source:** HubSpot calculation — count of complaint tickets over time window
- **Key fields:** complaint count, date range
- **Health impact (RYG thresholds):**
  - 🔴 Red: 2+ complaints in last **0–60 days**
  - 🟡 Yellow: 2+ complaints in last **60–90 days**
  - 🟢 Green: 90+ days since there were 2+ complaints

#### 3. Customer Request
- **Definition:** Customer asks for something extra or specific (not a service failure)
- **Source:** Manual input into HubSpot ticket (in-person, phone, text, email)
- **Key fields:** date logged, due date, account, contact (severity optional)
- **Health impact:**
  - Neutral if completed on time
  - Negative if overdue

#### 4. ServiceMaster Request (Internal)
- **Definition:** Internal action item initiated by the business
- **Source:** Manual input into HubSpot ticket
- **Key fields:** date logged, due date, account
- **Health impact:**
  - Neutral if completed on time
  - Negative if overdue

#### 5. Sensitive Event (Single Instance)
- **Definition:** High-risk incidents (e.g., missed hotspot, alarm triggered). Tracking only — action not always required.
- **Source:** Manual input into HubSpot (format TBD — possibly a "note")
- **Key fields:** event type, date, account
- **Health impact:**
  - Any single sensitive event negatively impacts the health score for **30 days** (linear decay)

#### 6. Sensitive Event Volume (Multiple Events Over Time)
- **Definition:** Aggregate count of sensitive events over a rolling time window
- **Source:** HubSpot calculation — count of sensitive event records over time window
- **Key fields:** event count, date range
- **Health impact (RYG thresholds):**
  - 🔴 Red: 2+ sensitive events in last **0–60 days**
  - 🟡 Yellow: 2+ sensitive events in last **60–90 days**
  - 🟢 Green: 90+ days since there were 2+ sensitive events

#### 7. New Cleaner
- **Definition:** New cleaner assigned to the account
- **Source:** Timekeeping system → HubSpot (format TBD — possibly a "note")
- **Key fields:** effective date
- **Health impact (RYG thresholds):**
  - 🔴 Red: New cleaner within **0–15 days**
  - 🟡 Yellow: New cleaner within **15–30 days**
  - 🟢 Green: 30+ days since a new cleaner was assigned

#### 8. New Contact Person
- **Definition:** Change in customer decision-maker
- **Source:** Manual input into HubSpot (format TBD — possibly a "note")
- **Key fields:** effective date
- **Health impact (RYG thresholds):**
  - 🔴 Red: New contact within **0–30 days**
  - 🟡 Yellow: New contact within **30–60 days**
  - 🟢 Green: 60+ days since the contact changed

---

### B. Tier-Based Activity (Frequency-Driven Execution)

*"Did we do the basics often enough in the last 30 days?"*

#### 9. Customer Visits — Frequency
- **Definition:** Meaningful customer interactions (visit, call, email, text)
- **Source:** Manual input into HubSpot
- **Key fields:** visits completed (last 30 days), visits required (by account tier)
- **Health impact:**
  - Below threshold = small negative
  - Meets/exceeds threshold = neutral or small positive

#### 10. Supply Deliveries — Frequency
- **Definition:** Supervisor supply refills or product drop-offs
- **Source:** Timekeeping system → HubSpot
- **Key fields:** deliveries completed (last 30 days), deliveries required (by account tier)
- **Health impact:**
  - Below threshold = small negative
  - Meets/exceeds threshold = neutral or small positive

#### 11. Quality Inspections — Frequency
- **Definition:** Supervisor performs quality inspections
- **Source:** Timekeeping system → HubSpot
- **Key fields:** inspections completed (last 30 days), inspections required (by account tier)
- **Health impact:**
  - Below threshold = small negative
  - Meets/exceeds threshold = neutral or small positive

---

### C. Outcome-Based Signals (Result Quality)

#### 12. Quality Inspection Results
- **Definition:** Outcome score from each inspection
- **Source:** Inspection system (TBD)
- **Key fields:** inspection score (scale TBD)
- **Health impact:**
  - Good results = positive impact until next quality inspection (resets on next inspection)
  - Poor results = negative impact until next quality inspection (resets on next inspection)

#### 13. Customer Survey Results
- **Definition:** Formal customer survey feedback
- **Source:** HubSpot (survey tool TBD) — in this app: the Criteria-First Feedback™ post-job survey
- **Key fields:** score (1–5 avg), comments
- **Health impact:**
  - Positive surveys increase score for **30 days**
  - Negative surveys decrease score for **60 days**

#### 14. Customer Visit — Sentiment / Gut Check
- **Definition:** Sales or Ops team's impression of customer satisfaction during a visit
- **Source:** Manual input into HubSpot (format TBD — possibly a "note")
- **Key fields:** date, sentiment (positive / neutral / negative)
- **Health impact:**
  - Positive sentiment increases score for **30 days**
  - Negative sentiment decreases score for **60 days**

#### 15. Project Outcome
- **Definition:** Result of recent project work (e.g., floor stripping, carpet extraction)
- **Source:** Project system → HubSpot (Zuper integration preferred). **Low priority — skip if too difficult to set up.**
- **Key fields:** project occurred (yes/no), outcome (positive/negative)
- **Health impact:**
  - Positive results increase score for **30 days**
  - Negative results decrease score for **60 days**

---

## 7. Score Decay

`HealthEvent` records carry a `decayDays` field. A negative `scoreImpact` (e.g., `-20`) loses its full impact linearly to `0` over `decayDays` days. This prevents stale incidents from permanently suppressing an account's score after the situation has been handled.

- A nightly scheduled job applies decay even when no new events occur.
- Completing a remediation task adds a `+N` credit to `issueResolution`, making the feedback loop visible.

---

## 8. Task Generation

Tasks are created immediately when a `HealthEvent` is written. Rules come from the `TaskRules` table (keyed by `[category][severity]`) — task generation is a data change, not a code deploy.

**Role → Due window mapping:**
| Role              | Due window   | Scope                    |
|-------------------|--------------|--------------------------|
| `service_manager` | `today`      | Assigned accounts        |
| `supervisor`      | `this_week`  | Field tasks this week    |
| `operator`        | `this_month` | Daily tasks (mobile)     |

**Task completion feedback:**
- Completed → positive `issueResolution` signal; score recalculated
- Overdue (past `dueDate`, still `pending`) → additional negative signal on next nightly compute
- Dismissed with reason → neutral; logged for audit; no score change

**Repeat offense escalation:** If `repeatCount` for `category: 'incident' | 'sensitive_event'` on the same account reaches **3 within 180 days**, severity is automatically escalated one level and a `contract_review` task is generated regardless of the original rule template.

**Example TaskRule** — `PK: 'sensitive_event'`, `SK: 'high'`:
```json
{
  "taskTemplates": [
    { "title": "File incident report", "category": "incident_report", "assigneeRole": "service_manager", "dueWindow": "today", "priority": "critical" },
    { "title": "Call account contact", "category": "follow_up_call", "assigneeRole": "service_manager", "dueWindow": "today", "priority": "critical" },
    { "title": "Schedule crew debrief", "category": "crew_debrief", "assigneeRole": "supervisor", "dueWindow": "this_week", "priority": "high" }
  ]
}
```

---

## 9. Data Model (DynamoDB)

### AccountHealth
```
PK: accountId
SK: "CURRENT"  |  "SNAPSHOT#<ISO timestamp>" (keep last 12)
score: number (0–100)
tier: 'green' | 'yellow' | 'red'
incidentOverride: boolean
components: { serviceQuality, contractHealth, activityRecency, customerEngagement, issueResolution }
  each: { score: number, tier: string, factors: string[] }
riskProfile: {
  eventCount12m: number
  incidentCount12m: number
  lastEventAt: string
  watchlist: boolean  ← true if incidentCount12m >= threshold (default: 2+)
  watchlistReason?: string
}
lastComputedAt: string
computedBy: 'system' | 'webhook' | 'scheduled' | 'manual'
```

### DealHealth
```
PK: dealId
score, tier, incidentOverride
components: { contractHealth, activityRecency, issueResolution }
lastComputedAt: string
```
Deal health rolls up into account health — active deals weighted more heavily than draft.

### HealthEvents (permanent — never delete)
```
PK: accountId
SK: "<ISO timestamp>#<eventId>"
category: 'incident' | 'sensitive_event' | 'customer_complaint' | 'missed_service'
         | 'payment_issue' | 'quality_flag' | 'health_decline'
severity: 'low' | 'medium' | 'high' | 'critical'
resolvedAt?: string  ← set when closed; stops incident override
scoreImpact: number  ← negative; 0 once decayed
decayDays: number
repeatCount?: number  ← same category + accountId within 180 days
GSIs: dealId, resolvedAt, category+reportedAt
```

### ServiceTasks
```
PK: assigneeId
SK: "<dueDate>#<taskId>"
category: 'incident_report' | 'follow_up_call' | 'remediation_visit'
         | 'account_review' | 'crew_debrief' | 'contract_review' | 'spot_check'
priority: 'critical' | 'high' | 'medium' | 'low'
dueWindow: 'today' | 'this_week' | 'this_month'
status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
assigneeRole: 'service_manager' | 'supervisor' | 'operator'
GSIs: accountId, dueDate, status+dueDate
```

---

## 10. HubSpot Integration

Two custom HubSpot company properties to create:

| Property name  | Type   | Values              |
|----------------|--------|---------------------|
| `health_tier`  | string | 'green' / 'yellow' / 'red' |
| `health_score` | number | 0–100               |

Written back to HubSpot after each compute via `CrmRepository.updateAccountHealth(accountId, tier, score)`.

---

## 11. Recompute Triggers

| Trigger                       | Notes                                               |
|-------------------------------|-----------------------------------------------------|
| HubSpot deal stage webhook    | Extends existing webhook handler                    |
| Ticket created / resolved     | Ticketing system publishes HealthEvent → recompute  |
| Task completed                | `issueResolution` sub-score updated                 |
| Manual admin action           | UI button on account detail                         |
| Nightly scheduled job         | Applies score decay even when no events occur       |

---

## 12. Proactive Flags (Nightly Job)

The nightly compute evaluates patterns beyond the current score:
- Same event category **2+ times in 90 days** (even if all resolved) → `account_review` task for service manager ("recurring pattern")
- Health score **Yellow for 30+ consecutive days** without an incident (gradual decline, not event-driven) → flag for review
- **No recorded events for 180+ days** but score has been declining → signals missing data / unreported events

These flags generate `ServiceTasks` with `priority: 'medium'` and `dueWindow: 'this_month'`.

**Risk profile vs. health score distinction:**
- Health score = current state, resets as incidents resolve and decay clears
- Risk profile = rolling 12-month event frequency, **never resets**

---

## 13. Roles

| Role              | Primary surface                      | Task scope              |
|-------------------|--------------------------------------|-------------------------|
| `service_manager` | Operational dashboard (health + tasks)| Tasks for assigned accounts |
| `supervisor`      | Task list + crew view                | This week's field tasks |
| `operator`        | Daily task list (mobile-first)       | Today's tasks only      |

**Permissions:**
- `health:read` — admin, service_manager, supervisor
- `health:write` — admin, service_manager (manual events, trigger recompute)
- `tasks:read` / `tasks:write` — all ops roles (scoped to their queue)

---

## 14. Implementation Phases

| Phase | Scope |
|-------|-------|
| 1 — Foundation | AccountHealth, DealHealth, HealthEvents, ServiceTasks, TaskRules tables; `computeAccountHealth` service; incident override; data retention |
| 2 — Dashboard | Portfolio health stat cards; "Accounts Needing Attention" list; health column on accounts list |
| 3 — Account surfaces | Health tab on account detail; HealthBadge primitive; health badge in account header |
| 4 — HubSpot write-back | `updateAccountHealth` on CrmRepository; custom properties; webhook trigger extended |
| 5 — Task system | TaskRules seeding; task generation engine; `/dashboard/operations` and `/tasks` routes; ops roles |
| 6 — Deal health | Deal-level scoring; health badge on deal detail; deal rollup into account score |
| 7 — Reporting | Risk profiles + watchlist; nightly proactive flags; weekly/monthly report views |
| 8 — Report delivery | CSV/PDF export; email digest (requires notification service — not yet scoped) |
| 9 — Ticketing bridge | HealthEvents write path from ticketing system |

---

## 15. Open Questions (Unresolved)

1. How are service managers assigned to accounts — by account relationship, region, or crew?
2. Can admins/managers manually create HealthEvents outside of tickets or webhooks?
3. Does task completion automatically improve health score, or does a manager need to confirm resolution?
4. Is the operator task interface mobile web or a future native app?
5. What are the exact SLA windows — if a `today` task is not completed by EOD, who is notified and how?
6. Can a sales rep see their account's health score and open tasks, or is operations data walled off?
7. Should new accounts start at Green (decay over time) or neutral (no tier until enough signals exist)?
8. Can an admin manually override a Red tier to Green? If so, does the override expire?
9. What defines the exact list of `sensitive_event` subcategories (alarm trigger, security breach, etc.)?
10. Score dimension weights — fixed globally, or configurable per account type (new vs. tenured)?

---

## 16. In-App Implementation Notes (This Codebase)

These types and data structures are already implemented:

- **`src/types/health.ts`** — `AccountHealthScore`, `HealthSignal`, `SignalStatus`, `HealthTier`, `CRITERIA_META`, `EXTRA_CRITERIA_META`, `getCriterionMeta()`
- **`src/data/healthMockData.ts`** — `accountHealthScores` array with 3 representative accounts (Green/Yellow/Red)
- **`src/components/health/admin/HealthBadge.tsx`** — RYG score pill + tier label, sizes `sm` and `md`
- **`src/pages/Health.tsx`** — split-panel admin view (left: account list + signals, right: phone simulator)
- **`src/components/health/mobile/`** — full customer survey flow (pre-job criteria selection, post-job per-criterion rating, gut check, thank you)

Mock data accounts:
- **Maplewood Solutions** (acc-001) — Green, score ~82
- **Riverside Medical Center** (acc-004) — Yellow, score ~51
- **Lakewood Office Park** (acc-003) — Red, score ~34 (2 open complaints, new cleaner 9 days ago, alarm event, survey avg 2.1/5)
