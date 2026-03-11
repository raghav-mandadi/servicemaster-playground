import { getSignalStatusColor } from '../../../types/health';
import type { HealthSignal } from '../../../types/health';

interface SignalRowProps {
  signal: HealthSignal;
}

const STATUS_LABEL = { green: 'Good', yellow: 'Watch', red: 'Issue', na: 'N/A' };

export function SignalRow({ signal }: SignalRowProps) {
  const color = getSignalStatusColor(signal.status);

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-border-card last:border-0">
      {/* Status dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 mt-[5px]"
        style={{ background: color }}
      />

      {/* Label + detail */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-medium text-text-primary">{signal.label}</span>
          <span className="text-[11px] font-medium flex-shrink-0" style={{ color }}>
            {STATUS_LABEL[signal.status]}
          </span>
        </div>
        <p className="text-[12px] text-text-subtle mt-0.5 leading-relaxed">{signal.detail}</p>
        {signal.threshold && (
          <p className="text-[11px] mt-0.5" style={{ color: '#ABABAB' }}>{signal.threshold}</p>
        )}
      </div>
    </div>
  );
}
