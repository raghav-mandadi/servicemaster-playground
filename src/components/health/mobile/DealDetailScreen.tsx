import { useState } from 'react';
import {
  ChevronLeft, Plus, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Camera, Image,
  MapPin, Phone, Mail, Calendar, FileText, Info,
} from 'lucide-react';
import type { AccountHealthScore, HealthEvent } from '../../../types/health';
import type { ScoreBreakdownItem } from '../../../utils/healthScoring';
import { isInherentlyPositive } from '../../../utils/healthScoring';
import { EVENT_META } from '../eventMeta';

interface DealDetailScreenProps {
  account:          AccountHealthScore;
  mergedEvents:     HealthEvent[];
  breakdown?:       ScoreBreakdownItem[];
  photos?:          Record<string, number>;
  onBack:           () => void;
  onLogEvent:       () => void;
  onUpdateStatus?:  (eventId: string, status: 'in_progress' | 'resolved', note: string) => void;
  onAddPhoto?:      (eventId: string) => void;
}

type FilterKey = 'all' | 'open' | 'in_progress' | 'resolved';

const TIER_COLOR: Record<string, string> = {
  green:  '#16A34A',
  yellow: '#D97706',
  red:    '#DC2626',
};
const TIER_LABEL: Record<string, string> = {
  green:  'Healthy',
  yellow: 'Needs Attention',
  red:    'At Risk',
};
const SEVERITY_COLOR: Record<string, string> = {
  low:    '#6D6D6D',
  medium: '#D97706',
  high:   '#DC2626',
};
const OUTCOME_COLOR: Record<string, string> = {
  pass: '#16A34A', positive: '#16A34A', super_positive: '#16A34A',
  needs_attention: '#D97706', neutral: '#6D6D6D', yellow: '#D97706',
  fail: '#DC2626', negative: '#DC2626', super_negative: '#DC2626', red: '#DC2626',
};
const PHOTO_COLORS = ['#BFDBFE', '#BBF7D0', '#FDE68A', '#FECACA', '#DDD6FE'];
const FREQ_LABEL: Record<string, string> = {
  daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-Weekly', monthly: 'Monthly',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatContractDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function isThisWeek(iso: string): boolean {
  const now = new Date(); const day = now.getUTCDay();
  const ws = new Date(now); ws.setUTCDate(now.getUTCDate() - (day === 0 ? 6 : day - 1)); ws.setUTCHours(0, 0, 0, 0);
  return new Date(iso) >= ws;
}

// ─── Inline action form ───────────────────────────────────────────────────────

interface ActionFormProps {
  mode: 'in_progress' | 'resolved';
  photos: number;
  onSave: (note: string) => void;
  onCancel: () => void;
  onAddPhoto: () => void;
}

