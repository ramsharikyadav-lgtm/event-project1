import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserRights } from '../../types';
import { RIGHT_LABELS } from '../../utils/rights';
import { X, UserPlus, Shield } from 'lucide-react';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_RIGHTS_BY_ROLE: Record<UserRole, UserRights> = {
  ADMIN: {
    canCreateEvents: true,
    canBookVenues: true,
    canOrderRequirements: true,
    canVerifyTeamProof: true,
    canApproveManagementProof: true,
    canUploadSetupProof: false,
    canManageVenues: true,
    canManageUserRights: true
  },
  TEAM: {
    canCreateEvents: true,
    canBookVenues: true,
    canOrderRequirements: true,
    canVerifyTeamProof: true,
    canApproveManagementProof: false,
    canUploadSetupProof: false,
    canManageVenues: false,
    canManageUserRights: false
  },
  VENDOR: {
    canCreateEvents: false,
    canBookVenues: false,
    canOrderRequirements: false,
    canVerifyTeamProof: false,
    canApproveManagementProof: false,
    canUploadSetupProof: true,
    canManageVenues: false,
    canManageUserRights: false
  }
};

export const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose }) => {
  const { addUser } = useApp();

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('TEAM');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentOrCompany, setDepartmentOrCompany] = useState('');
  const [rights, setRights] = useState<UserRights>(DEFAULT_RIGHTS_BY_ROLE.TEAM);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setRights({ ...DEFAULT_RIGHTS_BY_ROLE[newRole] });
  };

  const toggleRight = (key: keyof UserRights) => {
    setRights(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetForm = () => {
    setName('');
    setRole('TEAM');
    setTitle('');
    setEmail('');
    setPhone('');
    setDepartmentOrCompany('');
    setRights({ ...DEFAULT_RIGHTS_BY_ROLE.TEAM });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !departmentOrCompany.trim()) return;

    addUser({
      name: name.trim(),
      role,
      title: title.trim(),
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@hotelops.local`,
      phone: phone.trim(),
      departmentOrCompany: departmentOrCompany.trim(),
      status: 'ACTIVE',
      rights
    });

    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <UserPlus className="w-4 h-4" />
              <span>User &amp; Vendor Access Control</span>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Add User / Vendor &amp; Assign Rights
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Register hotel staff, management, or external vendors and assign their exact permissions.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">User Role *</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:border-amber-600"
                >
                  <option value="ADMIN">Admin (Hotel Management)</option>
                  <option value="TEAM">Team (Event Operations)</option>
                  <option value="VENDOR">Vendor (External Partner)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder={role === 'VENDOR' ? 'e.g. Production Lead' : 'e.g. Event Coordinator'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {role === 'VENDOR' ? 'Vendor Company Name *' : 'Department *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'VENDOR' ? 'Enter vendor company name' : 'Enter hotel department'}
                  value={departmentOrCompany}
                  onChange={(e) => setDepartmentOrCompany(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="Optional contact number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono placeholder-slate-400"
                />
              </div>
            </div>

            {/* Granular Assigned Rights Checkboxes */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Assign Permissions &amp; Operational Rights:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                {RIGHT_LABELS.map(item => (
                  <label key={item.key} className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={rights[item.key]}
                      onChange={() => toggleRight(item.key)}
                      className="rounded text-amber-600"
                    />
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </label>
                ))}
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
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                Add User &amp; Save Rights
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
