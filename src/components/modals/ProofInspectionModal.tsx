import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorOrder } from '../../types';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  History,
  Camera
} from 'lucide-react';

interface ProofInspectionModalProps {
  order: VendorOrder | null;
  onClose: () => void;
}

export const ProofInspectionModal: React.FC<ProofInspectionModalProps> = ({ order, onClose }) => {
  const { 
    currentUser, 
    users,
    events, 
    vendors, 
    verifyByTeam, 
    approveByManagement, 
    requestRevision,
    switchUserById
  } = useApp();

  const [reviewNotes, setReviewNotes] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!order) return null;

  const event = events.find(e => e.id === order.eventId);
  const vendor = vendors.find(v => v.id === order.vendorId);

  const isLevel1Pending = order.status === 'SETUP_SUBMITTED';
  const isLevel2Pending = order.status === 'TEAM_VERIFIED';
  const isApproved = order.status === 'MANAGEMENT_APPROVED';

  const canVerifyTeam = currentUser.rights.canVerifyTeamProof;
  const canApproveManagement = currentUser.rights.canApproveManagementProof;
  const canRequestRevision = canVerifyTeam || canApproveManagement;

  const l1VerifierAccount = users.find(u => u.id !== currentUser.id && u.rights.canVerifyTeamProof);
  const l2ApproverAccount = users.find(u => u.id !== currentUser.id && u.rights.canApproveManagementProof);

  const handleVerifyTeam = () => {
    setErrorMsg('');
    if (!canVerifyTeam) {
      setErrorMsg('Requires "Level 1: Verify Proofs (Team)" right to verify.');
      return;
    }
    verifyByTeam(order.id, reviewNotes || 'Level 1 verified: Visual quality, venue placement, and specs confirmed.');
    onClose();
  };

  const handleApproveManagement = () => {
    setErrorMsg('');
    if (!canApproveManagement) {
      setErrorMsg('Requires "Level 2: Approve Proofs (Management)" right to sign off.');
      return;
    }
    approveByManagement(order.id, reviewNotes || 'Level 2 management approval granted. Logged in history.');
    onClose();
  };

  const handleRequestRevision = () => {
    if (!canRequestRevision) {
      setErrorMsg('Requires proof verification or approval rights to request a revision.');
      return;
    }
    if (!revisionReason.trim()) {
      setErrorMsg('Please specify what the vendor needs to adjust.');
      return;
    }
    requestRevision(order.id, revisionReason);
    onClose();
  };

  const canActOnCurrentStage =
    (isLevel1Pending && canVerifyTeam) ||
    (isLevel2Pending && canApproveManagement) ||
    (!isApproved && !isLevel1Pending && !isLevel2Pending && canRequestRevision);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                <Camera className="w-4 h-4" />
                <span>Two-Level Setup Proof Verification · {order.orderNumber}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {order.requirementTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vendor: <strong className="text-slate-800">{vendor?.name || 'Assigned Vendor'}</strong> · Event: <strong className="text-slate-800">{event?.title || 'Event'}</strong>
              </p>
            </div>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            {/* Setup Proof Photo Display */}
            {order.setupProof ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold flex items-center gap-1.5 text-slate-800">
                    <Camera className="w-4 h-4 text-amber-700" />
                    <span>Vendor Setup Proof Image</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Submitted: {new Date(order.setupProof.submittedAt).toLocaleTimeString()} by {order.setupProof.submittedBy}
                  </span>
                </div>

                <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative shadow-sm">
                  <img
                    src={order.setupProof.imageUrl}
                    alt="Setup proof"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium">
                    {order.venueLocation}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  <strong>Vendor Setup Remarks:</strong> "{order.setupProof.notes}"
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <Clock className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                <p className="font-bold">Setup Photo Not Yet Submitted</p>
                <p className="text-[11px] mt-0.5">Vendor is scheduled to complete setup by {order.requiredDate} at {order.requiredTime}.</p>
              </div>
            )}

            {/* Two-Level Verification Pipeline Tracker */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Two-Level Verification Pipeline
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Level 1: Team Verification */}
                <div className={`p-3 rounded-lg border ${
                  order.teamVerification?.verified
                    ? 'bg-emerald-50 border-emerald-300'
                    : isLevel1Pending
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-200 opacity-75'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-800">Level 1: Team</span>
                    {order.teamVerification?.verified ? (
                      <span className="text-emerald-700 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : isLevel1Pending ? (
                      <span className="text-blue-700 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> Ready for Review
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Pending Setup</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {order.teamVerification?.verifiedBy ? `By ${order.teamVerification.verifiedBy}` : 'Awaiting Level 1 Verifier'}
                  </div>
                  {order.teamVerification?.notes && (
                    <div className="mt-1 text-[10px] text-slate-600 italic">
                      "{order.teamVerification.notes}"
                    </div>
                  )}
                </div>

                {/* Level 2: Management Sign-off */}
                <div className={`p-3 rounded-lg border ${
                  order.managementApproval?.approved
                    ? 'bg-emerald-50 border-emerald-300'
                    : isLevel2Pending
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/10'
                    : 'bg-white border-slate-200 opacity-75'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-800">Level 2: Management</span>
                    {order.managementApproval?.approved ? (
                      <span className="text-emerald-700 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : isLevel2Pending ? (
                      <span className="text-amber-700 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> Ready for Sign-off
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Queued</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {order.managementApproval?.approvedBy ? `By ${order.managementApproval.approvedBy}` : 'Awaiting Level 2 Approver'}
                  </div>
                  {order.managementApproval?.notes && (
                    <div className="mt-1 text-[10px] text-slate-600 italic">
                      "{order.managementApproval.notes}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Action Box strictly gated by currentUser.rights */}
            {!isApproved && (canRequestRevision || isLevel1Pending || isLevel2Pending) && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                  <span className="font-bold text-slate-800">
                    Verification Controls (Acting as {currentUser.name} · {currentUser.role})
                  </span>

                  {isLevel1Pending && !canVerifyTeam && l1VerifierAccount && (
                    <button
                      onClick={() => switchUserById(l1VerifierAccount.id)}
                      className="text-amber-800 font-bold hover:underline"
                    >
                      Switch to {l1VerifierAccount.name} for Level 1
                    </button>
                  )}

                  {isLevel2Pending && !canApproveManagement && l2ApproverAccount && (
                    <button
                      onClick={() => switchUserById(l2ApproverAccount.id)}
                      className="text-amber-800 font-bold hover:underline"
                    >
                      Switch to {l2ApproverAccount.name} for Level 2
                    </button>
                  )}
                </div>

                {!canActOnCurrentStage ? (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                    {isLevel1Pending && !canVerifyTeam && (
                      <span>Your account does not have the <strong>Level 1: Verify Proofs (Team)</strong> right.</span>
                    )}
                    {isLevel2Pending && !canApproveManagement && (
                      <span>Your account does not have the <strong>Level 2: Approve Proofs (Management)</strong> right.</span>
                    )}
                    {!isLevel1Pending && !isLevel2Pending && !canRequestRevision && (
                      <span>Verification actions require Level 1 or Level 2 approval rights.</span>
                    )}
                  </div>
                ) : (
                  <>
                    {!showRevisionInput ? (
                      <div>
                        <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                          Verification Remarks / Approval Notes:
                        </label>
                        <input
                          type="text"
                          placeholder={
                            isLevel1Pending 
                              ? "e.g. Visual quality and stage placement verified."
                              : "e.g. Management sign-off granted. Setup authorized for event."
                          }
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-amber-600"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-rose-700 font-bold mb-1 text-[11px]">
                          Revision Requirements for Vendor:
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Describe the required adjustment so the vendor can correct and re-upload proof..."
                          value={revisionReason}
                          onChange={(e) => setRevisionReason(e.target.value)}
                          className="w-full p-2 bg-rose-50/40 border border-rose-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-rose-600"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                      {!showRevisionInput ? (
                        <>
                          {canRequestRevision && (
                            <button
                              onClick={() => setShowRevisionInput(true)}
                              className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold text-xs transition-colors"
                            >
                              Request Revision
                            </button>
                          )}

                          {isLevel1Pending && canVerifyTeam && (
                            <button
                              onClick={handleVerifyTeam}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Verify Setup (Level 1)</span>
                            </button>
                          )}

                          {isLevel2Pending && canApproveManagement && (
                            <button
                              onClick={handleApproveManagement}
                              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Approve &amp; Sign Off (Level 2)</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowRevisionInput(false)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleRequestRevision}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow-xs"
                          >
                            Send Revision Request to Vendor
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Saved History Log */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Audit &amp; Change History Log</span>
              </div>

              <div className="space-y-1.5">
                {order.historyLog.map(hist => (
                  <div key={hist.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800">{hist.action}</div>
                      <div className="text-slate-500">By {hist.actor} ({hist.actorRole})</div>
                      {hist.notes && <div className="text-slate-600 italic mt-0.5">"{hist.notes}"</div>}
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] shrink-0">{hist.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
