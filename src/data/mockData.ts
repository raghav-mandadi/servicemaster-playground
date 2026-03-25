import type { Template, User } from '../types';

export const templates: Template[] = [
  { id: 'tpl-001', name: 'Janitorial Service', description: 'Recurring janitorial services covering routine cleaning of all interior spaces including restrooms, common areas, workstations, and floors on a scheduled frequency.', category: 'Janitorial', pricingType: 'Flat Rate', usedInDeals: 34, lastUpdated: '2025-01-10' },
  { id: 'tpl-002', name: 'Project Service', description: 'One-time or periodic deep cleaning projects such as post-construction cleanups, floor stripping and waxing, carpet extraction, and specialty surface treatments.', category: 'Project', pricingType: 'Flat Rate', usedInDeals: 12, lastUpdated: '2025-01-08' },
];

export const users: User[] = [
  { id: 'usr-001', name: 'Leon Harrington', email: 'leon@servicemaster.com', role: 'Admin', status: 'Active', lastLogin: '2025-01-15' },
  { id: 'usr-002', name: 'Amber Collins', email: 'acollins@servicemaster.com', role: 'Manager', status: 'Active', lastLogin: '2025-01-14' },
  { id: 'usr-003', name: 'Derek Washington', email: 'dwashington@servicemaster.com', role: 'Rep', status: 'Active', lastLogin: '2025-01-15' },
  { id: 'usr-004', name: 'Maria Gonzalez', email: 'mgonzalez@servicemaster.com', role: 'Rep', status: 'Active', lastLogin: '2025-01-13' },
  { id: 'usr-005', name: "Brian O'Donnell", email: 'bodonnell@servicemaster.com', role: 'Manager', status: 'Active', lastLogin: '2025-01-10' },
  { id: 'usr-006', name: 'Tanya Sinclair', email: 'tsinclair@servicemaster.com', role: 'Rep', status: 'Inactive', lastLogin: '2024-12-20' },
  { id: 'usr-007', name: 'Kevin Park', email: 'kpark@servicemaster.com', role: 'Rep', status: 'Active', lastLogin: '2025-01-14' },
  { id: 'usr-008', name: 'Jessica Okafor', email: 'jokafor@servicemaster.com', role: 'Admin', status: 'Active', lastLogin: '2025-01-15' },
];

export const recentActivity = [
  { id: 'act-001', text: 'New account created · Centennial Medical Plaza', time: '2 hours ago' },
  { id: 'act-002', text: 'Template updated · Janitorial Service', time: '4 hours ago' },
  { id: 'act-003', text: 'Site closed · $12,000/mo — Lakewood Office Park', time: '6 hours ago' },
  { id: 'act-004', text: 'Account updated · Riverside Medical Center', time: '1 day ago' },
  { id: 'act-005', text: 'New user invited · Jessica Okafor', time: '1 day ago' },
  { id: 'act-006', text: 'Site created · Northgate Hospital East Wing — $7,800/mo', time: '2 days ago' },
];
