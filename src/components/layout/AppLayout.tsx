import { Outlet, useLocation, useParams } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { accounts } from '../../data/mockDataLoader';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/accounts': 'Accounts',
  '/templates': 'Pricing Templates',
  '/health': 'Health Scoring',
  '/users': 'Users',
  '/settings': 'Settings',
};

function ContentHeader() {
  const location = useLocation();
  const params = useParams();

  let title = routeTitles[location.pathname] ?? '';

  if (!title && location.pathname.startsWith('/accounts/')) {
    const account = accounts.find(a => a.id === params.id);
    title = account?.name ?? 'Account Detail';
  }

  return (
    <div className="sticky top-0 z-40 h-[56px] bg-white border-b border-border-header flex items-center justify-between px-8">
      <span className="text-[20px] font-medium text-text-primary">{title}</span>
      <button className="text-text-subtle hover:text-text-primary transition-colors">
        <HelpCircle size={20} />
      </button>
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const isHealthRoute = location.pathname.startsWith('/health');

  return (
    <div className="flex h-screen bg-surface-page">
      <Sidebar />
      <main className={`flex-1 ml-[240px] flex flex-col ${isHealthRoute ? 'h-screen overflow-hidden' : 'overflow-y-auto'}`}>
        <ContentHeader />
        <div className={isHealthRoute ? 'flex-1 overflow-hidden' : ''}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
