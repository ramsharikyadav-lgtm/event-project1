import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorOrder } from '../../types';
import { filterOrdersForUser } from '../../utils/rights';
import { ProofInspectionModal } from '../modals/ProofInspectionModal';
import { SubmitProofModal } from '../modals/SubmitProofModal';
import { 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  Camera, 
  CheckCircle2, 
  Building2,
  ChevronRight
} from 'lucide-react';

interface VendorOrdersViewProps {
  onOpenNewOrder: () => void;
}

export const VendorOrdersView: React.FC<VendorOrdersViewProps> = ({ onOpenNewOrder }) => {
  const { orders, events, vendors, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inspectingOrder, setInspectingOrder] = useState<VendorOrder | null>(null);
  const [uploadingOrder, setUploadingOrder] = useState<VendorOrder | null>(null);

  const visibleOrders = filterOrdersForUser(orders, currentUser, vendors);

  const filteredOrders = visibleOrders.filter(o => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const vendor = vendors.find(v => v.id === o.vendorId);
    const event = events.find(e => e.id === o.eventId);
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const canOrderRequirements = currentUser.rights.canOrderRequirements;
  const canUploadSetupProof = currentUser.rights.canUploadSetupProof;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <span>Hotel Operations &amp; External Contractors</span>
            <span className="text-slate-300">·</span>
            <span>Service Requirements</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Vendor Requirement Orders
          </h2>
          <p className="text-xs text-slate-600 max-w-xl mt-0.5">
            Order venue requirements with target date &amp; time. Vendors are notified and upload photo proofs upon completing setup.
          </p>
        </div>

        {canOrderRequirements && (
          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Order New Requirement</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white border border-slate-200 rounded-xl shadow-2xs w-full sm:w-auto">
          {[
            { label: 'All Orders', value: 'ALL' },
            { label: 'Pending Setup', value: 'PENDING_SETUP' },
            { label: 'Proof Submitted', value: 'SETUP_SUBMITTED' },
            { label: 'Team Verified', value: 'TEAM_VERIFIED' },
            { label: 'Approved', value: 'MANAGEMENT_APPROVED' },
            { label: 'Revision', value: 'REVISION_REQUESTED' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search requirements, vendors, dates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
          />
        </div>
      </div>

      {/* Grid of Orders or Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs space-y-2.5">
          <FileText className="w-9 h-9 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-800">No requirement orders found</p>
          <p className="max-w-md mx-auto text-slate-500">
            {visibleOrders.length === 0
              ? 'Dispatch an event requirement order to a registered vendor to start tracking setup and photo verification.'
              : 'Try clearing your search or status filter.'}
          </p>
          {canOrderRequirements && visibleOrders.length === 0 && (
            <button
              onClick={onOpenNewOrder}
              className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Order New Requirement</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map(ord => {
            const event = events.find(e => e.id === ord.eventId);
            const vendor = vendors.find(v => v.id === ord.vendorId);
            const canUploadForThisOrder =
              canUploadSetupProof && ord.status !== 'MANAGEMENT_APPROVED';

            return (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {ord.orderNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ord.status === 'MANAGEMENT_APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'TEAM_VERIFIED'
                        ? 'bg-amber-100 text-amber-800'
                        : ord.status === 'SETUP_SUBMITTED'
                        ? 'bg-blue-100 text-blue-800'
                        : ord.status === 'REVISION_REQUESTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {ord.requirementTitle}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      Event: <strong className="text-slate-800">{event?.title || 'Event'}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ord.description}
                  </p>

                  {/* Details Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Required Date &amp; Time:</span>
                      </span>
                      <strong className="font-mono text-slate-900">{ord.requiredDate} at {ord.requiredTime}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-700" />
                        <span>Venue Room:</span>
                      </span>
                      <strong className="text-slate-900 truncate max-w-[200px]">{ord.venueLocation}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span>Assigned Vendor:</span>
                      <strong className="text-slate-900">{vendor?.name || 'Assigned Vendor'}</strong>
                    </div>
                  </div>

                  {/* Proof image mini badge if uploaded */}
                  {ord.setupProof && (
                    <div 
                      onClick={() => setInspectingOrder(ord)}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors"
                    >
                      <img
                        src={ord.setupProof.imageUrl}
                        alt="Thumbnail"
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-emerald-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Setup Photo Proof Uploaded</span>
                        </div>
                        <div className="text-[10px] text-emerald-700">Click to inspect proof &amp; history</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Ordered by {ord.orderedBy.name} ({ord.orderedBy.role})
                  </span>

                  <div className="flex items-center gap-2">
                    {canUploadForThisOrder && (
                      <button
                        onClick={() => setUploadingOrder(ord)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{ord.setupProof ? 'Re-Upload Proof' : 'Upload Proof'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setInspectingOrder(ord)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {inspectingOrder && (
        <ProofInspectionModal
          order={inspectingOrder}
          onClose={() => setInspectingOrder(null)}
        />
      )}

      {uploadingOrder && (
        <SubmitProofModal
          order={uploadingOrder}
          onClose={() => setUploadingOrder(null)}
        />
      )}
    </div>
  );
};
