import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, MoreHorizontal, FileText, Building2, Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { StatusChip } from '../components/ui/StatusChip';
import { accounts as allAccounts } from '../data/mockData';
import { accountHealthScores } from '../data/healthMockData';
import { HealthBadge } from '../components/health/admin/HealthBadge';
import type { Account } from '../types';

const columnHelper = createColumnHelper<Account>();

// Build a map: accountId → lowest health score (aggregate across deals)
const healthByAccount = new Map(
  accountHealthScores.map(h => [h.accountId, h])
);

export function Accounts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<string>('name');
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
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'activity') return b.lastActivity.localeCompare(a.lastActivity);
      if (sortKey === 'status') return a.status.localeCompare(b.status);
      if (sortKey === 'health') {
        const ha = healthByAccount.get(a.id)?.score ?? -1;
        const hb = healthByAccount.get(b.id)?.score ?? -1;
        return ha - hb; // ascending: at-risk first
      }
      return 0;
    });
  }, [search, statusFilter, sortKey]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(0);
  }

  function handleSortChange(value: string) {
    setSortKey(value);
    setPage(0);
  }

  const columns = [
    columnHelper.display({
      id: 'checkbox',
      header: () => <input type="checkbox" className="rounded-[6px] border-[#E5E7EB]" />,
      cell: () => <input type="checkbox" className="rounded-[6px] border-[#E5E7EB]" />,
      size: 52,
    }),
    columnHelper.accessor('name', {
      header: 'Account Name',
      cell: info => (
        <button onClick={() => navigate(`/accounts/${info.row.original.id}`)} className="font-medium text-text-primary hover:text-primary text-left">
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor('primaryContact', {
      header: 'Primary Contact',
      cell: info => (
        <div>
          <p className="text-[14px] text-text-primary">{info.getValue().name}</p>
          <p className="text-[12px] text-text-subtle">{info.getValue().email}</p>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusChip status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'health',
      header: 'Health Score',
      cell: info => {
        const h = healthByAccount.get(info.row.original.id);
        if (!h) return <span className="text-[13px] text-text-subtle">—</span>;
        return (
          <button
            onClick={() => navigate('/health')}
            title="View in Health module"
          >
            <HealthBadge score={h.score} tier={h.tier} trend={h.trend} size="sm" />
          </button>
        );
      },
    }),
    columnHelper.accessor('deals', {
      header: 'Deals',
      cell: info => (
        <div className="flex items-center gap-1.5">
          <FileText size={16} className="text-text-subtle" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('buildings', {
      header: 'Buildings',
      cell: info => (
        <div className="flex items-center gap-1.5">
          <Building2 size={16} className="text-text-subtle" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('lastActivity', {
      header: 'Last Activity',
      cell: info => <span className="text-[13px] text-text-subtle">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/accounts/${info.row.original.id}`)} className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
            <Eye size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
            <Pencil size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
            <MoreHorizontal size={16} />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: paged,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-text-subtle">Manage your customer accounts and associated deals</p>
        <Button variant="primary">
          <Plus size={16} /> New Account
        </Button>
      </div>

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
            className="appearance-none border border-border rounded-[4px] py-2.5 pl-4 pr-9 text-[16px] bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          >
            {['All', 'Active', 'Draft', 'New', 'Archived'].map(s => (
              <option key={s} value={s === 'All' ? 'All' : s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={sortKey}
            onChange={e => handleSortChange(e.target.value)}
            className="appearance-none border border-border rounded-[4px] py-2.5 pl-4 pr-9 text-[16px] bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          >
            <option value="name">Sort: Name (A–Z)</option>
            <option value="activity">Sort: Last Activity</option>
            <option value="status">Sort: Status</option>
            <option value="health">Sort: Health (At Risk first)</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-border-card overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="bg-surface-header border-b border-border-header">
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    className="text-left px-4 py-[10px] text-[16px] font-medium text-text-subtle"
                    style={h.column.columnDef.size ? { width: h.column.columnDef.size } : undefined}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[14px] text-text-subtle">
                  No accounts match your search.
                </td>
              </tr>
            ) : table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-border-card hover:bg-surface-page hover:shadow-row-hover transition-all">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-4 text-[16px] text-text-primary">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
