import { RefreshCw } from 'lucide-react';
import type { AccountHealthScore } from '../../../types/health';
import { EVENT_META } from '../eventMeta';

interface DealListScreenProps {
  accounts:       AccountHealthScore[];
  employeeName:   string;
  onSelectDeal:   (dealId: string) => void;
  onRefresh:      () => void;
}

const TIER_COLOR: Record<string, string> = {
  green:  '#16A34A',
  yellow: '#D97706',
  red:    '#DC2626',
};

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DealListScreen({ accounts, employeeName, onSelectDeal, onRefresh }: DealListScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Helvetica Neue, sans-serif', background: '#F4F7FA' }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 18px 14px', borderBottom: '1px solid #E6E8ED' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: '#00A2B2', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>S</span>
            </div>
            <span style={{ fontSize: 12, color: '#8E8E93', fontWeight: 500 }}>ServiceMaster Clean</span>
          </div>
          <button
            onClick={onRefresh}
            title="Refresh"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <RefreshCw size={15} color="#8E8E93" />
          </button>
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#1C1B1F', margin: '10px 0 1px', lineHeight: 1.2 }}>Your Active Sites</p>
        <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>{employeeName}</p>
      </div>

      {/* Deal list */}
      <div style={{ flex: 1, padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {accounts.length === 0 ? (
          <p style={{ fontSize: 13, color: '#8E8E93', textAlign: 'center', marginTop: 40 }}>No active deals assigned.</p>
        ) : (
          accounts.map(account => {
            const lastEvent = [...(account.events ?? [])].sort(
              (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
            )[0];
            const lastMeta = lastEvent ? EVENT_META[lastEvent.type] : null;

            return (
              <button
                key={account.dealId}
                onClick={() => onSelectDeal(account.dealId)}
                style={{
                  background: '#fff',
                  border: '1px solid #E6E8ED',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {/* Health dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: TIER_COLOR[account.tier],
                }} />

                {/* Deal info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1B1F', margin: 0, lineHeight: 1.3 }}>{account.dealName}</p>
                  <p style={{ fontSize: 12, color: '#8E8E93', margin: '2px 0 0' }}>{account.accountName}</p>
                  {lastEvent && lastMeta && (
                    <p style={{ fontSize: 11, color: '#ABABAB', margin: '4px 0 0' }}>
                      Last: {lastMeta.label} · {relativeDate(lastEvent.loggedAt)}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: TIER_COLOR[account.tier] }}>{account.score}</span>
                </div>

                {/* Chevron */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M5 10l4-3-4-3" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
