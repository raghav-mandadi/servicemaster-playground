interface TagProps {
  children: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export function Tag({ children, removable = false, onRemove }: TagProps) {
  if (removable) {
    return (
      <span className="inline-flex items-center gap-2 bg-primary-surface border border-primary/30 rounded-[4px] px-[13px] py-1.5 text-primary text-[13px]">
        {children}
        <button type="button" onClick={onRemove} className="text-primary hover:text-primary-hover">×</button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center bg-surface-header rounded-[4px] px-3 py-1.5 text-[13px] text-text-primary">
      {children}
    </span>
  );
}
