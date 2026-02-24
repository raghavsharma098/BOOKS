'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, getImageUrl } from '../../lib/api';

// ─── Shared UI atoms ─────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent = false,
}: { label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-5 flex flex-col gap-1 ${accent ? 'bg-[#60351B] text-white' : 'bg-white border border-[#210C00]/10'}`}>
      <p className={`text-xs uppercase tracking-wide ${accent ? 'text-white/60' : 'text-[#210C00]/50'}`}>{label}</p>
      <p className={`text-3xl font-semibold ${accent ? 'text-white' : 'text-[#210C00]'}`}>{value}</p>
      {sub && <p className={`text-xs ${accent ? 'text-white/60' : 'text-[#210C00]/50'}`}>{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[#210C00]/60 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getStats()
      .then((r: any) => setStats(r.data))
      .catch(() => setError('Could not load stats. Check backend connection.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-sm text-[#210C00]/50 animate-pulse">Loading dashboard…</p>;

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        {error}
      </div>
    );

  const { users, books, moderation, giveaways, blogs, recentReported, popularBooks, recentBlogs } =
    stats || {};

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-[#210C00]">Dashboard Overview</h1>
        <p className="text-sm text-[#210C00]/50 mt-0.5">Real-time snapshot of your platform.</p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users?.total ?? '—'} sub={`+${users?.newThisWeek ?? 0} this week`} accent />
        <StatCard label="Total Books" value={books?.total ?? '—'} />
        <StatCard label="Active Giveaways" value={giveaways?.active ?? '—'} sub={`${giveaways?.pending ?? 0} pending approval`} />
        <StatCard label="Published Blogs" value={(blogs?.published ?? 0) + (blogs?.featured ?? 0)} sub={`${blogs?.featured ?? 0} featured`} />
      </div>

      {/* ── Moderation warnings ── */}
      {(moderation?.pendingReports > 0 || moderation?.pendingClubs > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap gap-4 items-center">
          <span className="text-amber-700 font-medium text-sm">⚠️  Attention required:</span>
          {moderation.pendingReports > 0 && (
            <Link href="/admin/moderation?tab=reviews&filter=reported" className="text-sm text-amber-700 underline">
              {moderation.pendingReports} reported review{moderation.pendingReports !== 1 ? 's' : ''}
            </Link>
          )}
          {moderation.pendingClubs > 0 && (
            <Link href="/admin/moderation?tab=clubs&filter=pending" className="text-sm text-amber-700 underline">
              {moderation.pendingClubs} club{moderation.pendingClubs !== 1 ? 's' : ''} pending approval
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Popular Books ── */}
        <Section title="Popular Books This Week">
          <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
            {(popularBooks || []).map((b: any, i: number) => (
              <div key={b._id} className="flex items-center gap-3 px-4 py-3 border-b border-[#210C00]/5 last:border-b-0">
                <span className="text-xs text-[#210C00]/40 w-4">{i + 1}</span>
                {b.coverImage ? (
                  <img src={getImageUrl(b.coverImage)} className="w-7 h-10 object-cover rounded-sm flex-shrink-0" alt="" />
                ) : (
                  <div className="w-7 h-10 bg-[#60351B]/10 rounded-sm flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#210C00] truncate">{b.title}</p>
                  <p className="text-xs text-[#210C00]/50 truncate">{b.author?.name}</p>
                </div>
                <span className="text-xs text-[#60351B] font-medium">{b.weeklyViews ?? 0}v</span>
              </div>
            ))}
            {(!popularBooks || popularBooks.length === 0) && (
              <p className="px-4 py-6 text-sm text-[#210C00]/40 text-center">No data yet</p>
            )}
          </div>
        </Section>

        {/* ── Recent Reports ── */}
        <Section title="Recent Reported Reviews">
          <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
            {(recentReported || []).map((r: any) => (
              <div key={r._id} className="px-4 py-3 border-b border-[#210C00]/5 last:border-b-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-[#210C00]">{r.user?.name || 'Unknown'}</span>
                  <span className="text-[10px] text-red-500">{r.reports?.length ?? 0} report{r.reports?.length !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-xs text-[#210C00]/60 line-clamp-2">{r.reviewText || '—'}</p>
                <p className="text-[10px] text-[#210C00]/40 mt-0.5">📖 {r.book?.title}</p>
              </div>
            ))}
            {(!recentReported || recentReported.length === 0) && (
              <p className="px-4 py-6 text-sm text-[#210C00]/40 text-center">No reported content 🎉</p>
            )}
            <div className="px-4 py-2 bg-[#FAF6F0]">
              <Link href="/admin/moderation" className="text-xs text-[#60351B] hover:underline">
                View all moderation →
              </Link>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Blogs ── */}
      <Section title="Recent Blog Performance">
        <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#210C00]/10 bg-[#FAF6F0]">
                <th className="px-4 py-2.5 text-left text-xs text-[#210C00]/50 font-medium">Title</th>
                <th className="px-4 py-2.5 text-left text-xs text-[#210C00]/50 font-medium">Type</th>
                <th className="px-4 py-2.5 text-left text-xs text-[#210C00]/50 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right text-xs text-[#210C00]/50 font-medium">Views</th>
              </tr>
            </thead>
            <tbody>
              {(recentBlogs || []).map((b: any) => (
                <tr key={b._id} className="border-b border-[#210C00]/5 last:border-b-0 hover:bg-[#FAF6F0] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blogs/${b._id}`} className="text-[#60351B] hover:underline truncate block max-w-[220px]">
                      {b.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#210C00]/60">{b.type?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      b.visibility === 'featured' ? 'bg-amber-100 text-amber-700' :
                      b.visibility === 'published' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{b.visibility}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-[#210C00]/60">{b.views ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!recentBlogs || recentBlogs.length === 0) && (
            <p className="px-4 py-6 text-sm text-[#210C00]/40 text-center">No published blogs yet</p>
          )}
          <div className="px-4 py-2 bg-[#FAF6F0] flex justify-between items-center">
            <Link href="/admin/blogs" className="text-xs text-[#60351B] hover:underline">View all blogs →</Link>
            <Link href="/admin/blogs/new" className="text-xs bg-[#60351B] text-white px-3 py-1.5 rounded-full hover:bg-[#4A2518]">
              + New post
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
