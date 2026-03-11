# Health Scoring Module — UX & Requirements Documentation

**Version:** 1.0
**Scope:** Janitorial accounts only
**Last Updated:** March 2026

---

## Overview

ServiceMaster Clean's Health Scoring module replaces generic star ratings with a psychologically grounded **Criteria-First Feedback™** framework. Instead of asking "how did we do?" in the abstract, customers define what success looks like *before* the job, then rate against those exact criteria *after* the job.

The module lives in the admin console as a split-panel view:
- **Left panel** — Admin dashboard: account health scores, signal breakdowns, recommended actions
- **Right panel** — Mobile phone simulator: live preview of the exact customer mobile app experience

---

## The Framework — Criteria-First Feedback™

### Psychological Basis

Generic service ratings suffer from a fundamental problem: raters have no shared anchor. A 4/5 from one customer may reflect the same satisfaction level as a 2/5 from another, depending on individual expectations. This framework solves that with four well-researched principles:

1. **Goal-Setting Theory (Locke & Latham, 1990)**
   Specific, self-set goals produce more accurate performance evaluations than generic prompts. When customers choose their own criteria, they've made a commitment to evaluate on those terms.

2. **Expectation Disconfirmation Theory (Oliver, 1980)**
   Customer satisfaction = Perceived Performance − Expected Performance. By making expectations explicit and concrete before service, the post-job rating measures a real gap rather than a vague impression.

3. **Commitment & Consistency (Cialdini)**
   People behave consistently with prior public commitments. A customer who selected "Spotless restrooms" as a priority is psychologically invested in rating that criterion honestly.

4. **Implementation Intentions (Gollwitzer, 1999)**
   Pre-defining what success looks like creates a mental template that makes post-job evaluation sharper and more reliable.

### The Two-Phase Loop

```
PRE-JOB:  "What does success look like for you today?"
          → Customer selects 3–10 criteria from curated list
          → Criteria are stored against the job record

POST-JOB: "Did we hit your standards?"
          → Customer rates us on exactly what THEY said mattered
          → One screen per criterion (focused, specific, honest)
          → Optional note per criterion
          → Final gut-check: overall thumbs up/down
```

---

## Customer Mobile Experience

The customer flow is accessed via SMS or email link, viewable on mobile. The phone simulator in the admin app previews this exact experience.

---

### PRE-JOB SURVEY

#### Screen 1: Welcome
- ServiceMaster teal branding
- "Hi [First Name] 👋"
- "Your ServiceMaster team is scheduled for [Day], [Date] at [Time]"
- "Before they arrive, take 30 seconds to tell us what a great job looks like to you. We'll report back on exactly what you said mattered."
- CTA (teal, full-width): **"Set My Standards →"**

#### Screen 2: Criteria Selection
- Title: "What matters most to you?"
- Subtitle: "Select everything you want us to nail. Choose at least 3."
- Progress: Step 1 of 2
- Multi-select chips (2-column grid):

| # | Emoji | Criterion |
|---|---|---|
| 1 | 🚽 | Spotless restrooms |
| 2 | 🚪 | Clean lobby & entryways |
| 3 | 🗑️ | Trash removal — all areas |
| 4 | ☕ | Clean break room / kitchen |
| 5 | 🖥️ | Dust-free surfaces & desks |
| 6 | ✨ | Polished floors |
| 7 | 🪟 | Window ledges & glass |
| 8 | ⏰ | On-time arrival |
| 9 | 🔇 | Minimal disruption to staff |
| 10 | 💬 | Clear communication from team |

- **Validation:** Minimum 3 selected required
- CTA: **"These are my priorities →"** (disabled until ≥ 3 selected)

#### Screen 3: Confirmation
- Large animated checkmark (teal)
- Title: "Your standards are set"
- Shows selected criteria as teal checklist
- "After your service, we'll ask you to rate us on each of these — nothing else."
- CTA: **"Got it, I'm all set"**

---

### POST-JOB SURVEY

#### Screen 1: Service Complete Intro
- Header: "Service Complete ✓"
- "How did we do on what YOU said mattered?"
- Shows their selected criteria as reminder chips
- Progress bar: 0%
- CTA: **"Start Rating →"**

#### Screens 2–N: Per-Criterion Rating
One screen per selected criterion, in order selected.

