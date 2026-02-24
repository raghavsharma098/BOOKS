'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { giveawaysApi, adminApi } from '../../../../lib/api';

export default function AdminGiveawayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [giveaway, setGiveaway] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [entTotal, setEntTotal] = useState(0);
  const [entPage, setEntPage] = useState(1);
  const [entPages, setEntPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchGiveaway = useCallback(async () => {
    try {
      const r: any = await giveawaysApi.getById(id);
      setGiveaway(r.data);
    } catch {
      flash('Could not load giveaway', false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEntries = useCallback(async (p = 1) => {
    try {
      const r: any = await adminApi.getGiveawayEntries(id, p);
      setEntries(r.data || []);
      setEntTotal(r.totalEntries || 0);
      setEntPages(r.pages || 1);
    } catch {
      /* non-critical */
    }
  }, [id]);

  useEffect(() => {
    fetchGiveaway();
    fetchEntries(1);
  }, [fetchGiveaway, fetchEntries]);

  const doAction = async (fn: () => Promise<any>, successMsg: string, redirect = false) => {
    try {
      await fn();
      flash(successMsg);
      if (redirect) { router.push('/admin/giveaways'); return; }
      fetchGiveaway();
    } catch {
      flash('Action failed', false);
    }
  };

  const toggleSelect = (uid: string) =>
    setSelectedIds((s) => s.includes(uid) ? s.filter((x) => x !== uid) : [...s, uid]);

  const handleManualPick = async () => {
    if (selectedIds.length === 0) return flash('Select at least one winner', false);
    setPicking(true);
    try {
      await adminApi.selectWinnersManual(id, selectedIds);
      flash('Winners set!');
      fetchGiveaway();
      setSelectedIds([]);
    } catch {
      flash('Failed to set winners', false);
    } finally {
      setPicking(false);
    }
  };

  if (loading) return <p className="text-sm text-[#210C00]/40 animate-pulse">Loading…</p>;
  if (!giveaway) return <p className="text-sm text-red-500">Giveaway not found.</p>;

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600', pending: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700', ended: 'bg-orange-100 text-orange-700',
    winners_selected: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <Link href="/admin/giveaways" className="text-xs text-[#60351B] hover:underline">← All Giveaways</Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#210C00]">{giveaway.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[giveaway.status] || 'bg-gray-100'}`}>
              {giveaway.status?.replace('_', ' ')}
            </span>
            <span className="text-xs text-[#210C00]/50 capitalize">{giveaway.giveawayType?.replace('_', ' ')}</span>
            <span className="text-xs text-[#210C00]/50">{giveaway.entryCount ?? 0} entries · {giveaway.numberOfWinners} winner(s)</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {['draft', 'pending', 'approved'].includes(giveaway.status) && (
            <button onClick={() => doAction(() => adminApi.publishGiveaway(id), 'Published!')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700">
              Publish
            </button>
          )}
          {giveaway.status === 'active' && (
            <button onClick={() => doAction(() => adminApi.closeGiveaway(id), 'Closed')} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600">
              Close
            </button>
          )}
          {giveaway.status === 'ended' && (
            <button onClick={() => doAction(() => adminApi.selectWinnersAuto(id), 'Winners randomly selected!')} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full hover:bg-purple-700">
              Auto-Pick Winners
            </button>
          )}
          <button onClick={() => doAction(() => adminApi.deleteGiveaway(id), 'Deleted', true)} className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Start', value: giveaway.startDate ? new Date(giveaway.startDate).toLocaleDateString() : '—' },
          { label: 'End', value: giveaway.endDate ? new Date(giveaway.endDate).toLocaleDateString() : '—' },
          { label: 'Entries', value: giveaway.entryCount ?? 0 },
          { label: 'Winners', value: giveaway.numberOfWinners ?? 1 },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-[#210C00]/10 rounded-xl p-4">
            <p className="text-xs text-[#210C00]/50 mb-1">{c.label}</p>
            <p className="text-xl font-semibold text-[#210C00]">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Winners */}
      {giveaway.winners && giveaway.winners.length > 0 && (
        <div className="bg-white border border-purple-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-purple-50 border-b border-purple-100">
            <h2 className="font-semibold text-purple-700 text-sm">🏆 Winners</h2>
          </div>
          <ul className="divide-y divide-[#210C00]/5">
            {giveaway.winners.map((w: any, i: number) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700">{i + 1}</div>
                <div>
                  <p className="text-sm font-medium text-[#210C00]">{w.user?.name || w.user}</p>
                  <p className="text-xs text-[#210C00]/50">{w.user?.email}</p>
                </div>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${w.notified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {w.notified ? 'Notified' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Entries */}
      <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#210C00]/10">
          <h2 className="font-semibold text-[#210C00] text-sm">Entries ({entTotal})</h2>
          {selectedIds.length > 0 && (
            <button onClick={handleManualPick} disabled={picking} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full hover:bg-purple-700 disabled:opacity-50">
              {picking ? 'Setting…' : `Set ${selectedIds.length} as winner(s)`}
            </button>
          )}
        </div>
        <ul className="divide-y divide-[#210C00]/5 max-h-80 overflow-y-auto">
          {entries.map((e: any, i: number) => {
            const u = e.user;
            const uid = u?._id || u;
            const isSelected = selectedIds.includes(uid);
            return (
              <li
                key={i}
                onClick={() => uid && toggleSelect(uid)}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-[#FAF6F0]'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-[#210C00]/20'}`}>
                  {isSelected && <span className="text-white text-[9px]">✓</span>}
                </div>
                <div className="w-7 h-7 rounded-full bg-[#60351B]/10 flex-shrink-0 overflow-hidden">
                  {u?.profilePicture && <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#210C00] font-medium truncate">{u?.name || 'Unknown'}</p>
                  <p className="text-xs text-[#210C00]/50 truncate">{u?.email}</p>
                </div>
                <span className="text-[10px] text-[#210C00]/40">
                  {e.enteredAt ? new Date(e.enteredAt).toLocaleDateString() : ''}
                </span>
              </li>
            );
          })}
          {entries.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-[#210C00]/40">No entries yet</li>
          )}
        </ul>
        {entPages > 1 && (
          <div className="px-5 py-3 bg-[#FAF6F0] border-t border-[#210C00]/10 flex items-center gap-2">
            <button disabled={entPage <= 1} onClick={() => { const p = entPage - 1; setEntPage(p); fetchEntries(p); }} className="text-xs px-3 py-1 border rounded disabled:opacity-40">←</button>
            <span className="text-xs text-[#210C00]/60">{entPage}/{entPages}</span>
            <button disabled={entPage >= entPages} onClick={() => { const p = entPage + 1; setEntPage(p); fetchEntries(p); }} className="text-xs px-3 py-1 border rounded disabled:opacity-40">→</button>
          </div>
        )}
      </div>
    </div>
  );
}
