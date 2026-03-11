// ─── Survey Framework Types ───────────────────────────────────────────────────

export type SurveyCriterion =
  | 'restrooms'
  | 'lobby'
  | 'trash'
  | 'kitchen'
  | 'surfaces'
  | 'floors'
  | 'windows'
  | 'punctuality'
  | 'disruption'
  | 'communication';

export type CriterionRating = 1 | 2 | 3 | 4 | 5;

export interface CriterionMeta {
  key: string;
  emoji: string;
  label: string;
  question: string;
}

export const CRITERIA_META: CriterionMeta[] = [
  { key: 'restrooms',     emoji: '🚽', label: 'Spotless restrooms',        question: 'Were restrooms clean, stocked, and smelling fresh?' },
  { key: 'lobby',         emoji: '🚪', label: 'Clean lobby & entryways',    question: 'Was the first impression walking in a clean one?' },
  { key: 'trash',         emoji: '🗑️', label: 'Trash removal — all areas', question: 'Were all trash receptacles emptied throughout the space?' },
  { key: 'kitchen',       emoji: '☕', label: 'Clean break room / kitchen', question: 'Was the kitchen left clean, wiped down, and tidy?' },
  { key: 'surfaces',      emoji: '🖥️', label: 'Dust-free surfaces & desks', question: 'Were work surfaces and common areas visibly dust-free?' },
  { key: 'floors',        emoji: '✨', label: 'Polished floors',             question: 'Did floors look clean and well-maintained?' },
  { key: 'windows',       emoji: '🪟', label: 'Window ledges & glass',       question: 'Were ledges and glass surfaces clean and streak-free?' },
  { key: 'punctuality',   emoji: '⏰', label: 'On-time arrival',             question: 'Did the team arrive on schedule?' },
  { key: 'disruption',    emoji: '🔇', label: 'Minimal disruption to staff', question: 'Did the team work without interrupting your day?' },
  { key: 'communication', emoji: '💬', label: 'Clear communication',         question: 'Did you know what was happening and when?' },
];

// Pre-built additional options customers can select beyond the standard 10
export const EXTRA_CRITERIA_META: CriterionMeta[] = [
  { key: 'conference',  emoji: '🏢', label: 'Conference rooms',        question: 'Were conference rooms left clean and presentable?' },
  { key: 'stairwells',  emoji: '🪜', label: 'Stairwells & elevators',  question: 'Were stairwells and elevators clean and tidy?' },
  { key: 'outdoor',     emoji: '🌿', label: 'Outdoor entrance areas',  question: 'Was the outdoor entrance clean and welcoming?' },
  { key: 'shower',      emoji: '🚿', label: 'Shower / locker rooms',   question: 'Were shower and locker rooms clean and hygienic?' },
  { key: 'storage',     emoji: '📦', label: 'Storage & utility rooms', question: 'Were storage areas tidy and accessible?' },
  { key: 'seating',     emoji: '🪑', label: 'Waiting room & seating',  question: 'Was waiting room furniture and seating visibly clean?' },
  { key: 'odor',        emoji: '🌸', label: 'Odor & air freshness',    question: 'Did the space smell clean and fresh throughout?' },
  { key: 'securearea',  emoji: '🔒', label: 'Secure area protocols',   question: 'Did the team follow all secure area access protocols?' },
];

const ALL_PRESET_META: CriterionMeta[] = [...CRITERIA_META, ...EXTRA_CRITERIA_META];

// Returns display metadata for any criterion key — standard, extra, or custom (prefixed "custom:")
export function getCriterionMeta(key: string): { emoji: string; label: string; question: string } {
  const found = ALL_PRESET_META.find(m => m.key === key);
  if (found) return found;
  const label = key.startsWith('custom:') ? key.slice(7) : key;
  return { emoji: '✏️', label, question: `Did we meet your expectation for: ${label}?` };
}

export interface PreJobSurveyResponse {
  id: string;
  accountId: string;
  dealId: string;
  scheduledDate: string;
  selectedCriteria: SurveyCriterion[];
  submittedAt: string | null;
}

export interface PostJobCriterionRating {
  criterion: string;
  rating: CriterionRating;
  note?: string;
}

