'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { booksApi, reviewsApi, userApi, recommendationsApi } from '../../lib/api';
import homeIcon from '../../images/home.png';
import bookIcon from '../../images/book-icon.png';
import collectionIcon from '../../images/collection.png';
import communityIcon from '../../images/community.png';
import collection1Icon from '../../images/collection1.png';
import settingIcon from '../../images/setting.png';
import sideBarLogo from '../../images/side bar logo.png';
import bellIcon from '../../images/bell.png';
import user2 from '../../images/human.png';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import MobileDrawer from '../components/MobileDrawer';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import bookCoverMain from '../../images/Book cover (7).png';
import bookCover1 from '../../images/Book cover (8).png';
import bookCover2 from '../../images/Book cover (8).png';
import bookCover3 from '../../images/Book cover (8).png';
import bookCover4 from '../../images/Book cover (8).png';
import bookCover5 from '../../images/Book cover (8).png';
import bookCover6 from '../../images/Book cover (8).png';
import newsImg from '../../images/news.png';
import news1Img from '../../images/news1.png';
import news2Img from '../../images/news2.png';
import news3Img from '../../images/news3.png';
import news4Img from '../../images/news4.png';
import paceIcon from '../../images/pace.png';
import plotIcon from '../../images/plot.png';
import charactersIcon from '../../images/characters.png';
import diverseIcon from '../../images/diverse.png';
import flawsIcon from '../../images/flaws.png';
import likeImg from '../../images/like.png';
import pencilIcon from '../../images/pencil.png';
import downArrowIcon from '../../images/down arrow.png';
import shareImg from '../../images/share.png';
import bookmarkImg from '../../images/bookmark.png';
import unlikeImg from '../../images/unlike.png';

