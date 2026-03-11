import type { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: 340,
        height: 700,
        background: '#1a1a1a',
        borderRadius: 48,
        padding: 10,
        boxShadow: '0 32px 80px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      {/* Side buttons */}
      <div style={{ position: 'absolute', left: -3, top: 120, width: 3, height: 36, background: '#333', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: -3, top: 170, width: 3, height: 60, background: '#333', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: -3, top: 244, width: 3, height: 60, background: '#333', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', right: -3, top: 160, width: 3, height: 80, background: '#333', borderRadius: '0 2px 2px 0' }} />

      {/* Screen bezel */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#000',
          borderRadius: 40,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Notch */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 28,
              background: '#000',
              borderRadius: '0 0 18px 18px',
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Helvetica Neue, sans-serif', zIndex: 1 }}>9:41</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', zIndex: 1 }}>
            {/* Signal bars */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0"  y="8"  width="3" height="4" rx="1" fill="#000"/>
              <rect x="4.5" y="5" width="3" height="7" rx="1" fill="#000"/>
              <rect x="9"  y="2"  width="3" height="10" rx="1" fill="#000"/>
              <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#000"/>
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="#000"/>
              <path d="M3.5 7C5 5.2 6.4 4.5 8 4.5s3 .7 4.5 2.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M1 4.5C3.2 2 5.5 1 8 1s4.8 1 7 3.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            {/* Battery */}
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="#000"/>
              <rect x="2" y="2" width="14" height="8" rx="2" fill="#000"/>
              <path d="M22 4.5v3a1.5 1.5 0 000-3z" fill="#000"/>
            </svg>
          </div>
        </div>

        {/* App content */}
        <div
          style={{
            height: 'calc(100% - 44px - 34px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            height: 34,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 120, height: 5, background: '#000', borderRadius: 3, opacity: 0.2 }} />
        </div>
      </div>
    </div>
  );
}
