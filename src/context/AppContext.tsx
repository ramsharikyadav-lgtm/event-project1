import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  UserProfile, 
  UserRights,
  Venue,
  HotelEvent, 
  Vendor, 
  VendorOrder, 
  NotificationItem, 
  PlatformViewMode 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_VENUES,
  INITIAL_EVENTS, 
  INITIAL_VENDORS, 
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';
import { playChimeSound } from '../utils/sound';

interface ActivePushToast {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
}

interface AppContextType {
  currentUser: UserProfile;
  users: UserProfile[];
  switchUser: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  viewMode: PlatformViewMode;
  setViewMode: (mode: PlatformViewMode) => void;

  events: HotelEvent[];
  venues: Venue[];
  vendors: Vendor[];
  orders: VendorOrder[];
  notifications: NotificationItem[];
  activePushToast: ActivePushToast | null;
  dismissPushToast: () => void;
  notifyAlert: (title: string, message: string, type?: string) => void;

  // Actions: Events & Orders
  createEvent: (eventData: Omit<HotelEvent, 'id' | 'createdBy'>) => void;
  createOrder: (orderData: {
    eventId: string;
    vendorId: string;
    requirementTitle: string;
    description: string;
    requiredDate: string;
    requiredTime: string;
    venueLocation: string;
  }) => void;
  submitSetupProof: (orderId: string, imageUrl: string, notes: string) => void;
  verifyByTeam: (orderId: string, notes: string) => void;
  approveByManagement: (orderId: string, notes: string) => void;
  requestRevision: (orderId: string, reason: string) => void;

  // Actions: User & Vendor Rights Management (Admin)
  addUser: (userData: Omit<UserProfile, 'id'>) => void;
  removeUser: (userId: string) => void;
  assignUserRights: (userId: string, rights: Partial<UserRights>) => void;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;

  // Actions: Venue Management
  createVenue: (venueData: Omit<Venue, 'id'>) => void;
  removeVenue: (venueId: string) => void;
  updateVenue: (venueId: string, updates: Partial<Venue>) => void;

