import { UserProfile, HotelEvent, Vendor, VendorOrder, NotificationItem, Venue } from '../types';

// Clean initial bootstrap: only a single primary Administrator account so rights,
// users, vendors, venues, events, and orders are created from scratch with zero sample data.
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    name: 'Administrator',
    role: 'ADMIN',
    title: 'System Administrator',
    email: 'admin@hotelops.local',
    phone: '',
    departmentOrCompany: 'Hotel Management',
    status: 'ACTIVE',
    rights: {
      canCreateEvents: true,
      canBookVenues: true,
      canOrderRequirements: true,
      canVerifyTeamProof: true,
      canApproveManagementProof: true,
      canUploadSetupProof: false,
      canManageVenues: true,
      canManageUserRights: true
    }
  }
];

export const INITIAL_VENUES: Venue[] = [];

export const INITIAL_EVENTS: HotelEvent[] = [];

export const INITIAL_VENDORS: Vendor[] = [];

export const INITIAL_ORDERS: VendorOrder[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
