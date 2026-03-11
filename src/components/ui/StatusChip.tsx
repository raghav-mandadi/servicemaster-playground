import type { AccountStatus } from '../../types';

type Status = AccountStatus | 'Inactive';

interface StatusChipProps {
  status: Status;
}

const config: Record<Status, { bg: string; border: string; dot: string; text: string }> = {
  Active: {
    bg: 'bg-status-activeSurface',
    border: 'border-status-active/27',
    dot: 'bg-status-active',
    text: 'text-[#15803D]',
  },
  Draft: {
    bg: 'bg-status-draftSurface',
    border: 'border-status-draft/27',
    dot: 'bg-status-draft',
    text: 'text-[#0891B2]',
  },
  New: {
    bg: 'bg-status-newSurface',
    border: 'border-status-new/27',
    dot: 'bg-status-new',
    text: 'text-status-new',
  },
  Archived: {
    bg: 'bg-status-archivedSurface',
    border: 'border-status-archived/27',
    dot: 'bg-status-archived',
    text: 'text-text-subtle',
  },
  Inactive: {
    bg: 'bg-status-archivedSurface',
    border: 'border-status-archived/27',
    dot: 'bg-status-archived',
    text: 'text-text-subtle',
  },
};

export function StatusChip({ status }: StatusChipProps) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-[6px] px-[13px] h-[33.5px] rounded-full border text-[13px] font-medium ${c.bg} ${c.border} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}
