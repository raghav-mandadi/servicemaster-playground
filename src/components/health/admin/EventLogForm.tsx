import { useState } from 'react';
import { Camera } from 'lucide-react';
import type { HealthEvent, EventType, EventSeverity } from '../../../types/health';
import { EVENT_META } from '../eventMeta';

interface EventLogFormProps {
  dealName: string;
  onSubmit: (event: Omit<HealthEvent, 'id' | 'dealId' | 'loggedAt'>) => void;
  onCancel: () => void;
}

const SEVERITY_TYPES: EventType[] = ['complaint'];
const OUTCOME_TYPES:  EventType[] = ['customer_visit', 'qc_inspection', 'project_outcome'];

// Customer visit: 5-tier sentiment scale per requirements
const VISIT_SENTIMENT = [
  { label: 'Super Positive', value: 'super_positive', color: '#16A34A' },
  { label: 'Positive',       value: 'positive',       color: '#22C55E' },
  { label: 'Neutral',        value: 'neutral',        color: '#6D6D6D' },
  { label: 'Negative',       value: 'negative',       color: '#D97706' },
  { label: 'Super Negative', value: 'super_negative', color: '#DC2626' },
];

const OUTCOME_OPTIONS: Record<string, { label: string; value: string; color?: string }[]> = {
  qc_inspection:   [
    { label: 'Pass',           value: 'pass',           color: '#16A34A' },
    { label: 'Needs Attention',value: 'needs_attention', color: '#D97706' },
    { label: 'Fail',           value: 'fail',           color: '#DC2626' },
  ],
  project_outcome: [
    { label: 'Positive', value: 'positive', color: '#16A34A' },
    { label: 'Neutral',  value: 'neutral',  color: '#6D6D6D' },
    { label: 'Negative', value: 'negative', color: '#DC2626' },
  ],
};

// Sensitive event: ops manager sets the score impact level (no forced subtypes)
const SENSITIVE_IMPACT = [
  { label: 'Red Impact',    value: 'red',    color: '#DC2626', hint: 'Forces Red tier + full deduction; decays over 30 days' },
  { label: 'Yellow Impact', value: 'yellow', color: '#D97706', hint: 'Deduction only, no tier override; decays over 30 days' },
  { label: 'No Impact',     value: 'none',   color: '#6D6D6D', hint: 'Logged for record only — does not affect score' },
];

const SEVERITY_LABELS: { label: string; value: EventSeverity; color: string }[] = [
  { label: 'Low',    value: 'low',    color: '#6D6D6D' },
  { label: 'Medium', value: 'medium', color: '#D97706' },
  { label: 'High',   value: 'high',   color: '#DC2626' },
];

const VISITED_BY_OPTIONS = ['Ops Manager', 'GM', 'Sales'];

const EVENT_TYPES = Object.keys(EVENT_META) as EventType[];

