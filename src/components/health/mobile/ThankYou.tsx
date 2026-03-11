interface ThankYouProps {
  firstName: string;
  avgScore: number;
  hasLowRating: boolean;
  sentiment: 'positive' | 'negative';
  onReset: () => void;
}

export function ThankYou({ firstName, avgScore, hasLowRating, sentiment, onReset }: ThankYouProps) {
  const scoreColor = avgScore >= 4 ? '#16A34A' : avgScore >= 3 ? '#F59E0B' : '#DC2626';
  const fillPct = (avgScore / 5) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>
      {/* Full progress */}
      <div style={{ height: 3, background: '#00A2B2' }} />

      <div style={{ flex: 1, padding: '32px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Celebration */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: sentiment === 'positive' ? '#DCFCE7' : '#FEF3C7',
          border: `2px solid ${sentiment === 'positive' ? '#16A34A' : '#F59E0B'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 20,
        }}>
          {sentiment === 'positive' ? '🎉' : '🙏'}
        </div>

        <p style={{ fontSize: 24, fontWeight: 700, color: '#1C1B1F', marginBottom: 8 }}>
          Thank you, {firstName}!
        </p>
        <p style={{ fontSize: 14, color: '#6D6D6D', lineHeight: 1.6, marginBottom: 28 }}>
          Your feedback goes directly to your ServiceMaster team. We review every response.
        </p>

        {/* Score display */}
        <div style={{
          width: '100%', padding: '20px',
          background: '#F4F7FA', borderRadius: 16, marginBottom: 20,
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6D6D6D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Your satisfaction score</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12, justifyContent: 'center' }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: scoreColor }}>{avgScore.toFixed(1)}</span>
            <span style={{ fontSize: 16, color: '#6D6D6D' }}>/5</span>
          </div>
          {/* Score bar */}
          <div style={{ height: 8, background: '#EDEDED', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${fillPct}%`, background: scoreColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Follow-up alert if low */}
        {hasLowRating && (
          <div style={{
            width: '100%', padding: '14px 16px',
            background: '#FEF3C7', borderRadius: 12, border: '1px solid #F59E0B',
            display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20, textAlign: 'left',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 13, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
              We noticed some areas didn't meet your standards. Your account manager will follow up within 24 hours.
            </p>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#6D6D6D', lineHeight: 1.6 }}>
          Your feedback helps us improve with every visit. See you next time!
        </p>
      </div>

      {/* Reset (for preview purposes) */}
      <div style={{ padding: '0 20px 24px' }}>
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            color: '#00A2B2',
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 500,
            border: '1px solid #00A2B2',
            cursor: 'pointer',
            fontFamily: 'Helvetica Neue, sans-serif',
          }}
        >
          ↺ Preview again
        </button>
      </div>
    </div>
  );
}
