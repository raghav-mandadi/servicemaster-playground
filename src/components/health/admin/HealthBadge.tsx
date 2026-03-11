import type { HealthTier } from '../../../types/health';

interface HealthBadgeProps {
  score: number;
  tier: HealthTier;
  trend?: number;
  size?: 'sm' | 'md';
}

const TIER_STYLES: Record<HealthTier, { bg: string; text: string; dot: string }> = {
  green:  { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' },
  yellow: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  red:    { bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' },
};

const TIER_LABEL: Record<HealthTier, string> = {
  green: 'Healthy',
  yellow: 'Needs Attention',
  red: 'At Risk',
};

export function HealthBadge({ score, tier, trend, size = 'md' }: HealthBadgeProps) {
  const s = TIER_STYLES[tier];
  const isSmall = size === 'sm';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isSmall ? 5 : 7 }}>
      {/* Score pill */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 4 : 5,
        padding: isSmall ? '2px 8px' : '4px 10px',
        background: s.bg,
        borderRadius: 20,
      }}>
        <span style={{
          width: isSmall ? 7 : 8,
          height: isSmall ? 7 : 8,
          borderRadius: '50%',
          background: s.dot,
          flexShrink: 0,
          display: 'inline-block',
        }} />
        <span style={{
          fontSize: isSmall ? 12 : 14,
          fontWeight: 700,
          color: s.text,
          fontFamily: 'Helvetica Neue, sans-serif',
        }}>
          {score}
        </span>
      </span>
      {/* Tier label — md only */}
      {!isSmall && (
        <span style={{ fontSize: 13, color: s.text, fontWeight: 500 }}>{TIER_LABEL[tier]}</span>
      )}
      {/* Trend */}
      {trend !== undefined && trend !== 0 && (
        <span style={{
          fontSize: isSmall ? 11 : 12,
          color: trend > 0 ? '#16A34A' : '#DC2626',
          fontWeight: 500,
        }}>
          {trend > 0 ? `↑+${trend}` : `↓${trend}`}
        </span>
      )}
    </div>
  );
}
