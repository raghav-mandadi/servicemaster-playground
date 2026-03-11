interface BadgeProps {
  count: number;
  variant?: 'red' | 'teal';
}

export function Badge({ count, variant = 'red' }: BadgeProps) {
  return (
    <span
      className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white ${variant === 'red' ? 'bg-status-danger' : 'bg-primary'}`}
    >
      {count}
    </span>
  );
}
