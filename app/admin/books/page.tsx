'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminBooksApi, getImageUrl } from '../../../lib/api';

type Book = {
  _id: string;
  title: string;
  coverImage?: string;
  author?: { name: string };
  authors?: { name: string }[];
  createdBy?: { name: string; email: string };
  createdByType: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  submissionNote?: string;
  createdAt: string;
  isbn?: string;
};

type Tab = 'pending' | 'approved' | 'rejected' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminBooksPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [books, setBooks] = useState<Book[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch books when tab or search changes
  useEffect(() => {
    setLoading(true);
    setError('');
    adminBooksApi
      .getAll({ status: tab, search: debouncedSearch || undefined })
      .then((r: any) => {
        // backend returns { data: [...books], pendingCount, total, pages }
        setBooks(Array.isArray(r.data) ? r.data : (r.data?.books ?? []));
        setPendingCount(r.pendingCount ?? r.data?.pendingCount ?? 0);
      })
      .catch(() => setError('Failed to load books.'))
      .finally(() => setLoading(false));
  }, [tab, debouncedSearch]);

  async function quickApprove(id: string) {
    try {
      await adminBooksApi.approve(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      setPendingCount((n) => Math.max(0, n - 1));
    } catch {
      alert('Failed to approve book.');
    }
  }

  async function quickReject(id: string) {
    const reason = prompt('Rejection reason (optional):') ?? '';
    try {
      await adminBooksApi.reject(id, reason);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      if (tab === 'pending') setPendingCount((n) => Math.max(0, n - 1));
    } catch {
      alert('Failed to reject book.');
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#210C00]">Book Management</h1>
          <p className="text-sm text-[#210C00]/50 mt-0.5">
            Review user submissions and manage the full book catalogue.
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="px-4 py-2 bg-[#60351B] text-white text-sm font-medium rounded-lg hover:bg-[#4A2814] transition-colors"
        >
          + Add Book
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#210C00]/10">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              tab === key
                ? 'text-[#60351B] border-b-2 border-[#60351B]'
                : 'text-[#210C00]/50 hover:text-[#210C00]'
            }`}
          >
            {label}
            {key === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-semibold">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#210C00]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or author…"
            className="w-full pl-9 pr-4 h-9 rounded-lg bg-white border border-[#210C00]/10 text-sm placeholder:text-[#210C00]/30 focus:outline-none focus:border-[#60351B]"
          />
        </div>
        <span className="text-xs text-[#210C00]/40">{books.length} result{books.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white border border-[#210C00]/10 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white border border-[#210C00]/10 rounded-xl px-6 py-12 text-center">
          <p className="text-[#210C00]/40 text-sm">
            {tab === 'pending' ? 'No pending book submissions.' : `No ${tab} books found.`}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#210C00]/8 bg-[#FAF6F0]">
                <th className="text-left text-xs text-[#210C00]/40 font-medium px-4 py-3 w-12" />
                <th className="text-left text-xs text-[#210C00]/40 font-medium px-4 py-3">Book</th>
                <th className="text-left text-xs text-[#210C00]/40 font-medium px-4 py-3 hidden md:table-cell">Submitted by</th>
                <th className="text-left text-xs text-[#210C00]/40 font-medium px-4 py-3 hidden lg:table-cell">Date</th>
                <th className="text-left text-xs text-[#210C00]/40 font-medium px-4 py-3">Status</th>
                <th className="text-right text-xs text-[#210C00]/40 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#210C00]/5">
              {books.map((book) => (
                <tr key={book._id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                  {/* Thumbnail */}
                  <td className="px-4 py-3 w-12">
                    {book.coverImage ? (
                      <img src={getImageUrl(book.coverImage)} alt="" className="w-8 h-11 object-cover rounded" />
                    ) : (
                      <div className="w-8 h-11 bg-[#F0EBE3] rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#C4B99A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </td>
                  {/* Title / Author */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#210C00] line-clamp-1">{book.title}</p>
                    <p className="text-xs text-[#210C00]/50">
                      {book.author?.name || book.authors?.map((a) => a.name).join(', ') || '—'}
                    </p>
                  </td>
                  {/* Submitted by */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {book.createdByType === 'user' && book.createdBy ? (
                      <div>
                        <p className="text-xs text-[#210C00]">{book.createdBy.name}</p>
                        <p className="text-[10px] text-[#210C00]/40">{book.createdBy.email}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-[#210C00]/40 italic">Admin</span>
                    )}
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-[#210C00]/50">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_BADGE[book.status] ?? ''}`}>
                      {book.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/books/${book._id}`}
                        className="px-3 py-1 text-xs font-medium bg-[#60351B]/8 text-[#60351B] rounded-md hover:bg-[#60351B]/15 transition-colors"
                      >
                        Review
                      </Link>
                      {book.status === 'pending' && (
                        <>
                          <button
                            onClick={() => quickApprove(book._id)}
                            className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => quickReject(book._id)}
                            className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
