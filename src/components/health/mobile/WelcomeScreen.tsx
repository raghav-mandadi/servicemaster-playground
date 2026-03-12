import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  firstName:     string;
  scheduledDate: string;
  onNext:        () => void;
  onSkip?:       () => void;
}

export function WelcomeScreen({ firstName, scheduledDate, onNext, onSkip }: WelcomeScreenProps) {
  const formattedDate = new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 20px 24px', fontFamily: 'Helvetica Neue, sans-serif' }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
        <div style={{ width: 32, height: 32, background: '#00A2B2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={16} color="#fff" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1C1B1F' }}>ServiceMaster Clean</span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#1C1B1F', marginBottom: 8, lineHeight: 1.2 }}>
          Hi {firstName}!
        </p>
        <p style={{ fontSize: 15, color: '#6D6D6D', marginBottom: 24, lineHeight: 1.5 }}>
          Your ServiceMaster team is scheduled for<br />
          <strong style={{ color: '#1C1B1F' }}>{formattedDate}</strong>
        </p>

        {/* Value prop card */}
        <div style={{
          background: '#E6F8FA',
          borderRadius: 16,
          padding: '20px',
          marginBottom: 32,
          border: '1px solid rgba(0,162,178,0.3)',
        }}>
          <p style={{ fontSize: 14, color: '#1C1B1F', lineHeight: 1.6, margin: 0 }}>
            Before they arrive, take <strong>30 seconds</strong> to tell us what a great job looks like to you.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        style={{
          width: '100%',
          padding: '16px',
          background: '#00A2B2',
          color: '#fff',
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Helvetica Neue, sans-serif',
          marginBottom: 12,
        }}
      >
        Set My Standards →
      </button>

      {onSkip && (
        <button
          onClick={onSkip}
          style={{
            width: '100%',
            padding: '12px',
            background: 'none',
            color: '#8E8E93',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'Helvetica Neue, sans-serif',
          }}
        >
          Skip for now
        </button>
      )}
    </div>
  );
}
