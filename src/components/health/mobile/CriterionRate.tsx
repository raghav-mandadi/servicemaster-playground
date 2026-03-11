import { useState } from 'react';
import { getCriterionMeta } from '../../../types/health';
import type { CriterionRating } from '../../../types/health';

interface CriterionRateProps {
  criterion: string;
  current: number;
  total: number;
  onNext: (rating: CriterionRating, note?: string) => void;
  onBack: () => void;
}

const EMOJI_OPTIONS: { value: CriterionRating; emoji: string; label: string }[] = [
  { value: 1, emoji: '😞', label: 'Missed it' },
  { value: 2, emoji: '😐', label: 'Below' },
  { value: 3, emoji: '😊', label: 'Met it' },
  { value: 4, emoji: '😄', label: 'Above' },
  { value: 5, emoji: '🌟', label: 'Exceeded' },
];

export function CriterionRate({ criterion, current, total, onNext, onBack }: CriterionRateProps) {
  const [selected, setSelected] = useState<CriterionRating | null>(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const meta = getCriterionMeta(criterion);
  const progress = (current / total) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: '#EDEDED' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#00A2B2', transition: 'width 0.3s' }} />
      </div>

      <div style={{ flex: 1, padding: '20px 20px 16px', display: 'flex', flexDirection: 'column' }}>
        {/* Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: '#6D6D6D', margin: 0 }}>
            {current + 1} of {total}
          </p>
          <button onClick={onBack} style={{ fontSize: 13, color: '#6D6D6D', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
        </div>

        {/* Criterion display */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>{meta.emoji}</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1C1B1F', marginBottom: 6 }}>{meta.label}</p>
          <p style={{ fontSize: 14, color: '#6D6D6D', lineHeight: 1.5, margin: '0 12px' }}>{meta.question}</p>
        </div>

        {/* Emoji rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {EMOJI_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 6px',
                borderRadius: 14,
                border: `2px solid ${selected === opt.value ? '#00A2B2' : '#EDEDED'}`,
                background: selected === opt.value ? '#E6F8FA' : '#fff',
                cursor: 'pointer',
                flex: 1,
                margin: '0 3px',
                transition: 'all 0.15s',
                fontFamily: 'Helvetica Neue, sans-serif',
              }}
            >
              <span style={{ fontSize: 26 }}>{opt.emoji}</span>
              <span style={{ fontSize: 10, color: selected === opt.value ? '#00A2B2' : '#6D6D6D', fontWeight: selected === opt.value ? 600 : 400, whiteSpace: 'nowrap' }}>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Optional note toggle */}
        {selected && !showNote && (
          <button
            onClick={() => setShowNote(true)}
            style={{ fontSize: 13, color: '#00A2B2', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: 12, padding: '4px 0' }}
          >
            + Add a note (optional)
          </button>
        )}
        {showNote && (
          <textarea
            placeholder="What specifically? (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #CED4DC',
              borderRadius: 10,
              fontSize: 13,
              color: '#1C1B1F',
              resize: 'none',
              outline: 'none',
              fontFamily: 'Helvetica Neue, sans-serif',
              boxSizing: 'border-box',
            }}
          />
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 20px' }}>
        <button
          onClick={() => selected && onNext(selected, note || undefined)}
          disabled={!selected}
          style={{
            width: '100%',
            padding: '15px',
            background: selected ? '#00A2B2' : '#CED4DC',
            color: '#fff',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'Helvetica Neue, sans-serif',
          }}
        >
          {current + 1 < total ? 'Next →' : 'Almost done →'}
        </button>
      </div>
    </div>
  );
}
