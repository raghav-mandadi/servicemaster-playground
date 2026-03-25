import { useState, useRef, useEffect, useMemo } from 'react';
import { X, SlidersHorizontal, Filter } from 'lucide-react';
import { AccountHealthList } from '../components/health/admin/AccountHealthList';
import type { HealthSelection } from '../components/health/admin/AccountHealthList';
import { HealthDetail } from '../components/health/admin/HealthDetail';
import { PhoneFrame } from '../components/health/PhoneFrame';
import { MobileApp } from '../components/health/MobileApp';
import { ScoringRulesPanel } from '../components/health/admin/ScoringRulesPanel';
import { accountHealthScores } from '../data/mockDataLoader';
import { DEFAULT_SCORING_CONFIG } from '../data/scoringConfig';
import type { ScoringConfig } from '../data/scoringConfig';
import { computeLiveScore } from '../utils/healthScoring';
import type { HealthEvent } from '../types/health';
import eventsJson from '../data/events.json';
import usersJson from '../data/users.json';

const STORAGE_KEY = 'sm_health_events';

const ROLE_DISPLAY: Record<string, string> = {
  gm:          'GM',
  ops_manager: 'Ops Manager',
  supervisor:  'Supervisor',
  cs:          'CS',
  sales:       'Sales',
};

