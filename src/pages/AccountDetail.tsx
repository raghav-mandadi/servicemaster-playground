import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Pencil, Plus, HeartPulse, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusChip } from '../components/ui/StatusChip';
import { HealthBadge } from '../components/health/admin/HealthBadge';
import { accounts, deals as allDeals, buildings as allBuildings } from '../data/mockData';
import { accountHealthScores } from '../data/healthMockData';

type Tab = 'deals' | 'buildings';

const frequencyColors: Record<string, string> = {
  Daily: 'bg-status-activeSurface text-[#15803D] border-status-active/27',
  Weekly: 'bg-primary-surface text-primary border-primary/30',
  'Bi-weekly': 'bg-status-warningSurface text-[#92400E] border-status-warning/27',
};

export function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('deals');

  const account = accounts.find(a => a.id === id) ?? accounts[0];
  const accountDeals = allDeals.filter(d => d.accountId === account.id);
  const accountBuildings = allBuildings.filter(b => b.accountId === account.id);

  // Health data
  const accountHealth = accountHealthScores.find(h => h.accountId === account.id);
  const healthByDeal = new Map(accountHealthScores.filter(h => h.accountId === account.id).map(h => [h.dealId, h]));

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/accounts')}
            className="flex items-center gap-1.5 bg-white border border-border-card shadow-back-btn rounded-[8px] px-3 py-2 text-[14px] text-text-primary hover:bg-surface-page"
          >
            <ArrowLeft size={16} /> Accounts
          </button>
          <h3 className="text-[24px] font-medium text-text-primary">{account.name}</h3>
          <StatusChip status={account.status} />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Edit Account</Button>
          <Button variant="primary"><Plus size={16} /> New Deal</Button>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-white border border-border-card rounded-[8px] p-4 mb-4 flex items-center gap-6 divide-x divide-border-card">
        {[
          { label: 'Primary Contact', value: account.primaryContact.name },
          { label: 'Phone', value: account.primaryContact.phone },
          { label: 'Email', value: account.primaryContact.email },
          { label: 'Address', value: account.address },
          { label: 'Account Type', value: account.accountType },
          { label: 'Member Since', value: account.memberSince },
        ].map(({ label, value }) => (
          <div key={label} className="pl-6 first:pl-0">
            <p className="text-[12px] text-text-subtle font-medium uppercase tracking-wide">{label}</p>
            <p className="text-[14px] text-text-primary mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Health score card */}
      <div className="bg-white border border-border-card rounded-[8px] px-5 py-3.5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeartPulse size={18} className="text-text-subtle" />
          <span className="text-[14px] font-medium text-text-primary">Account Health</span>
          {accountHealth ? (
            <HealthBadge score={accountHealth.score} tier={accountHealth.tier} trend={accountHealth.trend} size="md" />
          ) : (
            <span className="text-[13px] text-text-subtle">No health data yet</span>
          )}
        </div>
        {accountHealth && (
          <div className="flex items-center gap-4">
            {accountHealth.lastSurveyDate && (
              <span className="text-[12px] text-text-subtle">
                Last survey: {accountHealth.lastSurveyDate}
                {accountHealth.lastSurveyScore !== null && (
                  <span className="ml-1 font-medium text-text-primary">({accountHealth.lastSurveyScore}/5 avg)</span>
                )}
              </span>
            )}
            <button
              onClick={() => navigate('/health')}
              className="flex items-center gap-1.5 text-[13px] text-primary hover:underline font-medium"
            >
              Full report <ExternalLink size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border-card mb-4 flex gap-6">
        {(['deals', 'buildings'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-[15px] capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary font-medium'
                : 'text-text-subtle hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'deals' && (
        <div>
          <div className="flex justify-end mb-3">
            <Button variant="primary" size="skinny"><Plus size={14} /> New Deal</Button>
          </div>
          <div className="rounded-[8px] border border-border-card overflow-hidden bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-header border-b border-border-header">
                  {['Deal Name', 'Template', 'Buildings', 'Est. Monthly Value', 'Health Score', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-[10px] text-[16px] font-medium text-text-subtle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accountDeals.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-text-subtle">No deals yet.</td></tr>
                ) : accountDeals.map(deal => {
                  const dh = healthByDeal.get(deal.id);
                  return (
                    <tr key={deal.id} className="border-b border-border-card hover:bg-surface-page transition-all">
                      <td className="px-4 py-4 text-[16px] font-medium text-text-primary">{deal.name}</td>
                      <td className="px-4 py-4 text-[16px] text-text-primary">{deal.template}</td>
                      <td className="px-4 py-4 text-[16px] text-text-primary">{deal.buildings}</td>
                      <td className="px-4 py-4 text-[16px] font-medium text-text-primary">
                        {deal.monthlyValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </td>
                      <td className="px-4 py-4">
                        {dh ? (
                          <button onClick={() => navigate('/health')} title="View in Health module">
                            <HealthBadge score={dh.score} tier={dh.tier} trend={dh.trend} size="sm" />
                          </button>
                        ) : (
                          <span className="text-[12px] text-text-subtle">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4"><StatusChip status={deal.status} /></td>
                      <td className="px-4 py-4 text-[13px] text-text-subtle">{deal.createdDate}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle"><Eye size={16} /></button>
                          <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle"><Pencil size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'buildings' && (
        <div>
          <div className="flex justify-end mb-3">
            <Button variant="primary" size="skinny"><Plus size={14} /> Add Building</Button>
          </div>
          <div className="rounded-[8px] border border-border-card overflow-hidden bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-header border-b border-border-header">
                  {['Building Name', 'Address', 'Sq Footage', 'Floors', 'Restrooms', 'Cleaning Frequency', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-[10px] text-[16px] font-medium text-text-subtle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accountBuildings.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-text-subtle">No buildings yet.</td></tr>
                ) : accountBuildings.map(bld => (
                  <tr key={bld.id} className="border-b border-border-card hover:bg-surface-page transition-all">
                    <td className="px-4 py-4 text-[16px] font-medium text-text-primary">{bld.name}</td>
                    <td className="px-4 py-4 text-[14px] text-text-subtle">{bld.address}</td>
                    <td className="px-4 py-4 text-[16px] text-text-primary">{bld.sqFootage.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[16px] text-text-primary">{bld.floors}</td>
                    <td className="px-4 py-4 text-[16px] text-text-primary">{bld.restrooms}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center border rounded-full px-3 py-1 text-[12px] font-medium ${frequencyColors[bld.cleaningFrequency] ?? ''}`}>
                        {bld.cleaningFrequency}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle"><Eye size={16} /></button>
                        <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle"><Pencil size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