export function EventLogForm({ onSubmit, onCancel }: EventLogFormProps) {
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [severity,     setSeverity]     = useState<EventSeverity | null>(null);
  const [outcome,      setOutcome]      = useState<string | null>(null);
  const [description,  setDescription]  = useState('');
  const [hasPhotos,    setHasPhotos]    = useState(false);

  // new_contact fields
  const [contactName,  setContactName]  = useState('');
  const [startDate,    setStartDate]    = useState('');

  // new_cleaner fields
  const [cleanerName,  setCleanerName]  = useState('');
  const [cleanerStart, setCleanerStart] = useState('');

  // customer_visit fields
  const [visitedBy,    setVisitedBy]    = useState('');

  function handleTypeSelect(type: EventType) {
    setSelectedType(type);
    setSeverity(null);
    setOutcome(null);
  }

  function handleSubmit() {
    if (!selectedType || !description.trim()) return;
    onSubmit({
      type:         selectedType,
      severity:     severity ?? undefined,
      outcome:      outcome ?? undefined,
      description:  description.trim(),
      hasPhotos,
      loggedBy:     'Current User',
      loggedByRole: 'cs',
      ...(selectedType === 'new_contact' && contactName ? { contactName } : {}),
      ...(selectedType === 'new_contact' && startDate   ? { startDate }   : {}),
      ...(selectedType === 'new_cleaner' && cleanerName  ? { cleanerName }  : {}),
      ...(selectedType === 'new_cleaner' && cleanerStart ? { startDate: cleanerStart } : {}),
      ...(selectedType === 'customer_visit' && visitedBy ? { visitedBy } : {}),
    });
  }

  const isNewContact = selectedType === 'new_contact';
  const isNewCleaner = selectedType === 'new_cleaner';
  const isVisit      = selectedType === 'customer_visit';
  const isSensitive  = selectedType === 'sensitive_event';

  const canSubmit = selectedType !== null && description.trim().length > 0 &&
    (!isNewContact || (contactName.trim().length > 0 && startDate.length > 0)) &&
    (!isNewCleaner || (cleanerName.trim().length > 0 && cleanerStart.length > 0));

  return (
    <div className="flex flex-col gap-4">
      {/* Event type grid */}
      <div>
        <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-2">Event Type</p>
        <div className="grid grid-cols-2 gap-2">
          {EVENT_TYPES.map(type => {
            const { label, Icon, color } = EVENT_META[type];
            const active = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] border text-left transition-all"
                style={{
                  borderColor: active ? '#00A2B2' : '#E0E3EA',
                  background:  active ? '#E6F8FA' : '#FAFAFA',
                  outline:     active ? '2px solid #00A2B233' : 'none',
                  outlineOffset: 1,
                }}
              >
                <Icon size={14} color={active ? '#00A2B2' : color} style={{ flexShrink: 0 }} />
                <span
                  className="text-[12px] font-medium leading-tight"
                  style={{ color: active ? '#00A2B2' : '#3A3A3A' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complaint severity */}
      {selectedType && SEVERITY_TYPES.includes(selectedType) && (
        <div>
          <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-2">Severity</p>
          <div className="flex gap-2">
            {SEVERITY_LABELS.map(({ label, value, color }) => {
              const active = severity === value;
              return (
                <button
                  key={value}
                  onClick={() => setSeverity(active ? null : value)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                  style={{
                    borderColor: active ? color : '#E0E3EA',
                    background:  active ? color + '18' : '#FAFAFA',
                    color:       active ? color : '#6D6D6D',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sensitive event — ops manager sets impact level, no forced subtypes */}
      {isSensitive && (
        <div>
          <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-2">Score Impact</p>
          <div className="flex flex-col gap-1.5">
            {SENSITIVE_IMPACT.map(({ label, value, color, hint }) => {
              const active = outcome === value;
              return (
                <button
                  key={value}
                  onClick={() => setOutcome(active ? null : value)}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-[8px] border text-left transition-all"
                  style={{
                    borderColor: active ? color : '#E0E3EA',
                    background:  active ? color + '10' : '#FAFAFA',
                  }}
                >
                  <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: color }} />
                  <div>
                    <span className="text-[12px] font-medium" style={{ color: active ? color : '#3A3A3A' }}>{label}</span>
                    <p className="text-[10px] text-text-subtle mt-0.5">{hint}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer visit sentiment — 5-tier scale + visited by */}
      {isVisit && (
        <>
          <div>
            <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-2">Visit Sentiment</p>
            <div className="flex flex-wrap gap-2">
              {VISIT_SENTIMENT.map(({ label, value, color }) => {
                const active = outcome === value;
                return (
                  <button
                    key={value}
                    onClick={() => setOutcome(active ? null : value)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                    style={{
                      borderColor: active ? color : '#E0E3EA',
                      background:  active ? color + '18' : '#FAFAFA',
                      color:       active ? color : '#6D6D6D',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-2">Visited By</p>
            <div className="flex gap-2">
              {VISITED_BY_OPTIONS.map(opt => {
                const active = visitedBy === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setVisitedBy(active ? '' : opt)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                    style={{
                      borderColor: active ? '#00A2B2' : '#E0E3EA',
                      background:  active ? '#E6F8FA' : '#FAFAFA',
                      color:       active ? '#00A2B2' : '#6D6D6D',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* QC / Project outcome */}
      {selectedType && OUTCOME_TYPES.includes(selectedType) && !isVisit && (
        <div>
          <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-2">Outcome</p>
          <div className="flex flex-wrap gap-2">
            {(OUTCOME_OPTIONS[selectedType] ?? []).map(({ label, value, color = '#6D6D6D' }) => {
              const active = outcome === value;
              return (
                <button
                  key={value}
                  onClick={() => setOutcome(active ? null : value)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                  style={{
                    borderColor: active ? color : '#E0E3EA',
                    background:  active ? color + '18' : '#FAFAFA',
                    color:       active ? color : '#6D6D6D',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* New Contact — required fields */}
      {isNewContact && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-1.5">
              Contact Name <span className="text-[#DC2626]">*</span>
            </p>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="e.g. Jennifer Walsh"
              className="w-full px-3 py-2 text-[13px] border border-border-card rounded-[8px] outline-none focus:border-primary bg-surface-header"
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-1.5">
              Start Date <span className="text-[#DC2626]">*</span>
            </p>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-border-card rounded-[8px] outline-none focus:border-primary bg-surface-header"
            />
          </div>
        </div>
      )}

      {/* New Cleaner — required fields */}
      {isNewCleaner && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-1.5">
              Cleaner Name <span className="text-[#DC2626]">*</span>
            </p>
            <input
              type="text"
              value={cleanerName}
              onChange={e => setCleanerName(e.target.value)}
              placeholder="e.g. Carlos Mendez"
              className="w-full px-3 py-2 text-[13px] border border-border-card rounded-[8px] outline-none focus:border-primary bg-surface-header"
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-1.5">
              Start Date <span className="text-[#DC2626]">*</span>
            </p>
            <input
              type="date"
              value={cleanerStart}
              onChange={e => setCleanerStart(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-border-card rounded-[8px] outline-none focus:border-primary bg-surface-header"
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-2">Description</p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what happened, what was observed, or what was communicated…"
          rows={3}
          className="w-full px-3 py-2 text-[13px] text-text-primary border border-border-card rounded-[8px] outline-none focus:border-primary resize-none bg-surface-header leading-relaxed"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setHasPhotos(p => !p)}
          className="flex items-center gap-1.5 text-[12px] font-medium transition-colors"
          style={{ color: hasPhotos ? '#00A2B2' : '#8E8E93' }}
        >
          <Camera size={14} />
          {hasPhotos ? 'Photos attached' : 'Attach photos'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-[12px] font-medium text-text-subtle border border-border-card rounded-[6px] hover:bg-surface-header transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-1.5 text-[12px] font-semibold text-white rounded-[6px] transition-colors"
            style={{ background: canSubmit ? '#00A2B2' : '#C9C9C9', cursor: canSubmit ? 'pointer' : 'default' }}
          >
            Log Event
          </button>
        </div>
      </div>
    </div>
  );
}
