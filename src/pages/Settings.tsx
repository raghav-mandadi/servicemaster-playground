import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const navItems = ['General', 'Notifications', 'Integrations', 'Billing'];

export function Settings() {
  const [activeSection, setActiveSection] = useState('General');

  return (
    <div className="px-8 py-6">
      <p className="text-[13px] text-text-subtle mb-6">Configure your account and application preferences</p>

      <div className="flex gap-0 bg-white border border-border-card rounded-[8px] overflow-hidden">
        {/* Left nav */}
        <div className="w-[160px] border-r border-border-card flex-shrink-0">
          {navItems.map(item => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              className={`w-full text-left px-4 py-3 text-[14px] transition-colors ${
                activeSection === item
                  ? 'text-primary font-medium bg-primary-surface'
                  : 'text-text-primary hover:bg-surface-page'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 p-6">
          {activeSection === 'General' && (
            <form className="max-w-md flex flex-col gap-4">
              <h3 className="text-[20px] font-medium text-text-primary mb-2">General Settings</h3>
              <Input label="Company Name" defaultValue="ServiceMaster Clean" />
              <Input label="Company Address" defaultValue="123 Commerce St, Chicago, IL 60601" />
              <Input label="Primary Contact Email" type="email" defaultValue="admin@servicemaster.com" />
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-text-primary">Timezone</label>
                <select className="border border-border rounded-[4px] py-2.5 px-4 text-[16px] bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>America/Chicago (CST)</option>
                  <option>America/New_York (EST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>America/Denver (MST)</option>
                </select>
              </div>
              <div className="mt-2">
                <Button variant="primary">Save Changes</Button>
              </div>
            </form>
          )}
          {activeSection !== 'General' && (
            <div className="flex items-center justify-center h-48 text-text-subtle text-[14px]">
              {activeSection} settings coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
