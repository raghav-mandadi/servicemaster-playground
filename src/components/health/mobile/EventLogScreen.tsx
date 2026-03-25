import { ChevronLeft } from 'lucide-react';
import { EventLogForm } from '../admin/EventLogForm';
import type { HealthEvent } from '../../../types/health';

interface EventLogScreenProps {
  dealName:  string;
  onSubmit:  (e: Omit<HealthEvent, 'id' | 'dealId' | 'loggedAt'>) => void;
  onBack:    () => void;
}

export function EventLogScreen({ dealName, onSubmit, onBack }: EventLogScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Helvetica Neue, sans-serif', background: '#F4F7FA' }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 14px 10px', borderBottom: '1px solid #E6E8ED', background: '#fff', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
          <ChevronLeft size={18} color="#00A2B2" />
          <span style={{ fontSize: 14, color: '#00A2B2' }}>Deal</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#1C1B1F', margin: '0 0 16px' }}>Log Event</p>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E6E8ED', padding: '16px' }}>
          <EventLogForm dealName={dealName} onSubmit={onSubmit} onCancel={onBack} />
        </div>
      </div>
    </div>
  );
}
