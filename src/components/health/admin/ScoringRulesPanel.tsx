import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { ScoringConfig } from '../../../data/scoringConfig';
import { DEFAULT_SCORING_CONFIG } from '../../../data/scoringConfig';

interface ScoringRulesPanelProps {
  config:   ScoringConfig;
  onChange: (config: ScoringConfig) => void;
  onClose:  () => void;
}

// ─── Field editor ─────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  value,
  onChange,
  positive,
}: {
  label:    string;
  hint?:    string;
  value:    number;
  onChange: (v: number) => void;
  positive?: boolean;
}) {
  const color = positive
    ? '#16A34A'
    : value < 0
    ? '#DC2626'
    : '#6D6D6D';

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border-card last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-text-primary">{label}</p>
        {hint && <p className="text-[10px] text-text-subtle mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-16 text-right text-[12px] font-semibold border border-border-card rounded-[5px] px-2 py-1 outline-none focus:border-[#00A2B2] transition-colors"
          style={{ color }}
          step={1}
        />
        <span className="text-[10px] text-text-subtle w-5">pts</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-2">{title}</p>
      <div className="bg-white border border-border-card rounded-[8px] px-3">
        {children}
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ScoringRulesPanel({ config, onChange, onClose }: ScoringRulesPanelProps) {
  const [draft, setDraft] = useState<ScoringConfig>({ ...config });

  function set<K extends keyof ScoringConfig>(key: K, value: number) {
    setDraft(prev => ({ ...prev, [key]: value }));
  }

  function apply() {
    onChange(draft);
    onClose();
  }

  function reset() {
    setDraft({ ...DEFAULT_SCORING_CONFIG });
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(DEFAULT_SCORING_CONFIG);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end"
      onClick={onClose}
    >
      <div
        className="bg-[#F4F7FA] h-full w-[400px] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-border-card flex-shrink-0">
          <div>
            <p className="text-[14px] font-semibold text-text-primary">Scoring Rules</p>
            <p className="text-[11px] text-text-subtle mt-0.5">Tweaks take effect immediately on live-scored deals</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-[11px] text-text-subtle hover:text-text-primary transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-surface-header border border-border-card flex items-center justify-center hover:bg-border-card transition-colors"
            >
              <X size={13} className="text-text-subtle" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">

          {/* Tier thresholds */}
          <Section title="Tier Thresholds">
            <Field
              label="Green threshold"
              hint="Score ≥ this → Healthy"
              value={draft.greenThreshold}
              onChange={v => set('greenThreshold', v)}
              positive
            />
            <Field
              label="Yellow threshold"
              hint="Score ≥ this → Needs Attention (else Red)"
              value={draft.yellowThreshold}
              onChange={v => set('yellowThreshold', v)}
              positive
            />
          </Section>

          {/* Complaints */}
          <Section title="Complaints (open, unresolved)">
            <Field label="Low severity" value={draft.complaintLow} onChange={v => set('complaintLow', v)} />
            <Field label="Medium severity" value={draft.complaintMedium} onChange={v => set('complaintMedium', v)} />
            <Field label="High severity" value={draft.complaintHigh} onChange={v => set('complaintHigh', v)} />
          </Section>

          {/* Sensitive events */}
          <Section title="Sensitive Events">
            <Field
              label="Red impact (forces Red tier)"
              hint="Ops manager sets Red severity · Decays to 0 linearly over decay days"
              value={draft.sensitiveEventRed}
              onChange={v => set('sensitiveEventRed', v)}
            />
            <Field
              label="Yellow impact (score only)"
              hint="No tier override · Decays to 0 over same decay window"
              value={draft.sensitiveEventYellow}
              onChange={v => set('sensitiveEventYellow', v)}
            />
            <Field
              label="Decay window (days)"
              hint="Days until sensitive event impact reaches 0"
              value={draft.sensitiveEventDecayDays}
              onChange={v => set('sensitiveEventDecayDays', v)}
              positive
            />
          </Section>

          {/* Requests */}
          <Section title="Open Requests">
            <Field label="Customer request" value={draft.customerRequest} onChange={v => set('customerRequest', v)} />
            <Field label="SM internal request" value={draft.smRequest} onChange={v => set('smRequest', v)} />
          </Section>

          {/* New cleaner — configurable time windows per scoring doc §9 */}
          <Section title="New Cleaner Assigned">
            <Field
              label="Red window deduction"
              hint={`Applied days 0–${draft.newCleanerRedDays} · Immediate risk period`}
              value={draft.newCleanerRed}
              onChange={v => set('newCleanerRed', v)}
            />
            <Field
              label="Yellow window deduction"
              hint={`Applied days ${draft.newCleanerRedDays}–${draft.newCleanerYellowDays} · Monitoring period`}
              value={draft.newCleanerYellow}
              onChange={v => set('newCleanerYellow', v)}
            />
            <Field
              label="Red window (days)"
              hint="Days before transition to Yellow (default: 7)"
              value={draft.newCleanerRedDays}
              onChange={v => set('newCleanerRedDays', v)}
              positive
            />
            <Field
              label="Yellow window end (days)"
              hint="Days before site is cleared to Green (default: 44)"
              value={draft.newCleanerYellowDays}
              onChange={v => set('newCleanerYellowDays', v)}
              positive
            />
          </Section>

          {/* New contact — configurable time windows per scoring doc §10 */}
          <Section title="New Contact Person">
            <Field
              label="Red window deduction"
              hint={`Applied days 0–${draft.newContactRedDays} · Longest auto-red trigger`}
              value={draft.newContactRed}
              onChange={v => set('newContactRed', v)}
            />
            <Field
              label="Yellow window deduction"
              hint={`Applied days ${draft.newContactRedDays}–${draft.newContactYellowDays}`}
              value={draft.newContactYellow}
              onChange={v => set('newContactYellow', v)}
            />
            <Field
              label="Red window (days)"
              hint="Days before transition to Yellow (default: 59)"
              value={draft.newContactRedDays}
              onChange={v => set('newContactRedDays', v)}
              positive
            />
            <Field
              label="Yellow window end (days)"
              hint="Days before site is cleared to Green (default: 89)"
              value={draft.newContactYellowDays}
              onChange={v => set('newContactYellowDays', v)}
              positive
            />
          </Section>

          {/* QC Inspections — thresholds per scoring doc §3 */}
          <Section title="QC Inspection Outcomes">
            <Field label="Pass (score ≥ 86)" value={draft.qcPass} onChange={v => set('qcPass', v)} positive />
            <Field label="Needs attention (70–85)" value={draft.qcNeedsAttention} onChange={v => set('qcNeedsAttention', v)} />
            <Field label="Fail (score ≤ 69)" value={draft.qcFail} onChange={v => set('qcFail', v)} />
          </Section>

          {/* Customer visits */}
          <Section title="Customer Visit Sentiment">
            <Field label="Super Positive" value={draft.visitSuperPositive} onChange={v => set('visitSuperPositive', v)} positive />
            <Field label="Positive" value={draft.visitPositive} onChange={v => set('visitPositive', v)} positive />
            <Field label="Negative" value={draft.visitNegative} onChange={v => set('visitNegative', v)} />
            <Field label="Super Negative" value={draft.visitSuperNegative} onChange={v => set('visitSuperNegative', v)} />
          </Section>

          {/* Project outcomes */}
          <Section title="Project Outcomes">
            <Field label="Positive outcome" value={draft.projectPositive} onChange={v => set('projectPositive', v)} positive />
            <Field label="Negative outcome" value={draft.projectNegative} onChange={v => set('projectNegative', v)} />
          </Section>

          {/* Resolution bonus */}
          <Section title="Resolution">
            <Field
              label="Bonus when event resolved"
              hint="Added to score when an open event is marked resolved"
              value={draft.resolutionBonus}
              onChange={v => set('resolutionBonus', v)}
              positive
            />
          </Section>

          {/* Time decay toggle */}
          <div className="mb-5">
            <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-2">System-Wide Time Decay</p>
            <div className="bg-white border border-border-card rounded-[8px] px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[12px] text-text-primary">Decay multiplier</p>
                <p className="text-[10px] text-text-subtle mt-0.5">
                  Events age: 1.00× today → 0.90× at 30d → 0.60× at 60d → 0.40× at 90d → 0.10× at 360d
                </p>
              </div>
              <button
                onClick={() => setDraft(prev => ({ ...prev, enableTimeDecay: !prev.enableTimeDecay }))}
                className="flex-shrink-0 w-10 h-5 rounded-full transition-colors relative"
                style={{ background: draft.enableTimeDecay ? '#00A2B2' : '#D1D5DB' }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: draft.enableTimeDecay ? '1.375rem' : '0.125rem' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-white border-t border-border-card flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-[13px] font-medium text-text-subtle border border-border-card rounded-[8px] hover:border-border transition-colors"
          >
            Discard
          </button>
          <button
            onClick={apply}
            className="flex-1 py-2 text-[13px] font-semibold text-white bg-[#00A2B2] hover:bg-[#008A99] rounded-[8px] transition-colors"
          >
            Apply Rules
          </button>
        </div>
      </div>
    </div>
  );
}
