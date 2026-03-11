import { useState } from 'react';
import { X } from 'lucide-react';
import { AccountHealthList } from '../components/health/admin/AccountHealthList';
import type { HealthSelection } from '../components/health/admin/AccountHealthList';
import { HealthDetail } from '../components/health/admin/HealthDetail';
import { PhoneFrame } from '../components/health/PhoneFrame';
import { MobileApp } from '../components/health/MobileApp';
import type { PreviewMode } from '../components/health/MobileApp';
import { accountHealthScores } from '../data/healthMockData';

export function Health() {
  const firstRed = accountHealthScores.find(a => a.tier === 'red');
  const [selected, setSelected] = useState<HealthSelection | null>(
    firstRed ? { type: 'deal', dealId: firstRed.dealId, accountId: firstRed.accountId } : null
  );
  const [previewMode,     setPreviewMode]     = useState<PreviewMode>('prejob');
  const [showPhoneModal,  setShowPhoneModal]  = useState(false);

  // Resolve what to show in the detail panel
  const selectedDeal = selected?.type === 'deal'
    ? accountHealthScores.find(a => a.dealId === selected.dealId) ?? null
    : null;

  const selectedAccountDeals = selected
    ? accountHealthScores.filter(a => a.accountId === selected.accountId)
    : [];

  const handleSelect = (sel: HealthSelection) => {
    setSelected(sel);
    setPreviewMode('prejob');
  };

  // For phone modal — use selected deal, or first deal of selected account
  const previewAccount = selectedDeal
    ?? (selectedAccountDeals.length > 0 ? selectedAccountDeals[0] : null);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── Account/Deal sidebar ─────────────────────────────────────────── */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #E6E8ED',
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        <AccountHealthList
          accounts={accountHealthScores}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {/* ── Detail panel ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#F4F7FA' }}>
        {selected ? (
          <HealthDetail
            selection={selected}
            deal={selectedDeal}
            accountDeals={selectedAccountDeals}
            onOpenPhonePreview={() => setShowPhoneModal(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-48 text-[13px] text-text-subtle">
            Select an account or deal to view its health score.
          </div>
        )}
      </div>

      {/* ── Phone preview modal ─────────────────────────────────────────── */}
      {showPhoneModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowPhoneModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#F4F7FA',
              borderRadius: 16,
              padding: '20px 20px 24px',
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
                Customer Mobile Preview
              </p>
              <p style={{ fontSize: 12, color: '#6D6D6D' }}>
                {previewAccount
                  ? `${previewAccount.accountName} — ${previewAccount.dealName}`
                  : 'Select a deal to preview'}
              </p>
            </div>

            <PhoneFrame>
              <MobileApp
                mode={previewMode}
                account={previewAccount}
                onModeChange={setPreviewMode}
              />
            </PhoneFrame>

            <div style={{ width: '100%', maxWidth: 340, padding: '10px 14px', background: '#E6F8FA', borderRadius: 10, border: '1px solid #00A2B2' }}>
              <p style={{ fontSize: 11, color: '#00A2B2', fontWeight: 600, marginBottom: 4 }}>Criteria-First Feedback™</p>
              <p style={{ fontSize: 11, color: '#6D6D6D', lineHeight: 1.6, margin: 0 }}>
                Customers define success criteria before the job, then rate against exactly those criteria after. More honest, more actionable feedback.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
