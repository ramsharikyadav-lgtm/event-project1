import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorOrder } from '../../types';
import { filterOrdersForUser, RIGHT_LABELS } from '../../utils/rights';
import { ProofInspectionModal } from '../modals/ProofInspectionModal';
import { SubmitProofModal } from '../modals/SubmitProofModal';
import { 
  Clock, 
  CheckCircle2, 
  Camera, 
  MapPin, 
  Building2,
  ChevronRight,
  ShieldCheck,
  Plus,
  KeyRound,
  Calendar
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewEvent: () => void;
  onOpenNewOrder: () => void;
  onOpenNewVenue: () => void;
  onOpenNewUser: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenNewEvent,
  onOpenNewOrder,
  onOpenNewVenue,
  onOpenNewUser
}) => {
  const { events, venues, vendors, users, orders, currentUser } = useApp();

  const [inspectingOrder, setInspectingOrder] = useState<VendorOrder | null>(null);
  const [vendorUploadingOrder, setVendorUploadingOrder] = useState<VendorOrder | null>(null);

  const rights = currentUser.rights;
  const visibleOrders = filterOrdersForUser(orders, currentUser, vendors);

  // Status counts
  const pendingSetupCount = visibleOrders.filter(o => o.status === 'PENDING_SETUP').length;
  const awaitingTeamCount = visibleOrders.filter(o => o.status === 'SETUP_SUBMITTED').length;
  const awaitingMgmtCount = visibleOrders.filter(o => o.status === 'TEAM_VERIFIED').length;
  const completedCount = visibleOrders.filter(o => o.status === 'MANAGEMENT_APPROVED').length;

  // Proofs needing review (Level 1 or Level 2)
  const proofsNeedingReview = visibleOrders.filter(
    o => o.status === 'SETUP_SUBMITTED' || o.status === 'TEAM_VERIFIED'
  );

  const canVerifyAny = rights.canVerifyTeamProof || rights.canApproveManagementProof;
  const activeRightLabels = RIGHT_LABELS.filter(r => rights[r.key]);
  const uploadableOrder = visibleOrders.find(
    o => o.status === 'PENDING_SETUP' || o.status === 'REVISION_REQUESTED'
  );

  const needsInitialSetup = venues.length === 0 || events.length === 0 || orders.length === 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Rights-Aware Quick Actions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-amber-700">
              Grand Azure Hotels &amp; Resorts
            </span>
            <span className="text-slate-300">·</span>
            <span>Event &amp; Vendor Hub</span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-slate-700">{currentUser.role}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Event Operations &amp; Proof Verification Dashboard
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Signed in as <strong>{currentUser.name}</strong> ({currentUser.title}). Available actions and navigation reflect your assigned rights.
          </p>

          {/* Active Rights Summary */}
          <div className="pt-1 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-600">
            <span className="font-bold text-slate-500 uppercase text-[10px] mr-1">Your Active Rights:</span>
            {activeRightLabels.length === 0 ? (
              <span className="text-rose-700 font-semibold">
                No operational rights assigned yet — ask an Administrator to assign permissions.
              </span>
            ) : (
              activeRightLabels.map((item, idx) => (
                <React.Fragment key={item.key}>
                  <span className="font-medium text-slate-800">{item.shortLabel}</span>
                  {idx < activeRightLabels.length - 1 && <span className="text-slate-300">·</span>}
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* Quick Action Group strictly gated by currentUser.rights */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {rights.canOrderRequirements && (
            <button
              onClick={onOpenNewOrder}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Order Requirement</span>
            </button>
          )}

          {rights.canCreateEvents && (
            <button
              onClick={onOpenNewEvent}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>{rights.canBookVenues ? 'Book Venue & Event' : 'Create Event'}</span>
            </button>
          )}

          {rights.canManageVenues && (
            <button
              onClick={onOpenNewVenue}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>Add Venue</span>
            </button>
          )}

          {rights.canManageUserRights && (
            <button
              onClick={() => onNavigateTab('user-rights')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>Manage Rights</span>
            </button>
          )}
        </div>
      </div>

      {/* Onboarding Setup Checklist when workspace has empty collections */}
      {needsInitialSetup && (
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Workspace Setup Guide</h2>
              <p className="text-xs text-slate-600">
                Start with a clean slate by configuring your hotel venues, staff &amp; vendor accounts, events, and requirement orders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className={`p-3.5 rounded-xl border bg-white ${venues.length > 0 ? 'border-emerald-200' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                <span>1. Create Venues</span>
                {venues.length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5">
                {venues.length > 0 ? `${venues.length} venue(s) ready` : 'Add ballrooms or banquet spaces.'}
              </p>
              {rights.canManageVenues && (
                <button
                  onClick={onOpenNewVenue}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  <span>+ Add Venue</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className={`p-3.5 rounded-xl border bg-white ${users.length > 1 ? 'border-emerald-200' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                <span>2. Users &amp; Vendors</span>
                {users.length > 1 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5">
                {users.length > 1 ? `${users.length} account(s) configured` : 'Register team & vendor accounts with rights.'}
              </p>
              {rights.canManageUserRights && (
                <button
                  onClick={onOpenNewUser}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  <span>+ Add User / Vendor</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className={`p-3.5 rounded-xl border bg-white ${events.length > 0 ? 'border-emerald-200' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                <span>3. Book Event</span>
                {events.length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5">
                {events.length > 0 ? `${events.length} event(s) scheduled` : 'Schedule an event and reserve a venue.'}
              </p>
              {rights.canCreateEvents && (
                <button
                  onClick={onOpenNewEvent}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  <span>+ Create Event</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className={`p-3.5 rounded-xl border bg-white ${orders.length > 0 ? 'border-emerald-200' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                <span>4. Order Requirements</span>
                {orders.length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5">
                {orders.length > 0 ? `${orders.length} order(s) dispatched` : 'Dispatch requirements with setup date & time.'}
              </p>
              {rights.canOrderRequirements && (
                <button
                  onClick={onOpenNewOrder}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  <span>+ Order Requirement</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Setup</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {pendingSetupCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Orders awaiting setup
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Level 1: Team Review</span>
            <Camera className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700 font-mono tabular-nums">
            {awaitingTeamCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Photo proofs uploaded
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Level 2: Mgmt Approval</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {awaitingMgmtCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Team verified, awaiting sign-off
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Approved &amp; Saved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {completedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Logged in history archive
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Setup Proofs Pending Verification */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Setup Proofs Needing Verification
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">
                {proofsNeedingReview.length} Active
              </span>
            </div>

            {canVerifyAny && (
              <button
                onClick={() => onNavigateTab('approvals')}
                className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 transition-colors"
              >
                <span>View All Approvals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {proofsNeedingReview.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs space-y-1.5">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700">No setup proofs awaiting verification.</p>
                <p className="text-[11px] text-slate-400">
                  Uploaded vendor setup photos will appear here for two-level review.
                </p>
              </div>
            ) : (
              proofsNeedingReview.map(ord => {
                const event = events.find(e => e.id === ord.eventId);
                const vendor = vendors.find(v => v.id === ord.vendorId);
                const isLevel1 = ord.status === 'SETUP_SUBMITTED';
                const canInspect = canVerifyAny || rights.canOrderRequirements || rights.canUploadSetupProof;

                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {ord.orderNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isLevel1 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {isLevel1 ? 'Level 1: Team Verification' : 'Level 2: Management Sign-off'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {ord.requirementTitle}
                        </h4>

                        <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                          <span>Vendor: <strong className="text-slate-800">{vendor?.name || 'Assigned Vendor'}</strong></span>
                          <span>·</span>
                          <span className="text-slate-500">{event?.title || 'Event'}</span>
                        </div>
                      </div>

                      {ord.setupProof && (
                        <div 
                          onClick={() => canInspect && setInspectingOrder(ord)}
                          className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={ord.setupProof.imageUrl}
                            alt="Setup proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Vendor Setup Notes:</strong> "{ord.setupProof?.notes || 'Setup finished on schedule.'}"
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 font-mono text-[11px] truncate">
                        Required: {ord.requiredDate} at {ord.requiredTime} ({ord.venueLocation})
                      </span>

                      {canInspect && (
                        <button
                          onClick={() => setInspectingOrder(ord)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                        >
                          <span>{canVerifyAny ? 'Inspect & Verify Proof' : 'View Proof'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Events & Venues + Proof Uploader */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Booked Venues &amp; Events
            </h3>

            {(rights.canCreateEvents || rights.canBookVenues || rights.canOrderRequirements) && (
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700">No events booked yet.</p>
                {rights.canCreateEvents && (
                  <button
                    onClick={onOpenNewEvent}
                    className="mt-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-lg text-xs inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{rights.canBookVenues ? 'Book Venue & Event' : 'Create Event'}</span>
                  </button>
                )}
              </div>
            ) : (
              events.map(ev => {
                const eventOrders = visibleOrders.filter(o => o.eventId === ev.id);

                return (
                  <div 
                    key={ev.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 text-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {ev.eventType}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {ev.startDate.slice(0, 10)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {ev.title}
                    </h4>

                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{ev.guestCount} Guests · Client: {ev.clientName}</span>
                      <span className="font-semibold text-amber-800 font-mono">
                        {eventOrders.length} Requirements
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Setup Proof Uploader Card strictly gated by canUploadSetupProof */}
          {rights.canUploadSetupProof && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-700" />
                <span>Setup Proof Uploader</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Upload a photo of your completed setup so the Hotel Team and Management can verify and sign off.
              </p>
              {uploadableOrder ? (
                <button
                  onClick={() => setVendorUploadingOrder(uploadableOrder)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Proof for {uploadableOrder.orderNumber}</span>
                </button>
              ) : (
                <div className="text-[11px] font-medium text-amber-900 bg-white/70 border border-amber-200 rounded-lg p-2 text-center">
                  No pending or revision orders currently assigned to you.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Proof Inspection Modal */}
      {inspectingOrder && (
        <ProofInspectionModal
          order={inspectingOrder}
          onClose={() => setInspectingOrder(null)}
        />
      )}

      {/* Vendor Proof Upload Modal */}
      {vendorUploadingOrder && (
        <SubmitProofModal
          order={vendorUploadingOrder}
          onClose={() => setVendorUploadingOrder(null)}
        />
      )}
    </div>
  );
};
