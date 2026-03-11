import { AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react';

type AlertVariant = 'warning' | 'danger' | 'success' | 'info';

interface AlertBannerProps {
  variant: AlertVariant;
  message: string;
}

const config = {
  warning: { bg: 'bg-status-warningSurface', border: 'border-status-warning', text: 'text-[#92400E]', Icon: AlertTriangle },
  danger: { bg: 'bg-status-dangerSurface', border: 'border-status-danger', text: 'text-status-danger', Icon: XCircle },
  success: { bg: 'bg-status-successSurface', border: 'border-status-success', text: 'text-[#15803D]', Icon: CheckCircle },
  info: { bg: 'bg-status-infoSurface', border: 'border-status-info', text: 'text-[#0369A1]', Icon: Info },
};

export function AlertBanner({ variant, message }: AlertBannerProps) {
  const { bg, border, text, Icon } = config[variant];
  return (
    <div className={`flex items-center gap-3 rounded-[4px] border px-4 py-3 ${bg} ${border} ${text}`}>
      <Icon size={16} />
      <span className="text-[14px]">{message}</span>
    </div>
  );
}
