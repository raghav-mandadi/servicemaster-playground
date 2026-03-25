import { Pencil, Copy, FileText, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { templates } from '../data/mockDataLoader';

export function Templates() {
  return (
    <div className="px-8 py-6">
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button variant="primary"><Plus size={16} /> New Template</Button>
      </div>

      {/* Table */}
      <div>
        {/* Header row */}
        <div className="flex items-center bg-[#E6E8ED] rounded-[8px] mb-2">
          {['Template Name', 'Description', 'Category', 'Pricing Type', 'Used in Deals', 'Last Updated', 'Actions'].map((h, i) => (
            <div key={h} className="px-4 py-[10px] text-[16px] font-medium text-text-subtle"
              style={i === 1 ? { flex: '2 1 0', minWidth: 0 } : i >= 4 ? { flex: '0 0 140px' } : { flex: '1 1 0', minWidth: 0 }}>
              {h}
            </div>
          ))}
        </div>
        {/* Data rows */}
        <div className="flex flex-col gap-[8px]">
          {templates.map(tpl => (
            <div key={tpl.id} className="flex items-center border border-[#ededed] rounded-[8px] bg-white hover:shadow-row-hover transition-all">
              <div className="px-4 py-4 text-[16px] font-medium text-text-primary" style={{ flex: '1 1 0', minWidth: 0 }}>{tpl.name}</div>
              <div className="px-4 py-4 text-[14px] text-text-subtle truncate" style={{ flex: '2 1 0', minWidth: 0 }}>{tpl.description}</div>
              <div className="px-4 py-4 text-[14px] text-text-primary" style={{ flex: '1 1 0', minWidth: 0 }}>{tpl.category}</div>
              <div className="px-4 py-4 text-[14px] text-text-primary" style={{ flex: '1 1 0', minWidth: 0 }}>{tpl.pricingType}</div>
              <div className="px-4 py-4" style={{ flex: '0 0 140px' }}>
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-text-subtle" />
                  <span className="text-[14px] text-text-primary">{tpl.usedInDeals}</span>
                </div>
              </div>
              <div className="px-4 py-4 text-[13px] text-text-subtle" style={{ flex: '0 0 140px' }}>{tpl.lastUpdated}</div>
              <div className="px-4 py-4" style={{ flex: '0 0 140px' }}>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
                    <Pencil size={16} />
                  </button>
                  <button className="p-1.5 rounded hover:bg-surface-page text-text-subtle hover:text-text-primary">
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
