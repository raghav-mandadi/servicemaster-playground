export type AccountStatus = 'Active' | 'Draft' | 'New' | 'Archived';
export type DealStatus = 'Active' | 'Draft' | 'New' | 'Archived';
export type UserRole = 'Admin' | 'Manager' | 'Rep';
export type UserStatus = 'Active' | 'Inactive';
export type CleaningFrequency = 'Daily' | 'Weekly' | 'Bi-weekly';
export type PricingType = 'Flat Rate' | 'Per Sq Ft' | 'Hourly';

export interface Account {
  id: string;
  name: string;
  status: AccountStatus;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  address: string;
  accountType: string;
  memberSince: string;
  deals: number;
  buildings: number;
  lastActivity: string;
}

export interface Deal {
  id: string;
  accountId: string;
  name: string;
  template: string;
  buildings: number;
  monthlyValue: number;
  status: DealStatus;
  createdDate: string;
}

export interface Building {
  id: string;
  accountId: string;
  name: string;
  address: string;
  sqFootage: number;
  floors: number;
  restrooms: number;
  cleaningFrequency: CleaningFrequency;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  pricingType: PricingType;
  usedInDeals: number;
  lastUpdated: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}
