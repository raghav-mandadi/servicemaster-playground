import { useState } from 'react';
import { ChevronLeft, Camera, X, CheckCircle } from 'lucide-react';

interface ComplaintFormProps {
  onBack: () => void;
}

const ISSUE_TYPES = [
  'Quality issue',
  'Missed area',
  'Damaged item',
  'Staff concern',
  'Scheduling issue',
  'Other',
];

export function ComplaintForm({ onBack }: ComplaintFormProps) {
  const [issueType, setIssueType] = useState('');
  const [message, setMessage]    = useState('');
  const [photos, setPhotos]      = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const mockPhotoNames = ['IMG_5012.jpg', 'IMG_5013.jpg', 'IMG_5014.jpg'];

  function addPhoto() {
    if (photos.length < 3) {
      setPhotos(p => [...p, mockPhotoNames[p.length]]);
    }
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 24px', fontFamily: 'Helvetica Neue, sans-serif', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <CheckCircle size={28} color="#DC2626" />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#1C1B1F', margin: '0 0 8px' }}>Issue Received</p>
        <p style={{ fontSize: 13, color: '#6D6D6D', lineHeight: 1.6, margin: '0 0 8px' }}>
          Your account manager has been notified and will follow up within one business day.
        </p>
        <p style={{ fontSize: 12, color: '#8E8E93', margin: '0 0 28px' }}>Reference #ISS-2024-4481</p>
        <button
          onClick={onBack}
          style={{ fontSize: 14, fontWeight: 600, color: '#00A2B2', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>

      {/* Nav bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 14px 10px', borderBottom: '1px solid #F2F2F7', background: '#fff', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
          <ChevronLeft size={18} color="#00A2B2" />
          <span style={{ fontSize: 14, color: '#00A2B2' }}>Home</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px 18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <p style={{ fontSize: 19, fontWeight: 700, color: '#1C1B1F', margin: 0 }}>Report an Issue</p>
          </div>
          <p style={{ fontSize: 13, color: '#6D6D6D', margin: 0 }}>We take every report seriously and respond within 1 business day.</p>
        </div>

        {/* Issue type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6D6D6D', display: 'block', marginBottom: 8 }}>Issue Type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {ISSUE_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setIssueType(type)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  border: issueType === type ? '1.5px solid #DC2626' : '1px solid #E6E8ED',
                  background: issueType === type ? '#FEF2F2' : '#fff',
                  color: issueType === type ? '#DC2626' : '#6D6D6D',
                  cursor: 'pointer',
                  fontFamily: 'Helvetica Neue, sans-serif',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6D6D6D', display: 'block', marginBottom: 8 }}>Description</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Please describe the issue..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
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

        {/* Photos */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6D6D6D', display: 'block', marginBottom: 8 }}>Photos <span style={{ fontWeight: 400, color: '#8E8E93' }}>(optional)</span></label>
          <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 10px' }}>Attach photos to help us understand the issue.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {photos.map((name, i) => (
              <div key={i} style={{ position: 'relative', width: 62, height: 62, background: '#F2F2F7', borderRadius: 8, border: '1px solid #E6E8ED', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <Camera size={16} color="#8E8E93" />
                <span style={{ fontSize: 9, color: '#8E8E93', textAlign: 'center', lineHeight: 1.2, padding: '0 4px' }}>{name}</span>
                <button
                  onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))}
                  style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, background: '#6D6D6D', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <X size={9} color="#fff" />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <button
                onClick={addPhoto}
                style={{ width: 62, height: 62, background: '#F4F7FA', border: '1.5px dashed #C7C7CC', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}
              >
                <Camera size={18} color="#8E8E93" />
                <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'Helvetica Neue, sans-serif' }}>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div style={{ padding: '0 18px 24px', flexShrink: 0 }}>
        <button
          onClick={() => { if (message.trim()) setSubmitted(true); }}
          disabled={!message.trim()}
          style={{
            width: '100%',
            padding: '15px',
            background: message.trim() ? '#DC2626' : '#E6E8ED',
            color: message.trim() ? '#fff' : '#8E8E93',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: message.trim() ? 'pointer' : 'default',
            fontFamily: 'Helvetica Neue, sans-serif',
            transition: 'background 0.15s',
          }}
        >
          Submit Report
        </button>
      </div>
    </div>
  );
}
