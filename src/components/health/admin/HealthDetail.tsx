import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, RefreshCw, Smartphone, Plus, FileText, ChevronRight } from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';
import { EventList } from './EventList';
import { EventLogForm } from './EventLogForm';
import { WeeklyReportModal } from './WeeklyReportModal';
import type { AccountHealthScore, HealthTier, HealthEvent } from '../../../types/health';
import type { HealthSelection } from './AccountHealthList';
import type { ScoringConfig } from '../../../data/scoringConfig';
import { computeLiveScore } from '../../../utils/healthScoring';

interface HealthDetailProps {
  selection:           HealthSelection;
  deal:                AccountHealthScore | null;
  accountDeals:        AccountHealthScore[];
  onOpenPhonePreview?: () => void;
  scoringConfig:       ScoringConfig;
  eventsForDeal:       HealthEvent[];
  allAccountEvents:    HealthEvent[];
  onAddEvent:          (dealId: string, event: HealthEvent) => void;
  onDeleteEvent:       (dealId: string, eventId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIER_COLOR: Record<HealthTier, string> = {
  green:  '#16A34A',
  yellow: '#D97706',
  red:    '#DC2626',
};


// ─── Shared banners ───────────────────────────────────────────────────────────

function OverrideBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-[6px] border border-[#DC2626]/20 bg-[#FEF2F2]">
      <AlertTriangle size={14} className="text-[#DC2626] flex-shrink-0 mt-px" />
      <p className="text-[12px] text-[#B91C1C] leading-relaxed">{message}</p>
    </div>
  );
}

function WatchlistBanner({ riskProfile }: { riskProfile: AccountHealthScore['riskProfile'] }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-[6px] border border-[#F59E0B]/20 bg-[#FFFBEB]">
      <ShieldAlert size={14} className="text-[#D97706] flex-shrink-0 mt-px" />
      <p className="text-[12px] text-[#92400E] leading-relaxed">
        {riskProfile.watchlistReason ?? `${riskProfile.incidentCount12m} incidents in 12 months`}
        {' '}&mdash; {riskProfile.eventCount12m} total events this year.
      </p>
    </div>
  );
}

// ─── Account Summary (folder view) ───────────────────────────────────────────

function AccountSummary({ accountDeals, onOpenPhonePreview, allAccountEvents }: {
  accountDeals:        AccountHealthScore[];
  onOpenPhonePreview?: () => void;
  allAccountEvents:    HealthEvent[];
}) {
  const navigate = useNavigate();
  const accountName = accountDeals[0]?.accountName ?? '';
  const accountId   = accountDeals[0]?.accountId   ?? '';
  const accountTier = accountDeals[0]?.accountTier;
  const overallTier: HealthTier = accountDeals.some(d => d.tier === 'red')
    ? 'red'
    : accountDeals.some(d => d.tier === 'yellow')
    ? 'yellow'
    : 'green';
  const hasOverride  = accountDeals.some(d => d.incidentOverride);
  const riskProfile  = accountDeals[0]?.riskProfile;
  const TIER_LABEL = { red: 'At Risk', yellow: 'Needs Attention', green: 'Healthy' };

  // Event category stat cards
  const eventCounts: Record<string, number> = {};
  for (const ev of allAccountEvents) {
    eventCounts[ev.type] = (eventCounts[ev.type] ?? 0) + 1;
  }
  const STAT_CATEGORIES: Array<{ type: string; label: string; color: string }> = [
    { type: 'complaint',        label: 'Complaints',  color: '#DC2626' },
    { type: 'sensitive_event',  label: 'Sensitive',   color: '#DC2626' },
    { type: 'qc_inspection',    label: 'Inspections', color: '#00A2B2' },
    { type: 'customer_visit',   label: 'Visits',      color: '#00A2B2' },
    { type: 'customer_request', label: 'Requests',    color: '#D97706' },
  ];
  const statCards = STAT_CATEGORIES
    .map(c => ({ ...c, count: eventCounts[c.type] ?? 0 }))
    .filter(c => c.count > 0);

  return (
    <div className="px-5 py-4 flex flex-col gap-3">
      {hasOverride && (
        <OverrideBanner message="One or more sites are locked to Red due to an open sensitive event with Red impact." />
      )}
      {riskProfile?.watchlist && (
        <WatchlistBanner riskProfile={riskProfile} />
      )}

      {/* Compact header card */}
      <div className="bg-white border border-border-card rounded-[8px] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-semibold text-text-primary leading-tight truncate">{accountName}</p>
            {accountTier && (
              <span className="text-[10px] text-text-subtle border border-border-card px-1.5 py-0.5 rounded flex-shrink-0">
                Tier {accountTier}
              </span>
            )}
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0"
              style={{ background: TIER_COLOR[overallTier] + '12', color: TIER_COLOR[overallTier] }}
            >
              {TIER_LABEL[overallTier]}
            </span>
            <span className="text-[10px] text-text-subtle flex-shrink-0">
              {accountDeals.length} site{accountDeals.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onOpenPhonePreview && (
            <button
              onClick={onOpenPhonePreview}
              className="flex items-center gap-1 text-[11px] text-text-subtle hover:text-text-primary border border-border-card hover:border-border px-2 py-1 rounded-[6px] transition-colors"
            >
              <Smartphone size={11} />
              Preview
            </button>
          )}
          <button
            onClick={() => navigate(`/accounts/${accountId}`)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#00A2B2] hover:text-[#008A99] border border-[#00A2B2]/30 hover:border-[#00A2B2]/60 px-2 py-1 rounded-[6px] transition-colors"
          >
            View account
            <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* Event stat cards */}
      {statCards.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {statCards.map(card => (
            <div
              key={card.type}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-border-card bg-white"
            >
              <span className="text-[13px] font-bold" style={{ color: card.color }}>{card.count}</span>
              <span className="text-[11px] text-text-subtle">{card.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sites list — compact */}
      <div className="bg-white border border-border-card rounded-[8px] overflow-hidden">
        <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider px-4 py-2 border-b border-border-card bg-surface-header">
          Sites
        </p>
        <div className="divide-y divide-border-card">
          {accountDeals.map(deal => (
            <div key={deal.dealId} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TIER_COLOR[deal.tier] }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-text-primary truncate">{deal.dealName}</p>
                {deal.incidentOverride && (
                  <p className="text-[10px] text-[#B91C1C] mt-0.5">Incident override active</p>
                )}
              </div>
              <span className="text-[13px] font-semibold flex-shrink-0" style={{ color: TIER_COLOR[deal.tier] }}>
                {deal.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Deal Detail (file view) ──────────────────────────────────────────────────

function DealDetail({ account, onOpenPhonePreview, scoringConfig, events, onAddEvent, onDeleteEvent }: {
  account:             AccountHealthScore;
  onOpenPhonePreview?: () => void;
  scoringConfig:       ScoringConfig;
  events:              HealthEvent[];
  onAddEvent:          (dealId: string, event: HealthEvent) => void;
  onDeleteEvent:       (dealId: string, eventId: string) => void;
}) {
  const [showLogEvent,      setShowLogEvent]      = useState(false);
  const [showWeeklyReport,  setShowWeeklyReport]  = useState(false);

  type EventOverride = { status: 'in_progress' | 'resolved'; note: string; by: string; at: string };
  const [eventOverrides, setEventOverrides] = useState<Record<string, EventOverride>>({});

  // Apply overrides for in_progress / resolved status changes (ephemeral UI state)
  const allEvents: HealthEvent[] = useMemo(() => {
    const applyOverride = (e: HealthEvent): HealthEvent => {
      const ov = eventOverrides[e.id];
      if (!ov) return e;
      return {
        ...e,
        resolutionStatus: ov.status,
        resolutionNote:   ov.note || e.resolutionNote,
        ...(ov.status === 'resolved'    ? { resolvedAt: ov.at,    resolvedBy: ov.by } : {}),
        ...(ov.status === 'in_progress' ? { inProgressAt: ov.at, inProgressBy: ov.by } : {}),
      };
    };
    return events.map(applyOverride);
  }, [events, eventOverrides]);

  // Live score computation for the demo deal
  const liveScore = useMemo(() => {
    if (!account.liveScoring) return null;
    return computeLiveScore(allEvents, scoringConfig);
  }, [account.liveScoring, allEvents, scoringConfig]);

  const displayScore    = liveScore?.score    ?? account.score;
  const displayTier     = liveScore?.tier     ?? account.tier;
  const displayOverride = liveScore?.incidentOverride ?? account.incidentOverride;

  function handleUpdateStatus(eventId: string, status: 'in_progress' | 'resolved', note: string) {
    setEventOverrides(prev => ({
      ...prev,
      [eventId]: { status, note, by: 'Current User', at: new Date().toISOString() },
    }));
  }

  function handleDeleteEvent(eventId: string) {
    onDeleteEvent(account.dealId, eventId);
  }

  return (
    <div className="px-5 py-5 flex flex-col gap-4">
      {displayOverride && (
        <OverrideBanner message="This site is locked to Red due to an open sensitive event with Red impact. Score is computed but tier is held until resolved." />
      )}
      {account.riskProfile.watchlist && (
        <WatchlistBanner riskProfile={account.riskProfile} />
      )}

      {/* Score header */}
      <div className="bg-white border border-border-card rounded-[8px] px-5 py-4 flex items-start gap-5 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setShowLogEvent(true)}
            className="flex items-center gap-1.5 text-[11px] text-white bg-[#00A2B2] hover:bg-[#008A99] px-2.5 py-1.5 rounded-[6px] transition-colors"
          >
            <Plus size={12} />
            Log Event
          </button>
          {onOpenPhonePreview && (
            <button
              onClick={onOpenPhonePreview}
              className="flex items-center gap-1.5 text-[11px] text-text-subtle hover:text-text-primary border border-border-card hover:border-border px-2.5 py-1.5 rounded-[6px] transition-colors"
            >
              <Smartphone size={12} />
              Preview
            </button>
          )}
        </div>
        <ScoreGauge score={displayScore} tier={displayTier} size="lg" />
        <div className="flex-1 pt-1">
          <p className="text-[16px] font-semibold text-text-primary leading-tight">{account.accountName}</p>
          <p className="text-[13px] text-text-subtle mt-0.5">{account.dealName}</p>
          <div className="flex items-center gap-3 mt-3 text-[12px] text-text-subtle">
            <span style={{ color: account.trend >= 0 ? '#16A34A' : '#DC2626' }}>
              {account.trend >= 0 ? '+' : ''}{account.trend} pts this month
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw size={10} />
              {new Date(account.lastComputedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          {/* Live score breakdown for demo deal */}
          {liveScore && liveScore.breakdown.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {liveScore.breakdown.map(item => (
                <span
                  key={item.eventId}
                  className="text-[10px] px-1.5 py-px rounded"
                  style={{
                    background: item.impact > 0 ? '#F0FDF4' : item.impact < 0 ? '#FEF2F2' : '#F4F7FA',
                    color:      item.impact > 0 ? '#16A34A'  : item.impact < 0 ? '#DC2626'  : '#6D6D6D',
                  }}
                >
                  {item.impact > 0 ? '+' : ''}{item.impact} {item.label.replace(/_/g, ' ')}
                  {item.resolved ? ' ✓' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white border border-border-card rounded-[8px] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-card bg-surface-header">
          <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider">Activity Log</p>
          <div className="flex items-center gap-2">
            {allEvents.length > 0 && (
              <span className="text-[11px] text-text-subtle">{allEvents.length} event{allEvents.length !== 1 ? 's' : ''}</span>
            )}
            <button
              onClick={() => setShowWeeklyReport(true)}
              className="flex items-center gap-1 text-[11px] font-medium text-text-subtle hover:text-[#00A2B2] border border-border-card hover:border-[#00A2B2]/40 px-2 py-1 rounded-[5px] transition-colors"
            >
              <FileText size={10} />
              Weekly Report
            </button>
          </div>
        </div>
        <div className="px-4 py-3">
          <EventList events={allEvents} breakdown={liveScore?.breakdown} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteEvent} />
        </div>
      </div>

      {/* Weekly Report modal */}
      {showWeeklyReport && createPortal(
        <WeeklyReportModal
          events={allEvents}
          breakdown={liveScore?.breakdown}
          dealName={account.dealName}
          onClose={() => setShowWeeklyReport(false)}
        />,
        document.body
      )}

      {/* Log Event modal — rendered via portal to escape overflow clipping */}
      {showLogEvent && createPortal(
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setShowLogEvent(false)}
        >
          <div
            className="bg-white rounded-[12px] p-5 w-[480px] max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[14px] font-semibold text-text-primary mb-4">
              Log Event — {account.dealName}
            </p>
            <EventLogForm
              dealName={account.dealName}
              onSubmit={partial => {
                onAddEvent(account.dealId, {
                  ...partial,
                  id:       `ev-${Date.now()}`,
                  dealId:   account.dealId,
                  loggedAt: new Date().toISOString(),
                });
                setShowLogEvent(false);
              }}
              onCancel={() => setShowLogEvent(false)}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function HealthDetail({ selection, deal, accountDeals, onOpenPhonePreview, scoringConfig, eventsForDeal, allAccountEvents, onAddEvent, onDeleteEvent }: HealthDetailProps) {
  if (selection.type === 'account') {
    return <AccountSummary accountDeals={accountDeals} onOpenPhonePreview={onOpenPhonePreview} allAccountEvents={allAccountEvents} />;
  }
  if (!deal) return null;
  return (
    <DealDetail
      account={deal}
      onOpenPhonePreview={onOpenPhonePreview}
      scoringConfig={scoringConfig}
      events={eventsForDeal}
      onAddEvent={onAddEvent}
      onDeleteEvent={onDeleteEvent}
    />
  );
}
