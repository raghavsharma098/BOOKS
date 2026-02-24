'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../../lib/api';

type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isSuspended?: boolean;
  suspendedUntil?: string;
  createdAt: string;
  profileImage?: string;
};

const ROLE_BADGE: Record<string, string> = {
  user: 'bg-gray-100 text-gray-600',
  verified_author: 'bg-blue-100 text-blue-700',
  editorial_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};

const ROLES = ['user', 'verified_author', 'editorial_admin', 'admin'];

type ModalType = 'role' | 'suspend' | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Modals
  const [modal, setModal] = useState<ModalType>(null);
  const [target, setTarget] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('user');
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState('');

  const PER_PAGE = 20;

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r: any = await adminApi.getUsers({ page, limit: PER_PAGE, search, role: roleFilter });
      setUsers(r.data.users || []);
      setTotal(r.data.total || 0);
    } catch {
      flash('Failed to load users', false);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const openRoleModal = (u: User) => {
    setTarget(u);
    setNewRole(u.role);
    setModal('role');
  };

  const openSuspendModal = (u: User) => {
    setTarget(u);
    setSuspendDays(7);
    setSuspendReason('');
    setModal('suspend');
  };

  const closeModal = () => { setModal(null); setTarget(null); };

  const handleRoleChange = async () => {
    if (!target) return;
    try {
      await adminApi.updateUser(target._id, { role: newRole });
      flash('Role updated');
      setUsers((prev) => prev.map((u) => u._id === target._id ? { ...u, role: newRole } : u));
      closeModal();
    } catch {
      flash('Failed to update role', false);
    }
  };

  const handleSuspend = async () => {
    if (!target) return;
    try {
      await adminApi.updateUser(target._id, {
        isSuspended: true,
        suspendedDays: suspendDays,
        suspendedReason: suspendReason,
      });
      flash('User suspended');
      load();
      closeModal();
    } catch {
      flash('Failed to suspend user', false);
    }
  };

  const handleUnsuspend = async (u: User) => {
    try {
      await adminApi.updateUser(u._id, { isSuspended: false });
      flash('User unsuspended');
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, isSuspended: false } : x));
    } catch {
      flash('Failed to unsuspend', false);
    }
  };

  const handleDeactivate = async (u: User) => {
    try {
      await adminApi.updateUser(u._id, { isActive: !u.isActive });
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, isActive: !u.isActive } : x));
      flash(u.isActive ? 'User deactivated' : 'User reactivated');
    } catch {
      flash('Failed', false);
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#210C00]">Users</h1>
          <p className="text-xs text-[#210C00]/50 mt-0.5">{total} total users</p>
        </div>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm mb-4 ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-[#210C00]/10 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search username or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#60351B]"
          />
          <button onClick={handleSearch} className="px-4 py-2 bg-[#60351B] text-white text-sm rounded-lg hover:bg-[#4A2518]">
            Search
          </button>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {(search || roleFilter) && (
          <button
            onClick={() => { setSearch(''); setSearchInput(''); setRoleFilter(''); setPage(1); }}
            className="text-xs text-[#60351B] underline"
          >Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#210C00]/10">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs text-[#210C00]/50 font-medium">User</th>
              <th className="px-4 py-3 text-xs text-[#210C00]/50 font-medium">Email</th>
              <th className="px-4 py-3 text-xs text-[#210C00]/50 font-medium">Role</th>
              <th className="px-4 py-3 text-xs text-[#210C00]/50 font-medium">Status</th>
              <th className="px-4 py-3 text-xs text-[#210C00]/50 font-medium">Joined</th>
              <th className="px-4 py-3 text-xs text-[#210C00]/50 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#210C00]/5">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#210C00]/40 animate-pulse">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#210C00]/40">No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-[#FAF6F0] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#210C00]/10 overflow-hidden flex-shrink-0">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#210C00]/50">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-[#210C00]">{u.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#210C00]/70">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.isSuspended ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Suspended</span>
                  ) : !u.isActive ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Inactive</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#210C00]/50 whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => openRoleModal(u)} className="text-[11px] px-2 py-1 border border-[#210C00]/20 rounded-md hover:bg-[#FAF6F0] text-[#210C00]">
                      Role
                    </button>
                    {u.isSuspended ? (
                      <button onClick={() => handleUnsuspend(u)} className="text-[11px] px-2 py-1 border border-green-300 rounded-md text-green-700 hover:bg-green-50">
                        Unsuspend
                      </button>
                    ) : (
                      <button onClick={() => openSuspendModal(u)} className="text-[11px] px-2 py-1 border border-orange-300 rounded-md text-orange-700 hover:bg-orange-50">
                        Suspend
                      </button>
                    )}
                    <button onClick={() => handleDeactivate(u)} className="text-[11px] px-2 py-1 border border-red-200 rounded-md text-red-600 hover:bg-red-50">
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#210C00]/10 flex items-center justify-between">
            <span className="text-xs text-[#210C00]/50">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-xs px-3 py-1 border rounded-lg disabled:opacity-30 hover:bg-[#FAF6F0]">← Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="text-xs px-3 py-1 border rounded-lg disabled:opacity-30 hover:bg-[#FAF6F0]">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Role modal ── */}
      {modal === 'role' && target && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-[#210C00] mb-1">Change Role</h3>
            <p className="text-xs text-[#210C00]/50 mb-4">{target.username} · {target.email}</p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={closeModal} className="text-sm px-4 py-2 border border-[#210C00]/20 rounded-full hover:bg-[#FAF6F0]">Cancel</button>
              <button onClick={handleRoleChange} className="text-sm px-4 py-2 bg-[#60351B] text-white rounded-full hover:bg-[#4A2518]">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Suspend modal ── */}
      {modal === 'suspend' && target && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-[#210C00] mb-1">Suspend User</h3>
            <p className="text-xs text-[#210C00]/50 mb-4">{target.username}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#210C00]/60 block mb-1">Duration (days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(Number(e.target.value))}
                  className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#210C00]/60 block mb-1">Reason</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={2}
                  placeholder="Reason for suspension…"
                  className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={closeModal} className="text-sm px-4 py-2 border border-[#210C00]/20 rounded-full hover:bg-[#FAF6F0]">Cancel</button>
              <button onClick={handleSuspend} className="text-sm px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700">Suspend</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
