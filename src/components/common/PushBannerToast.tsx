import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const PushBannerToast: React.FC = () => {
  const { activePushToast, dismissPushToast, currentUser } = useApp();

  if (!activePushToast) return null;

  const isApproved = activePushToast.type.includes('approved') || activePushToast.type.includes('signoff');
  const isRevision = activePushToast.type.includes('revision');

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all ${
        isApproved
          ? 'bg-white/95 border-emerald-300 text-slate-800 shadow-emerald-500/10'
          : isRevision
          ? 'bg-white/95 border-rose-300 text-slate-800 shadow-rose-500/10'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-900/10'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${
              isApproved
                ? 'bg-emerald-50 text-emerald-600'
                : isRevision
                ? 'bg-rose-50 text-rose-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              {isApproved ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isRevision ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-amber-700 uppercase">
                  Grand Azure EventOps
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{activePushToast.timestamp}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {activePushToast.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activePushToast.message}
              </p>
            </div>
          </div>

          <button
            onClick={dismissPushToast}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Active Role: <strong className="text-slate-700">{currentUser.name} ({currentUser.role})</strong>
          </span>
          <button
            onClick={dismissPushToast}
            className="font-semibold text-amber-700 hover:text-amber-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
