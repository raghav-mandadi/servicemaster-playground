import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Building2, FileText, HeartPulse, Users, Settings, MapPin, ChevronDown, Check } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Accounts', icon: Building2 },
  { to: '/templates', label: 'Templates', icon: FileText },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const lastUpdated = new Date().toLocaleString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit',
});

const LOCATIONS = ['Chicago', 'Indianapolis'] as const;
type Location = typeof LOCATIONS[number];

function LocationDropdown() {
  const [active, setActive] = useState<Location>(() => {
    const stored = localStorage.getItem('sm_active_location');
    return (LOCATIONS.includes(stored as Location) ? stored : 'Chicago') as Location;
  });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function select(loc: Location) {
    setActive(loc);
    localStorage.setItem('sm_active_location', loc);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative px-4 py-2.5 border-t border-border-header">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 text-left group"
      >
        <MapPin size={13} className="text-text-subtle flex-shrink-0" />
        <span className="flex-1 text-[13px] font-medium text-text-primary truncate">{active}</span>
        <ChevronDown size={13} className={`text-text-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-border-card rounded-[8px] shadow-lg overflow-hidden z-50">
          {LOCATIONS.map(loc => (
            <button
              key={loc}
              onClick={() => select(loc)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-page transition-colors"
            >
              <span className={`flex-1 text-[13px] ${active === loc ? 'font-medium text-primary' : 'text-text-primary'}`}>
                {loc}
              </span>
              {active === loc && <Check size={12} className="text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-border-header flex flex-col z-50">
      {/* Logo / App title */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles size={20} className="text-primary" />
          <span className="font-semibold text-[16px] text-text-primary">Admin Console</span>
        </div>
        <p className="text-[11px] text-text-subtle pl-[28px]">Last Updated {lastUpdated}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 flex flex-col gap-0.5 px-3">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 h-[46px] px-3 rounded-[8px] text-[15px] transition-colors ${
                isActive
                  ? 'bg-primary text-white font-medium shadow-nav-active'
                  : 'text-text-primary font-normal hover:bg-surface-page'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-text-subtle'} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <LocationDropdown />

      {/* User chip */}
      <div className="h-[64px] border-t border-border-header px-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary text-white text-[13px] font-medium flex items-center justify-center flex-shrink-0">
          {getInitials('Leon Harrington')}
        </div>
        <div>
          <p className="text-[14px] font-medium text-text-primary">Leon Harrington</p>
          <p className="text-[12px] text-text-subtle">Admin</p>
        </div>
      </div>
    </aside>
  );
}
