import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader } from './components/common/TopHeader';
import { PushBannerToast } from './components/common/PushBannerToast';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EventsView } from './components/admin/EventsView';
import { VendorOrdersView } from './components/admin/VendorOrdersView';
import { SetupApprovalsView } from './components/admin/SetupApprovalsView';
import { VenueManagementView } from './components/admin/VenueManagementView';
import { UserRightsManagementView } from './components/admin/UserRightsManagementView';
import { HistoryView } from './components/admin/HistoryView';
import { MobileAppShell } from './components/mobile/MobileAppShell';
import { NewEventModal } from './components/modals/NewEventModal';
import { NewOrderModal } from './components/modals/NewOrderModal';
import { NewVenueModal } from './components/modals/NewVenueModal';
import { NewUserModal } from './components/modals/NewUserModal';
import { AdminTabId, canAccessTab } from './utils/rights';
import { Monitor, Smartphone } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { viewMode, setViewMode, currentUser } = useApp();
  
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Modals state
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [newVenueModalOpen, setNewVenueModalOpen] = useState(false);
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [selectedEventIdForOrder, setSelectedEventIdForOrder] = useState<string | undefined>();

  // Enforce rights-based tab fallback whenever user or rights change
  useEffect(() => {
    if (!canAccessTab(activeTab, currentUser.rights)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser.rights]);

  const handleOpenNewOrder = (eventId?: string) => {
    if (!currentUser.rights.canOrderRequirements) return;
    setSelectedEventIdForOrder(eventId);
    setNewOrderModalOpen(true);
  };

  const handleOpenNewEvent = () => {
    if (!currentUser.rights.canCreateEvents) return;
    setNewEventModalOpen(true);
  };

  const handleOpenNewVenue = () => {
    if (!currentUser.rights.canManageVenues) return;
    setNewVenueModalOpen(true);
  };

  const handleOpenNewUser = () => {
    if (!currentUser.rights.canManageUserRights) return;
    setNewUserModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      {/* Real-time Push Notification Toast */}
      <PushBannerToast />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />

      {/* Top Header */}
      <TopHeader
        activeTab={activeTab}
        setActiveTab={(t) => {
          const tab = t as AdminTabId;
          if (canAccessTab(tab, currentUser.rights)) {
            setActiveTab(tab);
          }
        }}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
        onOpenNewEvent={handleOpenNewEvent}
        onOpenNewOrder={() => handleOpenNewOrder()}
        onOpenNewVenue={handleOpenNewVenue}
        onOpenNewUser={handleOpenNewUser}
      />

      {/* Switch banner if viewing mobile mode */}
      {viewMode === 'MOBILE_APP' && (
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-amber-700" />
            <span>Mobile Staff &amp; Vendor Mode</span>
          </div>

          <button
            onClick={() => setViewMode('WEB_ADMIN')}
            className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Switch to Web Admin View</span>
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'WEB_ADMIN' ? (
          <div>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                onNavigateTab={(t) => {
                  const tab = t as AdminTabId;
                  if (canAccessTab(tab, currentUser.rights)) {
                    setActiveTab(tab);
                  }
                }}
                onOpenNewEvent={handleOpenNewEvent}
                onOpenNewOrder={() => handleOpenNewOrder()}
                onOpenNewVenue={handleOpenNewVenue}
                onOpenNewUser={handleOpenNewUser}
              />
            )}

            {activeTab === 'events' && canAccessTab('events', currentUser.rights) && (
              <EventsView
                onOpenNewEvent={handleOpenNewEvent}
                onOpenNewOrder={(eventId) => handleOpenNewOrder(eventId)}
              />
            )}

            {activeTab === 'orders' && canAccessTab('orders', currentUser.rights) && (
              <VendorOrdersView
                onOpenNewOrder={() => handleOpenNewOrder()}
              />
            )}

            {activeTab === 'approvals' && canAccessTab('approvals', currentUser.rights) && (
              <SetupApprovalsView />
            )}

            {activeTab === 'venues' && canAccessTab('venues', currentUser.rights) && (
              <VenueManagementView />
            )}

            {activeTab === 'user-rights' && canAccessTab('user-rights', currentUser.rights) && (
              <UserRightsManagementView />
            )}

            {activeTab === 'history' && canAccessTab('history', currentUser.rights) && (
              <HistoryView />
            )}
          </div>
        ) : (
          <div className="w-full flex justify-center py-2">
            <MobileAppShell />
          </div>
        )}
      </main>

      {/* Rights-gated Modals */}
      {currentUser.rights.canCreateEvents && (
        <NewEventModal
          isOpen={newEventModalOpen}
          onClose={() => setNewEventModalOpen(false)}
          onOpenNewVenue={handleOpenNewVenue}
        />
      )}

      {currentUser.rights.canOrderRequirements && (
        <NewOrderModal
          isOpen={newOrderModalOpen}
          onClose={() => setNewOrderModalOpen(false)}
          preselectedEventId={selectedEventIdForOrder}
        />
      )}

      {currentUser.rights.canManageVenues && (
        <NewVenueModal
          isOpen={newVenueModalOpen}
          onClose={() => setNewVenueModalOpen(false)}
        />
      )}

      {currentUser.rights.canManageUserRights && (
        <NewUserModal
          isOpen={newUserModalOpen}
          onClose={() => setNewUserModalOpen(false)}
        />
      )}

      {/* Hotel Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Grand Azure Hotels &amp; Resorts</span>
            <span>·</span>
            <span>Event &amp; Vendor Management System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Rights-Based Access Control</span>
            <span>·</span>
            <span>Two-Level Photo Proof Verification</span>
            <span>·</span>
            <span>Complete History Log</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
