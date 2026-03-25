# Health Check & Ticketing — Design Requirements
**Source:** Discovery meeting transcript (Health-Check-Ticketing-workflows)
**Version:** 1.0
**Last Updated:** 2026-03-23
**Audience:** Claude Code / Design iteration reference

---

## How to use this file

This document captures confirmed requirements, decisions, and design changes from a stakeholder discovery session. When making UI/design changes:
- Treat everything under **Confirmed Decisions** as locked unless explicitly revisited
- Treat everything under **Future State** as directional — do not block the path, but do not build yet
- Use the **Action Items** table at the bottom as your implementation checklist

---

## 1. Terminology (Locked)

| Old / Avoid | Use Instead |
|---|---|
| Contract | Site |
| Building | Site |
| Location | Site (for physical places) |
| Account | Site (for individual buildings) or Parent Company (for the grouping entity) |

- **Site** = the atomic unit. One physical place, one supervisor assigned, one health score.
- A site can be a whole building, a campus, a floor, or a room — the granularity is flexible and set per account.
- **Do not** use "contract" anywhere in the UI. The number of contracts behind a site is irrelevant to the health score.

---

## 2. Data Hierarchy

```
Super Admin / GM (cross-location view)
  └── Location (e.g. Chicago, Indianapolis, Milwaukee)
        └── Ops Manager
              └── Supervisor
                    └── Sites (their ~40 assigned sites)

Parent Company (optional grouping layer — client-side)
  └── Sites (individual buildings under that parent)
```

### Rules
- **Sites** are where all health scoring happens. Every other level is a roll-up.
- **Parent Company** grouping is **optional** — most accounts are standalone sites with no parent needed. Do not force a parent company field on every site entry.
- Parent company roll-up score = simple math: average of child site scores, OR a color distribution display (e.g. "3 green / 2 yellow / 1 red"). Both are acceptable. The breakdown view (clicking into child sites) is more important than the roll-up number.
- **Do not** organize sites by contact person (e.g. Nancy vs. Bill). The parent company is the grouping entity, not the individual contact.
- Special case (e.g. day crew / night crew at same building): create two separate sites. Do not add a sub-site layer.

---

## 3. User Roles & Permissions

### Role Hierarchy

| Role | Scope | Can See |
|---|---|---|
| Super Admin | All franchises | Everything |
| GM | Their location (e.g. all of Chicago) | All sites under their location; compare across Ops Managers |
| Ops Manager | Their area | All supervisors' sites in their area; spot patterns |
| Supervisor | Their assigned sites (~40) | Only their own sites by default |

### Permission Approach
- **Do not hard-block** supervisors from other accounts — fringe cases exist (covering for another supervisor).
- Instead: **default filter to "My Sites"** on login and **persist that filter across sessions**.
- The UI should make it trivially easy to see only your assigned accounts, with clear filters to broaden scope if needed.
- Task list / ticket assignment logic should be role-aware — the right items show up for the right person without manual routing.

---

## 4. Account List & Navigation

### Filter Bar (Required)
The account list must have a prominent, persistent filter bar with at minimum:
- **My Sites** (default for Supervisors)
- **My Area** (default for Ops Managers)
- **My Location** (default for GMs)
- All Sites (accessible to all, but not the default)
- Filter by Franchise (for Super Admin)

Filters should **persist across sessions** — if a supervisor filtered to "My Sites" last time, that's what loads next time.

### Account List Display
- Show all sites in a list (~250 total across the org)
- Bold the parent company name; indent child sites underneath
- Display health status indicator (red / yellow / green) inline on each row
- Red should **visually dominate** — if any child site is red, the parent company row shows red
- Clicking a parent company expands/shows child sites with individual scores

---

## 5. Health Score Logic

### Scoring Inputs (Confirmed)

| Event Type | Notes |
|---|---|
| Complaint | Volume + severity; tracked at 30 / 60 / 90 day windows |
| Quality / Cleaning Inspection (CQI) | Score-based; if CQI is bad AND complaints are open, site is high risk |
| New Cleaner Assigned | Auto-triggers elevated alert (red for first ~5 days, drops to yellow if no issues) |
| New Client Contact | Auto-triggers red — high churn risk in first week |
| Customer Visit | Logged by Ops Manager / GM only; has sentiment scale |
| Customer Request | Overdue requests negatively impact score |
| Sensitive Event | Catch-all; ops manager sets severity manually |

