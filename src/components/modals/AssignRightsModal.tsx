import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRights, UserRole } from '../../types';
import { RIGHT_LABELS } from '../../utils/rights';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';

interface AssignRightsModalProps {
  user: UserProfile | null;
  onClose: () => void;
}

export const AssignRightsModal: React.FC<AssignRightsModalProps> = ({ user, onClose }) => {
  const { users, assignUserRights, updateUser } = useApp();

  const [rights, setRights] = useState<UserRights>({
    canCreateEvents: false,
    canBookVenues: false,
    canOrderRequirements: false,
    canVerifyTeamProof: false,
    canApproveManagementProof: false,
    canUploadSetupProof: false,
    canManageVenues: false,
    canManageUserRights: false
  });
  const [role, setRole] = useState<UserRole>('TEAM');
  const [warningMsg, setWarningMsg] = useState('');

  useEffect(() => {
    if (user) {
      setRights({ ...user.rights });
      setRole(user.role);
      setWarningMsg('');
    }
  }, [user]);

  if (!user) return null;

  const otherRightsAdminsCount = users.filter(
    u => u.id !== user.id && u.rights.canManageUserRights
  ).length;
  const isOnlyRightsAdmin = user.rights.canManageUserRights && otherRightsAdminsCount === 0;

  const toggleRight = (key: keyof UserRights) => {
    if (key === 'canManageUserRights' && rights.canManageUserRights && isOnlyRightsAdmin) {
      setWarningMsg('At least one user must retain "Assign Rights & Manage Users" permission.');
      return;
    }
    setWarningMsg('');
    setRights(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    assignUserRights(user.id, rights);
    if (role !== user.role) {
      updateUser(user.id, { role });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Permission Rights Administration</span>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Assign Rights for {user.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.title} · <strong className="text-slate-700">{user.departmentOrCompany}</strong>
            {user.email ? ` (${user.email})` : ''}
          </p>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:border-amber-600"
              >
                <option value="ADMIN">ADMIN (Hotel Executive Management)</option>
                <option value="TEAM">TEAM (Hotel Event Operations)</option>
                <option value="VENDOR">VENDOR (External Service Partner)</option>
              </select>
            </div>

            {warningMsg && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{warningMsg}</span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-xs font-bold text-slate-800 mb-1">
                Configure Operational Permissions:
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {RIGHT_LABELS.map(item => {
                  const isChecked = rights[item.key];
                  return (
                    <label 
                      key={item.key} 
                      className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRight(item.key)}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div className="text-left">
                        <div className={`font-bold ${isChecked ? 'text-amber-900' : 'text-slate-800'}`}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                Save Assigned Rights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