// Inner component that uses useSearchParams
function ViewDetailContent(): JSX.Element {
  // URL params
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  // Backend data
  const [bookData, setBookData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);

  // Sidebar / header state (use shared MobileMenuContext)
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon, setMobileMenuOpen } = useMobileMenu();

  // Fetch book data
  useEffect(() => {
    async function fetchData() {
      try {
        setBookLoading(true);
        const [bookRes, userRes]: any[] = await Promise.all([
          bookId ? booksApi.getById(bookId).catch(() => null) : Promise.resolve(null),
          userApi.getProfile().catch(() => null),
        ]);
        setBookData(bookRes?.data || null);
        setUserData(userRes?.data || null);

        if (bookId) {
          const [reviewsRes, similarRes]: any[] = await Promise.all([
            reviewsApi.getByBook(bookId).catch(() => ({ data: [] })),
            recommendationsApi.getSimilar(bookId, 6).catch(() => ({ data: [] })),
          ]);
          setReviews(reviewsRes?.data || []);
          setSimilarBooks(similarRes?.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch book data:', err);
      } finally {
        setBookLoading(false);
      }
    }
    fetchData();
  }, [bookId]);

  // Search + filter panel state (small copy of dashboard behaviour)
  const MOODS = ['Adventurous', 'Hopeful', 'Funny', 'Reflective', 'Challenging', 'Informative', 'Relaxing', 'Dark', 'Inspiring', 'Lighthearted'];
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [matchAllMoods, setMatchAllMoods] = useState(false);
  const [selectedPace, setSelectedPace] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState<string>('');
  const [filters, setFilters] = useState<string[]>(['Adventures', 'Fiction']);
  const [authorExpanded, setAuthorExpanded] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  // search filter open state
  const topBarRef = useRef<HTMLDivElement | null>(null);

  function pickRandomBook() {
    const POOL = ['The Cambers of Secrets', 'The Remains of the Day', 'Little Women', 'The Merge'];
    const rnd = POOL[Math.floor(Math.random() * POOL.length)];
    setMobileSearchQuery(rnd);
  }

  const [reviewOpen, setReviewOpen] = useState(false);

  // Review form state
  const [reviewStarRating, setReviewStarRating] = useState<number>(0);
  const [reviewBookShelf, setReviewBookShelf] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState<string | null>(null);
  const [reviewPace, setReviewPace] = useState<string[]>([]);
  const [reviewContent, setReviewContent] = useState<string>('');

  // Shelf-picker (small modal shown when user clicks "want to read")
  const [shelfPickerOpen, setShelfPickerOpen] = useState(false);
  const [shelfPickerSelection, setShelfPickerSelection] = useState<string>('to read');
  const [bookShelf, setBookShelf] = useState<string | null>(null);

  function toggleReviewPace(p: string) {
    setReviewPace((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }
  function resetReviewForm() {
    setReviewStarRating(0);
    setReviewBookShelf(null);
    setReviewReason(null);
    setReviewPace([]);
    setReviewContent('');
  }

  function confirmShelfSelection() {
    setBookShelf(shelfPickerSelection);
    // also update review modal shelf if user later opens it
    setReviewBookShelf(shelfPickerSelection);
    setShelfPickerOpen(false);
  }

  function removeFilter(filter: string) {
    setFilters((prev) => prev.filter((f) => f !== filter));
  }

  // Mobile filter panel state + helpers (added to fix missing references)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  function toggleMood(m: string) { setSelectedMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])); }
  function togglePageRange(r: string) { setSelectedPages((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])); }
  function handleMobileApplyFilters() {
    const newFilters: string[] = [];
    selectedMoods.forEach((m) => newFilters.push(m));
    if (selectedPace) newFilters.push(selectedPace + ' pace');
    if (selectedType) newFilters.push(selectedType);
    selectedPages.forEach((p) => newFilters.push(`Pages ${p}`));
    setFilters(newFilters);
    setMobileFilterOpen(false);
  }



  useEffect(() => {
    const open = reviewOpen || shelfPickerOpen;
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarCompensation = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarCompensation > 0) document.body.style.paddingRight = `${scrollBarCompensation}px`;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || '';
      document.body.style.paddingRight = prevPaddingRight || '';
    };
  }, [reviewOpen, shelfPickerOpen]);

  // modal refs + focus-trap so keyboard focus and interaction stay inside the review dialog
  const modalRef = useRef<HTMLDivElement | null>(null);
  const reviewTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // shelf picker ref (small dialog)
  const shelfPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!reviewOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = Array.from(modal.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setReviewOpen(false); return; }
      if (e.key === 'Tab') {
        if (focusable.length === 0) { e.preventDefault(); return; }
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); (last as HTMLElement).focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); (first as HTMLElement).focus(); }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    // autofocus textarea (preferred) or fallback to first focusable element
    (reviewTextareaRef.current ?? first)?.focus?.();

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [reviewOpen]);

  useEffect(() => {
    if (!shelfPickerOpen) return;
    const el = shelfPickerRef.current;
    if (!el) return;

    const focusable = Array.from(el.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShelfPickerOpen(false); return; }
      if (e.key === 'Tab') {
        if (focusable.length === 0) { e.preventDefault(); return; }
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); (last as HTMLElement).focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); (first as HTMLElement).focus(); }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    (first ?? shelfPickerRef.current)?.focus?.();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shelfPickerOpen]);

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">

      {shelfPickerOpen && (
        <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.25)', zIndex: 995, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShelfPickerOpen(false)}>
          <div
            ref={shelfPickerRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 335.4201965332031,
              maxWidth: 'calc(100% - 48px)',
              height: 305.90496826171875,
              maxHeight: 'calc(100% - 48px)',
              background: 'rgba(228, 221, 209, 1)',
              border: '1.5px solid rgba(96, 53, 27, 0.2)',
              boxShadow: '0px 6px 20px rgba(33,12,0,0.12)',
              borderRadius: 22,
              zIndex: 996,
              padding: 18,
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(33,12,0,1)' }}>Choose shelf for this book</div>
              <button aria-label="Close shelf picker" onClick={() => setShelfPickerOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#210C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
              {['to read', 'currently reading', 'read'].map(option => {
                const selected = shelfPickerSelection === option;
                return (
                  <button
                    key={option}
                    onClick={() => setShelfPickerSelection(option)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '10px 18px',
                      borderRadius: 9999,
                      border: `1.5px solid ${selected ? '#60351B' : 'rgba(33,12,0,0.12)'}`,
                      background: selected ? '#fff' : 'transparent',
                      color: '#210C00',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    {selected && (
                      <svg width="14" height="14" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                    <span style={{ textTransform: 'capitalize' }}>{option}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={confirmShelfSelection}
                style={{ padding: '10px 40px', borderRadius: 9999, background: '#60351B', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />

      {/* ============ MOBILE LAYOUT (shows only on screens below lg) ============ */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#F2F0E4] px-4 py-3 flex items-center justify-between border-b border-[#210c00]/10">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              aria-label="Menu" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#60351B]/10 transition-colors active:scale-95"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="#60351B" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <Image src={sideBarLogo} alt="Logo" width={40} height={36} className="object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center">
              <Image src={bellIcon} alt="Notifications" width={22} height={22} style={{ objectFit: 'contain' }} />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#D0744C] flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setMobileMenuOpen(false)}>
            <div 
              className="w-3/4 max-w-[320px] h-full bg-[#F2F0E4] shadow-2xl flex flex-col"
              style={{ borderRight: '0.3px solid rgba(0,0,0,0.15)', animation: 'slideIn 250ms ease-out' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header with logo and close */}
              <div className="flex items-center justify-between px-4 pt-5 pb-2">
                <Image src={sideBarLogo} alt="Logo" width={50} height={44} className="object-contain" />
                <button 
                  aria-label="Close menu" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* User profile section */}
              <div className="px-4 pt-2 pb-3 flex items-center gap-3 border-b border-black/5">
                <div className="w-10 h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden">
                  <span className="text-white text-sm font-semibold">{userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#0C1421]">{userData?.name || 'User'}</div>
                  <div className="text-xs text-[#6B4A33]">View profile</div>
                </div>
              </div>

              {/* Navigation menu */}
              <nav className="flex flex-col gap-1 px-2 pt-4 flex-1">
                {[
                  { icon: homeIcon, label: 'Home', active: activeIcon === 'home' },
                  { icon: bookIcon, label: 'Discover', active: activeIcon === 'library' },
                  { icon: collectionIcon, label: 'Collections', active: activeIcon === 'collection' },
                  { icon: communityIcon, label: 'Community', active: activeIcon === 'community' },
                  { icon: collection1Icon, label: 'About', active: activeIcon === 'about' }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setActiveIcon(item.label.toLowerCase()); setMobileMenuOpen(false); }}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-[#60351B]/10 transition-colors text-left"
                  >
                    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                      {item.active && (
                        <span 
                          aria-hidden 
                          className="absolute inset-0 rounded-full bg-[#D0744C]" 
                          style={{ width: 40, height: 40, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                        />
                      )}
                      <Image 
                        src={item.icon} 
                        alt={item.label} 
                        width={20} 
                        height={20} 
                        className="object-contain relative z-10"
                        style={{ filter: item.active ? 'brightness(0)' : undefined }}
                      />
                    </div>
                    <span className={item.active ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>

              {/* Settings at bottom */}
              <div className="px-2 pb-6 border-t border-black/5 pt-2">
                <button 
                  onClick={() => { setActiveIcon('settings'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-[#60351B]/10 transition-colors text-left w-full"
                >
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {activeIcon === 'settings' && (
                      <span 
                        aria-hidden 
                        className="absolute inset-0 rounded-full bg-[#D0744C]" 
                        style={{ width: 40, height: 40, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                      />
                    )}
                    <Image 
                      src={settingIcon} 
                      alt="Settings" 
                      width={20} 
                      height={20} 
                      className="object-contain relative z-10"
                    />
                  </div>
                  <span className={activeIcon === 'settings' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>
                    Settings
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Filter Panel Overlay */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-[70] bg-black/40" onClick={() => setMobileFilterOpen(false)}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-[#F6F1EA] rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button 
                aria-label="Close filters" 
                onClick={() => setMobileFilterOpen(false)} 
                className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              <h2 className="text-lg font-semibold text-[#0C1421] mb-1 pr-10">Filter all books</h2>
              <p className="text-sm text-[#6B4A33] mb-4">I&apos;m in the mood for something...</p>

              {/* Moods grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {MOODS.map((m) => {
                  const sel = selectedMoods.includes(m);
                  return (
                    <button key={m} type="button" onClick={() => toggleMood(m)} className="flex items-center gap-2 text-sm text-[#0C1421]">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-sm border-2 ${sel ? 'bg-[#5F3824] border-[#5F3824] text-white' : 'border-[#60351B]'}`}>
                        {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </span>
                      <span className="capitalize">{m}</span>
                    </button>
                  );
                })}
              </div>

              {/* Any / All moods */}
              <div className="mb-4">
                <div className="text-sm text-[#6B4A33] mb-2">Show books with...</div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => setMatchAllMoods(false)} className="flex items-center gap-2 text-sm">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${!matchAllMoods ? 'border-[#5F3824] bg-[#5F3824]' : 'border-[#C4BFB5]'}`} />
                    <span>any of the selected moods</span>
                  </button>
                  <button type="button" onClick={() => setMatchAllMoods(true)} className="flex items-center gap-2 text-sm">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${matchAllMoods ? 'border-[#5F3824] bg-[#5F3824]' : 'border-[#C4BFB5]'}`} />
                    <span>all of the selected moods</span>
                  </button>
                </div>
              </div>

              {/* Pace */}
              <div className="mb-4">
                <div className="text-sm text-[#6B4A33] mb-2">Pace</div>
                <div className="flex flex-wrap items-center gap-4">
                  {['Slow','Medium','Fast'].map((p) => (
                    <button key={p} type="button" onClick={() => setSelectedPace(p)} className={`flex items-center gap-2 text-sm ${selectedPace === p ? 'text-[#0C1421]' : 'text-[#6B4A33]'}`}>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPace === p ? 'border-[#5F3824] bg-[#5F3824]' : 'border-[#60351B]'}`} />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="mb-4">
                <div className="text-sm text-[#6B4A33] mb-2">Type</div>
                <div className="flex flex-wrap items-center gap-4">
                  {['Fiction','Non-Fiction'].map((t) => (
                    <button key={t} type="button" onClick={() => setSelectedType(t)} className={`flex items-center gap-2 text-sm ${selectedType === t ? 'text-[#0C1421]' : 'text-[#6B4A33]'}`}>
                      <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${selectedType === t ? 'border-[#5F3824] bg-[#5F3824]' : 'border-[#60351B]'}`} />
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages */}
              <div className="mb-4">
                <div className="text-sm text-[#6B4A33] mb-2">Pages</div>
                <div className="flex flex-wrap items-center gap-4">
                  {['<200','<500-600','800+'].map((r) => {
                    const sel = selectedPages.includes(r);
                    return (
                      <button key={r} type="button" onClick={() => togglePageRange(r)} className="flex items-center gap-2 text-sm text-[#0C1421]">
                        <span className={`w-5 h-5 flex items-center justify-center rounded-sm border-2 ${sel ? 'bg-[#5F3824] border-[#5F3824] text-white' : 'border-[#60351B]'}`}>
                          {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={pickRandomBook}
                  className="flex-1 px-4 py-2.5 rounded-full border border-[#210C00] text-sm font-medium hover:bg-white/50 transition-colors"
                >
                  Pick a random book
                </button>
                <button
                  type="button"
                  onClick={handleMobileApplyFilters}
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#60351B] text-white text-sm font-medium"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <div className="pt-16 px-4 pb-8">
          {/* NOTE: header search is now provided by the global MobileTopBar; removed duplicate SearchBar from here */}

          {/* Filter pills (kept) */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((filter, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#60351B]/15 text-xs text-[#210c00]">
                  <span>{filter}</span>
                  <button onClick={() => removeFilter(filter)} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/10">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="#210c00" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#60351B]/10 rounded-xl p-4 mb-6">
            <div className="flex gap-4">
              {bookData?.coverImage ? (
                <img src={bookData.coverImage} alt="Book Cover" width={120} height={180} className="rounded-lg object-cover flex-shrink-0" style={{ width: 120, height: 180 }} />
              ) : (
                <Image src={bookCoverMain} alt="Book Cover" width={120} height={180} className="rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-lg leading-tight text-[#210c00] mb-2">{bookData?.title || 'Loading...'}</h1>
                <p className="text-sm text-[#210c00]/70 font-medium mb-2">~ {bookData?.author?.name || 'Unknown Author'}</p>
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)">
                      <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-[#3A1B08]/80">{bookData?.ratingsCount || 0} ratings • {reviews.length} reviews</p>
                <p className="text-xs text-[#3A1B08] mt-1">{bookData?.pageCount || 0} pages • {bookData?.format || 'paperback'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShelfPickerSelection('to read'); setShelfPickerOpen(true); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-[#210c00] text-sm">
                <Image src={pencilIcon} alt="" width={14} height={14} />
                <span>{bookShelf ?? 'want to read'}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#60351B] text-white text-sm">
                Buy
                <Image src={downArrowIcon} alt="" width={10} height={10} className="brightness-[10]" />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#60351B]/15 flex items-center justify-center">
                <Image src={bookmarkImg} alt="Bookmark" width={16} height={16} />
              </button>
            </div>
          </div>

          {/* About Author */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-[#3A1B08] mb-3">About the Author</h3>
            <div className="flex items-start gap-3">
              <Image src={user2} alt="Author" width={44} height={44} className="rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#3A1B08]">{bookData?.author?.name || 'Author'}</p>
                    <p className="text-xs text-[#210c00]/70">{bookData?.author?.booksPublished || 0} books</p>
                  </div>
                  <button className="px-4 py-1 text-xs rounded-full bg-[#60351B]/20">Follow</button>
                </div>
                <p className="text-sm text-[#210c00]/60 mt-2 leading-relaxed">
                  {bookData?.author?.bio || 'No author biography available.'}
                </p>
                <button onClick={() => setAuthorExpanded(!authorExpanded)} className="text-sm text-[#3A1B08]/80 underline decoration-dotted mt-1">
                  {authorExpanded ? 'Show less' : 'Show more'}
                </button>
              </div>
            </div>
          </div>

          {/* Genre Tags */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-[#210c00]/90 mb-3">Genre & Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(bookData?.genres || ['Fiction']).map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 text-xs rounded-full border border-[#210c00] bg-[#60351B]/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#210c00]/90 mb-2">Description</h3>
            <p className="text-sm text-[#210c00]/60 leading-relaxed">
              {bookData?.description || 'No description available.'}
            </p>
          </div>

          {/* Images Grid */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#210c00]/90 mb-2">Images</h3>
            <div className="grid grid-cols-2 gap-2">
              <Image src={news1Img} alt="" width={150} height={100} className="rounded border border-[#210c00] object-cover w-full" />
              <Image src={news2Img} alt="" width={150} height={100} className="rounded border border-[#210c00] object-cover w-full" />
            </div>
          </div>

          {/* Ratings */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-[#210c00]/90 mb-3">Community Ratings</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl font-semibold text-[#210c00]">4.5</span>
              <div className="flex-1">
                {[{l:'5',p:'75%'},{l:'4',p:'12%'},{l:'3',p:'6%'},{l:'2',p:'2%'},{l:'1',p:'5%'}].map((b,i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <span className="w-3 text-xs">{b.l}</span>
                    <div className="flex-1 h-2 bg-[#210c00]/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#60351B] rounded-full" style={{width: b.p}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-[#210c00] mb-3">Reader Reviews</h3>
            {[1,2].map(idx => (
              <div key={idx} className="flex gap-3 mb-4 last:mb-0">
                <Image src={user2} alt="" width={40} height={40} className="rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[#210c00]">Kun Jong unn</p>
                    <button className="px-3 py-0.5 text-xs rounded-full bg-[#60351B]/20">Follow</button>
                  </div>
                  <p className="text-xs text-[#210c00]/60 mb-1">234k followers • 54 Reviews</p>
                  <p className="text-xs text-[#210c00]/70 leading-relaxed line-clamp-4">
                    {reviews[0]?.content || 'No review content available.'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)">
                        <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
                      </svg>
                    ))}
                    <span className="text-xs text-[#60351B]/80">24 Sep 2025</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* More Editions */}
          <div className="bg-[#60351B]/20 -mx-4 px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[#210c00]">More Editions</h3>
              <Link href="/search-book" className="text-sm text-[#CC3E00]/80 underline decoration-dotted">View all</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(similarBooks.length > 0 ? similarBooks.slice(0,3) : []).map((book: any, i: number) => (
                <div key={i} className="flex flex-col items-center cursor-pointer" onClick={() => { window.location.href = '/view-detail?id=' + book._id; }}>
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} width={90} height={130} className="rounded-lg object-cover shadow-md" style={{ width: 90, height: 130 }} />
                  ) : (
                    <Image src={bookCover1} alt={book.title || ''} width={90} height={130} className="rounded-lg object-cover shadow-md" />
                  )}
                  <p className="text-xs font-medium text-black mt-2 text-center">{book.title || 'Book name'}</p>
                  <p className="text-xs text-[#CC3E00] text-center">{book.author?.name || 'Author'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#210c00]/30 text-center">
            <p className="text-xs text-[#210c00]/60">© 2026 Copyright All Rights Reserved</p>
            <div className="flex justify-center gap-4 mt-3">
              {['Home', 'About', 'Careers', 'Blog'].map((l, i) => (
                <a key={i} href="#" className="text-xs text-[#210c00]/60">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ============ END MOBILE LAYOUT ============ */}

      {/* ============ DESKTOP LAYOUT (shows only on lg and above) ============ */}
      <div className="hidden lg:block">
      {/* Top area: keep search + user */}
      <div className="px-4 lg:px-8 pb-12 mt-2 lg:mt-6">
        <div style={{ position: 'relative' }} ref={topBarRef}>
          {/* mobile bell moved to MobileTopBar */}

          <div className="hidden lg:block lg:ml-24">
            <SearchBar
              value={mobileSearchQuery}
              onChange={setMobileSearchQuery}
              placeholder="Search Book by name, author"
              initialFilters={filters}
              onApplyFilters={setFilters}
              onPickRandom={pickRandomBook}
              onFilterOpenChange={setSearchFilterOpen}
            />
          </div>

          {/* Desktop user block */}
          <div className="hidden lg:flex" style={{ position: 'absolute', top: 8, left: 680, width: 199, height: 45, alignItems: 'center', display: 'flex', gap: 12, boxSizing: 'border-box', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="w-10 h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden" style={{ flex: '0 0 auto' }}>
                <span className="text-white text-sm font-semibold">AR</span>
              </div>
              <span style={{ display: 'inline', maxWidth: 110, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 14, color: '#0C1421', fontWeight: 500 }}>{userData?.name || 'User'}</span>
            </div>
            <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <Image src={bellIcon} alt="Notifications" width={22} height={22} style={{ objectFit: 'contain' }} />
            </button>
          </div>

          <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 1124.34,
            top: 629.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>

          </div>

        {/* Decorative large panel (requested exact size/position) */}
        <div aria-hidden style={{
          position: 'absolute',
          width: 1100.3935546875,
          height: 3010.3759765625,
          top: 430,
          left: 216.5,
          opacity: 1,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderLeft: '0.5px solid rgba(33, 12, 0, 0.15)',
          borderRight: '0.5px solid rgba(33, 12, 0, 0.15)',
          background: 'rgba(96, 53, 27, 0.1)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {bookData?.coverImage ? (
          <img src={bookData.coverImage} alt="book-cover" style={{
            position: 'absolute',
            left: 404,
            top: 160.05,
            width: 263.0050048828125,
            height: 425.50030517578125,
            borderTopLeftRadius: 6,
            objectFit: 'cover',
            zIndex: 15
          }} />
        ) : (
          <Image src={bookCoverMain} alt="book-cover" width={263.0050048828125} height={385.50030517578125} style={{
            position: 'absolute',
            left: 404,
            top: 160.05,
            width: 263.0050048828125,
            height: 425.50030517578125,
            borderTopLeftRadius: 6,
            objectFit: 'cover',
            zIndex: 15
          }} />
        )}

  

        {/* Absolute title (exact coordinates & typography) */}
        <div style={{
          position: 'absolute',
          left: 768.77,
          top: 154.49,
          width: 428.0732421875,
          height: 147,
          fontFamily: 'Times New Roman, Times, serif',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '43px',
          lineHeight: '100%',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          zIndex: 16
        }}>{bookData?.title || 'Loading...'}</div>

        <div style={{
          position: 'absolute',
          left: 768.94,
          top: 313.49,
          width: 200,
          height: 18,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 700,
          fontStyle: 'normal',
          fontSize: 15,
          lineHeight: '100%',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.7)',
          boxSizing: 'border-box',
          zIndex: 16,
          display: 'flex',
          alignItems: 'center'
        }}>~ {bookData?.author?.name || 'Unknown Author'}</div>

        {/* Five stars (exact size/color/position) */}
        <div aria-hidden style={{
          position: 'absolute',
          left: 768.94,
          top: 357.59,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          left: 893.05,
          top: 357.59,
          width: 198,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 12,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 0.8)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>4,113,458 ratings • 99,449 reviews</div>

        <div onClick={() => { setShelfPickerSelection('to read'); setShelfPickerOpen(true); }} role="button" aria-label="want-to-read" style={{
          position: 'absolute',
          left: 769,
          top: 466,
          width: 157,
          height: 35,
          paddingTop: 8,
          paddingRight: 15,
          paddingBottom: 8,
          paddingLeft: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderRadius: 40,
          border: '1px solid rgba(33, 12, 0, 1)',
          boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
          background: 'transparent',
          cursor: 'pointer',
          zIndex: 18
        }}>
          <Image src={pencilIcon} alt="pencil" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 14, color: 'rgba(33,12,0,1)' }}>want to read</span>
        </div>

        <div role="button" aria-label="buy" style={{
          position: 'absolute',
          left: 937,
          top: 466,
          width: 88,
          height: 35,
          paddingTop: 8,
          paddingRight: 15,
          paddingBottom: 8,
          paddingLeft: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 40,
          background: 'rgba(96, 53, 27, 1)',
          boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 18
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8,marginLeft:10 }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: '#fff' }}>Buy</span>
            <Image src={downArrowIcon} alt="down" width={12} height={12} style={{ width: 12, height: 12, objectFit: 'contain', filter: 'brightness(10)' }} />
          </span>
        </div>

        <div role="button" aria-label="bookmark" style={{
          position: 'absolute',
          left: 1090.05,
          top: 466,
          width: 35,
          height: 35,
          borderRadius: 9999,
          background: 'rgba(96, 53, 27, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 18
        }}>
          <Image src={shareImg} alt="bookmark" width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
        </div>
                <div role="button" aria-label="bookmark" style={{
          position: 'absolute',
          left: 1140.05,
          top: 466,
          width: 35,
          height: 35,
          borderRadius: 9999,
          background: 'rgba(96, 53, 27, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 18
        }}>
          <Image src={bookmarkImg} alt="bookmark" width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
        </div>
        <div style={{
          position: 'absolute',
          left: 768.94,
          top: 383.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 1)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>341 pages • hardcover • first pub 1998</div>
        <div aria-hidden style={{
          position: 'absolute',
          left: 768.77,
          top: 544.62,
          width: 428.0794372558594,
          height: 0,
          opacity: 1,
          borderTop: '1px solid rgba(96, 53, 27, 0.2)',
          boxSizing: 'border-box',
          zIndex: 16
        }} />
                <div style={{
          position: 'absolute',
          left: 815.33,
          top: 645.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
                <div style={{
          position: 'absolute',
          left: 805.94,
          top: 603.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'mediun',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 1)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>About the Author</div>

        <div style={{
          position: 'absolute',
          left: 805.94,
          top: 1050.82,
          width: 359,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Editors</div>

        <div style={{
          position: 'absolute',
          left: 805.94,
          top: 1076.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>J.K. Rowling (author), Christopher Reath, Alena Cestabon. Steve Korg</div>

          <div style={{
          position: 'absolute',
          left: 885.94,
          top: 653.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'mediun',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 1)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>{bookData?.author?.name || 'Unknown Author'} </div>
        <div style={{
          position: 'absolute',
          left: 885.94,
          top: 673.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'mediu,',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.8)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>{bookData?.author?.booksCount || 0} books • {bookData?.author?.followersCount || 0} followers </div>
                <div style={{
          position: 'absolute',
          left: 805.94,
          top: 685.82,
          width: 352.6,
          height: 114,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16,
          justifyContent:'center',
          alignContent:'center'
        }}>Although she writes under the pen name J.K. Rowling, pronounced like rolling, 
        her name when her first Harry Potter book was published was simply Joanne Rowling. 
        Anticipating that the target audience of young boys might not want... </div>
        <div role="button" aria-label="show-more-author" onClick={() => setAuthorExpanded(prev => !prev)} style={{
          position: 'absolute',
          left: 805.94,
          top: 800.64,
          width: 100.734375,
          height: 17,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 0.8)',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textDecorationThickness: '7%',
          textDecorationSkipInk: 'auto',
          cursor: 'pointer',
          opacity: 1,
          boxSizing: 'border-box',
          zIndex: 16,
          display: 'flex',
          alignItems: 'center',
        }}>{authorExpanded ? 'Show less' : 'Show more'}</div>

        
                  {/* Genre & Tags (replicated under Follow) */}
          <div style={{
            position: 'absolute',
            left: 800.34,
            top: 828.4,
            width: 360,
            boxSizing: 'border-box',
            zIndex: 78
          }}>
            <div style={{
              fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
              fontWeight: 510,
              fontSize: 16,
              lineHeight: '22px',
              color: 'rgba(33,12,0,0.9)',
              marginBottom: 10
            }}>Genre & Tags</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              {(bookData?.genres || ['Fiction']).map((genre: string, i: number) => (
                <div key={i} style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>{genre}</div>
              ))}
              {(bookData?.moods || []).map((mood: string, i: number) => (
                <div key={`mood-${i}`} style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>{mood}</div>
              ))}
            </div>
            
        <div style={{
          position: 'absolute',
          left: 5.94,
          top: 300.82,
          width: 359,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Languages</div>
                <div style={{
          position: 'absolute',
          left: 5.94,
          top: 325.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Standard English (USA & IJK)</div>
        <div style={{
          position: 'absolute',
          left: 5.94,
          top: 360.82,
          width: 359,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Paperback</div>
        <div style={{
          position: 'absolute',
          left: 5.94,
          top: 385.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>paper textured, full colour, 345 pages
ISBN: 987 3 32564 455 B</div>
<div style={{
          position: 'absolute',
          left: 5.94,
          top: 438.82,
          width: 359,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Reviewed By</div>
        <div style={{
          position: 'absolute',
          left: 5.33,
          top: 470.94,
          width: 36,
          height: 36,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          left: 55.94,
          top: 470.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'regular',
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 1)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>J. K. Rowlings </div>
                <div style={{
          position: 'absolute',
          left: 5.94,
          top: 385.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>        <div style={{
          position: 'absolute',
          left: 48.94,
          top: 105.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 10,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>679 books • 234k followers</div></div>
        <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 384.34,
            top: 449.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>

          </div>
        <div style={{
          position: 'absolute',
          left: 337,
          top: 614.05,
          width: 453,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Description</div>

        <div style={{
          position: 'absolute',
          left: 337,
          top: 640.05,
          width: 409.17529296875,
          height: 342,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16,
          overflow: 'hidden'
        }}>
          <p style={{ margin: 0 }}>
            {bookData?.description || 'Loading description...'}
          </p>
        </div>

        <div style={{
          position: 'absolute',
          left: 337.33,
          top: 995.57,
          width: 408.638671875,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Images</div>

        <Image src={news1Img} alt="news1" width={256.607421875} height={150.18008422851562} style={{
          position: 'absolute',
          left: 337.33,
          top: 1028.5,
          width: 256.607421875,
          height: 150.18008422851562,
          borderRadius: 4,
          border: '0.8px solid rgba(33, 12, 0, 1)',
          opacity: 1,
          objectFit: 'cover',
          zIndex: 16,
          transform: 'rotate(0deg)'
        }} />
        <Image src={news2Img} alt="news2" width={144.62109375} height={150.18008422851562} style={{
          position: 'absolute',
          left: 601.35,
          top: 1028.5,
          width: 144.62109375,
          height: 150.18008422851562,
          borderRadius: 4,
          border: '0.8px solid rgba(33, 12, 0, 1)',
          opacity: 1,
          objectFit: 'cover',
          zIndex: 16,
          transform: 'rotate(0deg)'
        }} />
        <Image src={news3Img} alt="news3" width={134.658203125} height={164.29957580566406} style={{
          position: 'absolute',
          left: 337.35,
          top: 1191.03,
          width: 134.658203125,
          height: 164.29957580566406,
          borderRadius: 4,
          border: '0.8px solid rgba(33, 12, 0, 1)',
          opacity: 1,
          objectFit: 'cover',
          zIndex: 16,
          transform: 'rotate(0deg)'
        }} />

        <Image src={news4Img} alt="news4" width={264} height={164.29957580566406} style={{
          position: 'absolute',
          left: 482.3,
          top: 1191.03,
          width: 264,
          height: 164.29957580566406,
          borderRadius: 4,
          border: '0.8px solid rgba(33, 12, 0, 1)',
          opacity: 1,
          objectFit: 'cover',
          zIndex: 16,
          transform: 'rotate(0deg)'
        }} />

        <div aria-hidden style={{
          position: 'absolute',
          width: 775,
          height: 0,
          top: 1392.6,
          left: 379.2,
          opacity: 1,
          borderTop: '1.5px solid rgba(96, 53, 27, 0.2)',
          boxSizing: 'border-box',
          zIndex: 16
        }} />

        <div style={{
          position: 'absolute',
          left: 337.33,
          top: 1429.61,
          width: 453,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Ratings & Reviews</div>

        <div style={{
          position: 'absolute',
          left: 345.33,
          top: 1460.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>

        <div role="button" aria-label="action-button" style={{
          position: 'absolute',
          left: 530.85,
          top: 1463.95,
          width: 52,
          height: 52,
          background: 'rgba(96, 53, 27, 0.05)',
          border: '0.5px solid rgba(33, 12, 0, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16,
          borderRadius: 50,
          display: 'block'
        }}>
          <div aria-hidden style={{
            position: 'absolute',
            left: 15.26,
            top: 16,
            width: 21.17654800415039,
            height: 20,
            boxSizing: 'border-box',
            opacity: 1,
            transform: 'rotate(0deg)',
            zIndex: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image src={likeImg} alt="like" width={14} height={14} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                    <div role="button" aria-label="action-button" style={{
          position: 'absolute',
          left: 52.85,
          top: -15,
          width: 52,
          height: 52,
          
          border: '0.5px solid rgba(33, 12, 0, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16,
          borderRadius: 50,
          display: 'block'
        }}></div>
            <div aria-hidden style={{
            position: 'absolute',
            left: 70,
            top: 3,
            width: 21.17654800415039,
            height: 20,
            boxSizing: 'border-box',
            opacity: 1,
            transform: 'rotate(0deg)',
            zIndex: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image src={unlikeImg} alt="like" width={14} height={14} style={{ width: 20, height: 20, objectFit: 'contain' }} />
          </div>
          </div>
          
          
        </div>

        <input
          aria-label="add-review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder=""
          style={{
            position: 'absolute',
            left: 685.67,
            top: 1463.95,
            width: 498.52734375,
            height: 52,
            borderRadius: 42,
            border: '0.5px solid rgba(33, 12, 0, 0.8)',
            boxSizing: 'border-box',
            paddingLeft: 24,
            fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
            fontSize: 13,
            lineHeight: '17px',
            color: 'rgba(33, 12, 0, 1)',
            background: 'transparent',
            outline: 'none',
            zIndex: 15
          }}
        />

        {reviewText === '' && (
          <div style={{
            position: 'absolute',
            left: 698.69,
            top: 1478.9,
            width: 77.48516082763672,
            height: 22.100000381469727,
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 13,
            lineHeight: '17px',
            letterSpacing: '0%',
            color: 'rgba(33, 12, 0, 0.4)',
            boxSizing: 'border-box',
            verticalAlign: 'middle',
            pointerEvents: 'none',
            zIndex: 16
          }}>Add review</div>
        )}

        <div style={{
          position: 'absolute',
          left: 415.33,
          top: 1474.44,
          width: 92,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>J. K. Rowlings</div>

        <div style={{
          position: 'absolute',
          left: 417.33,
          top: 1488.95,
          width: 45,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>0 reviews</div>

        <div style={{
          position: 'absolute',
          left: 897.59,
          top: 1483.11,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
        </div>

        <button type="button" aria-label="submit-review" onClick={() => setReviewOpen(true)} style={{
          position: 'absolute',
          left: 1000.08,
          top: 1471.28,
          width: 178.732421875,
          height: 37.3251953125,
          paddingTop: 8,
          paddingRight: 12,
          paddingBottom: 8,
          paddingLeft: 12,
          gap: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 42,
          background: 'rgba(96, 53, 27, 1)',
          color: '#ffffff',
          boxSizing: 'border-box',
          cursor: 'pointer',
          zIndex: 16
        }}>
          <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 14, lineHeight: '17px', color: 'rgba(228, 221, 209, 1)' }}>Write a review</span>
        </button>

          {reviewOpen && (
          <div
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.25)', zIndex: 90, backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }}
            onClick={() => setReviewOpen(false)}
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 937.6873168945312,
                maxWidth: 'calc(100% - 48px)',
                height: 760.4577026367188,
                maxHeight: 'calc(100% - 48px)',
                background: 'rgba(228, 221, 209, 1)',
                border: '0.5px solid rgba(33, 12, 0, 1)',
                boxShadow: '0px 6px 20.4px 0px rgba(33, 12, 0, 0.25)',
                borderRadius: 22,
                opacity: 1,
                zIndex: 92,
                overflow: 'auto',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)'
              }}
            >
              {/* Close button */}
              <button
                type="button"
                aria-label="Close review"
                onClick={() => setReviewOpen(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '50%'
                }}
                className="hover:bg-black/5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#210C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Book info header */}
              <div style={{ display: 'flex', gap: 20, padding: '32px 40px 24px 40px' }}>
                <div style={{ width: 80, height: 120, borderRadius: 4, overflow: 'hidden', flexShrink: 0}}>
                  {bookData?.coverImage ? (
                    <img src={bookData.coverImage} alt="Book cover" style={{ objectFit: 'cover', width: '100%', height: '100%'}} />
                  ) : (
                    <Image src={bookCoverMain} alt="Book cover" width={80} height={120} style={{ objectFit: 'cover', width: '100%', height: '100%'}} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h2 style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 26, color: '#210C00', margin: 0, marginBottom: 4 }}>{bookData?.title || 'Book Title'}</h2>
                  <p style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 14, color: '#6B4A33', margin: 0, marginBottom: 10,marginLeft:5 }}>by {bookData?.author?.name || 'Unknown'}</p>
                  <p style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 13, color: 'rgba(58,27,8,1)', margin: 0 ,marginLeft:5}}>{bookData?.pageCount || 0} pages • {bookData?.format || 'paperback'} • first pub {bookData?.publicationDate ? new Date(bookData.publicationDate).getFullYear() : 'N/A'}</p>
                </div>
              </div>
            <div aria-hidden style={{
                      position: 'absolute',
                      width: 775,
                      height: 0,
                      top: 156,
                      left: 138.86,
                      opacity: 1,
                      borderTop: '1.5px solid rgba(96, 53, 27, 0.2)',
                      boxSizing: 'border-box',
                      zIndex: 16
                    }} />
              {/* My Ratings (stars) */}
              <div style={{ padding: '0 40px 16px 40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 500, fontSize: 16, color: 'rgba(33,12,0,0.7) ' }}>My Ratings</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewStarRating(star)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        aria-label={`Rate ${star} stars`}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill={star <= reviewStarRating ? 'rgba(255, 77, 0, 0.59)' : 'none'}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="rgba(255, 77, 0, 0.59)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewStarRating(0)}
                    style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 13, color: '#8B7355', background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 8 }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Book Shelves */}
              <div style={{ padding: '0 40px 16px 40px' }}>
                <p style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 510, fontSize: 15, color: 'rgba(33, 12, 0, 0.8)', margin: '0 0 10px 0' }}>Book Shelves</p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {['to read', 'currently reading', 'read', 'Do not finish'].map((shelf) => (
                    <label key={shelf} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <span
                        onClick={() => setReviewBookShelf(shelf)}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `2px solid ${reviewBookShelf === shelf ? '#60351B' : '#A89A8C'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: reviewBookShelf === shelf ? '#60351B' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        {reviewBookShelf === shelf && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </span>
                      <span style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 14, color: '#210C00' }}>{shelf}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Selects a reason */}
              <div style={{ padding: '0 40px 16px 40px' }}>
                <p style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 510, fontSize: 16, color: 'rgba(33, 12, 0, 0.8)', margin: '0 0 10px 0' }}>Selects a reason</p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {['slow', 'emotionally heavy', 'not engaging'].map((reason) => (
                    <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <span
                        onClick={() => setReviewReason(reason)}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `2px solid ${reviewReason === reason ? '#60351B' : '#A89A8C'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: reviewReason === reason ? '#60351B' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        {reviewReason === reason && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </span>
                      <span style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 14, color: '#210C00' }}>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pace */}
              <div style={{ padding: '0 40px 16px 40px' }}>
                <p style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 500, fontSize: 16, color: 'rgba(33, 12, 0, 0.8)', margin: '0 0 10px 0' }}>Pace</p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {['Slow', 'Medium', 'Fast'].map((pace) => {
                    const isSelected = reviewPace.includes(pace);
                    return (
                      <label key={pace} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <span
                          onClick={() => toggleReviewPace(pace)}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            border: `2px solid ${isSelected ? '#60351B' : '#A89A8C'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected ? '#60351B' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L4 7L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 14, color: '#210C00' }}>{pace}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* My Ratings (textarea) */}
              <div style={{ padding: '0 40px 24px 40px' }}>
                <p style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 510, fontSize: 16, color: 'rgba(33, 12, 0, 0.8)', margin: '0 0 10px 0' }}>My Ratings</p>
                <textarea
                  ref={reviewTextareaRef}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Enter your review"
                  style={{
                    width: '100%',
                    height: 120,
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid rgba(33,12,0,0.12)',
                    resize: 'none',
                    fontSize: 14,
                    fontFamily: 'SF Pro, -apple-system, Arial',
                    background: 'rgba(204, 62, 0, 0.09)',
                    color: 'rgba(96, 53, 27, 0.8)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '0 40px 32px 40px' }}>
                <button
                  type="button"
                  onClick={resetReviewForm}
                  style={{
                    padding: '10px 28px',
                    borderRadius: 18,
                    border: '1px solid rgba(33,12,0,0.2)',
                    background: 'transparent',
                    fontFamily: 'SF Pro, -apple-system, Arial',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#210C00',
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setReviewOpen(false)}
                  style={{
                    padding: '10px 28px',
                    borderRadius: 18,
                    border: 'none',
                    background: '#60351B',
                    fontFamily: 'SF Pro, -apple-system, Arial',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

       

        <div aria-hidden style={{
          position: 'absolute',
          width: 669,
          height: 0,
          top: 1601.4,
          left: 480,
          opacity: 1,
          borderTop: '1.5px solid rgba(96, 53, 27, 0.2)',
          boxSizing: 'border-box',
          zIndex: 16
        }} />

        <div style={{
          position: 'absolute',
          left: 336.99,
          top: 1596,
          width: 453,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Community Ratings</div>

        <div style={{
          position: 'absolute',
          left: 339.28,
          top: 1626,
          width: 814.5732421875,
          height: 38,
          display: 'flex',
          alignItems: 'flex-start',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Rating & review give by the community of different writer and reader of books and some reviews given by them.</div>

        <div style={{
          position: 'absolute',
          left: 339.28,
          top: 1668,
          width: 111.16796875,
          height: 77,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 590,
          fontStyle: 'normal',
          fontSize: 64,
          lineHeight: '20px',
          letterSpacing: '0%',
          verticalAlign: 'middle',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>4.5

        </div>

        <div aria-hidden style={{
          position: 'absolute',
          left: 500,
          top: 1698,
          width: 420,
          height: 64,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          boxSizing: 'border-box',
          zIndex: 16
        }}>
          {[{label: '5', pct: '75%'}, {label: '4', pct: '12%'}, {label: '3', pct: '6%'}, {label: '2', pct: '2%'}, {label: '1', pct: '5%'}].map((r, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 18, textAlign: 'right', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontSize: 16, color: 'rgba(33,12,0,1)' }}>{r.label}</div>
              <div style={{ width: 303, height: 10, borderRadius: 9999, background: 'rgba(33,12,0,0.12)', boxSizing: 'border-box', overflow: 'hidden' }}>
                <div style={{ width: r.pct, height: '100%', background: 'rgba(96,53,27,1)', borderRadius: 9999 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute',
          left: 354.28,
          top: 1747,
          width: 300,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          paddingLeft: 2.29,
          paddingTop: 2.38,
          gap: 12,
          zIndex: 16
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
          </div>

          <div style={{
            width: 97,
            height: 20,
            marginLeft:-103,
            marginTop:40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 20,
            lineHeight: '20px',
            letterSpacing: '0%',
            color: 'rgba(33, 12, 0, 0.6)'
          }}>2,256,896</div>
        </div>

        <div role="region" aria-label="community-reviews-card" style={{
          position: 'absolute',
          left: 336.99,
          top: 1849.52,
          width: 521.462890625,
          height: 583.822265625,
          paddingTop: 35,
          paddingRight: 34,
          paddingBottom: 35,
          paddingLeft: 34,
          gap: 10,
          borderRadius: 12,
          background: 'rgba(96, 53, 27, 0.08)',
          boxShadow: '0px 0px 4px 0px rgba(96, 53, 27, 1) inset',
          opacity: 1,
          boxSizing: 'border-box',
          zIndex: 16,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* survey blocks */}

          {[
            { title: 'Pace', icon: paceIcon, color: '255,77,0' },
            { title: 'Plot or character driven?', icon: plotIcon, color: '140,86,255' },
            { title: 'Loveable characters?', icon: charactersIcon, color: '0,150,255' },
            { title: 'Diverse cast of characters?', icon: diverseIcon, color: '34,197,94' },
            { title: 'Flaws of characters a main focus?', icon: flawsIcon, color: '255,77,100' }
          ].map((m, mi) => (
            <div key={mi} style={{ display: 'flex', flexDirection: 'column', gap:6, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Image src={m.icon} alt={`${m.title} icon`} width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
                <div style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'normal', fontSize: 16, lineHeight: '20px', letterSpacing: '0%', color: 'rgba(33,12,0,0.9)' }}>{m.title}</div>
              </div>

              <div style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {Array.from({ length: 22 }).map((_, i) => (
                  <div key={i} style={{
                    width: 20,
                    height: 20,
                    borderRadius: 9999,
                    background: `rgba(${m.color}, ${0.95 - i * 0.03})`
                  }} />
                ))}
              </div>

              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 9999, background: `rgba(${m.color},1)` }} />
                  <div style={{ fontSize: 12, color: 'rgba(33,12,0,0.6)' }}>Yes (45%)</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 9999, background: `rgba(${m.color},0.75)` }} />
                  <div style={{ fontSize: 12, color: 'rgba(33,12,0,0.6)' }}>Complicated (30%)</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 9999, background: `rgba(${m.color},0.5)` }} />
                  <div style={{ fontSize: 12, color: 'rgba(33,12,0,0.6)' }}>No (15%)</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 9999, background: `rgba(${m.color},0.25)` }} />
                  <div style={{ fontSize: 12, color: 'rgba(33,12,0,0.6)' }}>N/A (10%)</div>
                </div>
              </div>
            </div>
          ))}

        </div>

        <div style={{
          position: 'absolute',
          left: 336.99,
          top: 2495.67,
          width: 117,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>Reader Friends
        </div>
        <div style={{
          position: 'absolute',
          left: 345.33,
          top: 2530.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
          
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 2538.89,
          width: 91,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[0]?.user?.name || 'Anonymous'}</div>
          <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 624.34,
            top: 2541.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 2555.4,
          width: 134,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[0]?.user?.reviewCount || 0} Reviews</div>

        <div style={{
          position: 'absolute',
          left: 407.17,
          top: 2590.88,
          width: 744.685546875,
          height: 153,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 12,
          lineHeight: '17px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.7)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>
          {reviews[0]?.content || 'No review content available.'}
        </div>

        <div aria-hidden style={{
          position: 'absolute',
          left: 409.17,
          top: 2764.37,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          left: 521.32,
          top: 2764.19,
          width: 95,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '17px',
          color: 'rgba(96, 53, 27, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[0]?.createdAt ? new Date(reviews[0].createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
          <div style={{
          position: 'absolute',
          left: 345.33,
          top: 2835.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 2838.89,
          width: 91,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[1]?.user?.name || 'Anonymous'}</div>
          <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 624.34,
            top: 2841.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 2855.4,
          width: 134,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[1]?.user?.reviewCount || 0} Reviews</div>

        <div style={{
          position: 'absolute',
          left: 407.17,
          top: 2890.88,
          width: 744.685546875,
          height: 153,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 12,
          lineHeight: '17px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.7)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>
          {reviews[1]?.content || 'No review content available.'}
        </div>

        <div aria-hidden style={{
          position: 'absolute',
          left: 409.17,
          top: 3064.37,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          left: 521.32,
          top: 3064.19,
          width: 95,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '17px',
          color: 'rgba(96, 53, 27, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[1]?.createdAt ? new Date(reviews[1].createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>

        <div style={{
          position: 'absolute',
          left: 336.99,
          top: 3107.67,
          width: 127,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>Other Reviewers</div>
        <div style={{
          position: 'absolute',
          left: 345.33,
          top: 3155.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 3158.89,
          width: 91,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[2]?.user?.name || 'Anonymous'}</div>
          <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 624.34,
            top: 3158.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 3175.4,
          width: 134,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[2]?.user?.reviewCount || 0} Reviews</div>

        <div style={{
          position: 'absolute',
          left: 407.17,
          top: 3200.88,
          width: 744.685546875,
          height: 153,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 12,
          lineHeight: '17px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.7)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>
          {reviews[2]?.content || 'No review content available.'}
        </div>

        <div aria-hidden style={{
          position: 'absolute',
          left: 409.17,
          top: 3364.37,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          left: 521.32,
          top: 3364.19,
          width: 95,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '17px',
          color: 'rgba(96, 53, 27, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>{reviews[2]?.createdAt ? new Date(reviews[2].createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>

        {/* Bottom decorative panel (requested size/position) */}
        <div aria-hidden style={{
          position: 'absolute',
          width: 1344,
          height: 403,
          top: 3476,
          left: 174,
          opacity: 1,
          background: 'rgba(96, 53, 27, 0.2)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 0
        }} />
          <div style={{
          position: 'absolute',
          left: 226.99,
          top: 3507.67,
          width: 453,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 24,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>More Editions</div>
        <div style={{
          position: 'absolute',
          left: 226,
          top: 3558.5,
          display: 'flex',
          gap: 80,
          alignItems: 'flex-start',
          zIndex: 16
        }}>
          {(similarBooks.length > 0 ? similarBooks.slice(0,6) : []).map((book: any, i: number) => (
            <div key={i} style={{
              width: 135,
              height: 197,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 2,
              borderBottomRightRadius: 2,
              borderBottomLeftRadius: 6,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }} onClick={() => { window.location.href = '/view-detail?id=' + book._id; }}>
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title || 'edition'} width={135} height={197} style={{ objectFit: 'cover', width: 135, height: 197 }} />
              ) : (
                <Image src={bookCover1} alt={book.title || 'edition'} width={135} height={197} style={{ objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
        {/* Book titles under top More Editions (centered) */}
         {/* Book titles under top More Editions (centered) */}
        <div style={{ position: 'absolute', left: 228, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[0]?.title || 'Book name'}</div>
        <div style={{ position: 'absolute', left: 447, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[1]?.title || 'Book name'}</div>
        <div style={{ position: 'absolute', left: 662, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[2]?.title || 'Book name'}</div>
        <div style={{ position: 'absolute', left: 875, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[3]?.title || 'Book name'}</div>
        <div style={{ position: 'absolute', left: 1090, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[4]?.title || 'Book name'}</div>
        <div style={{ position: 'absolute', left: 1303, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[5]?.title || 'Book name'}</div>

        <div style={{ position: 'absolute', left: 228, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[0]?.author?.name || 'Author'}</div>
        <div style={{ position: 'absolute', left: 447, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[1]?.author?.name || 'Author'}</div>
        <div style={{ position: 'absolute', left: 662, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[2]?.author?.name || 'Author'}</div>
        <div style={{ position: 'absolute', left: 875, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[3]?.author?.name || 'Author'}</div>
        <div style={{ position: 'absolute', left: 1090, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[4]?.author?.name || 'Author'}</div>
        <div style={{ position: 'absolute', left: 1303, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>{similarBooks[5]?.author?.name || 'Author'}</div>
      </div>
                <Link href="/search-book" aria-label="View all Books" style={{
            position: 'absolute',
            left: 1312,
            top: 3507.5,
            width: 122,
            height: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'Regular',
            fontSize: 18,
            lineHeight: '17px',
            verticalAlign: 'middle',
            color: 'rgba(204, 62, 0, 0.8)',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textDecorationThickness: '7%',
            textDecorationSkipInk: 'auto',
            textDecorationColor: 'rgba(204, 62, 0, 0.8)',
            boxSizing: 'border-box',
            zIndex: 90
          }}>View all Books</Link>
                {/* Secondary strip (placeholder) */}
          <div role="region" aria-label="Secondary strip" style={{
            position: 'absolute',
            width: 1234,
            height: 75,
            top: 3910,
            left: 176,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            boxSizing: 'border-box',
            background: 'transparent',
            borderTop: '1px solid rgba(33, 12, 0, 0.52)',
            zIndex: 20
          }}>
            {/* left: copyright */}
            <div style={{ width: 226, height: 20, display: 'flex', alignItems: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontStyle: 'normal', fontSize: '13px', lineHeight: '20px', letterSpacing: '-0.24px', color: 'rgba(33, 12, 0, 0.74)' }}>
              © 2026 Copyright All Rights Reserved
            </div>

            {/* center: small nav links */}
            <nav aria-label="Footer quick links" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="#" style={{ color: 'rgba(33,12,0,0.6)', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 13, textDecoration: 'none' }}>Home</a>
              <div style={{ width: 4, height: 4, borderRadius: 9999, background: 'rgba(33,12,0,0.3)' }} />
              <a href="#" style={{ color: 'rgba(33,12,0,0.6)', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 13, textDecoration: 'none' }}>About us</a>
              <div style={{ width: 4, height: 4, borderRadius: 9999, background: 'rgba(33,12,0,0.3)' }} />
              <a href="#" style={{ color: 'rgba(33,12,0,0.6)', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 13, textDecoration: 'none' }}>Careers</a>
              <div style={{ width: 4, height: 4, borderRadius: 9999, background: 'rgba(33,12,0,0.3)' }} />
              <a href="#" style={{ color: 'rgba(33,12,0,0.6)', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 13, textDecoration: 'none' }}>Blog</a>
            </nav>

            <div style={{ flex: 1 }} />

            {/* right: social / small icons */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* small X */}
              <button aria-label="Close" style={{ width: 28, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', padding: 0, color: 'rgba(33,12,0,0.6)', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M1 1L11 11M11 1L1 11" stroke="rgba(33,12,0,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* instagram */}
              <a href="#" aria-label="Instagram" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(33,12,0,0.6)', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="rgba(33,12,0,0.6)" strokeWidth="1.2" fill="none" />
                  <circle cx="12" cy="11" r="3" stroke="rgba(33,12,0,0.6)" strokeWidth="1.2" fill="none" />
                  <circle cx="17.5" cy="6.5" r="0.9" fill="rgba(33,12,0,0.6)" />
                </svg>
              </a>

              {/* facebook */}
              <a href="#" aria-label="Facebook" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(33,12,0,0.6)', textDecoration: 'none' }}>
                <svg width="12" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M8.6 0H6.9C5.3 0 4.5.9 4.5 2.2V3.8H3v2.6h1.5V14h2.6V6.4H9.8L10 3.8H7.9V2.6c0-.6.2-.9.7-.9h.9V0z" fill="rgba(33,12,0,0.6)" />
                </svg>
              </a>

              {/* linkedin */}
              <a href="#" aria-label="LinkedIn" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(33,12,0,0.6)', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect x="2" y="6" width="4" height="12" rx="1" fill="rgba(33,12,0,0.6)" />
                  <path d="M9 10.5v7h4v-3.7c0-1.98 3-2.14 3 0V17.5h4v-4.58c0-4.36-4.66-4.2-6.18-2.05V10.5H9z" fill="rgba(33,12,0,0.6)" />
                  <circle cx="4" cy="4" r="1.3" fill="rgba(33,12,0,0.6)" />
                </svg>
              </a>
            </div>
          </div>
      </div>
      {/* ============ END DESKTOP LAYOUT ============ */}
    </main>
  );
}

// Wrapper component that provides Suspense boundary
export default function ViewDetailPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ViewDetailContent />
    </Suspense>
  );
}
