'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminBooksApi, getImageUrl } from '../../../../lib/api';

type AuditEntry = {
  _id: string;
  admin?: { name: string };
  action: string;
  reason?: string;
  createdAt: string;
};

type Book = {
  _id: string;
  title: string;
  coverImage?: string;
  authors?: { _id: string; name: string }[];
  description?: string;
  isbn?: string;
  language?: string;
  pageCount?: number;
  publicationDate?: string;
  publisher?: string;
  format?: string;
  editors?: string[];
  buyLink?: string;
  genres?: string[];
  moodTags?: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submissionNote?: string;
  createdByType: 'user' | 'admin';
  createdBy?: { name: string; email: string };
  createdAt: string;
  approvedBy?: { name: string };
  approvedAt?: string;
  rejectedBy?: { name: string };
  rejectedAt?: string;
  auditLog?: AuditEntry[];
};

const FIELD_LABEL: Record<string, string> = {
  title: 'Title', description: 'Description', isbn: 'ISBN',
  language: 'Language', pageCount: 'Page Count', publisher: 'Publisher',
  publicationDate: 'Publication Date', genres: 'Genres',
  format: 'Format', buyLink: 'Buy Link',
};

const FORMATS = ['Paperback', 'Hardcover', 'eBook', 'Audiobook', 'Audio CD', 'Board Book'] as const;

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Arabic', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Hindi', 'Other',
] as const;