function ActionForm({ mode, photos, onSave, onCancel, onAddPhoto }: ActionFormProps) {
  const [note, setNote] = useState('');
  const color = mode === 'resolved' ? '#16A34A' : '#D97706';
  return (
    <div style={{ padding: '12px 14px', background: '#FAFBFC', borderTop: '1px solid #F2F2F7' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>
        {mode === 'resolved' ? 'Resolve Event' : 'Mark In Progress'}
      </p>
      <textarea
        style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, color: '#1C1B1F', padding: '8px 10px', border: '1px solid #E6E8ED', borderRadius: 8, resize: 'none', background: '#fff', fontFamily: 'Helvetica Neue, sans-serif', outline: 'none' }}
        rows={2}
        placeholder="Add a resolution note (optional)…"
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <button onClick={onAddPhoto} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#00A2B2', background: '#F0FDFC', border: '1px solid #CCFBF1', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>
          <Camera size={13} />Add Photo
        </button>
        {Array.from({ length: photos }).map((_, i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: 6, background: PHOTO_COLORS[i % PHOTO_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Image size={14} color="rgba(0,0,0,0.3)" />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#6D6D6D', background: '#F2F2F7', border: 'none', borderRadius: 8, padding: '9px', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>Cancel</button>
        <button onClick={() => onSave(note)} style={{ flex: 2, fontSize: 13, fontWeight: 600, color: '#fff', background: color, border: 'none', borderRadius: 8, padding: '9px', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>Save</button>
      </div>
    </div>
  );
}

// ─── Single event card ────────────────────────────────────────────────────────

function MobileEventCard({ event, impact, photos, onUpdateStatus, onAddPhoto }: {
  event: HealthEvent; impact: number; photos: number;
  onUpdateStatus?: (id: string, s: 'in_progress' | 'resolved', note: string) => void;
  onAddPhoto?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [actionMode, setActionMode] = useState<'in_progress' | 'resolved' | null>(null);

  const meta         = EVENT_META[event.type];
  const Icon         = meta.Icon;
  const autoResolved = isInherentlyPositive(event);
  const resolved     = !!event.resolvedAt || event.resolutionStatus === 'resolved' || autoResolved;
  const inProgress   = !resolved && event.resolutionStatus === 'in_progress';

  const badgeText  = event.severity ?? event.outcome ?? null;
  const badgeColor = event.severity ? SEVERITY_COLOR[event.severity] : event.outcome ? (OUTCOME_COLOR[event.outcome] ?? '#6D6D6D') : null;

  function handleSave(note: string) {
    if (!actionMode) return;
    onUpdateStatus?.(event.id, actionMode, note);
    setActionMode(null); setExpanded(false);
  }

  return (
    <div style={{ borderTop: '1px solid #F2F2F7', opacity: resolved ? 0.65 : 1 }}>
      {/* Tap row */}
      <button
        onClick={() => { setExpanded(e => !e); setActionMode(null); }}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Helvetica Neue, sans-serif' }}
      >
        <div style={{ paddingTop: 3, flexShrink: 0 }}>
          {resolved ? <CheckCircle2 size={14} color="#16A34A" /> : inProgress ? <Clock size={14} color="#D97706" /> : <div style={{ width: 12, height: 12, borderRadius: '50%', background: meta.color + '25', border: `1.5px solid ${meta.color}`, marginTop: 1 }} />}
        </div>
        <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: meta.color + '14', border: `1px solid ${meta.color}30` }}>
          <Icon size={12} color={meta.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: resolved ? '#8E8E93' : '#1C1B1F' }}>{meta.label}</span>
            {badgeText && badgeColor && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: badgeColor + '18', color: badgeColor, textTransform: 'capitalize' }}>{badgeText.replace(/_/g, ' ')}</span>}
            {inProgress && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#FFFBEB', color: '#D97706' }}>In Progress</span>}
            {resolved   && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#F0FDF4', color: '#16A34A' }}>Resolved</span>}
            {impact !== 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: (impact > 0 ? '#16A34A' : '#DC2626') + '15', color: impact > 0 ? '#16A34A' : '#DC2626' }}>{impact > 0 ? '+' : ''}{impact}</span>}
            {(event.hasPhotos || photos > 0) && <Camera size={10} color="#8E8E93" />}
          </div>
          <p style={{ fontSize: 12, color: '#6D6D6D', margin: 0, lineHeight: 1.4 }}>{event.description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#AEAEB2' }}>{formatDate(event.loggedAt)}</span>
          {expanded ? <ChevronUp size={12} color="#AEAEB2" /> : <ChevronDown size={12} color="#AEAEB2" />}
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div style={{ background: '#FAFBFC', borderTop: '1px solid #F2F2F7' }}>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Metadata grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
              {event.complainant && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>Complainant</p>
                  <p style={{ fontSize: 12, color: '#1C1B1F', margin: 0, fontWeight: 500 }}>{event.complainant}</p>
                </div>
              )}
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>Reported by</p>
                <p style={{ fontSize: 12, color: '#1C1B1F', margin: 0 }}>{event.loggedBy}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>Date</p>
                <p style={{ fontSize: 12, color: '#1C1B1F', margin: 0 }}>{formatDate(event.loggedAt)}</p>
              </div>
              {inProgress && event.inProgressAt && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>In Progress since</p>
                  <p style={{ fontSize: 12, color: '#D97706', margin: 0 }}>{formatDate(event.inProgressAt)}{event.inProgressBy ? ` · ${event.inProgressBy}` : ''}</p>
                </div>
              )}
              {resolved && event.resolvedAt && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>Resolved</p>
                  <p style={{ fontSize: 12, color: '#16A34A', margin: 0 }}>{formatDate(event.resolvedAt)}{event.resolvedBy ? ` · ${event.resolvedBy}` : ''}</p>
                </div>
              )}
            </div>

            {/* Resolution note */}
            {event.resolutionNote && (
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 8, padding: '8px 10px' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#0369A1', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 3px' }}>Note</p>
                <p style={{ fontSize: 12, color: '#1C1B1F', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{event.resolutionNote}"</p>
              </div>
            )}

            {/* Photos */}
            {(event.hasPhotos || photos > 0) && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px' }}>Photos</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {event.hasPhotos && [0, 1, 2].map(i => (
                    <div key={`s${i}`} style={{ width: 52, height: 52, borderRadius: 8, background: PHOTO_COLORS[(i + 2) % PHOTO_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.08)' }}>
                      <Image size={16} color="rgba(0,0,0,0.3)" />
                    </div>
                  ))}
                  {Array.from({ length: photos }).map((_, i) => (
                    <div key={`n${i}`} style={{ width: 52, height: 52, borderRadius: 8, background: PHOTO_COLORS[i % PHOTO_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.08)' }}>
                      <Image size={16} color="rgba(0,0,0,0.3)" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions — hidden for auto-resolved positive events */}
            {!resolved && !autoResolved && !actionMode && onUpdateStatus && (
              <div style={{ display: 'flex', gap: 8 }}>
                {!inProgress && (
                  <button onClick={() => setActionMode('in_progress')} style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>
                    In Progress
                  </button>
                )}
                <button onClick={() => setActionMode('resolved')} style={{ flex: 2, fontSize: 13, fontWeight: 600, color: '#fff', background: '#16A34A', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} />Resolve
                </button>
              </div>
            )}

            {!resolved && !autoResolved && !actionMode && onAddPhoto && (
              <button onClick={() => onAddPhoto(event.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#6D6D6D', background: '#F2F2F7', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>
                <Camera size={13} />Add Photo
              </button>
            )}

            {resolved && (
              <button onClick={() => setExpanded(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: '#8E8E93', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontFamily: 'Helvetica Neue, sans-serif' }}>
                <ChevronUp size={12} color="#8E8E93" />Close
              </button>
            )}
          </div>

          {actionMode && (
            <ActionForm
              mode={actionMode}
              photos={photos}
              onSave={handleSave}
              onCancel={() => setActionMode(null)}
              onAddPhoto={() => onAddPhoto?.(event.id)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function DealDetailScreen({
  account, mergedEvents, breakdown, photos,
  onBack, onLogEvent, onUpdateStatus, onAddPhoto,
}: DealDetailScreenProps) {
  const [activeFilter,  setActiveFilter]  = useState<FilterKey>('all');
  const [showDetails,   setShowDetails]   = useState(false);

  const byDate = (a: HealthEvent, b: HealthEvent) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime();

  const openEvents       = mergedEvents.filter(e => !e.resolvedAt && e.resolutionStatus == null && !isInherentlyPositive(e)).sort(byDate);
  const inProgressEvents = mergedEvents.filter(e => !e.resolvedAt && e.resolutionStatus === 'in_progress' && !isInherentlyPositive(e)).sort(byDate);
  const resolvedEvents   = mergedEvents.filter(e =>  e.resolvedAt || e.resolutionStatus === 'resolved' || isInherentlyPositive(e)).sort(byDate);

  const filteredEvents: HealthEvent[] =
    activeFilter === 'open'        ? openEvents :
    activeFilter === 'in_progress' ? inProgressEvents :
    activeFilter === 'resolved'    ? resolvedEvents :
    [...openEvents, ...inProgressEvents, ...resolvedEvents];

  const resolvedThisWeek = resolvedEvents.filter(e => e.resolvedAt && isThisWeek(e.resolvedAt)).length;
  const openCount        = openEvents.length + inProgressEvents.length;
  const getImpact        = (id: string) => breakdown?.find(b => b.eventId === id)?.impact ?? 0;

  const FILTERS: { key: FilterKey; label: string; count: number; color: string }[] = [
    { key: 'all',         label: 'All',         count: mergedEvents.length,   color: '#6D6D6D' },
    { key: 'open',        label: 'Open',         count: openEvents.length,       color: '#DC2626' },
    { key: 'in_progress', label: 'In Progress',  count: inProgressEvents.length, color: '#D97706' },
    { key: 'resolved',    label: 'Resolved',     count: resolvedEvents.length,   color: '#16A34A' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Helvetica Neue, sans-serif', background: '#F4F7FA' }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 14px 10px', borderBottom: '1px solid #E6E8ED', background: '#fff', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
          <ChevronLeft size={18} color="#00A2B2" />
          <span style={{ fontSize: 14, color: '#00A2B2' }}>Sites</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Deal header — tappable to expand site details */}
        <div style={{ background: '#fff', border: '1px solid #E6E8ED', borderRadius: 14, overflow: 'hidden' }}>
          <button
            onClick={() => setShowDetails(d => !d)}
            style={{ padding: '16px', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', background: 'none', border: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#1C1B1F', margin: 0, lineHeight: 1.2 }}>{account.dealName}</p>
                <p style={{ fontSize: 13, color: '#8E8E93', margin: '3px 0 0' }}>{account.accountName}</p>
                {(account.address || account.city) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <MapPin size={10} color="#AEAEB2" />
                    <p style={{ fontSize: 11, color: '#AEAEB2', margin: 0 }}>{[account.address, account.city].filter(Boolean).join(', ')}</p>
                  </div>
                )}
                {(resolvedThisWeek > 0 || openCount > 0) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {resolvedThisWeek > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', borderRadius: 20, padding: '3px 10px' }}>{resolvedThisWeek} resolved this week</span>}
                    {openCount > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', borderRadius: 20, padding: '3px 10px' }}>{openCount} open</span>}
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <p style={{ fontSize: 26, fontWeight: 700, color: TIER_COLOR[account.tier], margin: 0, lineHeight: 1 }}>{account.score}</p>
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: TIER_COLOR[account.tier], background: TIER_COLOR[account.tier] + '18', borderRadius: 20, padding: '2px 8px' }}>
                  {TIER_LABEL[account.tier]}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <Info size={10} color="#AEAEB2" />
                  <span style={{ fontSize: 10, color: '#AEAEB2' }}>{showDetails ? 'Hide details' : 'Site details'}</span>
                  {showDetails ? <ChevronUp size={10} color="#AEAEB2" /> : <ChevronDown size={10} color="#AEAEB2" />}
                </div>
              </div>
            </div>
          </button>

          {/* Expanded site details */}
          {showDetails && (() => {
            const c = account.primaryContact;
            return (
              <div style={{ borderTop: '1px solid #F2F2F7', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Service info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {account.serviceFrequency && (
                    <div style={{ background: '#F4F7FA', borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 100 }}>
                      <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 0 3px' }}>Frequency</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: 0 }}>{FREQ_LABEL[account.serviceFrequency] ?? account.serviceFrequency}</p>
                    </div>
                  )}
                  <div style={{ background: '#F4F7FA', borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 100 }}>
                    <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 0 3px' }}>Monthly Value</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: 0 }}>${account.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div style={{ background: '#F4F7FA', borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 100 }}>
                    <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 0 3px' }}>Tier</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: 0 }}>Tier {account.accountTier}</p>
                  </div>
                </div>

                {/* Contract dates */}
                {(account.contractStartDate || account.contractEndDate) && (
                  <div style={{ background: '#F4F7FA', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 24 }}>
                    {account.contractStartDate && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          <Calendar size={10} color="#AEAEB2" />
                          <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, margin: 0 }}>Start</p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: 0 }}>{formatContractDate(account.contractStartDate)}</p>
                      </div>
                    )}
                    {account.contractEndDate && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          <Calendar size={10} color="#AEAEB2" />
                          <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, margin: 0 }}>End</p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: 0 }}>{formatContractDate(account.contractEndDate)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary contact */}
                {c && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 8px' }}>Primary Contact</p>
                    <div style={{ background: '#F4F7FA', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1B1F', margin: '0 0 1px' }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: '#6D6D6D', margin: 0 }}>{c.title}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
                          <Phone size={12} color="#00A2B2" />
                          <span style={{ fontSize: 12, color: '#00A2B2', fontWeight: 500 }}>{c.phone}</span>
                        </a>
                        <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
                          <Mail size={12} color="#00A2B2" />
                          <span style={{ fontSize: 12, color: '#00A2B2', fontWeight: 500 }}>{c.email}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service notes */}
                {account.serviceNotes && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8 }}>
                    <FileText size={12} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: '#78350F', margin: 0, lineHeight: 1.5 }}>{account.serviceNotes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Log Event */}
        <button
          onClick={onLogEvent}
          style={{ width: '100%', padding: '15px', background: '#00A2B2', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Helvetica Neue, sans-serif' }}
        >
          <Plus size={16} />Log Event
        </button>

        {/* Activity log + filter chips */}
        {mergedEvents.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E6E8ED', borderRadius: 14, overflow: 'hidden' }}>
            {/* Header */}
            <p style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, margin: 0, padding: '10px 14px 8px', borderBottom: '1px solid #F2F2F7' }}>
              Activity Log
            </p>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid #F2F2F7', overflowX: 'auto' }}>
              {FILTERS.map(f => {
                const active = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                      fontSize: 12, fontWeight: 600, padding: '5px 11px', borderRadius: 20,
                      border: `1.5px solid ${active ? f.color : '#E6E8ED'}`,
                      background: active ? f.color + '12' : '#fff',
                      color: active ? f.color : '#6D6D6D',
                      cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif',
                    }}
                  >
                    {f.label}
                    {f.count > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: active ? f.color : '#F2F2F7', color: active ? f.color === '#6D6D6D' ? '#fff' : f.color : '#6D6D6D', borderRadius: 10, padding: '0 5px', minWidth: 16, textAlign: 'center' }}>
                        {f.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Event list */}
            {filteredEvents.length === 0 ? (
              <p style={{ fontSize: 12, color: '#8E8E93', padding: '16px', textAlign: 'center' }}>No events in this category.</p>
            ) : (
              filteredEvents.map(ev => (
                <MobileEventCard
                  key={ev.id}
                  event={ev}
                  impact={getImpact(ev.id)}
                  photos={photos?.[ev.id] ?? 0}
                  onUpdateStatus={onUpdateStatus}
                  onAddPhoto={onAddPhoto}
                />
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
