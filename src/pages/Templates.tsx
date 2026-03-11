import { Pencil, Copy, FileText, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { templates } from '../data/mockData';

export function Templates() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-text-subtle">Reusable pricing structures applied to deals</p>
        <Button variant="primary"><Plus size={16} /> New Template</Button>
      </div>

      <div className="rounded-[8px] border border-border-card overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-header border-b border-border-header">
              {['Template Name', 'Description', 'Category', 'Pricing Type', 'Used in Deals', 'Last Updated', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-[10px] text-[16px] font-medium text-text-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {templates.map(tpl => (
              <tr key={tpl.id} className="border-b border-border-card last:border-0 hover:bg-surface-page hover:shadow-row-hover transition-all">
                <td className="px-4 py-4 text-[16px] font-medium text-text-primary whitespace-nowrap">{tpl.name}</td>
                <td className="px-4 py-4 text-[14px] text-text-subtle max-w-sm">{tpl.description}</td>
                <td className="px-4 py-4 text-[14px] text-text-primary whitespace-nowrap">{tpl.category}</td>
                <td className="px-4 py-4 text-[14px] text-text-primary whitespace-nowrap">{tpl.pricingType}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} className="text-text-subtle" />
                    <span className="text-[14px] text-text-primary">{tpl.usedInDeals}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px] text-text-subtle whitespace-nowrap">{tpl.lastUpdated}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
                      <Pencil size={16} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
                      <Copy size={16} />
                    </button>
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
