import { useState } from 'react';
import { CRITERIA_META, EXTRA_CRITERIA_META } from '../../../types/health';

interface CriteriaSelectProps {
  selected: string[];
  onChange: (criteria: string[]) => void;
  onNext: () => void;
}

export function CriteriaSelect({ selected, onChange, onNext }: CriteriaSelectProps) {
  const [showExtras, setShowExtras] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const addCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    const key = `custom:${trimmed}`;
    if (!selected.includes(key)) {
      onChange([...selected, key]);
    }
    setCustomText('');
    setShowCustomInput(false);
  };

  const removeCustom = (key: string) => {
    onChange(selected.filter(k => k !== key));
  };

  const customSelected = selected.filter(k => k.startsWith('custom:'));
  const canProceed = selected.length >= 3;

  const CriterionChip = ({ k, emoji, label }: { k: string; emoji: string; label: string }) => {
    const isSelected = selected.includes(k);
    return (
      <button
        onClick={() => toggle(k)}
        style={{
          padding: '12px 10px',
          borderRadius: 12,
          border: `2px solid ${isSelected ? '#00A2B2' : '#EDEDED'}`,
          background: isSelected ? '#E6F8FA' : '#fff',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          fontFamily: 'Helvetica Neue, sans-serif',
          transition: 'all 0.15s',
          position: 'relative',
        }}
      >
        {isSelected && (
          <div style={{
            position: 'absolute', top: 7, right: 7,
            width: 16, height: 16, borderRadius: '50%',
            background: '#00A2B2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="8" height="7" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span style={{ fontSize: 11, fontWeight: isSelected ? 600 : 400, color: isSelected ? '#00A2B2' : '#1C1B1F', lineHeight: 1.3 }}>{label}</span>
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid #EDEDED' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#00A2B2', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Step 1 of 2</p>
          <p style={{ fontSize: 11, color: '#6D6D6D', margin: 0 }}>{selected.length} selected {selected.length < 3 ? `(${3 - selected.length} more needed)` : '✓'}</p>
        </div>
        <p style={{ fontSize: 19, fontWeight: 700, color: '#1C1B1F', marginBottom: 3 }}>What matters most to you?</p>
        <p style={{ fontSize: 13, color: '#6D6D6D', margin: 0 }}>Select everything you want us to nail. Choose at least 3.</p>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#EDEDED', flexShrink: 0 }}>
        <div style={{ height: '100%', width: '50%', background: '#00A2B2' }} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}>

        {/* Standard criteria grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {CRITERIA_META.map(({ key, emoji, label }) => (
            <CriterionChip key={key} k={key} emoji={emoji} label={label} />
          ))}
        </div>

        {/* More options section */}
        <button
          onClick={() => setShowExtras(v => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: '#F4F7FA',
            border: '1px solid #EDEDED',
            borderRadius: 10,
            cursor: 'pointer',
            fontFamily: 'Helvetica Neue, sans-serif',
            marginBottom: showExtras ? 10 : 0,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1B1F' }}>More options</span>
          <span style={{ fontSize: 12, color: '#6D6D6D' }}>{showExtras ? '▲' : '▼'}</span>
        </button>

        {showExtras && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {EXTRA_CRITERIA_META.map(({ key, emoji, label }) => (
              <CriterionChip key={key} k={key} emoji={emoji} label={label} />
            ))}
          </div>
        )}

        {/* Custom criteria already added */}
        {customSelected.length > 0 && (
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6D6D6D', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Your custom standards</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {customSelected.map(k => (
                <div
                  key={k}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    background: '#E6F8FA',
                    border: '1.5px solid #00A2B2',
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 16 }}>✏️</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#1C1B1F', fontWeight: 500 }}>{k.slice(7)}</span>
                  <button
                    onClick={() => removeCustom(k)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6D6D6D', fontSize: 16, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add your own */}
        <div style={{ marginTop: 14, marginBottom: 8 }}>
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: '#fff',
                border: '1.5px dashed #CED4DC',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 13,
                color: '#00A2B2',
                fontWeight: 500,
                fontFamily: 'Helvetica Neue, sans-serif',
                textAlign: 'center',
              }}
            >
              + Add your own standard
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                autoFocus
                placeholder="e.g. Clean server room, No scent products..."
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustom(); if (e.key === 'Escape') { setShowCustomInput(false); setCustomText(''); } }}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1.5px solid #00A2B2',
                  borderRadius: 10,
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'Helvetica Neue, sans-serif',
                  boxSizing: 'border-box',
                  color: '#1C1B1F',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={addCustom}
                  disabled={!customText.trim()}
                  style={{
                    flex: 1, padding: '10px',
                    background: customText.trim() ? '#00A2B2' : '#CED4DC',
                    color: '#fff', border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: customText.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'Helvetica Neue, sans-serif',
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowCustomInput(false); setCustomText(''); }}
                  style={{
                    padding: '10px 16px',
                    background: '#F4F7FA', color: '#6D6D6D',
                    border: '1px solid #EDEDED', borderRadius: 8,
                    fontSize: 13, cursor: 'pointer',
                    fontFamily: 'Helvetica Neue, sans-serif',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CTA */}
      <div style={{ padding: '12px 14px 16px', borderTop: '1px solid #EDEDED', flexShrink: 0 }}>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            width: '100%',
            padding: '15px',
            background: canProceed ? '#00A2B2' : '#CED4DC',
            color: '#fff',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            fontFamily: 'Helvetica Neue, sans-serif',
            transition: 'background 0.2s',
          }}
        >
          {canProceed ? 'These are my priorities →' : `Select ${3 - selected.length} more to continue`}
        </button>
      </div>
    </div>
  );
}
