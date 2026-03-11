import { getCriterionMeta } from '../../../types/health';

interface CriteriaConfirmProps {
  selected: string[];
  onDone: () => void;
}

export function CriteriaConfirm({ selected, onDone }: CriteriaConfirmProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>
      {/* Progress bar — step 2 */}
      <div style={{ height: 3, background: '#EDEDED' }}>
        <div style={{ height: '100%', width: '100%', background: '#00A2B2' }} />
      </div>

      <div style={{ flex: 1, padding: '32px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Big checkmark */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#E6F8FA', border: '2px solid #00A2B2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width="32" height="26" viewBox="0 0 32 26" fill="none">
            <path d="M2 13L11 22L30 2" stroke="#00A2B2" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p style={{ fontSize: 22, fontWeight: 700, color: '#1C1B1F', marginBottom: 8, textAlign: 'center' }}>Your standards are set</p>
        <p style={{ fontSize: 14, color: '#6D6D6D', textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
          After your service, we'll ask you to rate us on each of these — nothing else.
        </p>

        {/* Selected criteria list */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {selected.map(key => {
            const { emoji, label } = getCriterionMeta(key);
            return (
              <div
                key={key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  background: '#F4F7FA',
                  borderRadius: 12,
                  border: '1px solid #EDEDED',
                }}
              >
                <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{emoji}</span>
                <span style={{ fontSize: 14, color: '#1C1B1F', fontWeight: 500 }}>{label}</span>
                <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#00A2B2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 24px' }}>
        <button
          onClick={onDone}
          style={{
            width: '100%',
            padding: '16px',
            background: '#00A2B2',
            color: '#fff',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Helvetica Neue, sans-serif',
          }}
        >
          Got it, I'm all set ✓
        </button>
      </div>
    </div>
  );
}
