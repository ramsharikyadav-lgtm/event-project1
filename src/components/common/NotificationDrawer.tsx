import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Camera, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Play
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    triggerTestNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const relevantNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full flex pl-10">
        <div className="w-full bg-white border-l border-slate-200 text-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Notifications &amp; Alerts</h3>
                <p className="text-xs text-slate-500">Live Event &amp; Vendor Updates</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-amber-600 text-white font-semibold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'unread' 
                    ? 'bg-amber-600 text-white font-semibold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {/* Live Push Alert Check */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-600">
                Verify real-time push banner &amp; chime
              </span>
              <button
                onClick={triggerTestNotification}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Play className="w-3 h-3 text-amber-600" />
                <span>Test Alert</span>
              </button>
            </div>

            {relevantNotifications.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">No Notifications</h4>
                <p className="text-xs text-slate-400">
                  Alerts appear here when events are booked, orders dispatched, or proofs verified.
                </p>
              </div>
            ) : (
              relevantNotifications.map(notif => {
                const isProof = notif.type === 'PROOF_SUBMITTED';
                const isApproved = notif.type === 'MANAGEMENT_APPROVED';
                const isRevision = notif.type === 'REVISION_REQUESTED';

                return (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      !notif.read 
                        ? 'bg-amber-50/40 border-amber-200 shadow-xs' 
                        : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-700'
                          : isProof
                          ? 'bg-blue-100 text-blue-700'
                          : isRevision
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isApproved ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isProof ? (
                          <Camera className="w-4 h-4" />
                        ) : isRevision ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
