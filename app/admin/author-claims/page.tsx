'use client';

import { useEffect, useState } from 'react';
import { authorsApi } from '../../../lib/api';

interface ClaimRequest {
  _id: string;
  name: string;
  bio?: string;
  profilePhoto?: string;
  totalBooks?: number;
  averageRating?: number;
  claimEmail?: string;
  claimProof?: string;
  updatedAt: string;
  claimedBy?: {
    _id: string;
    name: string;
    email: string;
    username?: string;
    profilePicture?: string;
  };
}

export default function AdminAuthorClaimsPage() {
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClaims = async (p = 1) => {
    setLoading(true);
    try {
      const res: any = await authorsApi.getClaimRequests({ page: p, limit: 20 });
      const data: ClaimRequest[] = res?.data || [];
      setClaims(data);
      setTotal(res?.total ?? data.length);
      setPages(res?.pages ?? 1);
      setPage(p);
    } catch (err) {
      console.error('Failed to fetch claim requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(1); }, []);

  const handleAction = async (authorId: string, status: 'approved' | 'rejected') => {
    setActionLoading(authorId + status);
    try {
      await authorsApi.updateClaimStatus(authorId, status);
      showToast(status === 'approved' ? 'Claim approved — user is now a Verified Author.' : 'Claim rejected.', true);
      // Remove from list
      setClaims((prev) => prev.filter((c) => c._id !== authorId));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err: any) {
      showToast(err?.message || 'Action failed', false);
    } finally {
      setActionLoading(null);
    }
  };

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#210C00]">Author Claim Requests</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            {loading ? 'Loading…' : `${total} pending claim${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => fetchClaims(page)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[#E8E4D9] bg-white hover:bg-[#F7F3EC] text-[#60351B]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m0 0A8.003 8.003 0 0112 4C15.418 4 18.418 5.791 20.083 8M4.582 9H9m11 11v-5h-.581m0 0A8.003 8.003 0 0112 20c-3.418 0-6.418-1.791-8.083-4M19.419 15H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8E4D9] p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E4D9] p-12 text-center">
          <svg className="w-12 h-12 text-[#C4BFB5] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[#6B6B6B] font-medium">No pending claim requests</p>
          <p className="text-sm text-[#9B9B9B] mt-1">All author claims have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim._id} className="bg-white rounded-xl border border-[#E8E4D9] p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Author info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {claim.profilePhoto ? (
                    <img src={claim.profilePhoto} alt={claim.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#E8E4D9] flex items-center justify-center text-[#60351B] font-semibold text-sm flex-shrink-0">
                      {initials(claim.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#210C00] text-base">{claim.name}</span>
                      <span className="text-xs text-[#9B9B9B]">·</span>
                      <span className="text-xs text-[#9B9B9B]">{claim.totalBooks ?? 0} books on Compass</span>
                      {(claim.averageRating ?? 0) > 0 && (
                        <>
                          <span className="text-xs text-[#9B9B9B]">·</span>
                          <span className="text-xs text-[#9B9B9B]">⭐ {(claim.averageRating ?? 0).toFixed(1)}</span>
                        </>
                      )}
                    </div>
                    {claim.bio && (
                      <p className="text-sm text-[#6B6B6B] mt-1 line-clamp-2">{claim.bio}</p>
                    )}
                  </div>
                </div>

                {/* Claimant + actions */}
                <div className="flex flex-col gap-3 md:items-end md:min-w-[260px]">
                  {/* Claimant */}
                  {claim.claimedBy && (
                    <div className="bg-[#FAF6F0] rounded-lg p-3 text-sm w-full md:w-auto">
                      <div className="text-[10px] uppercase tracking-widest text-[#9B9B9B] mb-1.5">Claimed by</div>
                      <div className="flex items-center gap-2">
                        {claim.claimedBy.profilePicture ? (
                          <img src={claim.claimedBy.profilePicture} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#E8E4D9] flex items-center justify-center text-[10px] text-[#60351B] font-medium">
                            {initials(claim.claimedBy.name)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-[#210C00] leading-tight">{claim.claimedBy.name}</div>
                          <div className="text-xs text-[#9B9B9B]">{claim.claimedBy.email}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Proof */}
                  {(claim.claimEmail || claim.claimProof) && (
                    <div className="bg-[#FAF6F0] rounded-lg p-3 text-sm w-full md:w-auto">
                      <div className="text-[10px] uppercase tracking-widest text-[#9B9B9B] mb-1.5">Proof submitted</div>
                      {claim.claimEmail && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {claim.claimEmail}
                        </div>
                      )}
                      {claim.claimProof && (
                        <div className="flex items-start gap-1.5 text-xs text-[#6B6B6B]">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {claim.claimProof.startsWith('http') ? (
                            <a href={claim.claimProof} target="_blank" rel="noopener noreferrer" className="text-[#60351B] underline break-all">{claim.claimProof}</a>
                          ) : (
                            <span className="break-all">{claim.claimProof}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-[#9B9B9B]">
                    Submitted {new Date(claim.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleAction(claim._id, 'rejected')}
                      className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === claim._id + 'rejected' ? 'Rejecting…' : 'Reject'}
                    </button>
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleAction(claim._id, 'approved')}
                      className="px-4 py-2 text-sm rounded-lg bg-[#60351B] text-white hover:bg-[#4A2816] disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === claim._id + 'approved' ? 'Approving…' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => fetchClaims(page - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-[#E8E4D9] disabled:opacity-40 hover:bg-[#F7F3EC]"
              >
                Previous
              </button>
              <span className="text-sm text-[#6B6B6B]">Page {page} of {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => fetchClaims(page + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-[#E8E4D9] disabled:opacity-40 hover:bg-[#F7F3EC]"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
