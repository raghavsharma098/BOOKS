'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi, giveawaysApi } from '../../../lib/api';

type Giveaway = {
  _id: string;
  title: string;
  status: string;
  giveawayType: string;
  entryCount: number;
  numberOfWinners: number;
  startDate: string;
  endDate: string;
  book?: { title: string; coverImage?: string };
};

const STATUS_COLORS: Record<string, string> = {
  draft:            'bg-gray-100 text-gray-600',
  pending:          'bg-amber-100 text-amber-700',
  approved:         'bg-blue-100 text-blue-700',
  active:           'bg-green-100 text-green-700',
  ended:            'bg-orange-100 text-orange-700',
  winners_selected: 'bg-purple-100 text-purple-700',
};

export default function AdminGiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Create modal state ──────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', giveawayType: 'physical_book',
    numberOfWinners: '1', startDate: '', endDate: '',
    minBooksRead: '0', minReviews: '0', bookId: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchGiveaways = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res: any = await giveawaysApi.getAll({ page: p, limit: 15 });
      setGiveaways(res.data || []);
      setPages(res.pages || 1);
      setTotal(res.total || 0);
    } catch {
      setMsg({ text: 'Failed to load giveaways', ok: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGiveaways(page); }, [page, fetchGiveaways]);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const action = async (fn: () => Promise<any>, successMsg: string) => {
    try {
      await fn();
      flash(successMsg);
      fetchGiveaways(page);
    } catch {
      flash('Action failed — see console', false);
    }
  };

  // ── Create handler ──────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (['minBooksRead', 'minReviews'].includes(k)) {
          fd.append(`eligibilityCriteria[${k === 'minBooksRead' ? 'minBooksRead' : 'minReviews'}]`, v);
        } else if (k === 'bookId') {
          if (v) fd.append('book', v);
        } else {
          fd.append(k, v);
        }
      });
      await adminApi.createGiveaway(fd);
      flash('Giveaway created');
      setShowCreate(false);
      setForm({ title: '', description: '', giveawayType: 'physical_book', numberOfWinners: '1', startDate: '', endDate: '', minBooksRead: '0', minReviews: '0', bookId: '' });
      fetchGiveaways(1);
    } catch {
      flash('Failed to create giveaway', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#210C00]">Giveaways</h1>
          <p className="text-sm text-[#210C00]/50 mt-0.5">{total} total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#60351B] text-white text-sm px-4 py-2 rounded-full hover:bg-[#4A2518] transition-colors"
        >
          + Create Giveaway
        </button>
      </div>

      {/* Flash */}
      {msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-[#210C00]/40animate-pulse">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#210C00]/10 bg-[#FAF6F0]">
                {['Giveaway', 'Type', 'Entries', 'Status', 'Ends', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#210C00]/50 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {giveaways.map((g) => (
                <tr key={g._id} className="border-b border-[#210C00]/5 last:border-b-0 hover:bg-[#FAF6F0] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#210C00] truncate max-w-[180px]">{g.title}</p>
                    <p className="text-[10px] text-[#210C00]/40 truncate">{g.book?.title || 'No book'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#210C00]/60 capitalize">{g.giveawayType?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-xs text-[#210C00]/70">{g.entryCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[g.status] || 'bg-gray-100 text-gray-500'}`}>
                      {g.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#210C00]/50">
                    {g.endDate ? new Date(g.endDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <Link href={`/admin/giveaways/${g._id}`} className="text-[10px] px-2 py-1 border border-[#60351B]/30 rounded text-[#60351B] hover:bg-[#60351B]/5">
                        View
                      </Link>
                      {['draft', 'pending', 'approved'].includes(g.status) && (
                        <button onClick={() => action(() => adminApi.publishGiveaway(g._id), 'Published!')} className="text-[10px] px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                          Publish
                        </button>
                      )}
                      {g.status === 'active' && (
                        <button onClick={() => action(() => adminApi.closeGiveaway(g._id), 'Giveaway closed')} className="text-[10px] px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">
                          Close
                        </button>
                      )}
                      {g.status === 'ended' && (
                        <button onClick={() => action(() => adminApi.selectWinnersAuto(g._id), 'Winners selected!')} className="text-[10px] px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                          Pick Winners
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {giveaways.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#210C00]/40">No giveaways yet</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-4 py-3 bg-[#FAF6F0] flex items-center gap-2 border-t border-[#210C00]/10">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1 rounded border border-[#210C00]/20 disabled:opacity-40">←</button>
            <span className="text-xs text-[#210C00]/60">Page {page}/{pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1 rounded border border-[#210C00]/20 disabled:opacity-40">→</button>
          </div>
        )}
      </div>

      {/* ── Create Modal ────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#210C00]/10">
              <h2 className="font-semibold text-[#210C00]">New Giveaway</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#210C00]/40 hover:text-[#210C00] text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
              {[
                { label: 'Title *', key: 'title', type: 'text', required: true },
                { label: 'Start Date *', key: 'startDate', type: 'date', required: true },
                { label: 'End Date *', key: 'endDate', type: 'date', required: true },
                { label: 'Number of Winners', key: 'numberOfWinners', type: 'number', required: false },
                { label: 'Min Books Read (eligibility)', key: 'minBooksRead', type: 'number', required: false },
                { label: 'Min Reviews (eligibility)', key: 'minReviews', type: 'number', required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block text-xs text-[#210C00]/60 mb-1">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-[#210C00]/60 mb-1">Type *</label>
                <select
                  value={form.giveawayType}
                  onChange={(e) => setForm((f) => ({ ...f, giveawayType: e.target.value }))}
                  className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B]"
                >
                  <option value="physical_book">Physical Book</option>
                  <option value="ebook">eBook</option>
                  <option value="merch">Merch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#210C00]/60 mb-1">Description *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#210C00]/60 mb-1">Linked Book ID <span className="text-[#210C00]/40">(optional — paste the book&#39;s _id)</span></label>
                <input
                  type="text"
                  value={form.bookId}
                  onChange={(e) => setForm((f) => ({ ...f, bookId: e.target.value }))}
                  placeholder="e.g. 64f3a1..."
                  className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B] font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="text-sm px-4 py-2 rounded-full border border-[#210C00]/20 text-[#210C00] hover:bg-[#FAF6F0]">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="text-sm px-5 py-2 rounded-full bg-[#60351B] text-white hover:bg-[#4A2518] disabled:opacity-50">
                  {saving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
