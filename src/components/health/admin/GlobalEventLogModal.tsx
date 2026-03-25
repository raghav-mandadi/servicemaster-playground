import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft } from 'lucide-react';
import { EventLogForm } from './EventLogForm';
import type { AccountHealthScore, HealthEvent, HealthTier } from '../../../types/health';

interface GlobalEventLogModalProps {
  sites:      AccountHealthScore[];
  onAddEvent: (dealId: string, event: HealthEvent) => void;
  onClose:    () => void;
}

const TIER_COLOR: Record<HealthTier, string> = {
  green:  '#16A34A',
  yellow: '#D97706',
  red:    '#DC2626',
};

const TIER_LABEL: Record<HealthTier, string> = {
  green:  'Healthy',
  yellow: 'Needs Attention',
  red:    'At Risk',
};

export function GlobalEventLogModal({ sites, onAddEvent, onClose }: GlobalEventLogModalProps) {
  const [step,         setStep]         = useState<1 | 2>(1);
  const [query,        setQuery]        = useState('');
  const [selectedSite, setSelectedSite] = useState<AccountHealthScore | null>(null);

  const filtered = sites.filter(site =>
    site.accountName.toLowerCase().includes(query.toLowerCase()) ||
    (site.primaryContact?.name ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[12px] w-[520px] max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {step === 1 ? (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-card flex-shrink-0">
              <p className="text-[14px] font-semibold text-text-primary">Log Event — Select a Site</p>
              <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded hover:bg-surface-header transition-colors">
                <X size={16} color="#6D6D6D" />
              </button>
            </div>
            <div className="px-4 py-3 border-b border-border-card flex-shrink-0">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by account or contact name…"
                autoFocus
                className="w-full text-[13px] border border-border-card rounded-[8px] px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <p className="text-[13px] text-text-subtle px-4 py-6 text-center">No sites match &ldquo;{query}&rdquo;</p>
              ) : (
                filtered.map(site => (
                  <button
                    key={site.dealId}
                    onClick={() => { setSelectedSite(site); setStep(2); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-header cursor-pointer border-b border-border-card last:border-0 text-left"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TIER_COLOR[site.tier] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">{site.accountName}</p>
                      <p className="text-[11px] text-text-subtle truncate">
                        {site.dealName}{site.primaryContact && <> &middot; {site.primaryContact.name}</>}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0" style={{ background: TIER_COLOR[site.tier] + '18', color: TIER_COLOR[site.tier] }}>
                      {TIER_LABEL[site.tier]}
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border-card flex-shrink-0">
              <button onClick={() => setStep(1)} className="flex items-center justify-center w-6 h-6 rounded hover:bg-surface-header transition-colors flex-shrink-0">
                <ChevronLeft size={14} color="#6D6D6D" />
              </button>
              <p className="text-[14px] font-semibold text-text-primary flex-1 truncate">Log Event — {selectedSite?.dealName}</p>
              <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded hover:bg-surface-header transition-colors flex-shrink-0">
                <X size={16} color="#6D6D6D" />
              </button>
            </div>
            {selectedSite && (
              <div className="px-5 pt-3 flex-shrink-0">
                <span className="text-[11px] text-text-subtle bg-surface-header border border-border-card rounded px-2 py-1">
                  {selectedSite.accountName} &middot; {selectedSite.dealName}
                </span>
              </div>
            )}
            <div className="px-5 py-4 overflow-y-auto flex-1">
              {selectedSite && (
                <EventLogForm
                  dealName={selectedSite.dealName}
                  onSubmit={partial => {
                    onAddEvent(selectedSite.dealId, {
                      ...partial,
                      id:       `ev-${Date.now()}`,
                      dealId:   selectedSite.dealId,
                      loggedAt: new Date().toISOString(),
                    });
                    onClose();
                  }}
                  onCancel={onClose}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
