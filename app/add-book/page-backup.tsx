'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { booksApi, userApi } from '../../lib/api';
import homeIcon from '../../images/home.png';
import bookIcon from '../../images/book-icon.png';
import collectionIcon from '../../images/collection.png';
import communityIcon from '../../images/community.png';
import collection1Icon from '../../images/collection1.png';
import settingIcon from '../../images/setting.png';
import sideBarLogo from '../../images/side bar logo.png';
import bellIcon from '../../images/bell.png';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import MobileDrawer from '../components/MobileDrawer';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
type BookForm = {
  coverUrl: string;
  title: string;
  author: string;
  isbn: string;
  pages: string;
  year: string;
  publisher: string;
  genre: string;
  description: string;
};

const initialForm: BookForm = {
  coverUrl: '',
  title: '',
  author: '',
  isbn: '',
  pages: '',
  year: '',
  publisher: '',
  genre: '',
  description: '',
};

export default function AddBookPage(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<BookForm>(initialForm);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // search input state for the positioned search bar
  const [searchQuery, setSearchQuery] = useState('');

  function pickRandomBook() {
    const POOL = ['Harry Potter', 'The Merge', 'Little Women', 'The Cambers of Secrets'];
    const rnd = POOL[Math.floor(Math.random() * POOL.length)];
    setSearchQuery(rnd);
  }

  // mobile drawer state is provided by MobileMenuContext
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();

  // success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // user data
  const [userData, setUserData] = useState<any>(null);

  // sidebar active state (from MobileMenuContext)
  // (do NOT redeclare here — use values from useMobileMenu)

  useEffect(() => {
    userApi.getProfile().then((res: any) => setUserData(res?.data || null)).catch(() => {});
  }, []);
  function toggleActive(id: string) {
    // context's setter expects a value (not an updater), so read current value and set new one
    setActiveIcon(activeIcon === id ? null : id);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
    setSuccess(null);

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);

    const payload: any = {
      title: form.title.trim(),
      description: form.description || undefined,
      isbn: form.isbn || undefined,
      pageCount: form.pages ? Number(form.pages) : undefined,
      publicationDate: form.year ? new Date(`${form.year}-01-01`).toISOString() : undefined,
      publisher: form.publisher || undefined,
      genres: form.genre ? [form.genre] : [],
      coverImage: form.coverUrl || filePreview || undefined,
    };

    try {
      await booksApi.create(payload);

      setForm(initialForm);
      setFile(null);
      setFilePreview(null);
      setShowSuccessModal(true);

      // auto-close modal and navigate after 2.5s
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/search-book');
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#F2F0E4]">

      {/* ===== Success Modal ===== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-[#E8E4D9] rounded-2xl shadow-xl px-8 py-10 flex flex-col items-center gap-3 max-w-[340px] w-[90%] text-center">
            <div className="w-14 h-14 rounded-full bg-[#D4EDDA] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0C1421]">Book Added!</h3>
            <p className="text-sm text-[#6B6B6B]">The book has been added to your library successfully.</p>
          </div>
        </div>
      )}

      {/* ===== Mobile Drawer (header provided by MobileTopBar) ===== */}
      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />



      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* Content area — offset by sidebar on lg+ */}
      <div className="min-h-screen flex flex-col px-4 sm:px-6 lg:pl-[156px] lg:pr-[60px] pt-[22px]">

        {/* Top bar: search + user (in-flow) */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 pl-12 lg:pl-0">
          {/* Search bar (desktop only here — mobile header provided by MobileTopBar) */}
          <div className="hidden lg:block">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Harry Potter" onPickRandom={pickRandomBook} />
          </div>

          {/* Spacer pushes user to the right */}
          <div className="flex-1" />

          {/* User + username + bell (in-flow, not fixed) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="w-[45px] h-[45px] rounded-full bg-white flex items-center justify-center shadow-sm" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '60%', height: '60%', color: '#6B4A33' }}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="username-text hidden sm:inline" style={{ fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", fontWeight: 400, fontStyle: 'normal', fontSize: '16px', lineHeight: '100%', letterSpacing: '0%', color: 'rgba(0,0,0,1)' }}>{userData?.name || 'User'}</span>
            <button aria-label="Notifications" title="Notifications" className="w-7 h-7 bg-transparent border-none p-0 flex-shrink-0">
              <Image src={bellIcon} alt="Notifications" width={28} height={28} style={{ objectFit: 'contain' }} />
            </button>
          </div>
        </div>

        {/* Form panel */}
        <div className="w-full max-w-[1224px] rounded-2xl flex flex-col gap-5" style={{
          background: 'rgba(255, 255, 255, 0.5)',
          borderTop: '0.8px solid rgba(96, 53, 27, 0.2)',
          border: '0.8px solid rgba(0,0,0,0.04)',
          padding: '24px 16px 32px 16px',
        }}>
          <div className="sm:px-4">
            {/* Header row */}
            <div className="w-full flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-[#0C1421]">Add Book Manually</h2>
              <button onClick={() => router.back()} aria-label="Close" className="w-8 h-8 flex items-center justify-center text-[#6B4A33] hover:opacity-70">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
              {/* Book Cover section */}
              <div>
                <label className="block text-sm font-medium text-[#6B4A33] mb-2">Book Cover</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Upload area */}
                  <label className="w-[100px] h-[140px] rounded-lg bg-[#E8E4D9] border border-dashed border-[#C4B8A8] flex flex-col items-center justify-center cursor-pointer hover:bg-[#DDD8CC] transition-colors flex-shrink-0">
                    {filePreview ? (
                      <img src={filePreview} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8B7355] mb-1">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-xs text-[#8B7355] text-center px-1">Click to upload cover image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                  {/* URL input */}
                  <div className="flex-1 w-full flex flex-col gap-1">
                    <input
                      type="url"
                      name="coverUrl"
                      value={form.coverUrl}
                      onChange={handleChange}
                      placeholder="Or paste image URL"
                      className="w-full h-10 px-3 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355]"
                    />
                    <span className="text-xs text-[#A09080]">Optional – you can add a cover later</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#6B4A33] mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter book title"
                  required
                  className="w-full h-10 px-3 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355]"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-[#6B4A33] mb-1">Author <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                  required
                  className="w-full h-10 px-3 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355]"
                />
              </div>

              {/* ISBN and Pages (side by side on sm+, stacked on mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B4A33] mb-1">ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="978-0-00-000000-0"
                    className="w-full h-10 px-3 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B4A33] mb-1">Pages</label>
                  <input
                    type="number"
                    name="pages"
                    value={form.pages}
                    onChange={handleChange}
                    placeholder="320"
                    className="w-full h-10 px-3 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355]"
                  />
                </div>
              </div>

              {/* Publish Year and Publisher (side by side on sm+, stacked on mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B4A33] mb-1">Publish Year</label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="2024"
                    className="w-full h-10 px-3 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B4A33] mb-1">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={form.publisher}
                    onChange={handleChange}
                    placeholder="Publisher name"
                    className="w-full h-10 px-3 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355]"
                  />
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-[#6B4A33] mb-1">Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full h-10 px-3 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#6B4A33] mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description of the book..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-[20px] bg-white border border-[#D4CFC4] text-sm text-[#0C1421] placeholder:text-[#A09080] focus:outline-none focus:border-[#8B7355] resize-none"
                />
              </div>

              {/* Error / Success messages */}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-[#6B4A33] text-white font-medium text-base hover:bg-[#5A3D2A] transition-colors disabled:opacity-60"
              >
                {loading ? 'Adding...' : 'Add Book'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
