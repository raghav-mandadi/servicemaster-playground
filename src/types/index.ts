export type AccountStatus = 'Active' | 'Draft' | 'New' | 'Archived';
export type DealStatus = 'Active' | 'Draft' | 'New' | 'Archived';
export type UserRole = 'Admin' | 'Manager' | 'Rep';
export type UserStatus = 'Active' | 'Inactive';
export type CleaningFrequency = 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
export type PricingType = 'Flat Rate' | 'Per Sq Ft' | 'Hourly';

export type RoomType = 'office' | 'conference' | 'lobby' | 'kitchen' | 'restroom' | 'hallway' | 'storage' | 'other';

export interface Room {
  name: string;
  type: RoomType;
}

export interface BuildingFloor {
  floorNumber: number;
  restroomCount: number;
  rooms: Room[];
}

export interface BuildingDetail {
  buildingId: string;
  name: string;
  sqFootage: number;
  cleaningFrequency: CleaningFrequency;
  floors: BuildingFloor[];
}

export interface Account {
  id: string;
  name: string;
  status: AccountStatus;
  industry: string;
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  memberSince: string;
  buildings: BuildingDetail[];
  siteCount: number;
  lastActivity: string;
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
