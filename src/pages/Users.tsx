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
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-text-subtle">Manage admin users and access</p>
        <Button variant="primary">Invite User</Button>
      </div>

      <div className="rounded-[8px] border border-border-card overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-header border-b border-border-header">
              {['Name', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-[10px] text-[16px] font-medium text-text-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-border-card hover:bg-surface-page hover:shadow-row-hover transition-all">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white text-[13px] font-medium flex items-center justify-center flex-shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-text-primary">{user.name}</p>
                      <p className="text-[12px] text-text-subtle">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4"><Tag>{user.role}</Tag></td>
                <td className="px-4 py-4"><StatusChip status={user.status} /></td>
                <td className="px-4 py-4 text-[13px] text-text-subtle">{user.lastLogin}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle"><Pencil size={16} /></button>
                    <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle"><UserX size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
