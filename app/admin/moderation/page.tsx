'use client';

import { useEffect, useState, useCallback } from 'react';
import { moderationApi } from '../../../lib/api';

type Tab = 'reviews' | 'comments' | 'clubs' | 'users';

// ─── Shared ───────────────────────────────────────────────────────────────────
function Flash({ msg }: { msg: { text: string; ok: boolean } | null }) {
  if (!msg) return null;
  return (
    <div className={`rounded-lg px-4 py-2.5 text-sm ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {msg.text}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ModerationPage() {
  const [tab, setTab] = useState<Tab>('reviews');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'reviews', label: 'Reviews' },
    { key: 'comments', label: 'Comments' },
    { key: 'clubs', label: 'Book Clubs' },
    { key: 'users', label: 'Users' },
  ];

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#210C00]">Community Moderation</h1>
        <p className="text-sm text-[#210C00]/50 mt-0.5">Reader-first platform — only book-based discussions allowed.</p>
      </div>

      <Flash msg={msg} />

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#210C00]/10 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${tab === t.key ? 'bg-[#60351B] text-white font-medium' : 'text-[#210C00]/60 hover:text-[#210C00]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reviews' && <ReviewsTab flash={flash} />}
      {tab === 'comments' && <CommentsTab flash={flash} />}
      {tab === 'clubs' && <ClubsTab flash={flash} />}
      {tab === 'users' && <UsersTab flash={flash} />}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab({ flash }: { flash: (m: string, ok?: boolean) => void }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ reported?: boolean; hidden?: boolean; lowRating?: boolean }>({ reported: true });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r: any = await moderationApi.getReviews({ ...filter, limit: 30 });
      setReviews(r.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>, msg: string) => {
    try { await fn(); flash(msg); load(); }
    catch { flash('Action failed', false); }
  };

  const filterBtn = (key: keyof typeof filter, label: string) => (
    <button
      onClick={() => setFilter((f) => ({ ...f, [key]: f[key] ? undefined : true }))}
      className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter[key] ? 'bg-[#60351B] text-white border-[#60351B]' : 'border-[#210C00]/20 text-[#210C00]/60 hover:bg-[#FAF6F0]'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {filterBtn('reported', '⚠ Reported')}
        {filterBtn('hidden', 'Hidden')}
        {filterBtn('lowRating', '⭐ Low Rating')}
      </div>

      {loading ? <p className="text-sm text-[#210C00]/40 animate-pulse">Loading…</p> : (
        <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
          {reviews.map((r) => (
            <div key={r._id} className="px-5 py-4 border-b border-[#210C00]/5 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-[#210C00]">{r.user?.name || 'Unknown'}</p>
                    <span className="text-xs text-[#210C00]/40">·</span>
                    <span className="text-xs text-[#210C00]/50">📖 {r.book?.title || 'Unknown book'}</span>
                    <span className="text-xs text-orange-500">{'★'.repeat(r.rating || 0)}</span>
                    {r.reports?.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">{r.reports.length} report{r.reports.length !== 1 ? 's' : ''}</span>
                    )}
                    {r.isHidden && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">hidden</span>
                    )}
                  </div>
                  <p className="text-xs text-[#210C00]/70 line-clamp-3">{r.reviewText || '—'}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {!r.isHidden ? (
                    <button onClick={() => act(() => moderationApi.hideReview(r._id), 'Review hidden')} className="text-[10px] px-2 py-1 border border-amber-300 text-amber-600 rounded hover:bg-amber-50">Hide</button>
                  ) : (
                    <button onClick={() => act(() => moderationApi.unhideReview(r._id), 'Review unhidden')} className="text-[10px] px-2 py-1 border border-gray-300 text-gray-500 rounded hover:bg-gray-50">Unhide</button>
                  )}
                  {r.reports?.length > 0 && (
                    <button onClick={() => act(() => moderationApi.dismissReviewReports(r._id), 'Reports dismissed')} className="text-[10px] px-2 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50">Dismiss</button>
                  )}
                  <button onClick={() => act(() => moderationApi.deleteReview(r._id), 'Review deleted')} className="text-[10px] px-2 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="px-5 py-8 text-center text-sm text-[#210C00]/40">No reviews match this filter 🎉</p>}
        </div>
      )}
    </div>
  );
}

// ─── Comments Tab ─────────────────────────────────────────────────────────────
function CommentsTab({ flash }: { flash: (m: string, ok?: boolean) => void }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reported, setReported] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r: any = await moderationApi.getComments({ reported: reported || undefined, limit: 30 } as any);
      setComments(r.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [reported]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>, msg: string) => {
    try { await fn(); flash(msg); load(); }
    catch { flash('Action failed', false); }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setReported((r) => !r)}
        className={`text-xs px-3 py-1 rounded-full border ${reported ? 'bg-[#60351B] text-white border-[#60351B]' : 'border-[#210C00]/20 text-[#210C00]/60'}`}
      >
        ⚠ Reported only
      </button>

      {loading ? <p className="text-sm text-[#210C00]/40 animate-pulse">Loading…</p> : (
        <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
          {comments.map((c) => (
            <div key={c._id} className="px-5 py-4 border-b border-[#210C00]/5 last:border-b-0 flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#210C00]">{c.user?.name || 'Unknown'}</p>
                <p className="text-xs text-[#210C00]/70 mt-0.5 line-clamp-2">{c.commentText || c.text || '—'}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => act(() => moderationApi.hideComment(c._id), 'Comment hidden')} className="text-[10px] px-2 py-1 border border-amber-300 text-amber-600 rounded hover:bg-amber-50">Hide</button>
                <button onClick={() => act(() => moderationApi.deleteComment(c._id), 'Comment deleted')} className="text-[10px] px-2 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="px-5 py-8 text-center text-sm text-[#210C00]/40">No comments match this filter 🎉</p>}
        </div>
      )}
    </div>
  );
}

// ─── Clubs Tab ────────────────────────────────────────────────────────────────
function ClubsTab({ flash }: { flash: (m: string, ok?: boolean) => void }) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r: any = await moderationApi.getClubs({ status: statusFilter, limit: 30 } as any);
      setClubs(r.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>, msg: string) => {
    try { await fn(); flash(msg); load(); }
    catch { flash('Action failed', false); }
  };

  const STATUS_BTNS = ['pending', 'active', 'rejected'];

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {STATUS_BTNS.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-3 py-1 rounded-full border capitalize ${statusFilter === s ? 'bg-[#60351B] text-white border-[#60351B]' : 'border-[#210C00]/20 text-[#210C00]/60'}`}>{s}</button>
        ))}
      </div>

      {loading ? <p className="text-sm text-[#210C00]/40 animate-pulse">Loading…</p> : (
        <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
          {clubs.map((c) => (
            <div key={c._id} className="px-5 py-4 border-b border-[#210C00]/5 last:border-b-0 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#210C00] truncate">{c.name}</p>
                <p className="text-xs text-[#210C00]/50 truncate">{c.description?.substring(0, 80)}</p>
                <p className="text-[10px] text-[#210C00]/40 mt-0.5">By {c.creator?.name} · {c.memberCount ?? 0} members · {c.clubType?.replace('_', ' ')}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {c.status !== 'active' && (
                  <button onClick={() => act(() => moderationApi.approveClub(c._id), 'Club approved')} className="text-[10px] px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                )}
                {c.clubType !== 'editorial_pick' && (
                  <button onClick={() => act(() => moderationApi.featureClub(c._id), 'Club featured')} className="text-[10px] px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600">Feature</button>
                )}
                {c.status !== 'rejected' && (
                  <button onClick={() => act(() => moderationApi.rejectClub(c._id, 'Admin action'), 'Club rejected')} className="text-[10px] px-2 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50">Reject</button>
                )}
                <button onClick={() => act(() => moderationApi.removeClub(c._id), 'Club removed')} className="text-[10px] px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50">Remove</button>
              </div>
            </div>
          ))}
          {clubs.length === 0 && <p className="px-5 py-8 text-center text-sm text-[#210C00]/40">No clubs with status: {statusFilter}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ flash }: { flash: (m: string, ok?: boolean) => void }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionUser, setActionUser] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [actionType, setActionType] = useState<'warn' | 'suspend' | null>(null);

  const searchUsers = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { adminApi } = await import('../../../lib/api');
      const r: any = await adminApi.getUsers({ search, limit: 20 });
      setUsers(r.data || []);
    } catch { flash('Search failed', false); }
    finally { setLoading(false); }
  };

  const doAction = async () => {
    if (!actionUser || !actionType) return;
    try {
      if (actionType === 'warn') await moderationApi.warnUser(actionUser._id, reason);
      if (actionType === 'suspend') await moderationApi.suspendUser(actionUser._id, reason, duration ? parseInt(duration) : undefined);
      flash(`User ${actionType === 'warn' ? 'warned' : 'suspended'}`);
      setActionUser(null); setReason(''); setDuration(''); setActionType(null);
    } catch { flash('Action failed', false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
          placeholder="Search by name, email or username…"
          className="flex-1 border border-[#210C00]/20 rounded-lg px-4 py-2 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B]"
        />
        <button onClick={searchUsers} className="bg-[#60351B] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#4A2518]">Search</button>
      </div>

      {loading && <p className="text-sm text-[#210C00]/40 animate-pulse">Searching…</p>}

      {users.length > 0 && (
        <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
          {users.map((u) => (
            <div key={u._id} className="flex items-center gap-3 px-5 py-3 border-b border-[#210C00]/5 last:border-b-0">
              <div className="w-8 h-8 rounded-full bg-[#60351B]/10 flex items-center justify-center text-xs text-[#60351B] font-semibold flex-shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#210C00] truncate">{u.name}</p>
                <p className="text-xs text-[#210C00]/50">{u.email} · {u.role}</p>
                {u.isSuspended && <span className="text-[10px] text-red-500">Suspended</span>}
                {u.warnings?.length > 0 && <span className="text-[10px] text-amber-600 ml-2">{u.warnings.length} warning(s)</span>}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setActionUser(u); setActionType('warn'); }}
                  className="text-[10px] px-2 py-1 border border-amber-300 text-amber-600 rounded hover:bg-amber-50"
                >Warn</button>
                {!u.isSuspended ? (
                  <button onClick={() => { setActionUser(u); setActionType('suspend'); }} className="text-[10px] px-2 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50">Suspend</button>
                ) : (
                  <button onClick={async () => { await moderationApi.unsuspendUser(u._id); flash('Unsuspended'); setUsers(uu => uu.map(x => x._id === u._id ? { ...x, isSuspended: false } : x)); }} className="text-[10px] px-2 py-1 border border-green-300 text-green-600 rounded hover:bg-green-50">Unsuspend</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action modal */}
      {actionUser && actionType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h2 className="font-semibold text-[#210C00] capitalize">{actionType} user: {actionUser.name}</h2>
            <div>
              <label className="text-xs text-[#210C00]/60 block mb-1">Reason *</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#60351B]" />
            </div>
            {actionType === 'suspend' && (
              <div>
                <label className="text-xs text-[#210C00]/60 block mb-1">Duration (days, leave blank = indefinite)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#60351B]" />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => { setActionUser(null); setActionType(null); setReason(''); setDuration(''); }} className="text-sm px-4 py-2 border rounded-full border-[#210C00]/20 text-[#210C00]">Cancel</button>
              <button onClick={doAction} disabled={!reason.trim()} className="text-sm px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 capitalize">{actionType}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
