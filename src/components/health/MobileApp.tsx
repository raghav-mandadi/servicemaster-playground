import { useState, useEffect, useMemo } from 'react';
import type { AccountHealthScore, HealthEvent } from '../../types/health';
import { DealListScreen }    from './mobile/DealListScreen';
import { DealDetailScreen } from './mobile/DealDetailScreen';
import { EventLogScreen }    from './mobile/EventLogScreen';
import { ContactScreen }    from './mobile/ContactScreen';
import { computeLiveScore } from '../../utils/healthScoring';
import { DEFAULT_SCORING_CONFIG } from '../../data/scoringConfig';

// PreviewMode kept as never export to avoid breaking any residual imports
export type PreviewMode = never;

type Section = 'deals' | 'deal-detail' | 'log-event' | 'contact';

export type MobileEventOverride = {
  status: 'in_progress' | 'resolved';
  note:   string;
  by:     string;
  at:     string;
};

interface MobileAppProps {
  accounts:     AccountHealthScore[];
  employeeName?: string;
}

export function MobileApp({ accounts, employeeName = 'Mike Torres' }: MobileAppProps) {
  const [section,          setSection]          = useState<Section>('deals');
  const [selectedDealId,   setSelectedDealId]   = useState<string | null>(null);
  const [localEvents,      setLocalEvents]      = useState<HealthEvent[]>([]);
  const [successBanner,    setSuccessBanner]    = useState<string | null>(null);
  const [mobileOverrides,  setMobileOverrides]  = useState<Record<string, MobileEventOverride>>({});
  const [mobilePhotos,     setMobilePhotos]     = useState<Record<string, number>>({});

  // Auto-clear success banner after 3s
  useEffect(() => {
    if (!successBanner) return;
    const t = setTimeout(() => setSuccessBanner(null), 3000);
    return () => clearTimeout(t);
  }, [successBanner]);

  const selectedAccount = accounts.find(a => a.dealId === selectedDealId) ?? null;

  // Local events for the currently selected deal
  const dealLocalEvents = localEvents.filter(e => e.dealId === selectedDealId);

  // Merge overrides into all deal events (for scoring + display)
  const mergedDealEvents = useMemo((): HealthEvent[] => {
    const applyOverride = (e: HealthEvent): HealthEvent => {
      const ov = mobileOverrides[e.id];
      if (!ov) return e;
      return {
        ...e,
        resolutionStatus: ov.status,
        resolutionNote:   ov.note || e.resolutionNote,
        ...(ov.status === 'resolved'    ? { resolvedAt: ov.at,    resolvedBy: ov.by } : {}),
        ...(ov.status === 'in_progress' ? { inProgressAt: ov.at, inProgressBy: ov.by } : {}),
      };
    };
    const seed = (selectedAccount?.events ?? []).map(applyOverride);
    const local = dealLocalEvents.map(applyOverride);
    return [...local, ...seed];
  }, [selectedAccount, dealLocalEvents, mobileOverrides]);

  // Compute breakdown from merged events
  const dealBreakdown = useMemo(() => {
    if (!selectedAccount) return undefined;
    return computeLiveScore(mergedDealEvents, DEFAULT_SCORING_CONFIG).breakdown;
  }, [selectedAccount, mergedDealEvents]);

  function handleSelectDeal(dealId: string) {
    setSelectedDealId(dealId);
    setSection('deal-detail');
  }

  function handleEventSubmit(partial: Omit<HealthEvent, 'id' | 'dealId' | 'loggedAt'>) {
    if (!selectedDealId) return;
    setLocalEvents(prev => [{
      ...partial,
      id:       `ev-${Date.now()}`,
      dealId:   selectedDealId,
      loggedAt: new Date().toISOString(),
    }, ...prev]);
    setSuccessBanner('Event logged successfully');
    setSection('deal-detail');
  }

  function handleUpdateStatus(eventId: string, status: 'in_progress' | 'resolved', note: string) {
    setMobileOverrides(prev => ({
      ...prev,
      [eventId]: { status, note, by: employeeName, at: new Date().toISOString() },
    }));
    setSuccessBanner(status === 'resolved' ? 'Event resolved' : 'Marked in progress');
  }

  function handleAddPhoto(eventId: string) {
    setMobilePhotos(prev => ({ ...prev, [eventId]: (prev[eventId] ?? 0) + 1 }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>

        {/* Success banner */}
        {successBanner && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: '#16A34A', color: '#fff',
            fontSize: 13, fontWeight: 600,
            padding: '10px 16px',
            textAlign: 'center',
            fontFamily: 'Helvetica Neue, sans-serif',
          }}>
            {successBanner}
          </div>
        )}

        {section === 'deals' && (
          <DealListScreen
            accounts={accounts}
            employeeName={employeeName}
            onSelectDeal={handleSelectDeal}
            onRefresh={() => {}}
          />
        )}

        {section === 'deal-detail' && selectedAccount && (
          <DealDetailScreen
            account={selectedAccount}
            mergedEvents={mergedDealEvents}
            breakdown={dealBreakdown}
            photos={mobilePhotos}
            onBack={() => setSection('deals')}
            onLogEvent={() => setSection('log-event')}
            onUpdateStatus={handleUpdateStatus}
            onAddPhoto={handleAddPhoto}
          />
        )}

        {section === 'log-event' && selectedAccount && (
          <EventLogScreen
            dealName={selectedAccount.dealName}
            onSubmit={handleEventSubmit}
            onBack={() => setSection('deal-detail')}
          />
        )}

        {section === 'contact' && (
          <ContactScreen onBack={() => setSection('deals')} />
        )}

      </div>

    </div>
  );
}
