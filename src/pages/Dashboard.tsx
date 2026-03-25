import { Building2, FileText, DollarSign, Clock, Plus, UserPlus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { StatusChip } from '../components/ui/StatusChip';
import { accounts } from '../data/mockDataLoader';
import { recentActivity } from '../data/mockData';

const statCards = [
  { label: 'Total Accounts', value: '42', trend: '+3 this month', icon: Building2 },
  { label: 'Active Deals', value: '87', icon: FileText },
  { label: 'Monthly Revenue', value: '$142,800', icon: DollarSign },
  { label: 'Pending Quotes', value: '11', icon: Clock },
];

export function Dashboard() {
  const recentAccounts = accounts.slice(0, 5);

  return (
    <div className="px-8 py-6">
      {/* Subtitle */}
      <p className="text-[13px] text-text-subtle mb-6">Welcome back, here's what's happening.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, trend, icon: Icon }) => (
          <div key={label} className="bg-white rounded-[8px] border border-border-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] text-text-subtle font-medium">{label}</span>
              <div className="w-10 h-10 rounded-[8px] bg-primary-surface flex items-center justify-center">
                <Icon size={20} className="text-primary" />
              </div>
            </div>
            <p className="text-[28px] font-medium text-text-primary">{value}</p>
            {trend && <p className="text-[13px] text-status-active mt-1">{trend}</p>}
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Recent Accounts table */}
        <div className="col-span-3 bg-white rounded-[8px] border border-border-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-card">
            <h2 className="text-[16px] font-medium text-text-primary">Recent Accounts</h2>
            <Link to="/accounts" className="text-[13px] text-primary hover:underline">View All →</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-header border-b border-border-header">
                <th className="text-left px-4 py-[10px] text-[14px] font-medium text-text-subtle">Account Name</th>
                <th className="text-left px-4 py-[10px] text-[14px] font-medium text-text-subtle">Status</th>
                <th className="text-left px-4 py-[10px] text-[14px] font-medium text-text-subtle">Sites</th>
                <th className="text-left px-4 py-[10px] text-[14px] font-medium text-text-subtle">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {recentAccounts.map((acc) => (
                <tr key={acc.id} className="border-b border-border-card hover:bg-surface-page hover:shadow-row-hover transition-all">
                  <td className="px-4 py-3">
                    <Link to={`/accounts/${acc.id}`} className="text-[14px] font-medium text-text-primary hover:text-primary">{acc.name}</Link>
                  </td>
                  <td className="px-4 py-3"><StatusChip status={acc.status} /></td>
                  <td className="px-4 py-3 text-[14px] text-text-primary">{acc.siteCount}</td>
                  <td className="px-4 py-3 text-[13px] text-text-subtle">{acc.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activity feed */}
        <div className="col-span-2 bg-white rounded-[8px] border border-border-card">
          <div className="px-6 py-4 border-b border-border-card">
            <h2 className="text-[16px] font-medium text-text-primary">Recent Activity</h2>
          </div>
          <div>
            {recentActivity.map((item, i) => (
              <div key={item.id}>
                <div className="px-6 py-4 flex items-start gap-3">
                  <Activity size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] text-text-primary">{item.text}</p>
                    <p className="text-[12px] text-text-subtle mt-0.5">{item.time}</p>
                  </div>
                </div>
                {i < recentActivity.length - 1 && <div className="border-b border-border-card mx-6" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Button variant="primary" size="regular">
          <Plus size={16} /> New Account
        </Button>
        <Button variant="secondary" size="regular">
          <Plus size={16} /> New Template
        </Button>
        <Button variant="secondary" size="regular">
          <UserPlus size={16} /> Invite User
        </Button>
      </div>
    </div>
  );
}