### Scoring Rules
- Complaints **do not get deleted** — they persist and affect the score for their configured time window (default: 30/60/90 days), then age off.
- Both **individual complaint severity** AND **complaint volume over time** feed the score — track both.
- A **positive customer visit adds points but does NOT resolve or suppress outstanding complaints**. Complaints must remain visible regardless.
- The score should still show red/yellow even after a great visit if underlying issues exist — complaints "lurk" intentionally.
- **Red overrides averaging** — one red site makes the parent company row red.

### Manual Override ("Nuclear Button")
- The **Customer Visit** event type includes a sentiment/weight scale.
  - Suggested UX: a scale from -10 to +10, or tiered labels (Super Positive / Positive / Neutral / Negative / Critical)
  - This allows an Ops Manager to heavily skew a score up or down for unusual circumstances
- **Only Ops Manager and above** can log a Customer Visit event. Supervisors do not have access to this event type.
- This is not a true "override" — it is a heavily weighted new data point. Underlying complaints remain.

### Configurable Time Windows
- The 30/60/90 day decay windows are **configurable per template** (see Section 7).
- Users should be able to change these as they learn what works (e.g. move to 15/30/45 days).

---

## 6. Ticketing & Complaint Workflow

### Ticket Lifecycle

```
1. Event occurs (complaint, request, sensitive event, etc.)
2. Employee logs ticket manually in Forward (phone/email/in-person trigger)
3. Ticket assigned to relevant supervisor
4. Supervisor resolves the issue + optionally uploads photo proof
5. Supervisor clicks "Resolve" — ticket closed
6. Ops Manager reviews resolved tickets next day (discretionary follow-up)
```

### Key Rules
- **Photo upload on resolution is critical** — this is the team's primary defense in disputes ("we cleaned it, here's the timestamp").
- **Do NOT auto-notify the client on resolution.** The ops manager chooses when/whether to call. Nothing is sent automatically.
- Resolution is discretionary — not every resolved ticket requires a follow-up call. The ops manager decides based on client importance/context.
- The "resolve" button is primarily used by the **supervisor**, but the ops manager can also resolve tickets.

### Resolution Criteria by Event Type
Some events have specific resolution criteria; others just need a checkbox:

| Event | Resolution Criteria |
|---|---|
| Complaint | Supervisor action taken + photo upload (where applicable) |
| Customer Request | Request completed by deadline |
| New Cleaner | Can be resolved immediately if experienced cleaner; otherwise resolves after performance is confirmed |
| New Contact | Requires proactive outreach / relationship established |
| Sensitive Event | Ops manager determines resolution criteria case-by-case |
| Customer Visit | No resolution needed — it's a logged observation |

---

## 7. Event Types & Field Metadata

### Complaint
- Severity: Low / Medium / High
- Description (free text)
- Photo attachment on resolution

### Customer Request
- Description
- Due date / deadline
- Resolution: completed on date

### Quality Inspection (CQI)
- Numeric score
- Notes
- Site / area inspected

### New Cleaner Assigned
- Cleaner name
- Start date
- Notes (e.g. "experienced on 5 other sites — low risk")

### New Client Contact
- Contact name *(required)*
- Start date *(required)*
- Notes
- Previous contact name (optional)

### Customer Visit
- Visited by (Ops Manager / GM / Sales)
- Visit date
- Sentiment scale: **Super Negative → Negative → Neutral → Positive → Super Positive** (maps to a numeric weight, e.g. -10 to +10)
- Notes / summary
- **Restricted to: Ops Manager, GM, Super Admin only**

### Sensitive Event
- No exhaustive pick list — this is intentionally a catch-all
- Category label (free text or short tag)
- Description (free text)
- Severity: the Ops Manager manually assigns the color impact (red / yellow / no impact)
- Examples (do not use as a forced list): facility left unlocked, theft, employee misconduct, safety violation, caught on camera misusing property

---

## 8. Templates & Admin Configurability

