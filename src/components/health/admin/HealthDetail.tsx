import { useState } from 'react';
import { AlertTriangle, ShieldAlert, RefreshCw, Smartphone } from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';
import { SignalRow } from './SignalRow';
import { ActionItems } from './ActionItems';
import { SurveyHistory } from './SurveyHistory';
import type { AccountHealthScore, HealthTier } from '../../../types/health';
import { TIER_REQUIREMENTS } from '../../../types/health';
import type { HealthSelection } from './AccountHealthList';

interface HealthDetailProps {
  selection:           HealthSelection;
  deal:                AccountHealthScore | null;
  accountDeals:        AccountHealthScore[];
  onOpenPhonePreview?: () => void;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = 'complaints' | 'requests' | 'risks' | 'tier' | 'surveys';

const SIGNAL_TAB: Record<string, TabKey> = {
  'Customer Complaints':       'complaints',
  'Complaint Volume':          'complaints',
  'Customer Request':          'requests',
  'ServiceMaster Request':     'requests',
  'Sensitive Event':           'risks',
  'Sensitive Event Volume':    'risks',
  'New Cleaner':               'risks',
  'New Contact Person':        'risks',
  'Customer Visits':           'tier',
  'Supply Deliveries':         'tier',
  'Quality Inspections':       'tier',
  'Quality Inspection Result': 'surveys',
  'Customer Survey Results':   'surveys',
  'Visit Sentiment':           'surveys',
  'Project Outcome':           'surveys',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIER_COLOR: Record<HealthTier, string> = {
  green:  '#16A34A',
  yellow: '#D97706',
  red:    '#DC2626',
};

function worstStatus(signals: AccountHealthScore['signals']): 'red' | 'yellow' | 'green' | 'na' {
  if (signals.some(s => s.status === 'red'))    return 'red';
  if (signals.some(s => s.status === 'yellow')) return 'yellow';
  if (signals.some(s => s.status === 'green'))  return 'green';
  return 'na';
}

const STATUS_DOT: Record<string, string> = {
  red:    '#DC2626',
  yellow: '#D97706',
  green:  '#16A34A',
  na:     '#C9C9C9',
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

function AccountSummary({ accountDeals, onOpenPhonePreview }: {
  accountDeals:        AccountHealthScore[];
  onOpenPhonePreview?: () => void;
}) {
  const accountName  = accountDeals[0]?.accountName ?? '';
  const accountTier  = accountDeals[0]?.accountTier;
  const allActions   = accountDeals.flatMap(d => d.actionItems);
  const overallTier: HealthTier = accountDeals.some(d => d.tier === 'red')
    ? 'red'
    : accountDeals.some(d => d.tier === 'yellow')
    ? 'yellow'
    : 'green';
  const hasOverride  = accountDeals.some(d => d.incidentOverride);
  const riskProfile  = accountDeals[0]?.riskProfile;

  const TIER_LABEL = { red: 'At Risk', yellow: 'Needs Attention', green: 'Healthy' };

  return (
    <div className="px-5 py-5 flex flex-col gap-4">
      {hasOverride && (
        <OverrideBanner message="One or more deals are locked to Red due to an open incident or sensitive event." />
      )}
      {riskProfile?.watchlist && (
        <WatchlistBanner riskProfile={riskProfile} />
      )}

      {/* Account header */}
      <div className="bg-white border border-border-card rounded-[8px] px-5 py-4 relative">
        {onOpenPhonePreview && (
          <button
            onClick={onOpenPhonePreview}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] text-text-subtle hover:text-text-primary border border-border-card hover:border-border px-2.5 py-1.5 rounded-[6px] transition-colors"
          >
            <Smartphone size={12} />
            Preview
          </button>
        )}
        <p className="text-[18px] font-semibold text-text-primary leading-tight">{accountName}</p>
        <div className="flex items-center gap-2 mt-1">
          {accountTier && (
            <span className="text-[11px] text-text-subtle border border-border-card px-1.5 py-0.5 rounded">
              Tier {accountTier}
            </span>
          )}
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded"
            style={{
              background: TIER_COLOR[overallTier] + '12',
              color:      TIER_COLOR[overallTier],
            }}
          >
            {TIER_LABEL[overallTier]}
          </span>
          <span className="text-[11px] text-text-subtle">
            {accountDeals.length} deal{accountDeals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Deal list */}
      <div className="bg-white border border-border-card rounded-[8px] overflow-hidden">
        <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider px-4 py-2.5 border-b border-border-card bg-surface-header">
          Deals
        </p>
        <div className="divide-y divide-border-card">
          {accountDeals.map(deal => (
            <div key={deal.dealId} className="flex items-center gap-3 px-4 py-3.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TIER_COLOR[deal.tier] }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">{deal.dealName}</p>
                {deal.incidentOverride && (
                  <p className="text-[11px] text-[#B91C1C] mt-0.5">Incident override active</p>
                )}
              </div>
              <div className="flex items-baseline gap-2 flex-shrink-0">
                <span className="text-[15px] font-semibold" style={{ color: TIER_COLOR[deal.tier] }}>
                  {deal.score}
                </span>
                <span className="text-[11px]" style={{ color: deal.trend >= 0 ? '#16A34A' : '#DC2626' }}>
                  {deal.trend >= 0 ? '+' : ''}{deal.trend}
                </span>
                {deal.lastSurveyScore !== null && (
                  <span className="text-[11px] text-text-subtle">{deal.lastSurveyScore.toFixed(1)}/5</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {allActions.length > 0 && <ActionItems items={allActions} />}
    </div>
  );
}

// ─── Deal Detail (file view) ──────────────────────────────────────────────────

function DealDetail({ account, onOpenPhonePreview }: {
  account:             AccountHealthScore;
  onOpenPhonePreview?: () => void;
}) {
  const tierReqs   = TIER_REQUIREMENTS[account.accountTier];
  const [activeTab, setActiveTab] = useState<TabKey>('complaints');

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'complaints', label: 'Complaints' },
    { key: 'requests',   label: 'Requests'   },
    { key: 'risks',      label: 'Risks'      },
    { key: 'tier',       label: `Tier ${account.accountTier}` },
    { key: 'surveys',    label: 'Surveys'    },
  ];

  const signalsForTab  = (tab: TabKey) => account.signals.filter(s => SIGNAL_TAB[s.label] === tab);
  const tabDotColor    = (tab: TabKey) => STATUS_DOT[worstStatus(signalsForTab(tab))];

  return (
    <div className="px-5 py-5 flex flex-col gap-4">
      {account.incidentOverride && (
        <OverrideBanner message="This deal is locked to Red due to an open incident or sensitive event. Score is computed but tier is held until resolved." />
      )}
      {account.riskProfile.watchlist && (
        <WatchlistBanner riskProfile={account.riskProfile} />
      )}

      {/* Score header */}
      <div className="bg-white border border-border-card rounded-[8px] px-5 py-4 flex items-start gap-5 relative">
        {onOpenPhonePreview && (
          <button
            onClick={onOpenPhonePreview}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] text-text-subtle hover:text-text-primary border border-border-card hover:border-border px-2.5 py-1.5 rounded-[6px] transition-colors"
          >
            <Smartphone size={12} />
            Preview
          </button>
        )}
        <ScoreGauge score={account.score} tier={account.tier} size="lg" />
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
            {account.lastSurveyScore !== null && (
              <span>Survey {account.lastSurveyScore.toFixed(1)}/5</span>
            )}
          </div>
        </div>
      </div>

      {/* Action items */}
      {account.actionItems.length > 0 && <ActionItems items={account.actionItems} />}

      {/* Signal tabs */}
      <div className="bg-white border border-border-card rounded-[8px] overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border-card overflow-x-auto">
          {TABS.map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors flex-shrink-0 border-b-2"
                style={{
                  borderBottomColor: isActive ? '#00A2B2' : 'transparent',
                  color:             isActive ? '#00A2B2' : '#6D6D6D',
                  background:        isActive ? '#F2FCFD' : 'transparent',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: tabDotColor(key) }}
                />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'tier' && (
            <div className="px-4 py-2.5 bg-surface-header border-b border-border-card">
              <p className="text-[11px] text-text-subtle">
                {tierReqs.label} &nbsp;&mdash;&nbsp;
                {tierReqs.visitsPerMonth >= 1 ? Math.round(tierReqs.visitsPerMonth) : '~1'} visit/mo &nbsp;&middot;&nbsp;
                {tierReqs.qcPerMonth >= 1 ? tierReqs.qcPerMonth : 'bimonthly'} QC &nbsp;&middot;&nbsp;
                {tierReqs.deliveriesPerMonth === 4 ? 'weekly' : tierReqs.deliveriesPerMonth >= 1 ? 'monthly' : 'with QC'} deliveries
              </p>
            </div>
          )}

          <div className="px-4">
            {signalsForTab(activeTab).map(signal => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
            {activeTab === 'surveys' && (
              <div className="pt-3 pb-4">
                <SurveyHistory surveys={account.recentSurveys} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function HealthDetail({ selection, deal, accountDeals, onOpenPhonePreview }: HealthDetailProps) {
  if (selection.type === 'account') {
    return <AccountSummary accountDeals={accountDeals} onOpenPhonePreview={onOpenPhonePreview} />;
  }
  if (!deal) return null;
  return <DealDetail account={deal} onOpenPhonePreview={onOpenPhonePreview} />;
}