export function Health() {
  const [eventsMap, setEventsMap] = useState<Record<string, HealthEvent[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Record<string, HealthEvent[]>;
    } catch {
      // ignore
    }
    // Seed from JSON: group events by dealId
    const map: Record<string, HealthEvent[]> = {};
    (eventsJson as HealthEvent[]).forEach(ev => {
      if (!map[ev.dealId]) map[ev.dealId] = [];
      map[ev.dealId].push(ev);
    });
    return map;
  });

  // Persist eventsMap to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsMap));
    } catch {
      // ignore quota errors
    }
  }, [eventsMap]);

  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>(DEFAULT_SCORING_CONFIG);

  // Compute live scores from eventsMap
  const liveAccountScores = useMemo(() => {
    return accountHealthScores.map(base => {
      const events = eventsMap[base.dealId] ?? [];
      const { score, tier, incidentOverride } = computeLiveScore(events, scoringConfig);
      return { ...base, score, tier, incidentOverride, events };
    });
  }, [eventsMap, scoringConfig]);

  const firstRed = liveAccountScores.find(a => a.tier === 'red');
  const [selected, setSelected] = useState<HealthSelection | null>(
    firstRed ? { type: 'deal', dealId: firstRed.dealId, accountId: firstRed.accountId } : null
  );
  const [showPhoneModal,   setShowPhoneModal]   = useState(false);
  const [showScoringRules, setShowScoringRules] = useState(false);
  const [currentUserId,    setCurrentUserId]    = useState<string>('user-004');
  const [filterMySites,    setFilterMySites]    = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = usersJson.find(u => u.userId === currentUserId) ?? usersJson[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Event mutation callbacks
  function handleAddEvent(dealId: string, event: HealthEvent) {
    setEventsMap(prev => ({
      ...prev,
      [dealId]: [event, ...(prev[dealId] ?? [])],
    }));
  }

  function handleDeleteEvent(dealId: string, eventId: string) {
    setEventsMap(prev => ({
      ...prev,
      [dealId]: (prev[dealId] ?? []).filter(e => e.id !== eventId),
    }));
  }

  // Filter scores by assigned sites when toggled
  const visibleScores = filterMySites && currentUser.assignedSiteIds?.length
    ? liveAccountScores.filter(s => currentUser.assignedSiteIds.includes(s.dealId))
    : liveAccountScores;

  const selectedDeal = selected?.type === 'deal'
    ? visibleScores.find(a => a.dealId === selected.dealId) ?? null
    : null;

  const selectedAccountDeals = selected
    ? visibleScores.filter(a => a.accountId === selected.accountId)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderBottom: '1px solid #E6E8ED',
        background: '#fff', flexShrink: 0, gap: 8,
      }}>

        {/* User chip + My Sites toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} ref={dropdownRef}>
          {/* User chip */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserDropdown(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'none', border: '1px solid #E6E8ED', borderRadius: 6,
                padding: '4px 10px 4px 6px', cursor: 'pointer', fontSize: 12,
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#00A2B2', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {currentUser.name.charAt(0)}
              </div>
              <span style={{ color: '#1C1B1F', fontWeight: 500 }}>{currentUser.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, color: '#6D6D6D',
                background: '#F0F2F5', borderRadius: 4, padding: '1px 5px',
              }}>
                {ROLE_DISPLAY[currentUser.role] ?? currentUser.role}
              </span>
            </button>

            {/* Dropdown */}
            {showUserDropdown && (
              <div style={{
                position: 'absolute', top: '110%', left: 0,
                background: '#fff', border: '1px solid #E6E8ED', borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 100,
                minWidth: 200, overflow: 'hidden',
              }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6, padding: '8px 12px 6px', margin: 0 }}>
                  View As
                </p>
                {usersJson.map(u => (
                  <button
                    key={u.userId}
                    onClick={() => { setCurrentUserId(u.userId); setShowUserDropdown(false); }}
                    style={{
                      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 12px', border: 'none', cursor: 'pointer',
                      background: u.userId === currentUserId ? '#F0FDFC' : 'none',
                      borderLeft: u.userId === currentUserId ? '2px solid #00A2B2' : '2px solid transparent',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: u.userId === currentUserId ? '#00A2B2' : '#E6E8ED',
                      color: u.userId === currentUserId ? '#fff' : '#6D6D6D',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, flexShrink: 0,
                    }}>
                      {u.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: 12, color: '#1C1B1F', flex: 1 }}>{u.name}</span>
                    <span style={{ fontSize: 10, color: '#8E8E93' }}>{ROLE_DISPLAY[u.role] ?? u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* My Sites toggle */}
          {currentUser.assignedSiteIds?.length > 0 && (
            <button
              onClick={() => setFilterMySites(v => !v)}
              title={filterMySites ? 'Showing my sites only' : 'Show all sites'}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 500,
                color: filterMySites ? '#00A2B2' : '#6D6D6D',
                background: filterMySites ? '#F0FDFC' : 'none',
                border: `1px solid ${filterMySites ? '#00A2B2' : '#E6E8ED'}`,
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              }}
            >
              <Filter size={12} />
              My Sites
              {filterMySites && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#00A2B2', color: '#fff', borderRadius: 10, padding: '0 5px' }}>
                  {visibleScores.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Scoring Rules */}
        <button
          onClick={() => setShowScoringRules(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 500, color: '#6D6D6D',
            background: 'none', border: '1px solid #E6E8ED',
            borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={13} />
          Scoring Rules
        </button>
      </div>

      {/* ── Main split panel ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Account/Deal sidebar */}
        <div style={{
          width: 300, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #E6E8ED',
          overflow: 'hidden', background: '#FFFFFF',
        }}>
          <AccountHealthList
            accounts={visibleScores}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#F4F7FA' }}>
          {selected ? (
            <HealthDetail
              selection={selected}
              deal={selectedDeal}
              accountDeals={selectedAccountDeals}
              onOpenPhonePreview={() => setShowPhoneModal(true)}
              scoringConfig={scoringConfig}
              eventsForDeal={selectedDeal ? (eventsMap[selectedDeal.dealId] ?? []) : []}
              allAccountEvents={selectedAccountDeals.flatMap(d => eventsMap[d.dealId] ?? [])}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-[13px] text-text-subtle">
              Select an account or deal to view its health score.
            </div>
          )}
        </div>
      </div>

      {/* ── Phone preview modal ─────────────────────────────────────────── */}
      {showPhoneModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowPhoneModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#F4F7FA', borderRadius: 16, padding: '20px 20px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 14, maxHeight: '95vh', overflowY: 'auto', position: 'relative',
            }}
          >
            <button
              onClick={() => setShowPhoneModal(false)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'white', border: '1px solid #E0E3EA',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <X size={14} color="#6D6D6D" />
            </button>

            <div style={{ width: '100%', maxWidth: 340, paddingTop: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', marginBottom: 2 }}>
                Field Staff Mobile Preview
              </p>
              <p style={{ fontSize: 12, color: '#6D6D6D' }}>
                {selectedAccountDeals.length > 0
                  ? selectedAccountDeals[0].accountName
                  : 'Select an account to preview'}
              </p>
            </div>

            <PhoneFrame>
              <MobileApp accounts={selectedAccountDeals} employeeName={currentUser.name} />
            </PhoneFrame>
          </div>
        </div>
      )}

      {/* ── Scoring Rules slide-over ─────────────────────────────────────── */}
      {showScoringRules && (
        <ScoringRulesPanel
          config={scoringConfig}
          onChange={setScoringConfig}
          onClose={() => setShowScoringRules(false)}
        />
      )}
    </div>
  );
}
