import {
  AlertCircle,
  MessageSquare,
  ClipboardList,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Building2,
  Package,
  ClipboardCheck,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EventType } from '../../types/health';

export const EVENT_META: Record<EventType, { label: string; Icon: LucideIcon; color: string }> = {
  complaint:        { label: 'Complaint',        Icon: AlertCircle,    color: '#DC2626' },
  customer_request: { label: 'Customer Request', Icon: MessageSquare,  color: '#D97706' },
  sm_request:       { label: 'SM Request',       Icon: ClipboardList,  color: '#6D6D6D' },
  sensitive_event:  { label: 'Sensitive Event',  Icon: ShieldAlert,    color: '#DC2626' },
  new_cleaner:      { label: 'New Cleaner',      Icon: UserCheck,      color: '#D97706' },
  new_contact:      { label: 'New Contact',      Icon: UserPlus,       color: '#6D6D6D' },
  customer_visit:   { label: 'Customer Visit',   Icon: Building2,      color: '#00A2B2' },
  supply_delivery:  { label: 'Supply Delivery',  Icon: Package,        color: '#16A34A' },
  qc_inspection:    { label: 'QC Inspection',    Icon: ClipboardCheck, color: '#00A2B2' },
  project_outcome:  { label: 'Project Outcome',  Icon: Star,           color: '#6D6D6D' },
};
