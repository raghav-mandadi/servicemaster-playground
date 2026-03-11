import { getCriterionMeta } from '../../../types/health';

interface PostJobIntroProps {
  criteria: string[];
  onStart: () => void;
}

export function PostJobIntro({ criteria, onStart }: PostJobIntroProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>
      {/* Progress bar — 0% */}
      <div style={{ height: 3, background: '#EDEDED' }}>
        <div style={{ height: '100%', width: '0%', background: '#00A2B2' }} />
      </div>

      <div style={{ flex: 1, padding: '28px 20px 16px' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
          padding: '12px 16px', background: '#DCFCE7', borderRadius: 12, border: '1px solid #16A34A',
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#15803D', margin: 0 }}>Service Complete</p>
            <p style={{ fontSize: 12, color: '#15803D', margin: 0 }}>Today's cleaning has been logged</p>
          </div>
        </div>

        <p style={{ fontSize: 20, fontWeight: 700, color: '#1C1B1F', marginBottom: 8 }}>How did we do?</p>
        <p style={{ fontSize: 14, color: '#6D6D6D', marginBottom: 24, lineHeight: 1.5 }}>
          We'll ask about the <strong>{criteria.length} things you said mattered</strong> — nothing else.
        </p>

        {/* Criteria reminder */}
        <p style={{ fontSize: 11, fontWeight: 600, color: '#6D6D6D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Your criteria</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {criteria.map(key => {
            const { emoji, label } = getCriterionMeta(key);
            return (
              <div
                key={key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px',
                  background: '#F4F7FA',
                  borderRadius: 20,
                  border: '1px solid #EDEDED',
                }}
              >
                <span style={{ fontSize: 14 }}>{emoji}</span>
                <span style={{ fontSize: 12, color: '#1C1B1F' }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Time estimate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F4F7FA', borderRadius: 10 }}>
          <span style={{ fontSize: 16 }}>⏱️</span>
          <span style={{ fontSize: 13, color: '#6D6D6D' }}>Takes about <strong style={{ color: '#1C1B1F' }}>{criteria.length * 15} seconds</strong></span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 24px' }}>
        <button
          onClick={onStart}
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
          Start Rating →
        </button>
      </div>
    </div>
  );
}