export default function AdminBookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Book>>({});
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Approve / reject state
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminBooksApi
      .getBook(id)
      .then((r: any) => setBook(r.data))
      .catch(() => setError('Book not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (book) {
      setEditForm({
        title: book.title,
        description: book.description ?? '',
        isbn: book.isbn ?? '',
        language: book.language ?? 'English',
        pageCount: book.pageCount,
        publisher: book.publisher ?? '',
        publicationDate: book.publicationDate ?? '',
        format: book.format ?? '',
        editors: book.editors ?? [],
        buyLink: book.buyLink ?? '',
        genres: book.genres ?? [],
      });
    }
  }, [book]);

  async function handleApprove() {
    setActionLoading('approve');
    try {
      const fd = new FormData();
      // Enrich metadata on approve
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
        }
      });
      if (editFile) fd.append('coverImage', editFile);
      await adminBooksApi.approve(id, fd);
      load();
    } catch (e: any) {
      alert(e.message || 'Failed to approve.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setActionLoading('reject');
    try {
      await adminBooksApi.reject(id, rejectReason.trim());
      load();
      setRejectReason('');
    } catch (e: any) {
      alert(e.message || 'Failed to reject.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
        }
      });
      if (editFile) fd.append('coverImage', editFile);
      await adminBooksApi.update(id, fd);
      setEditing(false);
      setEditFile(null);
      setEditPreview(null);
      load();
    } catch (e: any) {
      alert(e.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-[#210C00]/50 animate-pulse">Loading book…</p>;
  if (error || !book) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {error || 'Book not found.'}
      <Link href="/admin/books" className="ml-3 underline">← Back to books</Link>
    </div>
  );

  const isPending = book.status === 'pending';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Link href="/admin/books" className="text-sm text-[#60351B] hover:underline">← Books</Link>
        <span className="text-[#210C00]/20">/</span>
        <h1 className="text-lg font-semibold text-[#210C00] line-clamp-1">{book.title}</h1>
        <span className={`ml-auto inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
          book.status === 'pending' ? 'bg-amber-100 text-amber-700' :
          book.status === 'approved' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {book.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: cover + submission info ── */}
        <div className="space-y-4">
          {/* Cover */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4 space-y-3">
            <div className="flex justify-center">
              {editPreview || book.coverImage ? (
                <img
                  src={editPreview || getImageUrl(book.coverImage)}
                  alt="Cover"
                  className="w-32 h-44 object-cover rounded-lg shadow"
                />
              ) : (
                <div className="w-32 h-44 bg-[#F0EBE3] rounded-lg flex items-center justify-center">
                  <span className="text-[#C4B99A] text-4xl">📚</span>
                </div>
              )}
            </div>
            {editing && (
              <label className="flex items-center justify-center gap-2 cursor-pointer w-full h-9 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-xs text-[#60351B] hover:bg-[#F0EBE3] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Change cover
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setEditFile(f); setEditPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            )}
          </div>

          {/* Submission info */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-[#210C00]/50 uppercase tracking-wide">Submission</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-[#210C00]/40">Submitted by</span>
                <p className="text-[#210C00] font-medium">
                  {book.createdByType === 'admin' ? 'Admin' : book.createdBy?.name ?? 'Unknown user'}
                </p>
                {book.createdBy?.email && (
                  <p className="text-xs text-[#210C00]/40">{book.createdBy.email}</p>
                )}
              </div>
              <div>
                <span className="text-xs text-[#210C00]/40">Date</span>
                <p className="text-[#210C00]">{new Date(book.createdAt).toLocaleDateString()}</p>
              </div>
              {book.submissionNote && (
                <div>
                  <span className="text-xs text-[#210C00]/40">Note from user</span>
                  <p className="text-[#210C00] text-xs italic mt-0.5">"{book.submissionNote}"</p>
                </div>
              )}
              {book.rejectionReason && (
                <div>
                  <span className="text-xs text-red-500">Rejection reason</span>
                  <p className="text-red-700 text-xs mt-0.5">{book.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: metadata + actions ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Metadata card */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#210C00]">Book Details</h3>
              <button
                onClick={() => setEditing((e) => !e)}
                className="text-xs text-[#60351B] hover:underline"
              >
                {editing ? 'Cancel editing' : 'Edit metadata'}
              </button>
            </div>

            {editing ? (
              /* Edit form */
              <div className="space-y-3">
                {(['title', 'description', 'isbn', 'publisher', 'buyLink'] as const).map((f) => (
                  <div key={f}>
                    <label className="block text-xs font-medium text-[#210C00]/60 mb-1">{FIELD_LABEL[f] || f}</label>
                    {f === 'description' ? (
                      <textarea
                        value={(editForm as any)[f] ?? ''}
                        onChange={(e) => setEditForm((s) => ({ ...s, [f]: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm focus:outline-none focus:border-[#60351B] resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(editForm as any)[f] ?? ''}
                        onChange={(e) => setEditForm((s) => ({ ...s, [f]: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm focus:outline-none focus:border-[#60351B]"
                      />
                    )}
                  </div>
                ))}
                {/* Format — enum dropdown */}
                <div>
                  <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Format</label>
                  <select
                    value={editForm.format ?? ''}
                    onChange={(e) => setEditForm((s) => ({ ...s, format: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm focus:outline-none focus:border-[#60351B]"
                  >
                    <option value="">— Select format —</option>
                    {FORMATS.map((fmt) => (
                      <option key={fmt} value={fmt}>{fmt}</option>
                    ))}
                  </select>
                </div>
                {/* Language — dropdown */}
                <div>
                  <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Language</label>
                  <select
                    value={editForm.language ?? 'English'}
                    onChange={(e) => setEditForm((s) => ({ ...s, language: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm focus:outline-none focus:border-[#60351B]"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Editors (comma-separated)</label>
                  <input
                    type="text"
                    value={(editForm.editors ?? []).join(', ')}
                    onChange={(e) => setEditForm((s) => ({ ...s, editors: e.target.value.split(',').map((g) => g.trim()).filter(Boolean) }))}
                    className="w-full h-9 px-3 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm focus:outline-none focus:border-[#60351B]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Page Count</label>
                    <input
                      type="number"
                      value={editForm.pageCount ?? ''}
                      onChange={(e) => setEditForm((s) => ({ ...s, pageCount: Number(e.target.value) || undefined }))}
                      className="w-full h-9 px-3 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm focus:outline-none focus:border-[#60351B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Publication Date</label>
                    <input
                      type="date"
                      value={editForm.publicationDate ? editForm.publicationDate.slice(0, 10) : ''}
                      onChange={(e) => setEditForm((s) => ({ ...s, publicationDate: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm focus:outline-none focus:border-[#60351B]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    value={(editForm.genres ?? []).join(', ')}
                    onChange={(e) => setEditForm((s) => ({ ...s, genres: e.target.value.split(',').map((g) => g.trim()).filter(Boolean) }))}
                    className="w-full h-9 px-3 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm focus:outline-none focus:border-[#60351B]"
                  />
                </div>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="w-full h-9 bg-[#60351B] text-white text-sm font-medium rounded-lg hover:bg-[#4A2814] disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            ) : (
              /* Read-only detail view */
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ['Title', book.title],
                  ['Author(s)', book.authors?.map((a) => a.name).join(', ') || '—'],
                  ['ISBN', book.isbn || '—'],
                  ['Language', book.language || '—'],
                  ['Format', book.format || '—'],
                  ['Pages', book.pageCount?.toString() || '—'],
                  ['Publisher', book.publisher || '—'],
                  ['Published', book.publicationDate ? new Date(book.publicationDate).getFullYear().toString() : '—'],
                  ['Editors', book.editors?.join(', ') || '—'],
                  ['Buy Link', book.buyLink || '—'],
                  ['Genres', book.genres?.join(', ') || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-[#210C00]/40">{label}</dt>
                    <dd className="text-sm text-[#210C00] mt-0.5">{value}</dd>
                  </div>
                ))}
                {book.description && (
                  <div className="col-span-2">
                    <dt className="text-xs text-[#210C00]/40">Description</dt>
                    <dd className="text-sm text-[#210C00] mt-0.5 line-clamp-4">{book.description}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {/* ── Approve / Reject panel (only for pending) ── */}
          {isPending && (
            <div className="bg-white border border-[#210C00]/10 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#210C00]">Review Decision</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="flex-1 h-10 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {actionLoading === 'approve' ? 'Approving…' : '✓ Approve Book'}
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#210C00]/60">Rejection reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this book is being rejected…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-sm placeholder:text-[#210C00]/30 focus:outline-none focus:border-red-400 resize-none"
                />
                <button
                  onClick={handleReject}
                  disabled={actionLoading !== null || !rejectReason.trim()}
                  className="w-full h-10 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {actionLoading === 'reject' ? 'Rejecting…' : '✕ Reject Book'}
                </button>
              </div>
            </div>
          )}

          {/* ── Audit log ── */}
          {book.auditLog && book.auditLog.length > 0 && (
            <div className="bg-white border border-[#210C00]/10 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-[#210C00]/50 uppercase tracking-wide">Audit History</h3>
              <ul className="space-y-2">
                {book.auditLog.map((entry) => (
                  <li key={entry._id} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#F0EBE3] flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {entry.action.includes('approved') ? '✓' : entry.action.includes('rejected') ? '✕' : '✎'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-[#210C00]">{entry.admin?.name ?? 'Admin'}</span>
                      <span className="text-[#210C00]/50"> — {entry.action.replace(/_/g, ' ')}</span>
                      {entry.reason && (
                        <p className="text-xs text-[#210C00]/40 mt-0.5 italic">"{entry.reason}"</p>
                      )}
                    </div>
                    <span className="text-xs text-[#210C00]/30 shrink-0">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
