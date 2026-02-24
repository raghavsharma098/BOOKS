'use client';

import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { booksApi, userApi } from '../../lib/api';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import MobileDrawer from '../components/MobileDrawer';
import MobileTopBar from '../components/MobileTopBar';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import UserNavbar from '../components/UserNavbar';

// ─── Types ───────────────────────────────────────────────────────────────────
type SubmitForm = {
  title: string;
  authorName: string;
  isbn: string;
  language: string;
  coverUrl: string;
  submissionNote: string;
};

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Arabic', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Hindi', 'Other',
];

const initialForm: SubmitForm = {
  title: '',
  authorName: '',
  isbn: '',
  language: 'English',
  coverUrl: '',
  submissionNote: '',
};

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-[#E8E4D9] rounded-2xl shadow-xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col items-center gap-4 max-w-[360px] w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[#D4EDDA] flex items-center justify-center">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#0C1421]">Book Submitted!</h3>
        <p className="text-xs sm:text-sm text-[#6B6B6B]">
          Your book has been submitted for review. It will be visible to everyone once our team approves it.
        </p>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2 text-sm font-medium bg-[#8B7355] text-white rounded-full hover:bg-[#6B5335] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AddBookPage(): JSX.Element {
  // obtain query param on client after mount to avoid CSR bailout warning
  const [prefillTitle, setPrefillTitle] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPrefillTitle(params.get('title') ?? '');
  }, []);

  const [form, setForm] = useState<SubmitForm>({ ...initialForm, title: prefillTitle });
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);

  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();

  useEffect(() => {
    userApi.getProfile()
      .then((res: any) => setUserData(res?.data || null))
      .catch(() => setUserData(null))
      .finally(() => setUserLoading(false));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
    setForm((s) => ({ ...s, coverUrl: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) { setError('Book title is required.'); return; }
    if (!form.authorName.trim()) { setError('Author name is required.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('authorName', form.authorName.trim());
      if (form.isbn.trim()) fd.append('isbn', form.isbn.trim());
      if (form.language) fd.append('language', form.language);
      if (form.coverUrl.trim()) fd.append('coverUrl', form.coverUrl.trim());
      if (form.submissionNote.trim()) fd.append('submissionNote', form.submissionNote.trim());
      if (file) fd.append('coverImage', file);

      await booksApi.submit(fd);
      setShowSuccessModal(true);
      setForm(initialForm);
      setFile(null);
      setFilePreview(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit book. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex">
      {/* Sidebar */}
      <aside className="hidden md:block w-[220px] lg:w-[240px] xl:w-[260px] flex-shrink-0">
        <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
      </aside>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onToggle={toggleMobileMenu}
        activeIcon={activeIcon}
        setActiveIcon={setActiveIcon}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileTopBar />
        
        {/* Top Bar - Desktop/Tablet */}
        <div className="hidden sm:block sticky top-0 z-50 bg-[#F5F1EB] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search..." showFilters={false} />
              </div>
              <UserNavbar />
            </div>
          </div>
        </div>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto w-full mt-14 sm:mt-0">
          {/* Access guard */}
          {userLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#60351B]" />
            </div>
          ) : userData?.role !== 'verified_author' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF3E0] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#60351B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#210C00] mb-2">Verified Authors Only</h2>
              <p className="text-sm text-[#210C00]/60 max-w-sm">
                Only verified authors can upload books. Once submitted, books go through admin review before going live.
              </p>
              <p className="mt-3 text-xs text-[#210C00]/40">
                If you believe you qualify, please apply for author verification through your profile settings.
              </p>
            </div>
          ) : (
          <>
          <div className="mb-6 flex items-start gap-3 bg-[#FFF8E7] border border-[#F0C040] rounded-xl px-4 py-3 text-sm text-[#7A5C00]">
            <svg className="w-5 h-5 mt-0.5 shrink-0 text-[#F0C040]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Can't find a book in our library? Submit it here and our team will review it.
              Once approved, it will appear publicly for everyone to discover.
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E4D9] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#0C1421] mb-6">Submit a Book for Review</h2>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Cover */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#6B4A33] mb-2">
                  Book Cover <span className="text-[#A09080] font-normal">(optional)</span>
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-28 rounded-xl bg-[#F5F1EB] border border-[#D4CFC4] flex items-center justify-center overflow-hidden shrink-0">
                    {filePreview || form.coverUrl ? (
                      <img src={filePreview || form.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-[#C4B99A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer w-full h-10 px-4 rounded-full bg-[#F5F1EB] border border-[#D4CFC4] text-xs sm:text-sm text-[#6B4A33] hover:bg-[#EDE8DF] transition-colors">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload image
                      <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
                    </label>
                    <input
                      type="url"
                      name="coverUrl"
                      value={form.coverUrl}
                      onChange={handleChange}
                      placeholder="Or paste cover URL"
                      disabled={!!file}
                      className="w-full h-10 px-4 rounded-full bg-white border border-[#D4CFC4] text-xs sm:text-sm placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#6B4A33] mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="Enter book title" required
                  className="w-full h-10 px-4 rounded-full bg-white border border-[#D4CFC4] text-xs sm:text-sm placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355] transition-colors"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#6B4A33] mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="authorName" value={form.authorName} onChange={handleChange}
                  placeholder="Enter author name" required
                  className="w-full h-10 px-4 rounded-full bg-white border border-[#D4CFC4] text-xs sm:text-sm placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355] transition-colors"
                />
              </div>

              {/* ISBN + Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#6B4A33] mb-1">
                    ISBN <span className="text-[#A09080] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text" name="isbn" value={form.isbn} onChange={handleChange}
                    placeholder="978-0-00-000000-0"
                    className="w-full h-10 px-4 rounded-full bg-white border border-[#D4CFC4] text-xs sm:text-sm placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#6B4A33] mb-1">Language</label>
                  <select
                    name="language" value={form.language} onChange={handleChange}
                    className="w-full h-10 px-4 rounded-full bg-white border border-[#D4CFC4] text-xs sm:text-sm focus:outline-none focus:border-[#8B7355] transition-colors appearance-none"
                  >
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Submission note */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#6B4A33] mb-1">
                  Why are you adding this book?{' '}
                  <span className="text-[#A09080] font-normal">(optional)</span>
                </label>
                <textarea
                  name="submissionNote" value={form.submissionNote} onChange={handleChange}
                  placeholder="e.g. I loved this book and couldn't find it in your library…"
                  rows={3} maxLength={500}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4CFC4] text-xs sm:text-sm placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355] transition-colors resize-none"
                />
                <p className="text-right text-[10px] text-[#A09080] mt-1">{form.submissionNote.length}/500</p>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full h-11 rounded-full bg-[#8B7355] text-white text-sm font-medium hover:bg-[#6B5335] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Submitting…
                  </>
                ) : 'Submit for Review'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-[#8B7355] mt-4">
            <a href="/my-books" className="underline underline-offset-2 hover:text-[#6B5335]">
              View your submitted &amp; saved books →
            </a>
          </p>
          </>
          )}{/* end verified_author guard */}
        </main>
      </div>

      {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}
    </div>
  );
}

