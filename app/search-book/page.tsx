'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { booksApi, userApi, getImageUrl } from '../../lib/api';
import homeIcon from '../../images/home.png';
import bookIcon from '../../images/book-icon.png';
import collectionIcon from '../../images/collection.png';
import communityIcon from '../../images/community.png';
import collection1Icon from '../../images/collection1.png';
import settingIcon from '../../images/setting.png';
import sideBarLogo from '../../images/side bar logo.png';
import bellIcon from '../../images/bell.png';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import MobileDrawer from '../components/MobileDrawer';
import Sidebar from '../components/Sidebar';
import MobileTopBar from '../components/MobileTopBar';
import bookCover1 from './images/card1.png';

// Admin panel content interface
interface PageContent {
  pageTitle: string;
  searchPlaceholder: string;
  loadingText: string;
  noResultsText: string;
  showMoreText: string;
  addBookText: string;
  cantFindText: string;
  viewProfileText: string;
  menuItems: {
    home: string;
    discover: string;
    collections: string;
    reviews: string;
    about: string;
    settings: string;
  };
  defaultCoverImage: string;
}

const defaultContent: PageContent = {
  pageTitle: 'Search results for',
  searchPlaceholder: 'Search...',
  loadingText: 'Loading books...',
  noResultsText: 'No results found',
  showMoreText: 'Show more',
  addBookText: 'Add a book',
  cantFindText: "Can't find this book? Add it.",
  viewProfileText: 'View profile',
  menuItems: {
    home: 'Home',
    discover: 'Discover',
    collections: 'Collections',
    reviews: 'Reviews',
    about: 'About',
    settings: 'Settings',
  },
  defaultCoverImage: '/images/card1.png',
};

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
  const [content] = useState<PageContent>(defaultContent);

  // Backend data
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);

  // mock data for development/testing
  const MOCK_BOOKS: BookItem[] = [
    {
      _id: 'mock1',
      title: 'Mockingjay',
      author: { name: 'Suzanne Collins' },
      coverImage: '/images/card1.png',
      genres: ['Fiction', 'Adventure'],
      pageCount: 390,
      averageRating: 4.2,
    },
    {
      _id: 'mock2',
      title: 'The Time Machine',
      author: { name: 'H. G. Wells' },
      coverImage: '/images/card1.png',
      genres: ['Sci-Fi'],
      pageCount: 118,
      averageRating: 4.0,
    },
  ];
  const [userData, setUserData] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [resultsLimit, setResultsLimit] = useState(24);
  const [totalBooks, setTotalBooks] = useState(0);
  const [showAddHint, setShowAddHint] = useState(true);
  const [filters, setFilters] = useState<string[]>([]);

  // keep track of SearchBar's filter-panel open state
  const [searchBarFilterOpen, setSearchBarFilterOpen] = useState(false);

  // filter UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedPace, setSelectedPace] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  // ref used by top bar
  const topBarRef = useRef<HTMLDivElement | null>(null);

  // mobile drawer + sidebar active state
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

      const headerBottom = header ? header.getBoundingClientRect().bottom + scrollY : 0;
      const sidebarWidth = window.innerWidth >= 1024 ? 96 : 0;
      const minLeft = sidebarWidth + 12;

      let top = btnRect.bottom + scrollY + 12;

      if (top + panelRect.height > scrollY + window.innerHeight - 8) {
        const aboveTop = btnRect.top + scrollY - panelRect.height - 12;
        if (aboveTop >= headerBottom + 8) top = aboveTop;
        else top = Math.max(headerBottom + 8, scrollY + window.innerHeight - panelRect.height - 8);
      }

      let left = btnRect.left + btnRect.width / 2 - panelRect.width / 2;
      left = Math.max(minLeft, Math.min(left, window.innerWidth - panelRect.width - 8));

      const arrowLeft = btnRect.left + btnRect.width / 2 - left;
      setPanelCoords({ top, left, arrowLeft });
    };

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

  function toggleActive(id: string) {
    setActiveIcon(activeIcon === id ? null : id);
  }

  // Fetch books from backend
  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const moodFilter = selectedMoods.length > 0 ? selectedMoods[0] : undefined;
        const genreFilter = filters.find((f) => !f.includes('pace') && !f.includes('Pages'));
        const result: any = await booksApi.getAll({
          search: query || undefined,
          genre: genreFilter || undefined,
          mood: moodFilter || undefined,
          page: 1,
          limit: resultsLimit,
        });
        const fetched: BookItem[] = result?.data || [];
        setBooks(fetched);
        setTotalBooks(result?.total || result?.count || 0);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setBooks([]);
        setTotalBooks(0);
      } finally {
        setLoading(false);
      }
    }
    const debounce = setTimeout(fetchBooks, 300);
    return () => clearTimeout(debounce);
  }, [query, resultsLimit, filters, selectedMoods]);

  // Fetch user profile
  useEffect(() => {
    userApi
      .getProfile()
      .then((res: any) => setUserData(res?.data || null))
      .catch(() => {});
  }, []);

  const results = books;

  // Menu item icon component
  const MenuItemIcon = ({
    icon,
    isActive,
    alt,
  }: {
    icon: any;
    isActive: boolean;
    alt: string;
  }) => (
    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
      {isActive && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#D0744C]"
        />
      )}
      <Image
        src={icon}
        alt={alt}
        width={18}
        height={18}
        className={`relative z-[1] object-contain ${alt === 'Home' ? 'brightness-0' : ''}`}
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* Mobile top bar with search */}
      <MobileTopBar>
        <div className="flex-1">
          <SearchBar
            asHeader
            value={query}
            onChange={setQuery}
            placeholder={content.searchPlaceholder}
            initialFilters={filters}
            onApplyFilters={setFilters}
            onPickRandom={pickRandomBook}
            onFilterOpenChange={setSearchBarFilterOpen}
          />
        </div>
      </MobileTopBar>


      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[150]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-3/4 max-w-[320px] bg-[#F2F0E4] shadow-2xl flex flex-col border-r border-black/[0.15] animate-[slideIn_250ms_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 pt-4 sm:pt-5 pb-2">
              <Image src={sideBarLogo} alt="Logo" width={50} height={44} className="object-contain w-10 h-9 sm:w-[50px] sm:h-11" />
              <button
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-black/5"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="sm:w-5 sm:h-5"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#0C1421"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile user */}
            <div className="px-3 sm:px-4 pt-2 pb-3 flex items-center gap-2 sm:gap-3 border-b border-black/5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden">
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {userData?.name
                    ? userData.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'U'}
                </span>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-[#0C1421]">{userData?.name || 'User'}</div>
                <div className="text-[10px] sm:text-xs text-[#6B4A33]">{content.viewProfileText}</div>
              </div>
            </div>

            {/* Menu items */}
            <div className="flex flex-col h-full w-full">
              <div className="w-full h-full flex flex-col gap-1 sm:gap-2 px-2 pt-3 sm:pt-4 translate-y-2">
                {/* Home */}
                <button
                  aria-pressed={activeIcon === 'home'}
                  onClick={() => {
                    toggleActive('home');
                    setMobileMenuOpen(false);
                  }}
                  aria-label="Home"
                  className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md hover:bg-black/5 text-left"
                >
                  <MenuItemIcon icon={homeIcon} isActive={activeIcon === 'home'} alt="Home" />
                  <span className={`text-sm sm:text-base ${activeIcon === 'home' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}`}>
                    {content.menuItems.home}
                  </span>
                </button>

                {/* Discover */}
                <button
                  aria-pressed={activeIcon === 'library'}
                  onClick={() => {
                    toggleActive('library');
                    setMobileMenuOpen(false);
                  }}
                  aria-label="Discover"
                  className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md hover:bg-black/5 text-left"
                >
                  <MenuItemIcon icon={bookIcon} isActive={activeIcon === 'library'} alt="Discover" />
                  <span className={`text-sm sm:text-base ${activeIcon === 'library' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}`}>
                    {content.menuItems.discover}
                  </span>
                </button>

                {/* Collections */}
                <button
                  aria-pressed={activeIcon === 'collection'}
                  onClick={() => {
                    toggleActive('collection');
                    setMobileMenuOpen(false);
                  }}
                  aria-label="Collections"
                  className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md hover:bg-black/5 text-left"
                >
                  <MenuItemIcon icon={collectionIcon} isActive={activeIcon === 'collection'} alt="Collections" />
                  <span className={`text-sm sm:text-base ${activeIcon === 'collection' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}`}>
                    {content.menuItems.collections}
                  </span>
                </button>

                {/* Reviews */}
                <button
                  aria-pressed={activeIcon === 'community'}
                  onClick={() => {
                    toggleActive('community');
                    setMobileMenuOpen(false);
                  }}
                  aria-label="Reviews"
                  className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md hover:bg-black/5 text-left"
                >
                  <MenuItemIcon icon={communityIcon} isActive={activeIcon === 'community'} alt="Reviews" />
                  <span className={`text-sm sm:text-base ${activeIcon === 'community' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}`}>
                    {content.menuItems.reviews}
                  </span>
                </button>

                {/* About */}
                <button
                  aria-pressed={activeIcon === 'collection-alt'}
                  onClick={() => {
                    toggleActive('collection-alt');
                    setMobileMenuOpen(false);
                  }}
                  aria-label="About"
                  className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md hover:bg-black/5 text-left"
                >
                  <MenuItemIcon icon={collection1Icon} isActive={activeIcon === 'collection-alt'} alt="About" />
                  <span className={`text-sm sm:text-base ${activeIcon === 'collection-alt' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}`}>
                    {content.menuItems.about}
                  </span>
                </button>
              </div>

              {/* Settings at bottom */}
              <div className="mt-auto mb-4 sm:mb-6 px-2">
                <button
                  aria-pressed={activeIcon === 'settings'}
                  onClick={() => {
                    toggleActive('settings');
                    setMobileMenuOpen(false);
                  }}
                  aria-label="Settings"
                  className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md hover:bg-black/5 text-left"
                >
                  <MenuItemIcon icon={settingIcon} isActive={activeIcon === 'settings'} alt="Settings" />
                  <span className={`text-sm sm:text-base ${activeIcon === 'settings' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}`}>
                    {content.menuItems.settings}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="w-full lg:ml-[96px] pt-16 sm:pt-6">
        {/* Top bar with search and user */}
        <div ref={topBarRef}>
          <TopBar
            query={query}
            setQuery={setQuery}
            placeholder={content.searchPlaceholder}
            filters={filters}
            setFilters={setFilters}
            pickRandomBook={pickRandomBook}
            setSearchBarFilterOpen={setSearchBarFilterOpen}
          />
        </div>

        {/* Content section */}
        <div className="px-3 sm:px-4 lg:px-8">
          {/* Can't find this book? */}
          {showAddHint && (
            <div className="flex items-center gap-2 mb-2">
              <a href="/add-book" className="text-xs sm:text-sm text-[#6B4A33] underline hover:opacity-80">
                {content.cantFindText}
              </a>
              <button type="button" onClick={() => setShowAddHint(false)} className="text-[#6B4A33] hover:opacity-70">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-3.5 sm:h-3.5">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Search results heading + Add a book button */}
          <div className="flex flex-wrap items-start justify-center lg:justify-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#D0744C] text-center lg:text-left">
              {content.pageTitle} &ldquo;{query}&rdquo;
            </h1>

            {/* Add a book button */}
            <a
              href="/add-book"
              aria-hidden={searchBarFilterOpen}
              className={`
                text-white text-xs sm:text-sm font-medium
                px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3
                rounded-[11px] bg-[#60351B]
                inline-flex items-center justify-center
                whitespace-nowrap z-50 transition-all
                lg:absolute lg:right-12 lg:top-[140px]
                ${searchBarFilterOpen ? 'blur-sm pointer-events-none opacity-60' : ''}
              `}
            >
              {content.addBookText}
            </a>
          </div>

          {/* Filter tags */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
            {filters.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[20px] border border-[#C4BFB5] text-[10px] sm:text-xs text-[#0C1421] bg-transparent"
              >
                {filter}
                <button type="button" onClick={() => removeFilter(filter)} className="hover:opacity-70">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-3 sm:h-3">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </span>
            ))}
          </div>

          {/* Book grid */}
          <section aria-live="polite">
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 justify-items-center">
              {loading ? (
                <div className="col-span-full text-center py-8 sm:py-12 text-[#6B4A33] text-sm sm:text-base">
                  {content.loadingText}
                </div>
              ) : results.length === 0 ? (
                <div className="col-span-full rounded-lg bg-white/60 border border-[#D4CFC4] p-4 sm:p-6 text-center text-sm sm:text-base">
                  {content.noResultsText}
                </div>
              ) : (
                results.map((b: any, i: number) => (
                  <article
                    key={b._id || i}
                    className="flex flex-col items-center cursor-pointer group w-full max-w-[135px]"
                    onClick={() => (window.location.href = `/view-detail?id=${b._id}`)}
                  >
                    {/* Book cover */}
                    <div className="relative mb-2 sm:mb-3 w-[100px] sm:w-[120px] md:w-[135px] aspect-[135/197] rounded-tl-md rounded-tr-sm rounded-br-sm rounded-bl-md overflow-hidden shadow-[inset_7px_0px_4px_0px_rgba(0,0,0,0.45),-8px_11px_9px_0px_rgba(0,0,0,0.47),0px_5px_5.3px_0px_rgba(255,255,255,0.25)]">
                      {b.coverImage ? (
                        <img src={getImageUrl(b.coverImage)} alt={b.title} className="w-full h-full object-cover" />
                      ) : (
                        <Image src={bookCover1} alt={b.title} fill className="object-cover" />
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-xs sm:text-sm font-medium text-[#0C1421] text-center mb-0.5 sm:mb-1 line-clamp-1">
                      {b.title}
                    </h4>
                    {/* Author */}
                    <p className="text-[10px] sm:text-xs text-[#D0744C] text-center">
                      {b.author?.name || b.author || 'Unknown'}
                    </p>
                  </article>
                ))
              )}
            </div>

            {/* Show more button */}
            {results.length > 0 && results.length < totalBooks && (
              <div className="mt-6 sm:mt-8 flex justify-center">
                <button
                  className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-[20px] border border-[#D4CFC4] text-xs sm:text-sm text-[#6B4A33] hover:bg-white/50 transition-colors"
                  onClick={() => setResultsLimit((n) => n + 12)}
                >
                  {content.showMoreText}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
