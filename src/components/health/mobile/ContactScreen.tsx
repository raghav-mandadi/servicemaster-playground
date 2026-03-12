import { ChevronLeft, Phone, Mail, Clock, MapPin } from 'lucide-react';

interface ContactScreenProps {
  onBack: () => void;
}

export function ContactScreen({ onBack }: ContactScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Helvetica Neue, sans-serif' }}>

      {/* Nav bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 14px 10px', borderBottom: '1px solid #F2F2F7', background: '#fff', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
          <ChevronLeft size={18} color="#00A2B2" />
          <span style={{ fontSize: 14, color: '#00A2B2' }}>Home</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <p style={{ fontSize: 19, fontWeight: 700, color: '#1C1B1F', margin: '0 0 4px' }}>Contact Us</p>
          <p style={{ fontSize: 13, color: '#6D6D6D', margin: 0 }}>Your ServiceMaster account team</p>
        </div>

        {/* Account manager */}
        <div style={{ background: '#F4F7FA', borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px' }}>Your Account Manager</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#00A2B2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>JR</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1B1F', margin: 0 }}>Jamie Rodriguez</p>
              <p style={{ fontSize: 12, color: '#6D6D6D', margin: '1px 0 0' }}>Account Manager</p>
            </div>
          </div>
        </div>

        {/* Contact methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ContactRow
            icon={<Phone size={16} color="#00A2B2" />}
            label="Call"
            value="(555) 842-0091"
            bg="#E6F8FA"
          />
          <ContactRow
            icon={<Mail size={16} color="#6D6D6D" />}
            label="Email"
            value="j.rodriguez@smclean.com"
            bg="#F4F7FA"
          />
        </div>

        {/* Hours */}
        <div style={{ background: '#fff', border: '1px solid #E6E8ED', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={14} color="#6D6D6D" />
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6D6D6D', margin: 0 }}>Office Hours</p>
          </div>
          {[
            { day: 'Monday – Friday', hours: '7:00 AM – 6:00 PM' },
            { day: 'Saturday',        hours: '8:00 AM – 2:00 PM' },
            { day: 'Sunday',          hours: 'Closed' },
          ].map(({ day, hours }) => (
            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#6D6D6D' }}>{day}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: hours === 'Closed' ? '#8E8E93' : '#1C1B1F' }}>{hours}</span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#8E8E93', margin: '8px 0 0' }}>For urgent issues outside hours, leave a voicemail — we check every morning.</p>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#fff', border: '1px solid #E6E8ED', borderRadius: 12 }}>
          <MapPin size={16} color="#6D6D6D" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: 0 }}>ServiceMaster Clean</p>
            <p style={{ fontSize: 12, color: '#6D6D6D', margin: '2px 0 0', lineHeight: 1.5 }}>4820 Westbrook Industrial Blvd<br />Suite 210, Atlanta, GA 30336</p>
          </div>
        </div>

      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, bg }: {
  icon:  React.ReactNode;
  label: string;
  value: string;
  bg:    string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: bg, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 11, color: '#8E8E93', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: '1px 0 0' }}>{value}</p>
      </div>
    </div>
  );
}