  // Notifications & Workspace
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  triggerTestNotification: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'ga_hotel_users_v4',
  VENUES: 'ga_hotel_venues_v4',
  EVENTS: 'ga_hotel_events_v4',
  VENDORS: 'ga_hotel_vendors_v4',
  ORDERS: 'ga_hotel_orders_v4',
  NOTIFS: 'ga_hotel_notifs_v4',
  ROLE: 'ga_hotel_role_v4',
  CURRENT_USER_ID: 'ga_hotel_active_uid_v4',
  VIEW_MODE: 'ga_hotel_viewmode_v4'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return INITIAL_USERS;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || INITIAL_USERS[0].id;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'ADMIN';
  });

  const [viewMode, setViewModeState] = useState<PlatformViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return (saved as PlatformViewMode) || 'WEB_ADMIN';
  });

  const [venues, setVenues] = useState<Venue[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENUES);
    return saved ? JSON.parse(saved) : INITIAL_VENUES;
  });

  const [events, setEvents] = useState<HotelEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [orders, setOrders] = useState<VendorOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activePushToast, setActivePushToast] = useState<ActivePushToast | null>(null);

  // Sync to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  const currentUser = users.find(u => u.id === activeUserId) || users.find(u => u.role === currentRole) || users[0] || INITIAL_USERS[0];

  const switchUser = (role: UserRole) => {
    const match = users.find(u => u.role === role);
    if (match) {
      setActiveUserId(match.id);
      setCurrentRole(match.role);
    }
  };

  const switchUserById = (userId: string) => {
    const match = users.find(u => u.id === userId);
    if (match) {
      setActiveUserId(match.id);
      setCurrentRole(match.role);
    }
  };

  const setViewMode = (mode: PlatformViewMode) => {
    setViewModeState(mode);
  };

  const dismissPushToast = () => {
    setActivePushToast(null);
  };

  const spawnPushNotification = (title: string, message: string, type: string = 'info') => {
    try {
      if (type.includes('approved')) {
        playChimeSound('approval');
      } else {
        playChimeSound('notification');
      }
    } catch {
      // AudioContext fallback
    }

    const toast: ActivePushToast = {
      id: `toast-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now'
    };
    setActivePushToast(toast);

    setTimeout(() => {
      setActivePushToast(curr => (curr?.id === toast.id ? null : curr));
    }, 6000);
  };

  const notifyAlert = (title: string, message: string, type: string = 'info') => {
    spawnPushNotification(title, message, type);
  };

  // Action: Create Event & Book Venue
  const createEvent = (data: Omit<HotelEvent, 'id' | 'createdBy'>) => {
    if (!currentUser.rights.canCreateEvents) {
      spawnPushNotification('Permission Required', 'Your account does not have the Create Events right.', 'revision');
      return;
    }

    const newId = `evt-${Date.now()}`;
    const newEvent: HotelEvent = {
      ...data,
      id: newId,
      createdBy: {
        name: currentUser.name,
        role: currentUser.role
      }
    };

    setEvents(prev => [newEvent, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'NEW_ORDER',
      title: 'Event Scheduled & Venue Booked',
      message: `${newEvent.title} registered for ${newEvent.venue}.`,
      timestamp: 'Just now',
      read: false,
      targetRoles: ['ADMIN', 'TEAM'],
      eventId: newId
    };
    setNotifications(prev => [notif, ...prev]);
    spawnPushNotification('Venue Booked', `${newEvent.venue} reserved for ${newEvent.title}.`);
  };

  // Action: Order Requirements to Vendor
  const createOrder = (data: {
    eventId: string;
    vendorId: string;
    requirementTitle: string;
    description: string;
    requiredDate: string;
    requiredTime: string;
    venueLocation: string;
  }) => {
    if (!currentUser.rights.canOrderRequirements) {
      spawnPushNotification('Permission Required', 'Your account does not have the Order Requirements right.', 'revision');
      return;
    }

    const orderNum = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();
    const nowReadable = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();

    const newOrder: VendorOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      eventId: data.eventId,
      vendorId: data.vendorId,
      requirementTitle: data.requirementTitle,
      description: data.description,
      requiredDate: data.requiredDate,
      requiredTime: data.requiredTime,
      venueLocation: data.venueLocation,
      status: 'PENDING_SETUP',
      orderedBy: {
        name: currentUser.name,
        role: currentUser.role,
        timestamp: nowIso
      },
      historyLog: [
        {
          id: `hist-${Date.now()}`,
          action: 'Requirement Ordered to Vendor',
          actor: currentUser.name,
          actorRole: currentUser.role,
          timestamp: nowReadable,
          notes: `Ordered setup for ${data.requiredDate} at ${data.requiredTime} (${data.venueLocation}).`
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);

    const vendor = vendors.find(v => v.id === data.vendorId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'NEW_ORDER',
      title: 'New Requirement Order Dispatched',
      message: `${orderNum}: ${data.requirementTitle} assigned to ${vendor?.name || 'Vendor'}. Setup required by ${data.requiredDate} at ${data.requiredTime}.`,
      timestamp: 'Just now',
      read: false,
      targetRoles: ['VENDOR', 'TEAM', 'ADMIN'],
      orderId: newOrder.id,
      eventId: data.eventId
    };
    setNotifications(prev => [notif, ...prev]);
    spawnPushNotification('Order Dispatched to Vendor', `${vendor?.name || 'Vendor'} notified with date & time: ${data.requiredDate} at ${data.requiredTime}.`);
  };

  // Action: Vendor Submits Photo Proof
  const submitSetupProof = (orderId: string, imageUrl: string, notes: string) => {
    if (!currentUser.rights.canUploadSetupProof) {
      spawnPushNotification('Permission Required', 'Your account does not have the Upload Setup Proofs right.', 'revision');
      return;
    }

    const nowReadable = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'SETUP_SUBMITTED',
          setupProof: {
            imageUrl,
            submittedAt: new Date().toISOString(),
            submittedBy: currentUser.name,
            notes: notes || 'Setup completed and verified on site.'
          },
          historyLog: [
            ...ord.historyLog,
            {
              id: `hist-${Date.now()}`,
              action: 'Setup Photo Proof Uploaded',
              actor: currentUser.name,
              actorRole: currentUser.role,
              timestamp: nowReadable,
              notes: notes || 'Proof image submitted for Level 1 verification.',
              imageUrl
            }
          ]
        };
      }
      return ord;
    }));

    const order = orders.find(o => o.id === orderId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'PROOF_SUBMITTED',
      title: 'Setup Photo Proof Uploaded',
      message: `${currentUser.name} uploaded setup proof for ${order?.orderNumber || 'Order'} (${order?.requirementTitle || 'Setup'}). Awaiting Level 1 verification.`,
      timestamp: 'Just now',
      read: false,
      targetRoles: ['TEAM', 'ADMIN'],
      orderId
    };
    setNotifications(prev => [notif, ...prev]);
    spawnPushNotification('Setup Proof Received', `${currentUser.name} submitted setup photo proof for Level 1 verification.`);
  };

  // Action: Team verifies setup proof (Level 1)
  const verifyByTeam = (orderId: string, notes: string) => {
    if (!currentUser.rights.canVerifyTeamProof) {
      spawnPushNotification('Permission Required', 'Your account does not have the Level 1 Team Verification right.', 'revision');
      return;
    }

    const nowReadable = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'TEAM_VERIFIED',
          teamVerification: {
            verified: true,
            verifiedBy: currentUser.name,
            verifiedAt: new Date().toISOString(),
            notes: notes || 'Setup inspected against venue specifications and verified.'
          },
          historyLog: [
            ...ord.historyLog,
            {
              id: `hist-${Date.now()}`,
              action: 'Level 1 Team Verified',
              actor: currentUser.name,
              actorRole: currentUser.role,
              timestamp: nowReadable,
              notes: notes || 'Verified quality & timing against event requirements. Escalated for Level 2 sign-off.'
            }
          ]
        };
      }
      return ord;
    }));

    const order = orders.find(o => o.id === orderId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'TEAM_VERIFIED',
      title: 'Level 1 Team Verification Completed',
      message: `${currentUser.name} verified setup proof for ${order?.orderNumber || 'Order'}. Forwarded for Level 2 management sign-off.`,
      timestamp: 'Just now',
      read: false,
      targetRoles: ['ADMIN'],
      orderId
    };
    setNotifications(prev => [notif, ...prev]);
    spawnPushNotification('Team Verification Passed', `${order?.orderNumber || 'Order'} verified. Awaiting Level 2 management sign-off.`, 'approved');
  };

  // Action: Management approves setup proof (Level 2)
  const approveByManagement = (orderId: string, notes: string) => {
    if (!currentUser.rights.canApproveManagementProof) {
      spawnPushNotification('Permission Required', 'Your account does not have the Level 2 Management Approval right.', 'revision');
      return;
    }

    const nowReadable = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'MANAGEMENT_APPROVED',
          managementApproval: {
            approved: true,
            approvedBy: currentUser.name,
            approvedAt: new Date().toISOString(),
            notes: notes || 'Executive sign-off granted. Setup cleared for event kickoff.'
          },
          historyLog: [
            ...ord.historyLog,
            {
              id: `hist-${Date.now()}`,
              action: 'Level 2 Management Approved',
              actor: currentUser.name,
              actorRole: currentUser.role,
              timestamp: nowReadable,
              notes: notes || 'Final management authorization signed off. Saved to completed history.'
            }
          ]
        };
      }
      return ord;
    }));

    const order = orders.find(o => o.id === orderId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'MANAGEMENT_APPROVED',
      title: 'Final Management Sign-Off Complete',
      message: `${currentUser.name} approved setup proof for ${order?.orderNumber || 'Order'}. Order completed and archived in history.`,
      timestamp: 'Just now',
      read: false,
      targetRoles: ['ADMIN', 'TEAM', 'VENDOR'],
      orderId
    };
    setNotifications(prev => [notif, ...prev]);
    spawnPushNotification('Order Fully Approved', `${order?.orderNumber || 'Order'} signed off by Management. Logged in history!`, 'approved');
  };

  // Action: Request Revision
  const requestRevision = (orderId: string, reason: string) => {
    if (!currentUser.rights.canVerifyTeamProof && !currentUser.rights.canApproveManagementProof) {
      spawnPushNotification('Permission Required', 'Your account does not have proof verification or approval rights.', 'revision');
      return;
    }

    const nowReadable = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'REVISION_REQUESTED',
          historyLog: [
            ...ord.historyLog,
            {
              id: `hist-${Date.now()}`,
              action: `Revision Requested by ${currentUser.role}`,
              actor: currentUser.name,
              actorRole: currentUser.role,
              timestamp: nowReadable,
              notes: reason
            }
          ]
        };
      }
      return ord;
    }));

    const order = orders.find(o => o.id === orderId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'REVISION_REQUESTED',
      title: 'Setup Revision Requested',
      message: `${currentUser.name} requested changes on ${order?.orderNumber || 'Order'}: "${reason}". Vendor re-upload required.`,
      timestamp: 'Just now',
      read: false,
      targetRoles: ['VENDOR', 'TEAM'],
      orderId
    };
    setNotifications(prev => [notif, ...prev]);
    spawnPushNotification('Revision Requested', 'Vendor notified to adjust setup and re-upload photo proof.', 'revision');
  };

  // Helper to ensure a Vendor profile exists when a user is VENDOR (or has upload proof right with a company)
  const syncVendorRecord = (user: UserProfile) => {
    if (user.role === 'VENDOR') {
      setVendors(prev => {
        const existingIndex = prev.findIndex(
          v => v.userId === user.id || (user.email && v.email.toLowerCase() === user.email.toLowerCase()) || v.name.toLowerCase() === user.departmentOrCompany.toLowerCase()
        );
        const companyName = user.departmentOrCompany.trim() || user.name;
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            userId: user.id,
            name: companyName,
            contactPerson: user.name,
            email: user.email,
            phone: user.phone
          };
          return updated;
        }
        const newVendor: Vendor = {
          id: `vnd-${Date.now()}`,
          userId: user.id,
          name: companyName,
          category: 'AV_LIGHTING',
          contactPerson: user.name,
          email: user.email,
          phone: user.phone,
          rating: 5.0,
          servicesDescription: user.title || 'External Service Provider'
        };
        return [...prev, newVendor];
      });
    }
  };

  // Action: Admin Add User / Vendor
  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    if (!currentUser.rights.canManageUserRights) {
      spawnPushNotification('Permission Required', 'Your account does not have rights to add users.', 'revision');
      return;
    }

    const newId = `user-${Date.now()}`;
    const newUser: UserProfile = {
      ...userData,
      id: newId
    };

    setUsers(prev => [...prev, newUser]);
    syncVendorRecord(newUser);
    spawnPushNotification('User Added', `${newUser.name} registered as ${newUser.role} with assigned rights.`);
  };

  // Action: Admin Remove User / Vendor
  const removeUser = (userId: string) => {
    if (!currentUser.rights.canManageUserRights) {
      spawnPushNotification('Permission Required', 'Your account does not have rights to remove users.', 'revision');
      return;
    }

    const target = users.find(u => u.id === userId);
    if (!target) return;

    const remainingRightsAdmins = users.filter(u => u.id !== userId && u.rights.canManageUserRights);
    if (target.rights.canManageUserRights && remainingRightsAdmins.length === 0) {
      spawnPushNotification('Action Denied', 'At least one user must retain Administer Rights permission.', 'revision');
      return;
    }

    const nextUsers = users.filter(u => u.id !== userId);
    setUsers(nextUsers);

    // Clean up associated vendor record only if it has no orders referencing it
    if (target.role === 'VENDOR') {
      setVendors(prev => prev.filter(v => {
        const isTargetVendor = v.userId === userId || (target.email && v.email.toLowerCase() === target.email.toLowerCase());
        if (!isTargetVendor) return true;
        const hasOrders = orders.some(o => o.vendorId === v.id);
        return hasOrders;
      }));
    }

    if (activeUserId === userId && nextUsers.length > 0) {
      setActiveUserId(nextUsers[0].id);
      setCurrentRole(nextUsers[0].role);
    }

    spawnPushNotification('User Removed', `${target.name} access revoked from system.`);
  };

  // Action: Admin Assign Rights to User / Vendor
  const assignUserRights = (userId: string, updatedRights: Partial<UserRights>) => {
    if (!currentUser.rights.canManageUserRights) {
      spawnPushNotification('Permission Required', 'Your account does not have rights to manage user permissions.', 'revision');
      return;
    }

    const target = users.find(u => u.id === userId);
    if (!target) return;

    const nextCanManage = updatedRights.canManageUserRights ?? target.rights.canManageUserRights;
    if (target.rights.canManageUserRights && !nextCanManage) {
      const otherRightsAdmins = users.filter(u => u.id !== userId && u.rights.canManageUserRights);
      if (otherRightsAdmins.length === 0) {
        spawnPushNotification('Action Denied', 'At least one user must retain Administer Rights permission.', 'revision');
        return;
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          rights: {
            ...u.rights,
            ...updatedRights
          }
        };
      }
      return u;
    }));

    spawnPushNotification('Rights Updated', `Permissions updated for ${target.name}.`);
  };

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    if (!currentUser.rights.canManageUserRights) {
      spawnPushNotification('Permission Required', 'Your account does not have rights to update users.', 'revision');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updatedUser = { ...u, ...updates };
        syncVendorRecord(updatedUser);
        return updatedUser;
      }
      return u;
    }));
    spawnPushNotification('Profile Updated', 'User profile changes saved.');
  };

  // Action: Create Venue
  const createVenue = (venueData: Omit<Venue, 'id'>) => {
    if (!currentUser.rights.canManageVenues) {
      spawnPushNotification('Permission Required', 'Your account does not have the Manage Venues right.', 'revision');
      return;
    }

    const newId = `ven-${Date.now()}`;
    const newVenue: Venue = {
      ...venueData,
      id: newId
    };

    setVenues(prev => [newVenue, ...prev]);
    spawnPushNotification('Venue Created', `${newVenue.name} added to hotel spaces.`);
  };

  // Action: Remove Venue
  const removeVenue = (venueId: string) => {
    if (!currentUser.rights.canManageVenues) {
      spawnPushNotification('Permission Required', 'Your account does not have the Manage Venues right.', 'revision');
      return;
    }

    const target = venues.find(v => v.id === venueId);
    setVenues(prev => prev.filter(v => v.id !== venueId));
    spawnPushNotification('Venue Removed', `${target?.name || 'Venue space'} deleted.`);
  };

  const updateVenue = (venueId: string, updates: Partial<Venue>) => {
    if (!currentUser.rights.canManageVenues) {
      spawnPushNotification('Permission Required', 'Your account does not have the Manage Venues right.', 'revision');
      return;
    }

    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, ...updates } : v));
    spawnPushNotification('Venue Updated', 'Venue specifications updated.');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const triggerTestNotification = () => {
    spawnPushNotification(
      'Push Notification Active',
      `Live alerts and audio chimes verified for ${currentUser.name} (${currentUser.role}).`
    );
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setVenues(INITIAL_VENUES);
    setEvents(INITIAL_EVENTS);
    setVendors(INITIAL_VENDORS);
    setOrders(INITIAL_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveUserId(INITIAL_USERS[0].id);
    setCurrentRole(INITIAL_USERS[0].role);
    setViewModeState('WEB_ADMIN');
    localStorage.clear();
    spawnPushNotification('Workspace Cleared', 'All events, venues, vendors, orders, and custom users cleared.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        switchUserById,
        viewMode,
        setViewMode,
        events,
        venues,
        vendors,
        orders,
        notifications,
        activePushToast,
        dismissPushToast,
        notifyAlert,
        createEvent,
        createOrder,
        submitSetupProof,
        verifyByTeam,
        approveByManagement,
        requestRevision,
        addUser,
        removeUser,
        assignUserRights,
        updateUser,
        createVenue,
        removeVenue,
        updateVenue,
        markNotificationRead,
        markAllNotificationsRead,
        triggerTestNotification,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
