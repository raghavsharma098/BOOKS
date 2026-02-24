'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
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
import bookCover1 from '../../images/card1.png';

type BookItem = {
  _id: string;
  title: string;
  author: any;
  coverImage?: string;
  genres?: string[];
  pageCount?: number;
  averageRating?: number;
};

export default function SearchBookPage(): JSX.Element {
  // Backend data
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [resultsLimit, setResultsLimit] = useState(24);
  const [totalBooks, setTotalBooks] = useState(0);
  const [showAddHint, setShowAddHint] = useState(true);
  const [filters, setFilters] = useState<string[]>([]);

  // keep track of SearchBar's filter-panel open state (SearchBar notifies parent)
  const [searchBarFilterOpen, setSearchBarFilterOpen] = useState(false);

  // filter UI state (was missing) — added so filter helpers and effects compile
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedPace, setSelectedPace] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  // ref used by top bar (kept for layout hooks elsewhere) - previously used for filter anchoring
  const topBarRef = useRef<HTMLDivElement | null>(null);



  // mobile drawer + sidebar active state (moved to global MobileMenuContext)
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon, setMobileMenuOpen } = useMobileMenu();
  
  function removeFilter(filter: string) {
    setFilters((prev) => prev.filter((f) => f !== filter));
  }

  function pickRandomBook() {
    if (books.length > 0) {
      const rnd = books[Math.floor(Math.random() * books.length)];
      setQuery(rnd.title);
    }
    setIsFilterOpen(false);
  }
  function handleApplyFilters() {
    const newFilters: string[] = [];
    selectedMoods.forEach((m) => newFilters.push(m));
    if (selectedPace) newFilters.push(selectedPace + ' pace');
    if (selectedType) newFilters.push(selectedType);
    selectedPages.forEach((p) => newFilters.push(`Pages ${p}`));
    setFilters(newFilters);
    setIsFilterOpen(false);
  }

  // refs + panel positioning for anchored popup
  const filterBtnRef = useRef<HTMLButtonElement | null>(null);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const [panelCoords, setPanelCoords] = useState<{ top: number; left: number; arrowLeft: number } | null>(null);

  useEffect(() => {
    if (!isFilterOpen) {
      setPanelCoords(null);
      return;
    }
    const compute = () => {
      const btn = filterBtnRef.current;
      const panel = filterPanelRef.current;
      const header = topBarRef.current;
      if (!btn || !panel) return;
      const btnRect = btn.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;

      const headerBottom = header ? (header.getBoundingClientRect().bottom + scrollY) : 0;
      const sidebarWidth = window.innerWidth >= 1024 ? 96 : 0;
      const minLeft = sidebarWidth + 12; // ensure panel doesn't cover left navbar on large screens

      // prefer placing below the button
      let top = btnRect.bottom + scrollY + 12;

      // if the panel would overflow the viewport vertically, try placing above the button
      if (top + panelRect.height > scrollY + window.innerHeight - 8) {
        const aboveTop = btnRect.top + scrollY - panelRect.height - 12;
        // use above if it won't overlap the header area, otherwise clamp below header
        if (aboveTop >= headerBottom + 8) top = aboveTop;
        else top = Math.max(headerBottom + 8, scrollY + window.innerHeight - panelRect.height - 8);
      }

      // ensure panel does not start before the sidebar (desktop) and clamp to viewport
      let left = btnRect.left + btnRect.width / 2 - panelRect.width / 2;
      left = Math.max(minLeft, Math.min(left, window.innerWidth - panelRect.width - 8));

      const arrowLeft = btnRect.left + btnRect.width / 2 - left;
      setPanelCoords({ top, left, arrowLeft });
    };

    // compute once after render and on resize/scroll
    requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [isFilterOpen, selectedMoods, selectedPace, selectedType, selectedPages]);

  // prevent background scrolling while filter modal is open
  useEffect(() => {
    if (!isFilterOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isFilterOpen]);

  // use values from MobileMenuContext instead of local duplicates
  function toggleActive(id: string) { setActiveIcon(activeIcon === id ? null : id); }

  // Fetch books from backend
  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const moodFilter = selectedMoods.length > 0 ? selectedMoods[0] : undefined;
        const genreFilter = filters.find(f => !f.includes('pace') && !f.includes('Pages'));
        const result: any = await booksApi.getAll({
          search: query || undefined,
          genre: genreFilter || undefined,
          mood: moodFilter || undefined,
          page: 1,
          limit: resultsLimit,
        });
        setBooks(result?.data || []);
        setTotalBooks(result?.total || result?.count || 0);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    const debounce = setTimeout(fetchBooks, 300);
    return () => clearTimeout(debounce);
  }, [query, resultsLimit, filters, selectedMoods]);

  // Fetch user profile
  useEffect(() => {
    userApi.getProfile().then((res: any) => setUserData(res?.data || null)).catch(() => {});
  }, []);

  const results = books;

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">

      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* Mobile hamburger button */}
      <button aria-label="Open menu" onClick={() => setMobileMenuOpen(true)} className="lg:hidden fixed top-5 left-4 z-[100] w-10 h-10 flex items-center justify-center rounded-lg bg-white/80 shadow-sm">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[150]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-3/4 max-w-[320px] bg-[#F2F0E4] shadow-2xl flex flex-col" style={{ borderRight: '0.3px solid rgba(0,0,0,0.15)', animation: 'slideIn 250ms ease-out' }}>
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <Image src={sideBarLogo} alt="Logo" width={50} height={44} style={{ objectFit: 'contain' }} />
              <button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Mobile user - moved from top-right */}
            <div className="px-4 pt-2 pb-3 flex items-center gap-3 border-b border-black/5">
              <div className="w-10 h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden">
                <span className="text-white text-sm font-semibold">{userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-[#0C1421]">{userData?.name || 'User'}</div>
                <div className="text-xs text-[#6B4A33]">View profile</div>
              </div>
            </div>

            <div className="flex flex-col h-full w-full">
              <div className="w-full h-full flex flex-col gap-2 px-2 pt-4" style={{ transform: 'translateY(8px)' }}>
                {/* Home */}
                <button aria-pressed={activeIcon === 'home'} onClick={() => { toggleActive('home'); setMobileMenuOpen(false); }} aria-label="Home" className="w-full flex items-center gap-4 px-4 py-3 rounded-md hover:bg-black/5 text-left">
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {activeIcon === 'home' && (<span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />)}
                    <Image src={homeIcon} alt="Home" width={20} height={20} style={{ position: 'relative', zIndex: 1, objectFit: 'contain', filter: 'brightness(0)' }} />
                  </div>
                  <span className={activeIcon === 'home' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>Home</span>
                </button>

                {/* Discover */}
                <button aria-pressed={activeIcon === 'library'} onClick={() => { toggleActive('library'); setMobileMenuOpen(false); }} aria-label="Discover" className="w-full flex items-center gap-4 px-4 py-3 rounded-md hover:bg-black/5 text-left">
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {activeIcon === 'library' && (<span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />)}
                    <Image src={bookIcon} alt="Discover" width={18} height={18} style={{ position: 'relative', zIndex: 1, objectFit: 'contain' }} />
                  </div>
                  <span className={activeIcon === 'library' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>Discover</span>
                </button>

                {/* Collections */}
                <button aria-pressed={activeIcon === 'collection'} onClick={() => { toggleActive('collection'); setMobileMenuOpen(false); }} aria-label="Collections" className="w-full flex items-center gap-4 px-4 py-3 rounded-md hover:bg-black/5 text-left">
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {activeIcon === 'collection' && (<span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />)}
                    <Image src={collectionIcon} alt="Collections" width={18} height={18} style={{ position: 'relative', zIndex: 1, objectFit: 'contain' }} />
                  </div>
                  <span className={activeIcon === 'collection' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>Collections</span>
                </button>

                {/* Reviews */}
                <button aria-pressed={activeIcon === 'community'} onClick={() => { toggleActive('community'); setMobileMenuOpen(false); }} aria-label="Reviews" className="w-full flex items-center gap-4 px-4 py-3 rounded-md hover:bg-black/5 text-left">
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {activeIcon === 'community' && (<span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />)}
                    <Image src={communityIcon} alt="Reviews" width={18} height={18} style={{ position: 'relative', zIndex: 1, objectFit: 'contain' }} />
                  </div>
                  <span className={activeIcon === 'community' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>Reviews</span>
                </button>

                {/* About */}
                <button aria-pressed={activeIcon === 'collection-alt'} onClick={() => { toggleActive('collection-alt'); setMobileMenuOpen(false); }} aria-label="About" className="w-full flex items-center gap-4 px-4 py-3 rounded-md hover:bg-black/5 text-left">
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {activeIcon === 'collection-alt' && (<span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />)}
                    <Image src={collection1Icon} alt="About" width={18} height={18} style={{ position: 'relative', zIndex: 1, objectFit: 'contain' }} />
                  </div>
                  <span className={activeIcon === 'collection-alt' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>About</span>
                </button>
              </div>

              <div className="mt-auto mb-6 px-2">
                <button aria-pressed={activeIcon === 'settings'} onClick={() => { toggleActive('settings'); setMobileMenuOpen(false); }} aria-label="Settings" className="w-full flex items-center gap-4 px-4 py-3 rounded-md hover:bg-black/5 text-left">
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {activeIcon === 'settings' && (<span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />)}
                    <Image src={settingIcon} alt="Settings" width={18} height={18} style={{ position: 'relative', zIndex: 1, objectFit: 'contain' }} />
                  </div>
                  <span className={activeIcon === 'settings' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}



      <div className="w-full lg:ml-[96px]">
        {/* Top bar with search and user */}
        <div ref={topBarRef} className="relative z-[70] flex items-center justify-center lg:justify-between gap-4 mb-6 px-4 pt-4 lg:px-8">
          {/* Search bar (desktop only here — mobile header provided by MobileTopBar) */}
          <div className="hidden lg:block">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search..."
              initialFilters={filters}
              onApplyFilters={setFilters}
              onPickRandom={pickRandomBook}
            />
          </div>

          {/* User + username + bell (in-flow, not fixed) */}
          <div className="hidden lg:flex items-center gap-4 lg:absolute lg:right-8 lg:top-1/2" style={{ transform: 'translate(-200px, -50%)' }}>
            <div className="flex items-center gap-3">
              {/* User avatar */}
              <div className="w-10 h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden">
                <span className="text-white text-sm font-semibold">{userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}</span>
              </div>
              <span className="text-sm font-medium text-[#0C1421]">{userData?.name || 'User'}</span>
            </div>
            <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center -ml-5" style={{ transform: 'translateX(50px)' }}>
              <Image src={bellIcon} alt="Notifications" width={22} height={22} style={{ objectFit: 'contain' }} />
            </button>
          </div>
        </div>

        {/* Content section */}
        <div className="px-4 lg:px-8">
          {/* Can't find this book? */}
          {showAddHint && (
            <div className="flex items-center gap-2 mb-2">
              <a href="/add-book" className="text-sm text-[#6B4A33] underline hover:opacity-80">Can&apos;t find this book? Add it.</a>
              <button type="button" onClick={() => setShowAddHint(false)} className="text-[#6B4A33] hover:opacity-70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Search results heading + Add a book button */}
          <div className="flex flex-wrap items-start justify-center lg:justify-start gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#D0744C] text-center lg:text-left">
              Search results for &ldquo;{query}&rdquo;
            </h1>

              {/* Add a book button - responsive */}
            <a
              href="/add-book"
              aria-hidden={searchBarFilterOpen}
              className={`text-white text-sm font-medium px-4 py-2 lg:px-6 lg:py-3 lg:absolute lg:right-12 lg:top-[140px] lg:ml-0 z-50 transition-all ${searchBarFilterOpen ? 'filter blur-sm pointer-events-none opacity-60' : ''}`}
              style={{
                borderRadius: 11,
                background: 'rgba(96,53,27,1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              Add a book
            </a>
          </div>

          {/* Filter tags */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {filters.map((filter) => (
              <span key={filter} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] border border-[#C4BFB5] text-xs text-[#0C1421] bg-transparent">
                {filter}
                <button type="button" onClick={() => removeFilter(filter)} className="hover:opacity-70">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>

          {/* Book grid */}
          <section aria-live="polite">
            <div className="w-max mx-auto sm:w-full sm:mx-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
              {loading ? (
                <div className="col-span-full text-center py-12 text-[#6B4A33]">Loading books...</div>
              ) : results.length === 0 ? (
                <div className="col-span-full rounded-lg bg-white/60 border border-[#D4CFC4] p-6 text-center">No results found</div>
              ) : (
                results.map((b: any, i: number) => {
                  return (
                    <article key={b._id || i} className="flex flex-col items-center cursor-pointer group" style={{ width: 135 }}
                      onClick={() => window.location.href = `/view-detail?id=${b._id}`}>
                      {/* Book cover */}
                      <div className="relative mb-3" style={{
                        width: 135,
                        height: 197,
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 2,
                        borderBottomRightRadius: 2,
                        borderBottomLeftRadius: 6,
                        overflow: 'hidden',
                        transform: 'rotate(0deg)',
                        opacity: 1,
                        boxShadow: '-8px 11px 9px 0px rgba(0,0,0,0.47), 0px 5px 5.3px 0px rgba(255,255,255,0.25), inset 7px 0px 4px 0px rgba(0,0,0,0.45)'
                      }}>
                        {b.coverImage ? (
                          <img src={b.coverImage} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Image src={bookCover1} alt={b.title} fill className="object-cover" />
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-medium text-[#0C1421] text-center mb-1 line-clamp-1">{b.title}</h4>
                      {/* Author in orange */}
                      <p className="text-xs text-[#D0744C] text-center">{b.author?.name || b.author || 'Unknown'}</p>
                    </article>
                  );
                })
              )}
            </div>

            {results.length > 0 && results.length < totalBooks && (
              <div className="mt-8 flex justify-center">
                <button className="px-5 py-2 rounded-[20px] border border-[#D4CFC4] text-sm text-[#6B4A33] hover:bg-white/50 transition-colors" onClick={() => setResultsLimit((n) => n + 12)}>Show more</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