Health score templates follow the same model as Job Cost Summary templates:

- **Admins build templates** that define:
  - Which event types are tracked
  - Weight assigned to each event type
  - Time windows for score decay (e.g. 30/60/90 days)
  - Color thresholds (what score = red vs. yellow vs. green)
- Templates are **assigned per franchise or per location** — Chicago can have a different template than Indianapolis
- Future franchisees can use the default (Todd/Dave's proven template) or build their own
- **Custom fields must be addable** — e.g. a franchisee might want to track "janitorial closet condition," which is not in the default template
- Template scoring weights and time windows must be editable after the fact — users will want to tune as they learn

---

## 9. Data Storage & HubSpot Integration

### Primary data home: **Forward (this app)**
All ticket logging, health score calculation, and event history lives in Forward — not HubSpot.

### What gets pushed to HubSpot (aggregate only):
- Overall site health status (red / yellow / green)
- Ticket count in last 90 days
- Summary info useful for sales/CS screen-pop (when a client calls in)

### What does NOT go to HubSpot:
- Individual tickets or complaint details
- Resolution photos
- Event history log

### Design implications:
- Do not create any data entry flows that require HubSpot — Forward is the single input point
- HubSpot is an output/integration layer, not a dependency
- **Do not purchase HubSpot Service Hub seats yet** — hold off until requirements are clearer
- Design for a future mobile-accessible version of Forward so supervisors can log on the go

---

## 10. Future State (Do Not Build Yet — Do Not Block)

### Customer Portal / Dashboard
- Customers will eventually log in and see a configurable subset of their health data
- Customers choose which data points they care about and how they want to be notified (push, email, frequency)
- Customer dashboard is built on top of the internal data — no separate data model needed
- Some customers will want weekly reports; some just want a ping when a quality check is done
- The portal will also have static elements: "Log a complaint" button, "Who is my account manager" info

### Design guidance now:
- Keep all data at the site level and surfaceable per account
- Do not hard-couple any views to internal-only logic that would prevent external exposure later
- The current internal tool proves out the health check model first; customer-facing comes after

---

## 11. Action Items Checklist

| # | Area | Change Required | Status |
|---|---|---|---|
| 1 | Terminology | Replace "contract" → "site" everywhere in UI | ☐ |
| 2 | Account list | Add persistent filter bar: My Sites / My Area / My Location / All | ☐ |
| 3 | Account list | Default filter to role-appropriate view on login; persist across sessions | ☐ |
| 4 | Parent Company | Add optional parent company grouping with child site expansion | ☐ |
| 5 | Parent Company | Roll-up display: avg score or color distribution (3 green / 1 red) | ☐ |
| 6 | Health score | Red overrides averaging — parent row = red if any child is red | ☐ |
| 7 | Event types | Add sentiment scale to Customer Visit event (-10 to +10 or 5-tier label) | ☐ |
| 8 | Event types | Restrict Customer Visit event to Ops Manager+ (hide from Supervisors) | ☐ |
| 9 | Event types | New Contact event: add required fields for contact name + start date | ☐ |
| 10 | Ticket resolution | Add photo upload field to resolution flow | ☐ |
| 11 | Sensitive events | Keep as catch-all — free text only, no forced pick list; ops manager sets severity | ☐ |
| 12 | Score history | Complaints persist and remain visible even after a positive customer visit | ☐ |
| 13 | Templates | Design admin-facing template builder (fields + weights + time windows) | ☐ |
| 14 | Templates | Make time windows (30/60/90 days) editable per template | ☐ |
| 15 | Roles | Supervisor role: default to "My Sites" filter; no hard data block | ☐ |
| 16 | HubSpot | Aggregate push only: status + ticket count; no ticket detail sync | ☐ |

---

## 12. Open Questions (Not Yet Resolved)

- Exact numeric weights for each event type → Devin to share his existing weighting spreadsheet
- Exact HubSpot fields to sync → Adam to clarify once architecture is further along
- Whether to build a mobile-responsive version of Forward or a dedicated mobile app
- Customer portal notification system design (email vs. push vs. in-app)

---

*This document should be updated after each stakeholder session. Increment the version number and update the Last Updated date at the top.*
