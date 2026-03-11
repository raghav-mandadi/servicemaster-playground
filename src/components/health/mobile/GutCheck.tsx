import { useState } from 'react';

interface GutCheckProps {
  onSubmit: (sentiment: 'positive' | 'negative') => void;
}

export function GutCheck({ onSubmit }: GutCheckProps) {
  const [selected, setSelected] = useState<'positive' | 'negative' | null>(null);
  const [followUp, setFollowUp] = useState('');

  const canSubmit = selected !== null && (selected !== 'negative' || followUp.trim().length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>
      {/* Full progress bar */}
      <div style={{ height: 3, background: '#EDEDED' }}>
        <div style={{ height: '100%', width: '95%', background: '#00A2B2' }} />
      </div>

      <div style={{ flex: 1, padding: '28px 20px 16px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#6D6D6D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Last question</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#1C1B1F', marginBottom: 6 }}>Overall, how do you feel?</p>
        <p style={{ fontSize: 14, color: '#6D6D6D', marginBottom: 28 }}>Just one final gut check.</p>

        {/* Sentiment buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => setSelected('positive')}
            style={{
              padding: '18px 20px',
              borderRadius: 16,
              border: `2px solid ${selected === 'positive' ? '#16A34A' : '#EDEDED'}`,
              background: selected === 'positive' ? '#DCFCE7' : '#fff',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Helvetica Neue, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 32 }}>👍</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: selected === 'positive' ? '#15803D' : '#1C1B1F', margin: 0 }}>Satisfied</p>
              <p style={{ fontSize: 12, color: '#6D6D6D', margin: 0 }}>Great job overall</p>
            </div>
          </button>

          <button
            onClick={() => setSelected('negative')}
            style={{
              padding: '18px 20px',
              borderRadius: 16,
              border: `2px solid ${selected === 'negative' ? '#DC2626' : '#EDEDED'}`,
              background: selected === 'negative' ? '#FEE2E2' : '#fff',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Helvetica Neue, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 32 }}>👎</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: selected === 'negative' ? '#DC2626' : '#1C1B1F', margin: 0 }}>Not satisfied</p>
              <p style={{ fontSize: 12, color: '#6D6D6D', margin: 0 }}>Something was off</p>
            </div>
          </button>
        </div>

        {/* Follow-up for negative */}
        {selected === 'negative' && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', marginBottom: 8 }}>What's most important for us to address? *</p>
            <textarea
              placeholder="Please describe the main issue..."
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${followUp.trim() ? '#CED4DC' : '#DC2626'}`,
                borderRadius: 10,
                fontSize: 14,
                color: '#1C1B1F',
                resize: 'none',
                outline: 'none',
                fontFamily: 'Helvetica Neue, sans-serif',
                boxSizing: 'border-box',
              }}
            />
            {!followUp.trim() && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>Required when not satisfied</p>}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 24px' }}>
        <button
          onClick={() => canSubmit && onSubmit(selected!)}
          disabled={!canSubmit}
          style={{
            width: '100%',
            padding: '16px',
            background: canSubmit ? '#00A2B2' : '#CED4DC',
            color: '#fff',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'Helvetica Neue, sans-serif',
          }}
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