- Progress indicator: "2 of 6" + progress bar fill
- Large criterion icon + name
- Criterion-specific question (see table below)
- **5-point emoji scale:**
  - 😞 (1) Missed it
  - 😐 (2) Below expectations
  - 😊 (3) Met expectations
  - 😄 (4) Above expectations
  - 🌟 (5) Exceeded expectations
- Optional text: "What specifically?" (collapsed by default)
- Navigation: Back / Next

**Criterion-to-Question Map:**

| Criterion | Question Shown to Customer |
|---|---|
| Spotless restrooms | Were restrooms clean, stocked, and smelling fresh? |
| Clean lobby & entryways | Was the first impression walking in a clean one? |
| Trash removal | Were all trash receptacles emptied throughout the space? |
| Clean break room / kitchen | Was the kitchen left clean, wiped down, and tidy? |
| Dust-free surfaces & desks | Were work surfaces and common areas visibly dust-free? |
| Polished floors | Did floors look clean and well-maintained? |
| Window ledges & glass | Were ledges and glass surfaces clean and streak-free? |
| On-time arrival | Did the team arrive on schedule? |
| Minimal disruption | Did the team work without interrupting your day? |
| Clear communication | Did you know what was happening and when? |

#### Screen N+1: Overall Gut Check
- Title: "Last one — overall, how do you feel?"
- Two large full-width buttons:
  - 👍 **"Satisfied — great job overall"**
  - 👎 **"Not satisfied — something was off"**
- If thumbs-down: required text input — "What's most important for us to address?"

#### Screen N+2: Thank You
- Celebration animation
- "Thank you, [First Name]!"
- "Your feedback goes directly to your ServiceMaster team."
- If any rating ≤ 2: "We noticed some areas didn't meet your standards. Your account manager will follow up within 24 hours."
- Score display: "Your satisfaction score: [avg]/5" with teal progress bar

---

## Admin Health Score View

### Layout
```
[Sidebar 240px] | [Admin Panel ~55%] | [Phone Simulator ~45%]
```

The `/health` route uses a unique split-panel layout. The left side scrolls independently; the right side shows the phone simulator fixed in view.

---

### Left Panel: Account Health List

**Filter bar:**
- Search input
- Tier filter: All | 🟢 Green | 🟡 Yellow | 🔴 Red

**Account rows (64px height each):**
- Account name (font-medium)
- Mini score gauge (arc, colored by tier)
- Score number (colored)
- Trend arrow (↑ or ↓) with delta
- Top risk signal text
- Last survey date

Clicking a row expands the detail panel below the list.

---

### Left Panel: Health Score Detail

Shown when an account is selected. Fully detailed view of all 15 signals.

#### Score Header
- Large circular score (0–100, colored by tier)
- Tier label: "Healthy" / "At Risk" / "Critical"
- Trend: ↑ +8 or ↓ -12 pts this month
- Account + Deal name

#### Signal Categories (accordion sections)

**A. Reactive & Risk Signals (8 inputs)**

| # | Signal | Red Condition | Yellow Condition | Green Condition |
|---|---|---|---|---|
| 1 | Customer Complaint | Open, any severity | Overdue | Resolved |
| 2 | Complaint Volume | 2+ complaints in 0–60 days | 2+ complaints in 60–90 days | 90+ days since 2+ complaints |
| 3 | Customer Request | Overdue | Open, not due yet | Resolved on time |
| 4 | ServiceMaster Request | Overdue | Open, not due yet | Resolved on time |
| 5 | Sensitive Event | Within last 30 days | — | 30+ days ago |
| 6 | Sensitive Event Volume | 2+ events in 0–60 days | 2+ events in 60–90 days | 90+ days since 2+ events |
| 7 | New Cleaner | Within 0–15 days | Within 15–30 days | 30+ days ago |
| 8 | New Contact Person | Within 0–30 days | Within 30–60 days | 60+ days ago |

**B. Tier-Based Activity (3 inputs)**
Did we do the basics often enough in the last 30 days?

| # | Signal | Below = | At/Above = |
|---|---|---|---|
| 9 | Customer Visits | Small negative per gap | Neutral / small positive |
| 10 | Supply Deliveries | Small negative per gap | Neutral / small positive |
| 11 | Quality Inspections | Small negative per gap | Neutral / small positive |

**C. Outcome-Based Signals (4 inputs)**

