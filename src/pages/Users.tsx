import { Pencil, UserX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusChip } from '../components/ui/StatusChip';
import { Tag } from '../components/ui/Tag';
import { users } from '../data/mockData';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function Users() {
  return (
    <div className="px-8 py-6">
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button variant="primary">Invite User</Button>
      </div>

      {/* Table */}
      <div>
        {/* Header row */}
        <div className="flex items-center bg-[#E6E8ED] rounded-[8px] mb-2">
          {['Name', 'Role', 'Status', 'Last Login', 'Actions'].map((h, i) => (
            <div key={h} className="px-4 py-[10px] text-[16px] font-medium text-text-subtle"
              style={i === 4 ? { flex: '0 0 100px' } : { flex: '1 1 0', minWidth: 0 }}>
              {h}
            </div>
          ))}
        </div>
        {/* Data rows */}
        <div className="flex flex-col gap-[8px]">
          {users.map(user => (
            <div key={user.id} className="flex items-center border border-[#ededed] rounded-[8px] bg-white hover:shadow-row-hover transition-all">
              <div className="px-4 py-4" style={{ flex: '1 1 0', minWidth: 0 }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-[13px] font-medium flex items-center justify-center flex-shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-text-primary">{user.name}</p>
                    <p className="text-[12px] text-text-subtle">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-4" style={{ flex: '1 1 0', minWidth: 0 }}><Tag>{user.role}</Tag></div>
              <div className="px-4 py-4" style={{ flex: '1 1 0', minWidth: 0 }}><StatusChip status={user.status} /></div>
              <div className="px-4 py-4 text-[13px] text-text-subtle" style={{ flex: '1 1 0', minWidth: 0 }}>{user.lastLogin}</div>
              <div className="px-4 py-4" style={{ flex: '0 0 100px' }}>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle"><Pencil size={16} /></button>
                  <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle"><UserX size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
