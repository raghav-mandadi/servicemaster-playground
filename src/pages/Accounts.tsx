import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, MoreHorizontal, Building2, Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { StatusChip } from '../components/ui/StatusChip';
import { accounts as allAccounts, accountHealthScores } from '../data/mockDataLoader';
import { HealthBadge } from '../components/health/admin/HealthBadge';

const healthByAccount = new Map(
  accountHealthScores.map(h => [h.accountId, h])
);

const HEADERS = ['', 'Account Name', 'Primary Contact', 'Status', 'Health Score', 'Sites', 'Buildings', 'Location', 'Last Activity', 'Actions'];

export function Accounts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('name');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const results = allAccounts.filter(a => {
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.primaryContact.name.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return [...results].sort((a, b) => {
      if (sortKey === 'name')     return a.name.localeCompare(b.name);
      if (sortKey === 'activity') return b.lastActivity.localeCompare(a.lastActivity);
      if (sortKey === 'status')   return a.status.localeCompare(b.status);
      if (sortKey === 'health') {
        const ha = healthByAccount.get(a.id)?.score ?? -1;
        const hb = healthByAccount.get(b.id)?.score ?? -1;
        return ha - hb;
      }
      return 0;
    });
  }, [search, statusFilter, sortKey]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function handleSearchChange(value: string) { setSearch(value); setPage(0); }
  function handleStatusChange(value: string) { setStatusFilter(value); setPage(0); }
  function handleSortChange(value: string)   { setSortKey(value);   setPage(0); }

  return (
    <div className="px-8 py-6">
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <SearchInput
          placeholder="Search accounts..."
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange('')}
          size="regular"
          className="w-64"
        />
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => handleStatusChange(e.target.value)}
            className="appearance-none border border-[#CED4DC] rounded-[4px] py-2 pl-4 pr-9 text-[16px] bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          >
            {['All', 'Active', 'Draft', 'New', 'Archived'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={sortKey}
            onChange={e => handleSortChange(e.target.value)}
            className="appearance-none border border-[#CED4DC] rounded-[4px] py-2 pl-4 pr-9 text-[16px] bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          >
            <option value="name">Sort: Name (A–Z)</option>
            <option value="activity">Sort: Last Activity</option>
            <option value="status">Sort: Status</option>
            <option value="health">Sort: Health (At Risk first)</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        </div>
        <div className="ml-auto">
          <Button variant="primary"><Plus size={16} /> New Account</Button>
        </div>
      </div>

      {/* Table */}
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#E6E8ED] rounded-[8px] mb-2">
          {HEADERS.map((h, i) => (
            <div
              key={i}
              className="px-4 py-[10px] text-[14px] font-medium text-text-subtle"
              style={i === 0 ? { flex: '0 0 52px' } : { flex: '1 1 0', minWidth: 0 }}
            >
              {i === 0 ? <input type="checkbox" className="rounded-[4px] border-[#E5E7EB]" /> : h}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-[8px]">
          {paged.length === 0 ? (
            <div className="px-4 py-10 text-center text-[14px] text-text-subtle border border-[#ededed] rounded-[8px] bg-white">
              No accounts match your search.
            </div>
          ) : paged.map(a => {
            const h = healthByAccount.get(a.id);
            return (
              <div key={a.id} className="flex items-center border border-[#ededed] rounded-[8px] bg-white hover:shadow-row-hover transition-all">
                {/* Checkbox */}
                <div className="px-4 py-4" style={{ flex: '0 0 52px' }}>
                  <input type="checkbox" className="rounded-[4px] border-[#E5E7EB]" />
                </div>
                {/* Account Name */}
                <div className="px-4 py-4 overflow-hidden" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <button
                    onClick={() => navigate(`/accounts/${a.id}`)}
                    className="font-medium text-[14px] text-text-primary hover:text-primary text-left truncate w-full"
                  >
                    {a.name}
                  </button>
                </div>
                {/* Primary Contact */}
                <div className="px-4 py-4 overflow-hidden" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <p className="text-[14px] text-text-primary truncate">{a.primaryContact.name}</p>
                  <p className="text-[12px] text-text-subtle truncate">{a.primaryContact.email}</p>
                </div>
                {/* Status */}
                <div className="px-4 py-4" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <StatusChip status={a.status} />
                </div>
                {/* Health Score */}
                <div className="px-4 py-4" style={{ flex: '1 1 0', minWidth: 0 }}>
                  {h ? (
                    <button onClick={() => navigate('/health')} title="View in Health module">
                      <HealthBadge score={h.score} tier={h.tier} trend={h.trend} size="sm" />
                    </button>
                  ) : (
                    <span className="text-[13px] text-text-subtle">—</span>
                  )}
                </div>
                {/* Sites */}
                <div className="px-4 py-4 text-[14px] text-text-primary" style={{ flex: '1 1 0', minWidth: 0 }}>
                  {a.siteCount}
                </div>
                {/* Buildings */}
                <div className="px-4 py-4" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <div className="flex items-center gap-1.5">
                    <Building2 size={16} className="text-text-subtle" />
                    <span className="text-[14px] text-text-primary">{a.buildings.length}</span>
                  </div>
                </div>
                {/* Location */}
                <div className="px-4 py-4 text-[13px] text-text-subtle" style={{ flex: '1 1 0', minWidth: 0 }}>
                  {a.address.city}, {a.address.state}
                </div>
                {/* Last Activity */}
                <div className="px-4 py-4 text-[13px] text-text-subtle" style={{ flex: '1 1 0', minWidth: 0 }}>
                  {a.lastActivity}
                </div>
                {/* Actions */}
                <div className="px-4 py-4" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/accounts/${a.id}`)}
                      className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
                      <Pencil size={16} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-[13px] text-text-subtle">
          {filtered.length === 0
            ? 'No results'
            : `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filtered.length)} of ${filtered.length} account${filtered.length !== 1 ? 's' : ''}`}
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" size="skinny" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={14} /> Previous
          </Button>
          <Button variant="secondary" size="skinny" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
