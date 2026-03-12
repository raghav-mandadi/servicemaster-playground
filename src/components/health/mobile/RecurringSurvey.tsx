import { useState } from 'react';
import { ChevronLeft, CheckCircle } from 'lucide-react';

interface RecurringSurveyProps {
  onBack:     () => void;
  onComplete: () => void;
}

const STARS = [1, 2, 3, 4, 5];

export function RecurringSurvey({ onBack, onComplete }: RecurringSurveyProps) {
  const [rating,    setRating]    = useState<number | null>(null);
  const [hovered,   setHovered]   = useState<number | null>(null);
  const [note,      setNote]      = useState('');
  const [submitted, setSubmitted] = useState(false);

  const displayRating = hovered ?? rating;

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 24px', fontFamily: 'Helvetica Neue, sans-serif', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <CheckCircle size={28} color="#16A34A" />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#1C1B1F', margin: '0 0 8px' }}>Check-in received</p>
        <p style={{ fontSize: 13, color: '#6D6D6D', lineHeight: 1.6, margin: '0 0 28px' }}>
          Your team can see this in real time. Thank you for the update.
        </p>
        <button
          onClick={onComplete}
          style={{ fontSize: 15, fontWeight: 600, color: '#fff', background: '#00A2B2', border: 'none', borderRadius: 14, padding: '13px 32px', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 14px 10px', borderBottom: '1px solid #F2F2F7', background: '#fff', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
          <ChevronLeft size={18} color="#00A2B2" />
          <span style={{ fontSize: 14, color: '#00A2B2' }}>Home</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6F8FA', borderRadius: 20, padding: '4px 10px', marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, background: '#00A2B2', borderRadius: '50%' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#00A2B2', letterSpacing: 0.3 }}>Service in progress</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#1C1B1F', margin: '0 0 6px', lineHeight: 1.2 }}>How are things going?</p>
          <p style={{ fontSize: 13, color: '#6D6D6D', margin: 0 }}>Quick check-in while your team is on site.</p>
        </div>

        {/* Star rating */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {STARS.map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M20 4l4.5 9.1 10 1.5-7.2 7 1.7 10L20 27l-9 4.7 1.7-10L5.5 14.6l10-1.5L20 4z"
                    fill={displayRating !== null && star <= displayRating ? '#F59E0B' : '#E6E8ED'}
                    stroke={displayRating !== null && star <= displayRating ? '#F59E0B' : '#D8D8DC'}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    style={{ transition: 'fill 0.1s' }}
                  />
                </svg>
              </button>
            ))}
          </div>
          {rating !== null && (
            <p style={{ fontSize: 13, color: '#6D6D6D', margin: 0 }}>
              {['', 'Not great', 'Below expectations', 'Okay', 'Good', 'Excellent'][rating]}
            </p>
          )}
        </div>

        {/* Optional note */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6D6D6D', display: 'block', marginBottom: 8 }}>
            Anything to add? <span style={{ fontWeight: 400, color: '#8E8E93' }}>(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="E.g. restrooms look great, lobby still being done…"
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 13,
              color: '#1C1B1F',
              border: '1px solid #E6E8ED',
              borderRadius: 10,
              resize: 'none',
              outline: 'none',
              fontFamily: 'Helvetica Neue, sans-serif',
              lineHeight: 1.5,
              background: '#FAFAFA',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Submit */}
      <div style={{ padding: '0 20px 24px', flexShrink: 0 }}>
        <button
          onClick={() => { if (rating !== null) setSubmitted(true); }}
          disabled={rating === null}
          style={{
            width: '100%',
            padding: '15px',
            background: rating !== null ? '#00A2B2' : '#E6E8ED',
            color: rating !== null ? '#fff' : '#8E8E93',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: rating !== null ? 'pointer' : 'default',
            fontFamily: 'Helvetica Neue, sans-serif',
            transition: 'background 0.15s',
          }}
        >
          Submit Check-In
        </button>
      </div>
    </div>
  );
}
