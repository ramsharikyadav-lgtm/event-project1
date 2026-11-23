export type UserRole = 'ADMIN' | 'TEAM' | 'VENDOR';

export interface UserRights {
  canCreateEvents: boolean;
  canBookVenues: boolean;
  canOrderRequirements: boolean;
  canVerifyTeamProof: boolean;      // Level 1 verification
  canApproveManagementProof: boolean; // Level 2 approval
  canUploadSetupProof: boolean;     // Vendor upload
  canManageVenues: boolean;         // Create & edit hotel venues
  canManageUserRights: boolean;     // Add/remove users & assign rights
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  phone: string;
  departmentOrCompany: string;
  rights: UserRights;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Venue {
  id: string;
  name: string;
  buildingOrFloor: string;
  maxCapacity: number;
  setupStyles: string[];
  amenities: string[];
  description: string;
  status: 'ACTIVE' | 'MAINTENANCE';
}

export type EventType = 'CONFERENCE' | 'GALA' | 'WEDDING' | 'BANQUET' | 'EXHIBITION';
export type EventStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface HotelEvent {
  id: string;
  title: string;
  clientName: string;
  eventType: EventType;
  venue: string; // e.g. "Grand Ballroom (Salons A-D)", "Sapphire Ocean Pavilion"
  startDate: string; // "2026-11-12T08:00"
  endDate: string;
  guestCount: number;
  status: EventStatus;
  createdBy: {
    name: string;
    role: UserRole;
  };
  description: string;
  specialInstructions?: string;
}

export type VendorCategory = 
  | 'AV_LIGHTING' 
  | 'FLORAL_DECOR' 
  | 'CATERING_HOSPITALITY' 
  | 'STAGING_FABRICATION' 
  | 'PHOTOGRAPHY_BROADCAST';

export interface Vendor {
  id: string;
  userId?: string;
  name: string;
  category: VendorCategory;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
  servicesDescription: string;
}

export type OrderStatus = 
  | 'PENDING_SETUP'          // Order sent to vendor with date & time, setup pending
  | 'SETUP_SUBMITTED'        // Vendor uploaded setup photo proof, awaiting Team verification (Level 1)
  | 'TEAM_VERIFIED'          // Team verified setup proof, awaiting Management approval (Level 2)
  | 'MANAGEMENT_APPROVED'    // Final management sign-off granted! (Completed)
  | 'REVISION_REQUESTED';    // Team or Management requested vendor to adjust setup and re-submit photo

export interface SetupProof {
  imageUrl: string;
  submittedAt: string;
  submittedBy: string;
  notes?: string;
}

export interface VerificationRecord {
  verified: boolean;
  verifiedBy: string;
  verifiedAt: string;
  notes?: string;
}

export interface ApprovalRecord {
  approved: boolean;
  approvedBy: string;
  approvedAt: string;
  notes?: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: UserRole;
  timestamp: string;
  notes?: string;
  imageUrl?: string;
}

export interface VendorOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-4821"
  eventId: string;
  vendorId: string;
  requirementTitle: string;
  description: string;
  requiredDate: string; // e.g. "2026-11-12"
  requiredTime: string; // e.g. "07:30"
  venueLocation: string; // e.g. "Grand Ballroom - Main Stage"
  status: OrderStatus;
  orderedBy: {
    name: string;
    role: UserRole;
    timestamp: string;
  };
  setupProof?: SetupProof;
  teamVerification?: VerificationRecord;
  managementApproval?: ApprovalRecord;
  historyLog: HistoryEntry[];
}

export type NotificationType = 
  | 'NEW_ORDER'              // Sent to vendor when requirements are ordered
  | 'PROOF_SUBMITTED'        // Sent to team when vendor uploads setup proof
  | 'TEAM_VERIFIED'          // Sent to management when team approves Level 1
  | 'MANAGEMENT_APPROVED'    // Sent to all when management finalizes Level 2
  | 'REVISION_REQUESTED';    // Sent to vendor if setup needs adjustment

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoles: UserRole[];
  orderId?: string;
  eventId?: string;
}

export type PlatformViewMode = 'WEB_ADMIN' | 'MOBILE_APP';
