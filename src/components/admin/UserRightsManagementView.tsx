import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { RIGHT_LABELS } from '../../utils/rights';
import { NewUserModal } from '../modals/NewUserModal';
import { AssignRightsModal } from '../modals/AssignRightsModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  KeyRound
} from 'lucide-react';

export const UserRightsManagementView: React.FC = () => {
  const { users, currentUser, removeUser, switchUserById } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [editingRightsUser, setEditingRightsUser] = useState<UserProfile | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  const canManageRights = currentUser.rights.canManageUserRights;

  if (!canManageRights) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs space-y-2">
        <KeyRound className="w-8 h-8 mx-auto text-slate-300" />
        <p className="text-sm font-bold text-slate-900">Permission Required</p>
        <p>Your account does not have the Assign Rights &amp; Manage Users permission.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.departmentOrCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const teamCount = users.filter(u => u.role === 'TEAM').length;
  const vendorCount = users.filter(u => u.role === 'VENDOR').length;
  const rightsAdminCount = users.filter(u => u.rights.canManageUserRights).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <span>Hotel Administration</span>
            <span className="text-slate-300">·</span>
            <span>Access &amp; Permissions</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            User &amp; Vendor Rights Management
          </h2>
          <p className="text-xs text-slate-600 max-w-xl mt-0.5">
            Add or remove staff and external vendors, and configure exact operational permissions. All menus and actions adapt automatically to each user&apos;s assigned rights.
          </p>
        </div>

        <button
          onClick={() => setNewUserModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User / Vendor</span>
        </button>
      </div>

      {/* Filter and Search Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'ALL' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'ADMIN' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter('TEAM')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'TEAM' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team Operations ({teamCount})
          </button>
          <button
            onClick={() => setRoleFilter('VENDOR')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'VENDOR' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            External Vendors ({vendorCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, title, department, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
          />
        </div>
      </div>

      {/* User Cards */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-800">No matching user or vendor accounts</p>
            <p className="text-slate-400">Clear your filter or add a new account above.</p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const isCurrentUser = user.id === currentUser.id;
            const isLastRightsAdmin = user.rights.canManageUserRights && rightsAdminCount <= 1;
            const canDeleteUser = !isLastRightsAdmin;
            const activeRights = RIGHT_LABELS.filter(r => user.rights[r.key]);
            const isConfirming = confirmDeleteUserId === user.id;

            return (
              <div
                key={user.id}
                className={`p-5 rounded-2xl bg-white border transition-all shadow-xs space-y-3 ${
                  isCurrentUser ? 'border-amber-400 ring-2 ring-amber-400/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-900'
                          : user.role === 'TEAM'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {user.role}
                      </span>

                      <h3 className="text-base font-bold text-slate-900">
                        {user.name}
                      </h3>

                      {isCurrentUser && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                          ACTIVE SESSION
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>{user.title}</span>
                      <span>·</span>
                      <strong className="text-slate-700">{user.departmentOrCompany}</strong>
                      {user.email && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-slate-400">{user.email}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {!isCurrentUser && (
                      <button
                        onClick={() => switchUserById(user.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors"
                        title="Switch active session to this user"
                      >
                        Switch Account
                      </button>
                    )}

                    <button
                      onClick={() => setEditingRightsUser(user)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Assign Rights</span>
                    </button>

                    {canDeleteUser && (
                      isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              removeUser(user.id);
                              setConfirmDeleteUserId(null);
                            }}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg"
                          >
                            Confirm Remove
                          </button>
                          <button
                            onClick={() => setConfirmDeleteUserId(null)}
                            className="px-2.5 py-1.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteUserId(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Rights Summary Strip */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap text-[11px]">
                  <span className="text-slate-400 font-bold text-[10px] uppercase mr-1">Assigned Rights:</span>

                  {activeRights.length === 0 ? (
                    <span className="text-rose-700 font-medium">No rights assigned</span>
                  ) : (
                    activeRights.map((r) => (
                      <span
                        key={r.key}
                        className={`px-2 py-0.5 rounded border font-medium ${
                          r.key === 'canVerifyTeamProof'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : r.key === 'canApproveManagementProof'
                            ? 'bg-purple-50 text-purple-800 border-purple-200 font-bold'
                            : r.key === 'canUploadSetupProof'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : r.key === 'canManageVenues' || r.key === 'canManageUserRights'
                            ? 'bg-slate-100 text-slate-800 border-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {r.shortLabel}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <NewUserModal
        isOpen={newUserModalOpen}
        onClose={() => setNewUserModalOpen(false)}
      />

      {editingRightsUser && (
        <AssignRightsModal
          user={editingRightsUser}
          onClose={() => setEditingRightsUser(null)}
        />
      )}
    </div>
  );
};
