import { UserProfile, UserRights, Vendor, VendorOrder } from '../types';

export type AdminTabId =
  | 'dashboard'
  | 'events'
  | 'orders'
  | 'approvals'
  | 'venues'
  | 'user-rights'
  | 'history';

export const canAccessTab = (tab: AdminTabId, rights: UserRights): boolean => {
  switch (tab) {
    case 'dashboard':
      return true;
    case 'events':
      return rights.canCreateEvents || rights.canBookVenues || rights.canOrderRequirements;
    case 'orders':
      return (
        rights.canOrderRequirements ||
        rights.canUploadSetupProof ||
        rights.canVerifyTeamProof ||
        rights.canApproveManagementProof
      );
    case 'approvals':
      return rights.canVerifyTeamProof || rights.canApproveManagementProof;
    case 'venues':
      return rights.canManageVenues || rights.canBookVenues;
    case 'user-rights':
      return rights.canManageUserRights;
    case 'history':
      return (
        rights.canOrderRequirements ||
        rights.canVerifyTeamProof ||
        rights.canApproveManagementProof ||
        rights.canUploadSetupProof ||
        rights.canCreateEvents
      );
    default:
      return false;
  }
};

export const getMatchingVendorIds = (user: UserProfile, vendors: Vendor[]): string[] => {
  return vendors
    .filter(
      (v) =>
        v.userId === user.id ||
        (user.email && v.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.departmentOrCompany && v.name.toLowerCase() === user.departmentOrCompany.toLowerCase())
    )
    .map((v) => v.id);
};

export const filterOrdersForUser = (
  orders: VendorOrder[],
  user: UserProfile,
  vendors: Vendor[]
): VendorOrder[] => {
  const hasBroadStaffAccess =
    user.rights.canOrderRequirements ||
    user.rights.canVerifyTeamProof ||
    user.rights.canApproveManagementProof ||
    user.rights.canCreateEvents ||
    user.rights.canManageUserRights;

  if (hasBroadStaffAccess) {
    return orders;
  }

  if (user.rights.canUploadSetupProof) {
    const myVendorIds = getMatchingVendorIds(user, vendors);
    if (myVendorIds.length === 0) return [];
    return orders.filter((o) => myVendorIds.includes(o.vendorId));
  }

  return [];
};

export const RIGHT_LABELS: { key: keyof UserRights; label: string; shortLabel: string; desc: string }[] = [
  {
    key: 'canCreateEvents',
    label: 'Create Hotel Events',
    shortLabel: 'Create Events',
    desc: 'Allows scheduling and creating event records'
  },
  {
    key: 'canBookVenues',
    label: 'Book Venues & Spaces',
    shortLabel: 'Book Venues',
    desc: 'Allows reserving ballrooms, pavilions, and salons for events'
  },
  {
    key: 'canOrderRequirements',
    label: 'Order Requirements to Vendors',
    shortLabel: 'Order Requirements',
    desc: 'Allows dispatching service requirements with target date & time'
  },
  {
    key: 'canVerifyTeamProof',
    label: 'Level 1: Verify Proofs (Team)',
    shortLabel: 'Level 1: Team Verify',
    desc: 'Inspects vendor setup photos and submits Level 1 verification'
  },
  {
    key: 'canApproveManagementProof',
    label: 'Level 2: Approve Proofs (Management)',
    shortLabel: 'Level 2: Mgmt Approve',
    desc: 'Grants final executive sign-off on setup completion'
  },
  {
    key: 'canUploadSetupProof',
    label: 'Upload Setup Proof Photos',
    shortLabel: 'Upload Setup Proofs',
    desc: 'Allows submitting completed setup photo proofs for verification'
  },
  {
    key: 'canManageVenues',
    label: 'Create & Manage Hotel Venues',
    shortLabel: 'Manage Venues',
    desc: 'Allows adding new venue spaces and removing unused spaces'
  },
  {
    key: 'canManageUserRights',
    label: 'Assign Rights & Manage Users',
    shortLabel: 'Manage User Rights',
    desc: 'Allows adding/removing users & vendors and assigning permissions'
  }
];
