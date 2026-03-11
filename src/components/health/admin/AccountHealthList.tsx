import { useState } from 'react';
import { Search, ChevronRight, ChevronDown, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { AccountHealthScore, HealthTier } from '../../../types/health';

export type HealthSelection =
  | { type: 'account'; accountId: string }
  | { type: 'deal';    dealId: string; accountId: string };

interface AccountHealthListProps {
  accounts: AccountHealthScore[];
  selected:  HealthSelection | null;
  onSelect:  (sel: HealthSelection) => void;
}

const TIER_COLOR: Record<HealthTier, string> = {
  green:  '#16A34A',
  yellow: '#D97706',
  red:    '#DC2626',
};

const TIER_ORDER: Record<HealthTier, number> = { red: 0, yellow: 1, green: 2 };

// Worst tier among an array of deals
function worstTier(deals: AccountHealthScore[]): HealthTier {
  const sorted = [...deals].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
  return sorted[0]?.tier ?? 'green';
}

type TierFilter = 'all' | HealthTier;

interface AccountGroup {
  accountId:   string;
  accountName: string;
  worstTier:   HealthTier;
  deals:       AccountHealthScore[];
}

export function AccountHealthList({ accounts, selected, onSelect }: AccountHealthListProps) {
  const [search,      setSearch]      = useState('');
  const [tierFilter,  setTierFilter]  = useState<TierFilter>('all');
  const [expanded,    setExpanded]    = useState<Set<string>>(() => {
    // Default: expand accounts that have any red/yellow deals
    const ids = new Set<string>();
    accounts.forEach(a => {
      if (a.tier !== 'green') ids.add(a.accountId);
    });
    return ids;
  });

  // Group by accountId
  const grouped: AccountGroup[] = [];
  const seen = new Set<string>();
  for (const deal of accounts) {
    if (!seen.has(deal.accountId)) {
      seen.add(deal.accountId);
      const dealsForAccount = accounts.filter(d => d.accountId === deal.accountId);
      grouped.push({
        accountId:   deal.accountId,
        accountName: deal.accountName,
        worstTier:   worstTier(dealsForAccount),
        deals:       dealsForAccount.sort((a, b) => a.score - b.score), // worst score first
      });
    }
  }

  // Sort groups: worst tier first
  grouped.sort((a, b) => TIER_ORDER[a.worstTier] - TIER_ORDER[b.worstTier]);

  // Filter by search and tier
  const filtered = grouped
    .map(g => ({
      ...g,
      deals: g.deals.filter(d => {
        const matchSearch = d.accountName.toLowerCase().includes(search.toLowerCase()) ||
                            d.dealName.toLowerCase().includes(search.toLowerCase());
        const matchTier   = tierFilter === 'all' || d.tier === tierFilter;
        return matchSearch && matchTier;
      }),
    }))
    .filter(g => g.deals.length > 0);

  const tierCounts = {
    red:    accounts.filter(a => a.tier === 'red').length,
    yellow: accounts.filter(a => a.tier === 'yellow').length,
    green:  accounts.filter(a => a.tier === 'green').length,
  };

  const CHIP_CONFIG = [
    { tier: 'red'    as HealthTier, count: tierCounts.red,    label: 'At Risk'  },
    { tier: 'yellow' as HealthTier, count: tierCounts.yellow, label: 'Watch'    },
    { tier: 'green'  as HealthTier, count: tierCounts.green,  label: 'Healthy'  },
  ];

  const toggleExpand = (accountId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  };

  const isAccountSelected = (accountId: string) =>
    selected?.type === 'account' && selected.accountId === accountId;

  const isDealSelected = (dealId: string) =>
    selected?.type === 'deal' && selected.dealId === dealId;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Sticky header ── */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b border-border-header bg-white">
        <div className="relative mb-2">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search accounts or deals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 border border-border rounded-[6px] text-[12px] bg-white text-text-primary outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1.5">
          {CHIP_CONFIG.map(({ tier, count, label }) => {
            const active = tierFilter === tier;
            const color  = TIER_COLOR[tier];
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(active ? 'all' : tier)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition-all flex-1 justify-center"
                style={{
                  background:    active ? color + '18' : '#F8F9FA',
                  borderColor:   active ? color + '60' : '#E0E3EA',
                  color:         active ? color : '#6D6D6D',
                  outline:       active ? `2px solid ${color}40` : 'none',
                  outlineOffset: 1,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="font-bold">{count}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tree ── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(group => {
          const isOpen    = expanded.has(group.accountId);
          const acctSel   = isAccountSelected(group.accountId);
          const acctColor = TIER_COLOR[group.worstTier];
          const multiDeal = group.deals.length > 1;

          // Find flags at account level (any deal)
          const hasOverride  = group.deals.some(d => d.incidentOverride);
          const hasWatchlist = group.deals.some(d => d.riskProfile.watchlist);

          return (
            <div key={group.accountId}>
              {/* Account row (folder) */}
              <div
                className="flex items-center group"
                style={{
                  borderLeft: acctSel ? '3px solid #00A2B2' : '3px solid transparent',
                  background: acctSel ? '#E6F8FA' : undefined,
                }}
              >
                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpand(group.accountId)}
                  className="flex-shrink-0 w-7 flex items-center justify-center h-full py-2 text-text-subtle hover:text-text-primary transition-colors"
                >
                  {isOpen
                    ? <ChevronDown size={12} />
                    : <ChevronRight size={12} />
                  }
                </button>

                {/* Account info — clickable for account-level view */}
                <button
                  className="flex-1 flex items-center gap-2 py-2 pr-3 min-w-0 text-left hover:bg-surface-page transition-colors"
                  onClick={() => {
                    onSelect({ type: 'account', accountId: group.accountId });
                    if (!isOpen) toggleExpand(group.accountId);
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: acctColor }}
                  />
                  <span className="text-[13px] font-semibold text-text-primary truncate flex-1">
                    {group.accountName}
                  </span>
                  {hasOverride && (
                    <span title="Incident override on a deal">
                      <AlertTriangle size={10} style={{ color: '#DC2626' }} className="flex-shrink-0" />
                    </span>
                  )}
                  {hasWatchlist && !hasOverride && (
                    <span title="Risk watchlist">
                      <ShieldAlert size={10} style={{ color: '#D97706' }} className="flex-shrink-0" />
                    </span>
                  )}
                  <span className="text-[10px] text-text-subtle flex-shrink-0 font-medium">
                    {multiDeal ? `${group.deals.length} deals` : '1 deal'}
                  </span>
                </button>
              </div>

              {/* Deal rows (files) — shown when expanded */}
              {isOpen && group.deals.map(deal => {
                const dealSel   = isDealSelected(deal.dealId);
                const dealColor = TIER_COLOR[deal.tier];
                return (
                  <button
                    key={deal.dealId}
                    onClick={() => onSelect({ type: 'deal', dealId: deal.dealId, accountId: deal.accountId })}
                    className="w-full text-left flex items-center gap-2 pl-9 pr-3 py-2 hover:bg-surface-page transition-colors"
                    style={{
                      borderLeft: dealSel ? '3px solid #00A2B2' : '3px solid transparent',
                      background: dealSel ? '#E6F8FA' : undefined,
                      minHeight: 36,
                    }}
                  >
                    {/* Tier color dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: dealColor }}
                    />

                    {/* Deal name */}
                    <span className="text-[12px] text-text-primary truncate flex-1">{deal.dealName}</span>

                    {/* Score + trend */}
                    <span
                      className="text-[13px] font-bold flex-shrink-0"
                      style={{ color: dealColor }}
                    >
                      {deal.score}
                    </span>
                    <span
                      className="text-[10px] font-semibold flex-shrink-0"
                      style={{ color: deal.trend >= 0 ? '#16A34A' : '#DC2626' }}
                    >
                      {deal.trend >= 0 ? '↑' : '↓'}{Math.abs(deal.trend)}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-[12px] text-text-subtle">
            No accounts match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
