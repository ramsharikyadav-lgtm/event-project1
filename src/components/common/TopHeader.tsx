import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { canAccessTab, filterOrdersForUser } from '../../utils/rights';
import { 
  Bell, 
  Plus, 
  Smartphone, 
  Monitor, 
  UserCircle2, 
  ChevronDown, 
  RotateCcw,
  Sparkles,
  Building2,
  KeyRound
} from 'lucide-react';

interface TopHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenNewEvent: () => void;
  onOpenNewOrder: () => void;
  onOpenNewVenue: () => void;
  onOpenNewUser: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  onOpenNewEvent,
  onOpenNewOrder,
  onOpenNewVenue,
  onOpenNewUser
}) => {
  const { 
    currentUser, 
    users, 
    vendors,
    switchUserById, 
    viewMode, 
    setViewMode, 
    notifications,
    orders,
    resetAllData 
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const visibleOrders = filterOrdersForUser(orders, currentUser, vendors);
  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingApprovalsCount = visibleOrders.filter(
    o => o.status === 'SETUP_SUBMITTED' || o.status === 'TEAM_VERIFIED'
  ).length;

  const rights = currentUser.rights;

  const showEventsTab = canAccessTab('events', rights);
  const showOrdersTab = canAccessTab('orders', rights);
  const showApprovalsTab = canAccessTab('approvals', rights);
  const showVenuesTab = canAccessTab('venues', rights);
  const showUserRightsTab = canAccessTab('user-rights', rights);
  const showHistoryTab = canAccessTab('history', rights);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-amber-700 transition-colors"
            >
              Grand Azure <span className="font-normal text-slate-500">EventOps</span>
            </a>
          </div>

          {/* Zone 2: Rights-gated Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'dashboard' ? 'text-amber-700 font-bold border-b-2 border-amber-600' : ''
              }`}
            >
              Dashboard
            </button>

            {showEventsTab && (
              <button
                onClick={() => setActiveTab('events')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                  activeTab === 'events' ? 'text-amber-700 font-bold border-b-2 border-amber-600' : ''
                }`}
              >
                Events
              </button>
            )}

            {showOrdersTab && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                  activeTab === 'orders' ? 'text-amber-700 font-bold border-b-2 border-amber-600' : ''
                }`}
              >
                Orders
              </button>
            )}

            {showApprovalsTab && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1.5 ${
                  activeTab === 'approvals' ? 'text-amber-700 font-bold border-b-2 border-amber-600' : ''
                }`}
              >
                <span>Setup Approvals</span>
                {pendingApprovalsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold font-mono">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {showVenuesTab && (
              <button
                onClick={() => setActiveTab('venues')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                  activeTab === 'venues' ? 'text-amber-700 font-bold border-b-2 border-amber-600' : ''
                }`}
              >
                Venues &amp; Spaces
              </button>
            )}

            {showUserRightsTab && (
              <button
                onClick={() => setActiveTab('user-rights')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1 ${
                  activeTab === 'user-rights' ? 'text-amber-700 font-bold border-b-2 border-amber-600' : ''
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>User Rights</span>
              </button>
            )}

            {showHistoryTab && (
              <button
                onClick={() => setActiveTab('history')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                  activeTab === 'history' ? 'text-amber-700 font-bold border-b-2 border-amber-600' : ''
                }`}
              >
                History &amp; Proofs
              </button>
            )}
          </nav>

          {/* Zone 3: Actions + Persona Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Platform View Toggle */}
            <div className="hidden xl:flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('WEB_ADMIN')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                  viewMode === 'WEB_ADMIN' 
                    ? 'bg-white text-slate-900 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Web Admin</span>
              </button>

              <button
                onClick={() => setViewMode('MOBILE_APP')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                  viewMode === 'MOBILE_APP' 
                    ? 'bg-white text-slate-900 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile App</span>
              </button>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              )}
            </button>

            {/* Active Account Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setRoleMenuOpen(!roleMenuOpen);
                  setConfirmReset(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200/70 text-xs transition-colors"
                title="Switch Active User Account"
              >
                <UserCircle2 className="w-4 h-4 text-amber-700" />
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-slate-900 truncate max-w-[110px]">{currentUser.name}</div>
                  <div className="text-[10px] font-semibold text-amber-800">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs">
                  <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Active Account ({users.length} {users.length === 1 ? 'account' : 'accounts'})
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUserById(u.id);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                          u.id === currentUser.id 
                            ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{u.title} · {u.departmentOrCompany}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-900' :
                          u.role === 'TEAM' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  {rights.canManageUserRights && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          onOpenNewUser();
                        }}
                        className="w-full text-left p-1.5 rounded-md text-[11px] font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add User / Vendor Account</span>
                      </button>

                      {!confirmReset ? (
                        <button
                          onClick={() => setConfirmReset(true)}
                          className="w-full text-left p-1.5 rounded-md text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear All Workspace Data</span>
                        </button>
                      ) : (
                        <div className="p-1.5 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-rose-800 font-semibold">Clear everything?</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                resetAllData();
                                setConfirmReset(false);
                                setRoleMenuOpen(false);
                              }}
                              className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmReset(false)}
                              className="px-2 py-0.5 bg-white text-slate-600 border border-slate-200 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rights-gated Primary Action Buttons */}
            <div className="flex items-center gap-1.5">
              {rights.canOrderRequirements && (
                <button
                  onClick={onOpenNewOrder}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap shrink-0"
                  title="Order new requirement to vendor"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Order Requirement</span>
                  <span className="sm:hidden">Order</span>
                </button>
              )}

              {rights.canCreateEvents && (
                <button
                  onClick={onOpenNewEvent}
                  className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap shrink-0"
                  title={rights.canBookVenues ? 'Book venue and schedule event' : 'Create event'}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{rights.canBookVenues ? 'Book Venue' : 'Create Event'}</span>
                  <span className="sm:hidden">Event</span>
                </button>
              )}

              {rights.canManageVenues && (
                <button
                  onClick={onOpenNewVenue}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                  title="Create new hotel venue or ballroom"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden md:inline">+ Venue</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
