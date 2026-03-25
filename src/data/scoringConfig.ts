// ─── Scoring Configuration ────────────────────────────────────────────────────
// Default values from Devin's weighted scoring system (health-check-scoring-values.md).
// All values are configurable per template; admins can edit in the Scoring Rules panel.
// Changes take effect immediately on any site with liveScoring: true.

export interface ScoringConfig {
  // ── Tier thresholds ───────────────────────────────────────────────────────
  greenThreshold:  number;  // score >= this → Green (default: 70)
  yellowThreshold: number;  // score >= this → Yellow (default: 40, else Red)

  // ── Complaint deductions (open, unresolved) ───────────────────────────────
  complaintLow:    number;  // low severity   (default: −8)
  complaintMedium: number;  // medium severity (default: −12)
  complaintHigh:   number;  // high severity   (default: −18)

  // ── Sensitive event — ops manager sets impact level (red/yellow/none) ─────
  sensitiveEventRed:    number;  // outcome = 'red'    → forces Red tier + full deduction; decays over sensitiveEventDecayDays
  sensitiveEventYellow: number;  // outcome = 'yellow' → deduction only, no tier override; same decay
  sensitiveEventDecayDays: number; // days over which sensitive event decays to 0 (default: 30)

  // ── Requests (open/overdue) ───────────────────────────────────────────────
  customerRequest: number;  // per open customer request (default: −6)
  smRequest:       number;  // per open SM internal request (default: −5)

  // ── New cleaner (days since assigned) — windows from Devin's scoring doc ──
  // Red:    0 – newCleanerRedDays  (default: 7 days)
  // Yellow: newCleanerRedDays – newCleanerYellowDays  (default: 44 days)
  // Green:  > newCleanerYellowDays
  newCleanerRed:        number;  // deduction in Red window    (default: −12)
  newCleanerYellow:     number;  // deduction in Yellow window (default: −6)
  newCleanerRedDays:    number;  // Red window end in days     (default: 7)
  newCleanerYellowDays: number;  // Yellow window end in days  (default: 44)

  // ── New contact person (days since changed) — windows from scoring doc ────
  // Red:    0 – newContactRedDays  (default: 59 days — longest red trigger in system)
  // Yellow: newContactRedDays – newContactYellowDays  (default: 89 days)
  // Green:  > newContactYellowDays
  newContactRed:        number;  // deduction in Red window    (default: −10)
  newContactYellow:     number;  // deduction in Yellow window (default: −5)
  newContactRedDays:    number;  // Red window end in days     (default: 59)
  newContactYellowDays: number;  // Yellow window end in days  (default: 89)

  // ── QC inspection outcomes (thresholds: ≥86=Green, 70–85=Yellow, ≤69=Red) ─
  qcPass:           number; // score ≥ 86  (default: +5)
  qcNeedsAttention: number; // score 70–85 (default: −3)
  qcFail:           number; // score ≤ 69  (default: −10)

  // ── Customer visit sentiment (5-tier scale) ───────────────────────────────
  visitSuperPositive: number; // (default: +10)
  visitPositive:      number; // (default: +5)
  // neutral = 0, not configurable
  visitNegative:      number; // (default: −8)
  visitSuperNegative: number; // (default: −15)

  // ── Project outcome ───────────────────────────────────────────────────────
  projectPositive:  number; // (default: +5)
  projectNegative:  number; // (default: −10)

  // ── Resolution bonus ─────────────────────────────────────────────────────
  resolutionBonus:  number; // points added back when an open event is resolved (default: +4)

  // ── System-wide time decay ────────────────────────────────────────────────
  // Per scoring doc Section 4: events lose impact as they age.
  // Multiplier table: 1d=1.00, 30d=0.90, 45d=0.80, 60d=0.60, 90d=0.40, 180d=0.15, 360d=0.10
  // Applied to: complaints, requests, visits, QC, project outcomes.
  // NOT applied to: sensitive_event (own decay), new_cleaner, new_contact (window-based).
  enableTimeDecay:  boolean; // whether to apply time decay multiplier (default: true)
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  greenThreshold:   70,
  yellowThreshold:  40,

  complaintLow:     -8,
  complaintMedium:  -12,
  complaintHigh:    -18,

  sensitiveEventRed:       -15,
  sensitiveEventYellow:    -8,
  sensitiveEventDecayDays: 30,

  customerRequest:  -6,
  smRequest:        -5,

  // Windows per Devin's scoring doc (health-check-scoring-values.md §9)
  newCleanerRed:        -12,
  newCleanerYellow:     -6,
  newCleanerRedDays:    7,
  newCleanerYellowDays: 44,

  // Windows per Devin's scoring doc (health-check-scoring-values.md §10)
  // New contact is the longest-lasting auto-red trigger in the system
  newContactRed:        -10,
  newContactYellow:     -5,
  newContactRedDays:    59,
  newContactYellowDays: 89,

  qcPass:           +5,
  qcNeedsAttention: -3,
  qcFail:           -10,

  visitSuperPositive: +10,
  visitPositive:      +5,
  visitNegative:      -8,
  visitSuperNegative: -15,

  projectPositive:  +5,
  projectNegative:  -10,

  resolutionBonus:  +4,

  enableTimeDecay:  true,
};
