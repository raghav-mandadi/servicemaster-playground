import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Building2, FileText, HeartPulse, Users, Settings } from 'lucide-react';

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
