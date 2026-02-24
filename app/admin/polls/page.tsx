'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { pollsApi, booksApi, getImageUrl } from '../../../lib/api';

type BookOption = { _id: string; title: string; coverImage?: string; author?: { name: string } };
type PollBook = { book: BookOption; voteCount: number; percentage?: number };
type Poll = {
  _id: string;
  title: string;
  year: number;
  status: 'active' | 'inactive';
  books: PollBook[];
  totalVotes?: number;
  createdAt: string;
};

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [formTitle, setFormTitle] = useState("Best Choice's of Reader");
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('inactive');
  const [selectedBooks, setSelectedBooks] = useState<BookOption[]>([]);
  const [saving, setSaving] = useState(false);

  // Book picker
  const [bookSearch, setBookSearch] = useState('');
  const [allBooks, setAllBooks] = useState<BookOption[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadPolls = useCallback(() => {
    setLoading(true);
    pollsApi.getAll()
      .then((r: any) => setPolls(r.data || []))
      .catch(() => setError('Failed to load polls.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadPolls(); }, [loadPolls]);

  // Pre-load all approved books once
  useEffect(() => {
    setBooksLoading(true);
    booksApi.getAll({ limit: 100 })
      .then((r: any) => setAllBooks(r.data || []))
      .catch(() => setAllBooks([]))
      .finally(() => setBooksLoading(false));
  }, []);

  // Filtered list based on search input
  const filteredBooks = bookSearch.trim()
    ? allBooks.filter(b =>
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        (b.author?.name || '').toLowerCase().includes(bookSearch.toLowerCase())
      )
    : allBooks;

  function openCreate() {
    setEditingPoll(null);
    setFormTitle("Best Choice's of Reader");
    setFormYear(new Date().getFullYear());
    setFormStatus('inactive');
    setSelectedBooks([]);
    setBookSearch('');
    setDropdownOpen(false);
    setShowForm(true);
  }

  function openEdit(poll: Poll) {
    setEditingPoll(poll);
    setFormTitle(poll.title);
    setFormYear(poll.year);
    setFormStatus(poll.status);
    setSelectedBooks(poll.books.map(b => b.book));
    setBookSearch('');
    setDropdownOpen(false);
    setShowForm(true);
  }

  function addBook(book: BookOption) {
    if (selectedBooks.find(b => b._id === book._id)) return;
    if (selectedBooks.length >= 4) { alert('Maximum 4 books per poll'); return; }
    setSelectedBooks(prev => [...prev, book]);
    setBookSearch('');
    setDropdownOpen(false);
  }

  function removeBook(id: string) {
    setSelectedBooks(prev => prev.filter(b => b._id !== id));
  }

  async function handleSave() {
    if (selectedBooks.length < 2) { alert('Please select at least 2 books'); return; }
    setSaving(true);
    try {
      const payload = { title: formTitle, year: formYear, bookIds: selectedBooks.map(b => b._id), status: formStatus };
      if (editingPoll) {
        await pollsApi.update(editingPoll._id, payload);
      } else {
        await pollsApi.create(payload);
      }
      setShowForm(false);
      loadPolls();
    } catch (err: any) {
      alert(err?.message || 'Failed to save poll');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(poll: Poll) {
    const newStatus = poll.status === 'active' ? 'inactive' : 'active';
    try {
      await pollsApi.update(poll._id, { status: newStatus });
      loadPolls();
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this poll?')) return;
    try {
      await pollsApi.delete(id);
      loadPolls();
    } catch {
      alert('Failed to delete poll');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin/books" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">← Admin</Link>
            <h1 className="text-2xl font-bold text-gray-800">Reader's Choice Polls</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create polls with selected books — shown on the dashboard for users to vote.</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-[#60351B] text-white rounded-lg text-sm font-medium hover:bg-[#4A2816] transition-colors"
          >
            + New Poll
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Poll list */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : polls.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm mb-4">No polls yet.</p>
            <button onClick={openCreate} className="px-4 py-2 bg-[#60351B] text-white rounded-lg text-sm">Create your first poll</button>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map(poll => {
              const totalVotes = poll.books.reduce((s, b) => s + (b.voteCount || 0), 0);
              return (
                <div key={poll._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-semibold text-gray-800 truncate">{poll.title}</h2>
                        <span className="text-xs text-gray-400 shrink-0">{poll.year}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${poll.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {poll.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{totalVotes} total votes · {poll.books.length} books</p>
                      {/* Books row */}
                      <div className="flex gap-3 flex-wrap">
                        {poll.books.map((pb, i) => {
                          const pct = totalVotes > 0 ? Math.round((pb.voteCount / totalVotes) * 100) : 0;
                          return (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                              {pb.book?.coverImage ? (
                                <img src={getImageUrl(pb.book.coverImage)} alt={pb.book.title} className="w-8 h-10 object-cover rounded" />
                              ) : (
                                <div className="w-8 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">?</div>
                              )}
                              <div>
                                <p className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{pb.book?.title}</p>
                                <p className="text-[10px] text-gray-400">{pb.book?.author?.name}</p>
                                <p className="text-[10px] text-blue-600 font-medium">{pb.voteCount} votes · {pct}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => toggleStatus(poll)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${poll.status === 'active' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {poll.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEdit(poll)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(poll._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{editingPoll ? 'Edit Poll' : 'Create Poll'}</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Poll Title</label>
              <input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#60351B]/30"
              />
            </div>

            {/* Year & Status row */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={formYear}
                  onChange={e => setFormYear(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#60351B]/30"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#60351B]/30"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active (shown on dashboard)</option>
                </select>
              </div>
            </div>

            {/* Selected books */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Books ({selectedBooks.length}/4 — min 2)
              </label>
              {selectedBooks.length === 0 ? (
                <p className="text-xs text-gray-400 italic mb-2">No books selected yet.</p>
              ) : (
                <div className="flex flex-col gap-2 mb-2">
                  {selectedBooks.map(book => (
                    <div key={book._id} className="flex items-center gap-2 bg-[#FFF8F3] border border-[#60351B]/20 rounded-lg px-3 py-2">
                      {book.coverImage ? (
                        <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-8 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-10 bg-gray-200 rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{book.title}</p>
                        <p className="text-[10px] text-gray-500">{book.author?.name}</p>
                      </div>
                      <button onClick={() => removeBook(book._id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Book dropdown picker */}
              {selectedBooks.length < 4 && (
                <div className="relative">
                  <div className="relative">
                    <input
                      value={bookSearch}
                      onChange={e => { setBookSearch(e.target.value); setDropdownOpen(true); }}
                      onFocus={() => setDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setDropdownOpen(false), 180)}
                      placeholder={booksLoading ? 'Loading books…' : 'Search or pick a book…'}
                      disabled={booksLoading}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#60351B]/30 disabled:opacity-50"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">{dropdownOpen ? '▲' : '▼'}</span>
                  </div>
                  {dropdownOpen && filteredBooks.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      {filteredBooks.map(book => {
                        const alreadyAdded = !!selectedBooks.find(b => b._id === book._id);
                        return (
                          <button
                            key={book._id}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => addBook(book)}
                            disabled={alreadyAdded}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                              alreadyAdded ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-[#FFF8F3] cursor-pointer'
                            }`}
                          >
                            {book.coverImage ? (
                              <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-7 h-9 object-cover rounded flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-9 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-[10px]">?</div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-800 truncate">{book.title}</p>
                              <p className="text-[10px] text-gray-500 truncate">{book.author?.name || '—'}</p>
                            </div>
                            {alreadyAdded && <span className="text-[10px] text-green-600 font-medium shrink-0">Added</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {dropdownOpen && !booksLoading && filteredBooks.length === 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl px-3 py-3 text-xs text-gray-400 italic">
                      No books found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || selectedBooks.length < 2}
                className="flex-1 px-4 py-2 bg-[#60351B] text-white rounded-lg text-sm font-medium hover:bg-[#4A2816] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : editingPoll ? 'Save Changes' : 'Create Poll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
