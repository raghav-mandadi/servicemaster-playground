import type { HealthEvent, HealthTier } from '../types/health';
import type { ScoringConfig } from '../data/scoringConfig';

// ─── Live Scoring Engine ──────────────────────────────────────────────────────
// Computes a site score from its event log + the current scoring config.
// Used for sites with liveScoring: true so you can see score changes in real-time.
//
// Scoring model: Base score = 100. Events add or subtract points. Score clamped 0–100.
// System-wide time decay (scoring doc §4) reduces event impact as events age.
// New-cleaner/new-contact use window-based logic instead of standard decay.

export interface LiveScoreResult {
  score:            number;
  tier:             HealthTier;
  incidentOverride: boolean;
  breakdown:        ScoreBreakdownItem[];
}

export interface ScoreBreakdownItem {
  eventId:   string;
  label:     string;
  impact:    number;
  resolved:  boolean;
}

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

// ─── Time decay multiplier ────────────────────────────────────────────────────
// Linear interpolation of Devin's lookup table (health-check-scoring-values.md §4).
// Applied to complaints, requests, visits, QC, project outcomes.
// NOT applied to: sensitive_event (own decay), new_cleaner, new_contact (window-based).
const DECAY_TABLE: [number, number][] = [
  [1,   1.00],
  [30,  0.90],
  [45,  0.80],
  [60,  0.60],
  [90,  0.40],
  [180, 0.15],
  [360, 0.10],
];

function getTimeDecayMultiplier(ageDays: number): number {
  if (ageDays <= 1)   return 1.00;
  if (ageDays >= 360) return 0.10;
  for (let i = 1; i < DECAY_TABLE.length; i++) {
    const [d0, w0] = DECAY_TABLE[i - 1];
    const [d1, w1] = DECAY_TABLE[i];
    if (ageDays <= d1) {
      const t = (ageDays - d0) / (d1 - d0);
      return w0 + t * (w1 - w0);
    }
  }
  return 0.10;
}

// ─── Main scoring function ────────────────────────────────────────────────────

// ─── Inherently positive events ───────────────────────────────────────────────
// These events have no open/in-progress state — they're always "done" and need
// no further action. Display layers use this to auto-place them in the Resolved
// section without requiring a user-triggered resolve action.
export function isInherentlyPositive(ev: HealthEvent): boolean {
  return (
    (ev.type === 'qc_inspection'   && ev.outcome === 'pass') ||
    (ev.type === 'customer_visit'  && (ev.outcome === 'positive' || ev.outcome === 'super_positive')) ||
    (ev.type === 'project_outcome' && ev.outcome === 'positive')
  );
}

export function computeLiveScore(
  events: HealthEvent[],
  config: ScoringConfig,
): LiveScoreResult {
  const breakdown: ScoreBreakdownItem[] = [];
  let posDelta = 0;
  let negDelta = 0;
  let incidentOverride = false;

  for (const ev of events) {
    // Inherently positive events are never treated as "resolved" for scoring:
    // they always use their natural positive impact, not the resolution bonus.
    const resolved   = !isInherentlyPositive(ev) && (ev.resolvedAt != null || ev.resolutionStatus === 'resolved');
    const ageDays    = daysSince(ev.loggedAt);
    let   impact     = 0;
    let   applyDecay = false; // standard time decay; window-based events skip this

    if (resolved) {
      // Resolved events get a small positive bonus
      impact = config.resolutionBonus;
    } else {
      switch (ev.type) {
        case 'complaint': {
          const base =
            ev.severity === 'high'   ? config.complaintHigh   :
            ev.severity === 'medium' ? config.complaintMedium :
                                       config.complaintLow;
          impact = base;
          applyDecay = true;
          break;
        }

        case 'sensitive_event':
          // Ops manager sets impact via outcome: 'red' | 'yellow' | 'none'
          // Uses its own linear decay over sensitiveEventDecayDays (not the standard table)
          if (ev.outcome !== 'none') {
            const base      = ev.outcome === 'yellow' ? config.sensitiveEventYellow : config.sensitiveEventRed;
            const decayDays = config.sensitiveEventDecayDays;
            if (ageDays <= decayDays) {
              impact = base * (1 - ageDays / decayDays);
            }
            if (ev.outcome !== 'yellow') incidentOverride = true;
          }
          break;

        case 'customer_request':
          impact = config.customerRequest;
          applyDecay = true;
          break;

        case 'sm_request':
          impact = config.smRequest;
          applyDecay = true;
          break;

        case 'new_cleaner':
          // Window-based per scoring doc §9 (configurable):
          //   Red:    0 – newCleanerRedDays    (default: 0–7d)
          //   Yellow: newCleanerRedDays – newCleanerYellowDays (default: 7–44d)
          //   Green:  > newCleanerYellowDays
          if      (ageDays <= config.newCleanerRedDays)    impact = config.newCleanerRed;
          else if (ageDays <= config.newCleanerYellowDays) impact = config.newCleanerYellow;
          break;

        case 'new_contact':
          // Window-based per scoring doc §10 (longest auto-red trigger in the system):
          //   Red:    0 – newContactRedDays    (default: 0–59d)
          //   Yellow: newContactRedDays – newContactYellowDays (default: 60–89d)
          //   Green:  > newContactYellowDays
          if      (ageDays <= config.newContactRedDays)    impact = config.newContactRed;
          else if (ageDays <= config.newContactYellowDays) impact = config.newContactYellow;
          break;

        case 'customer_visit':
          // 5-tier sentiment: super_positive / positive / neutral / negative / super_negative
          if      (ev.outcome === 'super_positive') impact = config.visitSuperPositive;
          else if (ev.outcome === 'positive')        impact = config.visitPositive;
          else if (ev.outcome === 'negative')        impact = config.visitNegative;
          else if (ev.outcome === 'super_negative')  impact = config.visitSuperNegative;
          // neutral: 0
          applyDecay = true;
          break;

        case 'qc_inspection':
          // Thresholds per scoring doc §3: ≥86=Green (pass), 70–85=Yellow (needs attention), ≤69=Red (fail)
          if      (ev.outcome === 'pass')            impact = config.qcPass;
          else if (ev.outcome === 'fail')            impact = config.qcFail;
          else if (ev.outcome === 'needs_attention') impact = config.qcNeedsAttention;
          applyDecay = true;
          break;

        case 'project_outcome':
          if      (ev.outcome === 'positive') impact = config.projectPositive;
          else if (ev.outcome === 'negative') impact = config.projectNegative;
          applyDecay = true;
          break;

        case 'supply_delivery':
          // neutral unless overdue — simplified for demo
          break;
      }

      // Apply system-wide time decay multiplier (scoring doc §4)
      if (applyDecay && config.enableTimeDecay && impact !== 0) {
        impact *= getTimeDecayMultiplier(ageDays);
      }
    }

    const roundedImpact = Math.round(impact);
    breakdown.push({ eventId: ev.id, label: ev.type, impact: roundedImpact, resolved });
    if (roundedImpact > 0) posDelta += roundedImpact; else negDelta += roundedImpact;
  }

  // Positives cannot buffer against negatives: negatives compute against base 100 first,
  // then positives recover back up — but never above 100.
  const afterNegatives = Math.max(0, 100 + negDelta);
  const rawScore = Math.min(100, afterNegatives + posDelta);
  const tier: HealthTier = incidentOverride
    ? 'red'
    : rawScore >= config.greenThreshold  ? 'green'
    : rawScore >= config.yellowThreshold ? 'yellow'
    : 'red';

  return { score: rawScore, tier, incidentOverride, breakdown };
}
