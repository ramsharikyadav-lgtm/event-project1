import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorOrder } from '../../types';
import { filterOrdersForUser } from '../../utils/rights';
import { ProofInspectionModal } from '../modals/ProofInspectionModal';
import { SubmitProofModal } from '../modals/SubmitProofModal';
import { 
  Calendar, 
  Camera, 
  FileCheck, 
  History, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  ShieldAlert
} from 'lucide-react';

type MobileTab = 'orders' | 'upload' | 'approvals' | 'history';

export const MobileAppShell: React.FC = () => {
  const { 
    currentUser, 
    users,
    switchUserById, 
    vendors, 
    orders, 
    verifyByTeam, 
    approveByManagement 
  } = useApp();

  const [activeTab, setActiveTab] = useState<MobileTab>('orders');
  const [selectedOrderForInspect, setSelectedOrderForInspect] = useState<VendorOrder | null>(null);
  const [selectedOrderForUpload, setSelectedOrderForUpload] = useState<VendorOrder | null>(null);
  const [deviceFrame, setDeviceFrame] = useState(true);

  const rights = currentUser.rights;
  const canViewOrders =
    rights.canOrderRequirements ||
    rights.canUploadSetupProof ||
    rights.canVerifyTeamProof ||
    rights.canApproveManagementProof;
  const canUploadProof = rights.canUploadSetupProof;
  const canVerifyOrApprove = rights.canVerifyTeamProof || rights.canApproveManagementProof;
  const canViewHistory = canViewOrders;

  const allowedTabs: MobileTab[] = [];
  if (canViewOrders) allowedTabs.push('orders');
  if (canUploadProof) allowedTabs.push('upload');
  if (canVerifyOrApprove) allowedTabs.push('approvals');
  if (canViewHistory) allowedTabs.push('history');

  useEffect(() => {
    if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [currentUser.id, rights, activeTab]);

  const relevantOrders = filterOrdersForUser(orders, currentUser, vendors);

  const pendingApprovalsCount = relevantOrders.filter(
    o => o.status === 'SETUP_SUBMITTED' || o.status === 'TEAM_VERIFIED'
  ).length;

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 min-h-[calc(100vh-6rem)]">
      {/* Device frame toggle */}
      <div className="mb-3 flex items-center justify-between w-full max-w-sm px-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Mobile Staff &amp; Vendor App</span>
        </span>
        <button
          onClick={() => setDeviceFrame(!deviceFrame)}
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
        >
          {deviceFrame ? 'Expand Full Width' : 'Show Phone Shell'}
        </button>
      </div>

      {/* Smartphone Chassis in Light Theme */}
      <div className={`w-full ${
        deviceFrame 
          ? 'max-w-[390px] h-[780px] rounded-[44px] border-[10px] border-slate-300 shadow-2xl overflow-hidden' 
          : 'max-w-md min-h-[640px] rounded-2xl border border-slate-200 shadow-lg'
      } bg-slate-50 text-slate-800 flex flex-col relative`}>

        {/* Dynamic Island Speaker Notch */}
        {deviceFrame && (
          <div className="pt-3 pb-1 flex justify-center bg-slate-100">
            <div className="w-24 h-5 bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
              <div className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
          </div>
        )}

        {/* Mobile Top App Bar */}
        <div className="h-14 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
              GA
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 tracking-tight leading-none truncate">
                Grand Azure Mobile
              </div>
              <div className="text-[10px] font-semibold text-amber-800 leading-tight truncate">
                {currentUser.role} · {currentUser.name}
              </div>
            </div>
          </div>

          {/* Dynamic Account Switcher */}
          <select
            value={currentUser.id}
            onChange={(e) => switchUserById(e.target.value)}
            className="bg-slate-100 text-[10px] font-semibold text-slate-800 rounded px-2 py-1 border border-slate-200 focus:outline-hidden max-w-[140px]"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {allowedTabs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs space-y-2 mt-6">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-800">No Mobile Order or Proof Rights Assigned</p>
              <p className="text-[11px] text-slate-500">
                An Administrator can enable Order Requirements, Upload Setup Proofs, or Verification rights for {currentUser.name} in User Rights Management.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: REQUIREMENTS & ORDERS */}
              {activeTab === 'orders' && canViewOrders && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Requirement Orders</h3>
                      <p className="text-[10px] text-slate-500">Scheduled dates &amp; target setup times</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      {relevantOrders.length} Orders
                    </span>
                  </div>

                  {relevantOrders.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs space-y-1">
                      <Calendar className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                      <p className="font-bold text-slate-700">No orders available</p>
                      <p className="text-[11px] text-slate-400">Requirement orders will appear here once dispatched.</p>
                    </div>
                  ) : (
                    relevantOrders.map(ord => {
                      const vendor = vendors.find(v => v.id === ord.vendorId);
                      const isApproved = ord.status === 'MANAGEMENT_APPROVED';

                      return (
                        <div key={ord.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {ord.orderNumber}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {ord.requirementTitle}
                          </h4>

                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                            <span><strong>{ord.requiredDate}</strong> at <strong>{ord.requiredTime}</strong></span>
                          </div>

                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{ord.venueLocation}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                            <span className="text-[10px] text-slate-500 truncate">{vendor?.name || 'Assigned Vendor'}</span>

                            {ord.setupProof ? (
                              <button
                                onClick={() => setSelectedOrderForInspect(ord)}
                                className="text-xs text-amber-800 font-bold flex items-center gap-1 hover:underline shrink-0"
                              >
                                <Camera className="w-3 h-3" />
                                <span>View Proof</span>
                              </button>
                            ) : canUploadProof ? (
                              <button
                                onClick={() => setSelectedOrderForUpload(ord)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1 shrink-0"
                              >
                                <Camera className="w-3 h-3" />
                                <span>Upload Proof</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium shrink-0">Pending Setup</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: SETUP PROOF UPLOAD */}
              {activeTab === 'upload' && canUploadProof && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Setup Camera Proof
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Submit Setup Proof Photo</h3>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                      Select an order below to upload an image proof for Team &amp; Management verification.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {relevantOrders.filter(o => o.status !== 'MANAGEMENT_APPROVED').length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs space-y-1">
                        <Camera className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                        <p className="font-bold text-slate-700">No pending setups</p>
                        <p className="text-[11px] text-slate-400">Orders needing proof upload will appear here.</p>
                      </div>
                    ) : (
                      relevantOrders.filter(o => o.status !== 'MANAGEMENT_APPROVED').map(ord => (
                        <div key={ord.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-slate-700">{ord.orderNumber}</span>
                            <span className="text-[10px] font-mono text-slate-500">{ord.requiredDate}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900">{ord.requirementTitle}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{ord.venueLocation}</p>

                          <button
                            onClick={() => setSelectedOrderForUpload(ord)}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs min-h-[44px]"
                          >
                            <Camera className="w-4 h-4 text-amber-400" />
                            <span>{ord.setupProof ? 'Update / Re-Upload Proof Photo' : 'Upload Setup Proof Photo'}</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TWO-LEVEL APPROVALS */}
              {activeTab === 'approvals' && canVerifyOrApprove && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Setup Proof Approvals</h3>
                      <p className="text-[10px] text-slate-500">Two-Level Verification Pipeline</p>
                    </div>
                  </div>

                  {relevantOrders.filter(o => o.status === 'SETUP_SUBMITTED' || o.status === 'TEAM_VERIFIED').length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs space-y-1">
                      <FileCheck className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                      <p className="font-bold text-slate-700">No proofs awaiting approval</p>
                      <p className="text-[11px] text-slate-400">Submitted vendor proofs will appear here for verification.</p>
                    </div>
                  ) : (
                    relevantOrders.filter(o => o.status === 'SETUP_SUBMITTED' || o.status === 'TEAM_VERIFIED').map(ord => {
                      const isLevel1 = ord.status === 'SETUP_SUBMITTED';

                      return (
                        <div key={ord.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                                {ord.orderNumber}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1">{ord.requirementTitle}</h4>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isLevel1 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isLevel1 ? 'Team Level 1' : 'Mgmt Level 2'}
                            </span>
                          </div>

                          {ord.setupProof && (
                            <div 
                              onClick={() => setSelectedOrderForInspect(ord)}
                              className="w-full h-28 rounded-lg overflow-hidden border border-slate-200 cursor-pointer relative"
                            >
                              <img
                                src={ord.setupProof.imageUrl}
                                alt="Proof"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                                Tap to enlarge
                              </div>
                            </div>
                          )}

                          {/* Quick Action gated strictly by rights */}
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrderForInspect(ord)}
                              className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold min-h-[44px] flex items-center justify-center"
                            >
                              Details
                            </button>

                            {isLevel1 && rights.canVerifyTeamProof && (
                              <button
                                onClick={() => verifyByTeam(ord.id, 'Mobile verification by Team.')}
                                className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold min-h-[44px] flex items-center justify-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Verify L1</span>
                              </button>
                            )}

                            {!isLevel1 && rights.canApproveManagementProof && (
                              <button
                                onClick={() => approveByManagement(ord.id, 'Mobile management sign-off.')}
                                className="flex-1 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold min-h-[44px] flex items-center justify-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve L2</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 4: SAVED HISTORY */}
              {activeTab === 'history' && canViewHistory && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Saved History Logs</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Permanent Archive</span>
                  </div>

                  {relevantOrders.filter(o => o.status === 'MANAGEMENT_APPROVED').length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs space-y-1">
                      <History className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                      <p className="font-bold text-slate-700">No approved history yet</p>
                      <p className="text-[11px] text-slate-400">Approved orders and setup proofs appear here.</p>
                    </div>
                  ) : (
                    relevantOrders.filter(o => o.status === 'MANAGEMENT_APPROVED').map(ord => (
                      <div key={ord.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-slate-700">{ord.orderNumber}</span>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Approved
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900">{ord.requirementTitle}</h4>

                        {ord.setupProof && (
                          <img
                            src={ord.setupProof.imageUrl}
                            alt="Thumbnail"
                            className="w-full h-24 object-cover rounded-lg border border-slate-100"
                          />
                        )}

                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>Approved by {ord.managementApproval?.approvedBy || 'Management'}</span>
                          <button
                            onClick={() => setSelectedOrderForInspect(ord)}
                            className="text-amber-800 font-bold"
                          >
                            View Log
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Fixed Mobile Bottom Tab Bar strictly gated by rights */}
        {allowedTabs.length > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid items-center px-1 z-30 shadow-sm"
            style={{ gridTemplateColumns: `repeat(${allowedTabs.length}, minmax(0, 1fr))` }}
          >
            {canViewOrders && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  activeTab === 'orders' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-[10px] mt-1">Orders</span>
              </button>
            )}

            {canUploadProof && (
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  activeTab === 'upload' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] mt-1">Proof</span>
              </button>
            )}

            {canVerifyOrApprove && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
                  activeTab === 'approvals' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-5 h-5" />
                <span className="text-[10px] mt-1">Approvals</span>
                {pendingApprovalsCount > 0 && (
                  <span className="absolute top-2 right-5 w-2 h-2 rounded-full bg-amber-600" />
                )}
              </button>
            )}

            {canViewHistory && (
              <button
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  activeTab === 'history' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <History className="w-5 h-5" />
                <span className="text-[10px] mt-1">History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedOrderForInspect && (
        <ProofInspectionModal
          order={selectedOrderForInspect}
          onClose={() => setSelectedOrderForInspect(null)}
        />
      )}

      {selectedOrderForUpload && (
        <SubmitProofModal
          order={selectedOrderForUpload}
          onClose={() => setSelectedOrderForUpload(null)}
        />
      )}
    </div>
  );
};
