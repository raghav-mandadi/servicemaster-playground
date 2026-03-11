import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ChevronDown } from 'lucide-react';

interface ActionItemsProps {
  items: string[];
}

const RESOLUTIONS = [
  { key: 'resolved',  label: 'Resolved'          },
  { key: 'talked',    label: 'Talked to customer' },
  { key: 'handled',   label: 'Handled'            },
  { key: 'na',        label: 'Not applicable'     },
  { key: 'other',     label: 'Other…'             },
] as const;

type ResolutionKey = typeof RESOLUTIONS[number]['key'];

function isHighPriority(item: string): boolean {
  return (
    item.startsWith('🔴') ||
    item.toLowerCase().includes('resolve') ||
    item.toLowerCase().includes('follow up on survey')
  );
}

function stripEmoji(item: string): string {
  return item.replace(/^[🔴🟡]\s*/, '');
}

interface CardState {
  dropdownOpen: boolean;
  otherOpen:    boolean;
  otherText:    string;
  dismissing:   boolean;
  hovered:      boolean;
}

// Portal dropdown — renders to document.body to escape any overflow clipping
function ResolveDropdown({
  anchorRef,
  open,
  onSelect,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open:      boolean;
  onSelect:  (key: ResolutionKey) => void;
  onClose:   () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, minWidth: 0 });

  // Recalculate position whenever it opens
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top:      rect.bottom + 4,
      left:     rect.right - 164, // right-align to button edge
      minWidth: 164,
    });
  }, [open, anchorRef]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!dropdownRef.current?.contains(target) && !anchorRef.current?.contains(target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position:    'fixed',
        top:         pos.top,
        left:        pos.left,
        minWidth:    pos.minWidth,
        background:  '#FFFFFF',
        border:      '1px solid #E0E3EA',
        borderRadius: 6,
        boxShadow:   '0 6px 16px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
        zIndex:      9999,
        overflow:    'hidden',
      }}
    >
      {RESOLUTIONS.map(({ key, label }) => (
        <button
          key={key}
          onMouseDown={e => { e.preventDefault(); onSelect(key); }}
          style={{
            display:    'block',
            width:      '100%',
            textAlign:  'left',
            padding:    '7px 12px',
            fontSize:   12,
            color:      '#3A3A3A',
            background: 'transparent',
            border:     'none',
            cursor:     'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F4F7FA')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {label}
        </button>
      ))}
    </div>,
    document.body
  );
}

export function ActionItems({ items }: ActionItemsProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [cardState, setCardState] = useState<Record<number, CardState>>({});

  // One ref per card index for the resolve button anchor
  const buttonRefs = useRef<Map<number, HTMLButtonElement | null>>(new Map());

  const getCard = (i: number): CardState =>
    cardState[i] ?? { dropdownOpen: false, otherOpen: false, otherText: '', dismissing: false, hovered: false };

  const updateCard = (i: number, patch: Partial<CardState>) =>
    setCardState(prev => ({ ...prev, [i]: { ...getCard(i), ...patch } }));

  const dismiss = (i: number) => {
    updateCard(i, { dismissing: true, dropdownOpen: false, otherOpen: false });
    setTimeout(() => setDismissed(prev => new Set([...prev, i])), 200);
  };

  const handleResolution = useCallback((i: number, key: ResolutionKey) => {
    if (key === 'other') {
      updateCard(i, { dropdownOpen: false, otherOpen: true });
    } else {
      dismiss(i);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = items
    .map((item, i) => ({ item, i }))
    .filter(({ i }) => !dismissed.has(i));

  if (visible.length === 0) {
    return (
      <div className="px-4 py-3 bg-status-successSurface border border-status-success/40 rounded-[6px]">
        <p className="text-[13px] text-[#15803D] font-medium">All caught up — no open action items.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <AlertTriangle size={14} className="text-status-warning flex-shrink-0" />
        <span className="text-[12px] font-semibold text-[#92400E]">
          {visible.length} open action{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {visible.map(({ item, i }) => {
          const high  = isHighPriority(item);
          const text  = stripEmoji(item);
          const color = high ? '#DC2626' : '#D97706';
          const card  = getCard(i);
          const showResolve = card.hovered || card.dropdownOpen;

          // Create a stable ref callback
          const setButtonRef = (el: HTMLButtonElement | null) => {
            buttonRefs.current.set(i, el);
          };

          const anchorRef = { current: buttonRefs.current.get(i) ?? null } as React.RefObject<HTMLButtonElement | null>;

          return (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col bg-white rounded-[8px] border border-border-card"
              style={{
                width:           220,
                borderLeftWidth: 3,
                borderLeftColor: color,
                opacity:         card.dismissing ? 0   : 1,
                transform:       card.dismissing
                  ? 'scale(0.96)'
                  : card.hovered
                  ? 'translateY(-2px)'
                  : 'translateY(0)',
                boxShadow: card.hovered
                  ? '0 4px 12px rgba(0,0,0,0.09)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'opacity 0.2s, transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'default',
              }}
              onMouseEnter={() => updateCard(i, { hovered: true })}
              onMouseLeave={() => updateCard(i, { hovered: false })}
            >
              <p className="text-[12px] text-text-primary leading-relaxed px-3 pt-3 pb-2 flex-1">{text}</p>

              {/* Other input */}
              {card.otherOpen && (
                <div className="px-3 pb-3 border-t border-border-card pt-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Add a note (optional)..."
                    value={card.otherText}
                    onChange={e => updateCard(i, { otherText: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') dismiss(i);
                      if (e.key === 'Escape') updateCard(i, { otherOpen: false });
                    }}
                    className="w-full px-2 py-1.5 text-[11px] border border-border rounded-[4px] outline-none focus:border-primary mb-1.5"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => dismiss(i)}
                      className="flex-1 text-[11px] font-medium py-1 rounded-[4px] text-white"
                      style={{ background: color }}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => updateCard(i, { otherOpen: false })}
                      className="text-[11px] px-2 py-1 rounded-[4px] text-text-subtle border border-border hover:bg-surface-header"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Resolve button — only visible on hover */}
              {!card.otherOpen && (
                <div
                  className="px-3 pb-2.5 flex justify-end"
                  style={{
                    opacity:    showResolve ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <button
                    ref={setButtonRef}
                    onClick={() => updateCard(i, { dropdownOpen: !card.dropdownOpen })}
                    className="flex items-center gap-1 text-[11px] font-medium text-text-subtle hover:text-text-primary transition-colors"
                  >
                    Resolve
                    <ChevronDown
                      size={11}
                      style={{
                        transform:  card.dropdownOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s',
                      }}
                    />
                  </button>
                </div>
              )}

              {/* Portal dropdown — escapes all overflow containers */}
              <ResolveDropdown
                anchorRef={anchorRef}
                open={card.dropdownOpen}
                onSelect={key => handleResolution(i, key)}
                onClose={() => updateCard(i, { dropdownOpen: false })}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
