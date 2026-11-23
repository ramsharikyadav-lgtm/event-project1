import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorOrder } from '../../types';
import { filterOrdersForUser } from '../../utils/rights';
import { ProofInspectionModal } from '../modals/ProofInspectionModal';
import { 
  History, 
  CheckCircle2, 
  Camera, 
  Search, 
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { orders, events, vendors, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

  const visibleOrders = filterOrdersForUser(orders, currentUser, vendors);

  // All completed or multi-step historically logged orders
  const completedOrders = visibleOrders.filter(
    o => o.status === 'MANAGEMENT_APPROVED' || o.historyLog.length > 1
  );

  const filteredHistory = completedOrders.filter(o => {
    const event = events.find(e => e.id === o.eventId);
    const vendor = vendors.find(v => v.id === o.vendorId);
    return (
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalLogsCount = visibleOrders.reduce((acc, curr) => acc + curr.historyLog.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <span>Audit &amp; Archival Records</span>
            <span className="text-slate-300">·</span>
            <span>Historical Proofs</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Event &amp; Setup Verification History
          </h2>
          <p className="text-xs text-slate-600 max-w-xl mt-0.5">
            Every vendor requirement, uploaded setup photo proof, Team Level 1 verification, and Management Level 2 approval is saved and indexed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500">Total Audit Logs:</span>{' '}
            <strong className="text-slate-900 font-mono">{totalLogsCount} entries</strong>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search past orders, events, vendors, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-600 shadow-2xs"
          />
        </div>
      </div>

      {/* History Cards */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs space-y-1.5">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-800">No historical records saved yet.</p>
            <p className="text-slate-400">
              Completed setup proofs and verification steps are automatically archived here.
            </p>
          </div>
        ) : (
          filteredHistory.map(ord => {
            const event = events.find(e => e.id === ord.eventId);
            const vendor = vendors.find(v => v.id === ord.vendorId);
            const isApproved = ord.status === 'MANAGEMENT_APPROVED';

            return (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {ord.orderNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-bold text-slate-800">{event?.title || 'Event'}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{ord.venueLocation}</span>
                      <span className="text-slate-300">·</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                        isApproved
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}>
                        <CheckCircle2 className={`w-3 h-3 ${isApproved ? 'text-emerald-600' : 'text-amber-600'}`} />
                        {isApproved ? 'Fully Approved' : ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {ord.requirementTitle}
                    </h3>

                    <p className="text-xs text-slate-600">
                      Vendor Partner: <strong className="text-slate-900">{vendor?.name || 'Assigned Vendor'}</strong> · Required Date: {ord.requiredDate} at {ord.requiredTime}
                    </p>
                  </div>

                  {/* Photo Proof Thumbnail */}
                  {ord.setupProof && (
                    <div 
                      onClick={() => setSelectedOrder(ord)}
                      className="relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group shrink-0 shadow-2xs"
                    >
                      <img
                        src={ord.setupProof.imageUrl}
                        alt="Historical proof"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Two-Level Verification Sign-off Record */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                      <span>Level 1: Team Operations Verification</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {ord.teamVerification?.verified ? (
                        <>Verified by: <strong>{ord.teamVerification.verifiedBy}</strong> on {ord.teamVerification.verifiedAt.slice(0, 10)}</>
                      ) : (
                        <span>Pending Level 1 verification</span>
                      )}
                    </div>
                    {ord.teamVerification?.notes && (
                      <div className="text-[11px] text-slate-500 italic">"{ord.teamVerification.notes}"</div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Level 2: Hotel Management Authorization</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {ord.managementApproval?.approved ? (
                        <>Signed off by: <strong>{ord.managementApproval.approvedBy}</strong> on {ord.managementApproval.approvedAt.slice(0, 10)}</>
                      ) : (
                        <span>Pending Level 2 management approval</span>
                      )}
                    </div>
                    {ord.managementApproval?.notes && (
                      <div className="text-[11px] text-slate-500 italic">"{ord.managementApproval.notes}"</div>
                    )}
                  </div>
                </div>

                {/* History Timeline */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Full Chronological Audit Trail ({ord.historyLog.length} steps):
                  </div>
                  <div className="space-y-1">
                    {ord.historyLog.map(hist => (
                      <div key={hist.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0 text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          <strong className="text-slate-800">{hist.action}</strong>
                          <span>by {hist.actor} ({hist.actorRole})</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{hist.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>Inspect Full Record &amp; Proof Photo</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
