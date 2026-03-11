import { getTierColors, getTierLabel } from '../../../types/health';
import type { HealthTier } from '../../../types/health';

interface ScoreGaugeProps {
  score: number;
  tier: HealthTier;
  size?: 'sm' | 'lg';
}

export function ScoreGauge({ score, tier, size = 'lg' }: ScoreGaugeProps) {
  const colors = getTierColors(tier);
  const colorMap = { green: '#16A34A', yellow: '#F59E0B', red: '#DC2626' };
  const strokeColor = colorMap[tier];

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5">
        <div
          className={`text-[13px] font-bold ${colors.text}`}
          style={{ minWidth: 28 }}
        >
          {score}
        </div>
        <div className="flex-1 h-1.5 bg-border-card rounded-full overflow-hidden" style={{ width: 40 }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${score}%`, background: strokeColor }}
          />
        </div>
      </div>
    );
  }

  // Large circular gauge
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  // Only fill ~270deg (3/4 of circle) for arc effect
  const arcPct = (score / 100) * 0.75;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(135deg)' }}>
          {/* Background track */}
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke="#EDEDED"
            strokeWidth="10"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={`${circumference * arcPct} ${circumference * (1 - arcPct)}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        {/* Score text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'none' }}>
          <span className={`text-[32px] font-bold leading-none ${colors.text}`}>{score}</span>
          <span className="text-[11px] text-text-subtle mt-0.5">/ 100</span>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-[12px] font-semibold ${colors.bg} ${colors.text} ${colors.border} border`}>
        {getTierLabel(tier)}
      </div>
    </div>
  );
}
