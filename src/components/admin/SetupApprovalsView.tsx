import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorOrder } from '../../types';
import { filterOrdersForUser } from '../../utils/rights';
import { ProofInspectionModal } from '../modals/ProofInspectionModal';
import { 
  Camera, 
  Clock, 
  ChevronRight, 
  Search,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const SetupApprovalsView: React.FC = () => {
  const { orders, events, vendors, currentUser, verifyByTeam, approveByManagement } = useApp();

  const [activeStage, setActiveStage] = useState<'all' | 'level1' | 'level2' | 'approved' | 'revision'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

  const visibleOrders = filterOrdersForUser(orders, currentUser, vendors);

  const filteredOrders = visibleOrders.filter(o => {
    const event = events.find(e => e.id === o.eventId);
    const vendor = vendors.find(v => v.id === o.vendorId);
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event?.title || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeStage === 'level1') return o.status === 'SETUP_SUBMITTED';
    if (activeStage === 'level2') return o.status === 'TEAM_VERIFIED';
    if (activeStage === 'approved') return o.status === 'MANAGEMENT_APPROVED';
    if (activeStage === 'revision') return o.status === 'REVISION_REQUESTED';
    return true;
  });

  const level1Count = visibleOrders.filter(o => o.status === 'SETUP_SUBMITTED').length;
  const level2Count = visibleOrders.filter(o => o.status === 'TEAM_VERIFIED').length;
  const approvedCount = visibleOrders.filter(o => o.status === 'MANAGEMENT_APPROVED').length;

  const canVerifyTeam = currentUser.rights.canVerifyTeamProof;
  const canApproveMgmt = currentUser.rights.canApproveManagementProof;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <span>Two-Level Approval Governance</span>
            <span className="text-slate-300">·</span>
            <span>Proof Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Setup Proof Approvals Queue
          </h2>
          <p className="text-xs text-slate-600 max-w-xl mt-0.5">
            Uploaded vendor setup proofs pass through <strong className="text-slate-900">Level 1: Team Verification</strong> and{' '}
            <strong className="text-slate-900">Level 2: Management Sign-off</strong> based on your assigned rights.
          </p>
        </div>

        {/* Active User Verification Rights Status */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 text-xs">
          <span className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 ${
            canVerifyTeam ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <UserCheck className="w-3.5 h-3.5" />
            <span>Level 1 Verify: {canVerifyTeam ? 'Allowed' : 'No Right'}</span>
          </span>
          <span className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 ${
            canApproveMgmt ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Level 2 Approve: {canApproveMgmt ? 'Allowed' : 'No Right'}</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl w-full sm:w-auto overflow-x-auto shadow-2xs">
          <button
            onClick={() => setActiveStage('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeStage === 'all' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Orders ({visibleOrders.length})
          </button>

          <button
            onClick={() => setActiveStage('level1')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeStage === 'level1' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Level 1: Team Queue</span>
            {level1Count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-100 text-blue-800 font-bold">
                {level1Count}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveStage('level2')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeStage === 'level2' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Level 2: Mgmt Queue</span>
            {level2Count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 font-bold">
                {level2Count}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveStage('approved')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeStage === 'approved' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search order, requirement, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
          />
        </div>
      </div>

      {/* Orders List with Photo Proofs */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs space-y-1.5">
            <Camera className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No setup proofs in this queue.</p>
            <p className="text-slate-400">
              {visibleOrders.length === 0
                ? 'Vendor orders and uploaded setup photos will appear here once submitted.'
                : 'Select another stage tab or clear your search query.'}
            </p>
          </div>
        ) : (
          filteredOrders.map(ord => {
            const event = events.find(e => e.id === ord.eventId);
            const vendor = vendors.find(v => v.id === ord.vendorId);
            const isLevel1 = ord.status === 'SETUP_SUBMITTED';
            const isLevel2 = ord.status === 'TEAM_VERIFIED';
            const isApproved = ord.status === 'MANAGEMENT_APPROVED';

            return (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left: Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {ord.orderNumber}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-700 font-semibold">{event?.title || 'Event'}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{ord.venueLocation}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {ord.requirementTitle}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {ord.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <span>Vendor: <strong className="text-slate-800">{vendor?.name || 'Assigned Vendor'}</strong></span>
                    <span>·</span>
                    <span>Setup Required: <strong className="text-slate-700">{ord.requiredDate} at {ord.requiredTime}</strong></span>
                  </div>
                </div>

                {/* Middle: Proof Thumbnail & Status Stepper */}
                <div className="flex items-center gap-4 shrink-0">
                  {ord.setupProof ? (
                    <div 
                      onClick={() => setSelectedOrder(ord)}
                      className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group shadow-2xs"
                    >
                      <img
                        src={ord.setupProof.imageUrl}
                        alt="Proof"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-28 h-20 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-center p-2">
                      <Clock className="w-5 h-5 mb-1 text-slate-400" />
                      <span className="text-[10px]">Awaiting Photo</span>
                    </div>
                  )}

                  {/* Two-Level Stepper */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs min-w-[200px]">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Approval Status
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          ord.teamVerification?.verified ? 'bg-emerald-600 text-white' : isLevel1 ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-300 text-slate-700'
                        }`}>
                          1
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700">Team</span>
                      </div>

                      <div className="w-4 h-0.5 bg-slate-300" />

                      <div className="flex items-center gap-1">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          ord.managementApproval?.approved ? 'bg-emerald-600 text-white' : isLevel2 ? 'bg-amber-600 text-white animate-pulse' : 'bg-slate-300 text-slate-700'
                        }`}>
                          2
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700">Mgmt</span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-semibold text-slate-600">
                      {isApproved ? 'Fully Approved & Archived' : isLevel2 ? 'Pending Management Sign-Off' : isLevel1 ? 'Proof Ready for Team' : 'Pending Vendor Setup'}
                    </div>
                  </div>
                </div>

                {/* Right: Strictly Rights-Gated Actions */}
                <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-end">
                  {isLevel1 && canVerifyTeam && (
                    <button
                      onClick={() => verifyByTeam(ord.id, 'Verified on floor by Team.')}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs whitespace-nowrap"
                      title="Direct Level 1 verification"
                    >
                      Quick Team Verify
                    </button>
                  )}

                  {isLevel2 && canApproveMgmt && (
                    <button
                      onClick={() => approveByManagement(ord.id, 'Management Level 2 sign-off executed.')}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-xs whitespace-nowrap"
                      title="Direct Level 2 approval"
                    >
                      Sign Off (Level 2)
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap"
                  >
                    <span>Inspect Proof</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedOrder && (
        <ProofInspectionModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
