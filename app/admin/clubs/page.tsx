'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { adminClubsApi, getImageUrl } from '../../../lib/api';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface Club {
  _id: string;
  name: string;
  description: string;
  clubType: string;
  privacy: string;
  discussionStructure: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  isFeatured: boolean;
  isEditorial: boolean;
  isVerified: boolean;
  coverImage?: string;
  creator?: { _id: string; name: string; email: string };
  memberCount: number;
  maxMembers?: number;
  tags?: string[];
  rejectionReason?: string;
  suspendReason?: string;
  createdAt: string;
}

interface Counts {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  draft: number;
}

const CLUB_TYPES = ['emotional', 'genre', 'buddy_read', 'author_led', 'editorial_pick'];
const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'suspended', 'draft'] as const;

const blankForm = {
  name: '', description: '', clubType: 'genre',
  privacy: 'public', discussionStructure: 'open',
  maxMembers: '', tags: '', coverImage: '',
  isFeatured: false, isEditorial: false, isVerified: false, status: 'approved',
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export default function AdminClubsPage() {
  const [clubs, setClubs]       = useState<Club[]>([]);
  const [counts, setCounts]     = useState<Counts>({ pending: 0, approved: 0, rejected: 0, suspended: 0, draft: 0 });
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('all');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);

  // Create / Edit form
  const [showForm, setShowForm]       = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [form, setForm]               = useState({ ...blankForm });
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving]           = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reject/Suspend modal
  const [actionModal, setActionModal] = useState<{ type: 'reject' | 'suspend'; club: Club } | null>(null);
  const [actionReason, setActionReason] = useState('');

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadClubs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await adminClubsApi.getAll(
        activeTab !== 'all' ? { status: activeTab } : undefined
      );
      setClubs(res.data || []);
      if (res.counts) setCounts(res.counts);
    } catch {
      setError('Failed to load clubs.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadClubs(); }, [loadClubs]);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingClub(null);
    setForm({ ...blankForm });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (club: Club) => {
    setEditingClub(club);
    setForm({
      name: club.name,
      description: club.description,
      clubType: club.clubType,
      privacy: club.privacy,
      discussionStructure: club.discussionStructure,
      maxMembers: club.maxMembers ? String(club.maxMembers) : '',
      tags: club.tags?.join(', ') || '',
      coverImage: club.coverImage || '',
      isFeatured:  club.isFeatured,
      isEditorial: club.isEditorial,
      isVerified:  club.isVerified,
      status: club.status,
    });
    setImageFile(null);
    setImagePreview(club.coverImage ? getImageUrl(club.coverImage) : '');
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return flash('Club name is required.', false);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('clubType', form.clubType);
      fd.append('privacy', form.privacy);
      fd.append('discussionStructure', form.discussionStructure);
      if (form.maxMembers) fd.append('maxMembers', form.maxMembers);
      if (form.tags) fd.append('tags', form.tags);
      fd.append('isFeatured',  String(form.isFeatured));
      fd.append('isEditorial', String(form.isEditorial));
      fd.append('isVerified',  String(form.isVerified));
      fd.append('status', form.status);
      if (imageFile) fd.append('coverImage', imageFile);

      if (editingClub) {
        await adminClubsApi.update(editingClub._id, fd);
        flash('Club updated.');
      } else {
        await adminClubsApi.create(fd);
        flash('Club created and is live.');
      }
      setShowForm(false);
      loadClubs();
    } catch (err: any) {
      flash(err?.message || 'Save failed.', false);
    } finally {
      setSaving(false);
    }
  };

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickAction = async (fn: () => Promise<any>, successMsg: string) => {
    try {
      await fn();
      flash(successMsg);
      loadClubs();
    } catch {
      flash('Action failed.', false);
    }
  };

  const submitActionWithReason = async () => {
    if (!actionModal) return;
    const { type, club } = actionModal;
    try {
      if (type === 'reject')  await adminClubsApi.reject(club._id, actionReason);
      if (type === 'suspend') await adminClubsApi.suspend(club._id, actionReason);
      flash(type === 'reject' ? 'Club rejected.' : 'Club suspended.');
      setActionModal(null);
      setActionReason('');
      loadClubs();
    } catch {
      flash('Action failed.', false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusPill = (s: string) => {
    const map: Record<string, string> = {
      approved:  'bg-green-100 text-green-700',
      pending:   'bg-yellow-100 text-yellow-700',
      rejected:  'bg-red-100 text-red-700',
      suspended: 'bg-orange-100 text-orange-700',
      draft:     'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${map[s] || 'bg-gray-100 text-gray-500'}`}>
        {s}
      </span>
    );
  };

  const typeLabel = (t: string) =>
    t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">← Admin</Link>
          <h1 className="text-2xl font-bold text-gray-800">Book Clubs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All clubs require admin approval before going public. Admin-created clubs are live immediately.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#60351B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4A2518] transition-colors whitespace-nowrap"
        >
          + Create Club
        </button>
      </div>

      {/* Flash */}
      {msg && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-100 pb-0 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const count = tab !== 'all' ? counts[tab] : undefined;
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-[#60351B] text-[#60351B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="capitalize">{tab}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  tab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Permission notice */}
      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
        <strong>Permission rules:</strong> Regular users &amp; verified authors can submit clubs (always <strong>pending</strong>).
        Admins create clubs that are <strong>immediately approved</strong>.
        No user can set featured, editorial, or verified — only admins can.
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : error ? (
        <div className="text-red-600 text-sm py-8 text-center">{error}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F7F0] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Club</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Creator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Members</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Badges</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clubs.map((club) => (
                <tr key={club._id} className="hover:bg-[#F9F7F0] transition-colors">
                  {/* Club name + cover */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#E8E2D4]">
                        {club.coverImage ? (
                          <img src={getImageUrl(club.coverImage)} alt={club.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📚</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#210C00] text-sm leading-tight line-clamp-1">{club.name}</p>
                        <p className="text-[10px] text-gray-400">{club.privacy}</p>
                      </div>
                    </div>
                  </td>
                  {/* Creator */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-700">{club.creator?.name || '—'}</p>
                    <p className="text-[10px] text-gray-400">{club.creator?.email || ''}</p>
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-600 capitalize">{typeLabel(club.clubType)}</span>
                  </td>
                  {/* Members */}
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                    {club.memberCount}{club.maxMembers ? `/${club.maxMembers}` : ''}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">{statusPill(club.status)}</td>
                  {/* Badges */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {club.isFeatured  && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#60351B] text-white">★ Featured</span>}
                      {club.isEditorial && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">✍ Editorial</span>}
                      {club.isVerified  && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">✓ Verified</span>}
                    </div>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">{fmtDate(club.createdAt)}</td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end flex-wrap gap-1">
                      {/* Status transitions */}
                      {club.status === 'pending' && (
                        <>
                          <button
                            onClick={() => quickAction(() => adminClubsApi.approve(club._id), 'Club approved!')}
                            className="text-[10px] px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setActionModal({ type: 'reject', club }); setActionReason(''); }}
                            className="text-[10px] px-2 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {club.status === 'approved' && (
                        <button
                          onClick={() => { setActionModal({ type: 'suspend', club }); setActionReason(''); }}
                          className="text-[10px] px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                          Suspend
                        </button>
                      )}
                      {club.status === 'suspended' && (
                        <button
                          onClick={() => quickAction(() => adminClubsApi.restore(club._id), 'Club restored!')}
                          className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Restore
                        </button>
                      )}
                      {/* Featured toggle */}
                      <button
                        onClick={() => {
                          const fd = new FormData();
                          fd.append('isFeatured', String(!club.isFeatured));
                          quickAction(() => adminClubsApi.update(club._id, fd), club.isFeatured ? 'Unfeatured' : 'Featured!');
                        }}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                          club.isFeatured
                            ? 'border-[#60351B] bg-[#60351B]/10 text-[#60351B]'
                            : 'border-gray-200 text-gray-500 hover:border-[#60351B] hover:text-[#60351B]'
                        }`}
                      >
                        {club.isFeatured ? '★ Feat.' : '☆ Feat.'}
                      </button>
                      <button
                        onClick={() => openEdit(club)}
                        className="text-[10px] px-2 py-1 border border-[#60351B]/30 rounded text-[#60351B] hover:bg-[#60351B]/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${club.name}"? This cannot be undone.`))
                            quickAction(() => adminClubsApi.delete(club._id), 'Deleted.');
                        }}
                        className="text-[10px] px-2 py-1 border border-red-200 rounded text-red-500 hover:bg-red-50"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clubs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                    No clubs {activeTab !== 'all' ? `with status "${activeTab}"` : ''} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-[#210C00]">
                {editingClub ? 'Edit Club' : 'Create New Club'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Cover image */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Cover Image</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-32 rounded-xl overflow-hidden bg-[#F2F0E4] border-2 border-dashed border-[#D0C4B0] flex items-center justify-center cursor-pointer hover:border-[#60351B] transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-2xl mb-1">📷</div>
                      <p className="text-xs">Click to upload</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Club Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="E.g. Midnight Horror Readers"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="What is this club about?"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B] resize-none"
                />
              </div>

              {/* Type + Privacy */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Club Type</label>
                  <select
                    value={form.clubType}
                    onChange={(e) => setForm({ ...form, clubType: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  >
                    {CLUB_TYPES.map((t) => (
                      <option key={t} value={t}>{typeLabel(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Privacy</label>
                  <select
                    value={form.privacy}
                    onChange={(e) => setForm({ ...form, privacy: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              {/* Discussion structure + Max members */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Discussion Structure</label>
                  <select
                    value={form.discussionStructure}
                    onChange={(e) => setForm({ ...form, discussionStructure: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  >
                    <option value="open">Open (free discussion)</option>
                    <option value="chapter_wise">Chapter-wise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Max Members</label>
                  <input
                    type="number"
                    value={form.maxMembers}
                    onChange={(e) => setForm({ ...form, maxMembers: e.target.value })}
                    placeholder="Unlimited"
                    min={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="horror, mystery, contemporary..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                />
              </div>

              {/* Status (admin sets directly) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                >
                  <option value="approved">Approved (live immediately)</option>
                  <option value="draft">Draft (admin only)</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Admin-only quality markers */}
              <div className="bg-[#F9F7F0] rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-[#210C00] mb-2">Admin-Only Markers</p>
                {([
                  { key: 'isFeatured',  label: '★ Featured', desc: 'Show on homepage / discovery' },
                  { key: 'isEditorial', label: '✍ Editorial Pick', desc: 'Editorial pick badge' },
                  { key: 'isVerified',  label: '✓ Verified',  desc: 'Verified community badge' },
                ] as { key: 'isFeatured' | 'isEditorial' | 'isVerified'; label: string; desc: string }[]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#210C00]">{label}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, [key]: !form[key] })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        form[key] ? 'bg-[#60351B]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        form[key] ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2518] disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingClub ? 'Save Changes' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reject / Suspend Reason Modal ─────────────────────────────────── */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-[#210C00] mb-1 capitalize">
              {actionModal.type} Club
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              You are about to <strong>{actionModal.type}</strong> &ldquo;{actionModal.club.name}&rdquo;.
              The club owner will be notified.
            </p>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Reason <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              placeholder={
                actionModal.type === 'reject'
                  ? 'E.g. Does not meet community guidelines — unrelated to books'
                  : 'E.g. Multiple member complaints about spam'
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B] resize-none mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitActionWithReason}
                className={`px-5 py-2 rounded-lg text-white text-sm font-medium ${
                  actionModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                Confirm {actionModal.type === 'reject' ? 'Rejection' : 'Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