| # | Signal | Impact |
|---|---|---|
| 12 | Quality Inspection Results | Good = positive until next inspection; Poor = negative until next inspection |
| 13 | Customer Survey Results | Positive = +score for 30 days; Negative = -score for 60 days |
| 14 | Visit Sentiment / Gut Check | Positive = +score for 30 days; Negative = -score for 60 days |
| 15 | Project Outcome | Positive = +score for 30 days; Negative = -score for 60 days |

#### Recommended Actions Panel
Generated from red/yellow signals. Ordered by severity. Example (for a RED account):
1. 🔴 "Resolve 2 open complaints — both flagged as High severity"
2. 🔴 "Complete new cleaner onboarding check-in"
3. 🟡 "Schedule second customer visit this month"
4. 🟡 "Complete overdue customer request"
5. 🔴 "Follow up on survey: avg 2.1/5 — customer cited restrooms and floors"

#### Survey Response History
- Last 3 post-job surveys
- Each: date, average score, overall sentiment, per-criterion scores, optional notes

---

### Right Panel: Phone Simulator

- iPhone-style device frame (notch, status bar, home indicator)
- Inner screen: ~375px width
- Two tabs inside the phone header: **Pre-Job** | **Post-Job**
- Interactive: admin can tap through screens to preview the customer experience
- Updates when a different account is selected from the list
- Reset button returns to Screen 1

---

## Scoring Algorithm

**Base score: 100 points.** Signals add or subtract points. Score clamped 0–100.

**Tier thresholds:**
- 🟢 Green: 70–100
- 🟡 Yellow: 40–69
- 🔴 Red: 0–39

**Deduction table (configurable — thresholds can evolve without changing inputs):**

| Signal | Condition | Points |
|---|---|---|
| Complaint (low severity) | Open | −8 |
| Complaint (medium severity) | Open | −12 |
| Complaint (high severity) | Open | −18 |
| Complaint (any) | Overdue | ×1.5 multiplier |
| Complaint volume | RED window (0–60 days) | −15 |
| Complaint volume | YELLOW window (60–90 days) | −8 |
| Customer request | Overdue | −6 |
| SM internal request | Overdue | −5 |
| Sensitive event | Within 30 days | −10 |
| Sensitive event volume | RED (0–60 days) | −12 |
| Sensitive event volume | YELLOW (60–90 days) | −6 |
| New cleaner | RED (0–15 days) | −12 |
| New cleaner | YELLOW (15–30 days) | −6 |
| New contact | RED (0–30 days) | −10 |
| New contact | YELLOW (30–60 days) | −5 |
| Visits below threshold | Per missing visit | −4 |
| Deliveries below threshold | Per missing delivery | −3 |
| Inspections below threshold | Per missing inspection | −4 |
| Activity at/above threshold | Per category | +2 |
| Inspection score < 70 | — | −10 |
| Inspection score 70–85 | — | −3 |
| Inspection score > 85 | — | +5 |
| Survey avg < 2.5 | — | −18 |
| Survey avg 2.5–3.5 | — | −8 |
| Survey avg 3.5–4.5 | — | +5 |
| Survey avg > 4.5 | — | +10 |
| Negative gut check | — | −8 |
| Positive gut check | — | +5 |
| Negative project outcome | — | −10 |
| Positive project outcome | — | +5 |

---

## Future: HubSpot Sync

Signal data will eventually sync from HubSpot (complaints, requests, visits, inspections). The mobile app and its survey data will push to HubSpot as a custom object. This module is designed to be the primary interface — HubSpot is the data backend, not the user-facing tool.

---

## File Structure

```
src/
  docs/
    health-scoring.md          ← This file
  pages/
    Health.tsx                 ← Main split-panel page
  components/
    health/
      PhoneFrame.tsx           ← iPhone device frame
      MobileApp.tsx            ← Mobile app screen manager
      mobile/
        WelcomeScreen.tsx
        CriteriaSelect.tsx
        CriteriaConfirm.tsx
        PostJobIntro.tsx
        CriterionRate.tsx
        GutCheck.tsx
        ThankYou.tsx
      admin/
        AccountHealthList.tsx
        HealthDetail.tsx
        ScoreGauge.tsx
        SignalRow.tsx
        ActionItems.tsx
        SurveyHistory.tsx
  types/
    health.ts
  data/
    healthMockData.ts
```