export interface PostJobSurveyResponse {
  id: string;
  preJobId: string;
  accountId: string;
  dealId: string;
  serviceDate: string;
  criterionRatings: PostJobCriterionRating[];
  overallSentiment: 'positive' | 'negative';
  followUpNote?: string;
  averageScore: number;
  submittedAt: string;
}

// ─── Health Score Signal Types ────────────────────────────────────────────────

export type SignalStatus = 'green' | 'yellow' | 'red' | 'na';
export type SignalCategory = 'risk' | 'activity' | 'outcome';

export interface HealthSignal {
  id: string;
  label: string;
  status: SignalStatus;
  detail: string;
  category: SignalCategory;
  pointImpact: number; // negative = hurts score, positive = helps
  threshold?: string;  // RYG threshold context shown in UI (e.g. "Red: 0–15d · Yellow: 15–30d")
  decayDays?: number;  // for time-decaying signals
}

export type HealthTier = 'green' | 'yellow' | 'red';

// Revenue-based account tier (1 = largest, 5 = smallest)
export type AccountTier = 1 | 2 | 3 | 4 | 5;

export interface RiskProfile {
  eventCount12m: number;        // total HealthEvents in rolling 12 months
  incidentCount12m: number;     // incident + sensitive_event only
  lastEventAt: string;          // most recent event ISO timestamp
  watchlist: boolean;           // true if incidentCount12m >= threshold (default: 2+)
  watchlistReason?: string;     // e.g. "3 incidents in 12 months"
}

// Monthly visit/QC/delivery requirements by account tier
export const TIER_REQUIREMENTS: Record<AccountTier, {
  visitsPerMonth: number;
  qcPerMonth: number;
  deliveriesPerMonth: number;
  label: string;
}> = {
  1: { visitsPerMonth: 1,    qcPerMonth: 2, deliveriesPerMonth: 4, label: 'Tier 1 ($10,001+/mo)' },
  2: { visitsPerMonth: 1,    qcPerMonth: 1, deliveriesPerMonth: 1, label: 'Tier 2 ($2,501–$10,000/mo)' },
  3: { visitsPerMonth: 0.75, qcPerMonth: 1, deliveriesPerMonth: 1, label: 'Tier 3 ($1,001–$2,500/mo)' },
  4: { visitsPerMonth: 0.67, qcPerMonth: 1, deliveriesPerMonth: 1, label: 'Tier 4 ($551–$1,000/mo)' },
  5: { visitsPerMonth: 0.33, qcPerMonth: 0.5, deliveriesPerMonth: 0.5, label: 'Tier 5 ($0–$550/mo)' },
};

export interface AccountHealthScore {
  accountId: string;
  accountName: string;
  dealId: string;
  dealName: string;
  score: number;         // 0–100
  tier: HealthTier;      // 70+ = green, 40–69 = yellow, 0–39 = red
  trend: number;         // delta vs last month (+/-)
  accountTier: AccountTier;   // revenue-based tier 1–5
  monthlyRevenue: number;     // MRR in USD
  incidentOverride: boolean;  // true = forced Red by open incident/sensitive_event
  riskProfile: RiskProfile;
  lastComputedAt: string;     // ISO timestamp of last score compute
  signals: HealthSignal[];
  lastSurveyDate: string | null;
  lastSurveyScore: number | null;
  recentSurveys: PostJobSurveyResponse[];
  preJobSurveys: PreJobSurveyResponse[];
  actionItems: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTierFromScore(score: number): HealthTier {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

export function getTierLabel(tier: HealthTier): string {
  if (tier === 'green') return 'Healthy';
  if (tier === 'yellow') return 'Needs Attention';
  return 'At Risk';
}

export function getTierColors(tier: HealthTier): { text: string; bg: string; border: string } {
  if (tier === 'green')  return { text: 'text-status-active',  bg: 'bg-status-activeSurface',  border: 'border-status-active' };
  if (tier === 'yellow') return { text: 'text-status-warning', bg: 'bg-status-warningSurface', border: 'border-status-warning' };
  return                        { text: 'text-status-danger',  bg: 'bg-status-dangerSurface',  border: 'border-status-danger' };
}

export function getSignalStatusColor(status: SignalStatus): string {
  if (status === 'green')  return '#16A34A';
  if (status === 'yellow') return '#F59E0B';
  if (status === 'red')    return '#DC2626';
  return '#C9C9C9';
}
