'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import MobileDrawer from '../components/MobileDrawer';
import MobileTopBar from '../components/MobileTopBar';
import UserNavbar from '../components/UserNavbar';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import { getImageUrl, readingApi, userApi } from '../../lib/api';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic content from admin panel
interface PageContent {
  header: {
    title: string;
    searchPlaceholder: string;
  };
  tabs: {
    toRead: string;
    currentlyReading: string;
    completed: string;
  };
  bookCard: {
    ratingsLabel: string;
    reviewsLabel: string;
    pagesLabel: string;
    formatLabel: string;
    firstPubLabel: string;
    wantToReadButton: string;
    writeReviewButton: string;
    logSessionButton: string;
    readButton: string;
    pageLabel: string;
  };
  logSession: {
    title: string;
    bookTitle: string;
    pagesReadLabel: string;
    currentPageLabel: string;
    feelingLabel: string;
    engagingOption: string;
    steadyOption: string;
    emotionalOption: string;
    resetButton: string;
    submitButton: string;
  };
  emptyState: {
    title: string;
    description: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    title: 'My Books',
    searchPlaceholder: 'Search your books',
  },
  tabs: {
    toRead: 'To read',
    currentlyReading: 'Currently reading',
    completed: 'Completed',
  },
  bookCard: {
    ratingsLabel: 'ratings',
    reviewsLabel: 'reviews',
    pagesLabel: 'pages',
    formatLabel: 'hardcover',
    firstPubLabel: 'first pub',
    wantToReadButton: 'Want to read',
    writeReviewButton: 'Write a review',
    logSessionButton: 'Log Session',
    readButton: 'Read',
    pageLabel: 'Page',
  },
  logSession: {
    title: 'Log reading session',
    bookTitle: 'The Remains of the Day',
    pagesReadLabel: 'Pages read',
    currentPageLabel: 'Currently on page {current} of {total}',
    feelingLabel: 'How did the reading feel? (Optional)',
    engagingOption: 'Engaging',
    steadyOption: 'Steady',
    emotionalOption: 'Emotional',
    resetButton: 'Reset',
    submitButton: 'Submit',
  },
  emptyState: {
    title: 'No books yet',
    description: 'Start adding books to your collection',
  },
};

// Real API data types
interface PopulatedBook {
  _id: string;
  title: string;
  coverImage: string;
  author: { name: string; profilePhoto?: string } | string | null;
  pageCount: number;
  averageRating: number;
  totalRatings: number;
  format: string;
  publicationDate: string;
}

interface ReadingEntry {
  _id: string;
  book: PopulatedBook | null;
  status: string;
  pagesRead: number;
  percentage: number;
}

// Helpers
function authorName(entry: ReadingEntry): string {
  const a = entry.book?.author;
  if (!a) return '';
  return typeof a === 'string' ? a : a.name || '';
}

function pubYear(entry: ReadingEntry): string {
  const d = entry.book?.publicationDate;
  if (!d) return '';
  return new Date(d).getFullYear().toString();
}

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/my-books`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Star Rating Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={sizeClasses[size]}
          viewBox="0 0 24 24"
          fill={star <= rating ? 'rgba(255,77,0,0.59)' : 'none'}
          stroke={star <= rating ? 'rgba(255,77,0,0.59)' : 'rgba(96, 53, 27, 0.3)'}
          strokeWidth="1"
        >
          <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
        </svg>
      ))}
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-1.5 bg-[#60351B]/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#60351B] rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-base sm:text-lg font-medium text-[#3A1B08] min-w-[40px]">{progress}%</span>
    </div>
  );
}

// Book Card Component
function BookCard({
  entry,
  content,
  activeTabIndex,
  onLogSession,
}: {
  entry: ReadingEntry;
  content: PageContent;
  activeTabIndex: number;
  onLogSession: (entry: ReadingEntry) => void;
}) {
  const book = entry.book;
  const name = authorName(entry);
  const year = pubYear(entry);
  const rating = book?.averageRating ?? 0;
  const ratingsCount = book?.totalRatings ? book.totalRatings.toLocaleString() : '—';
  const bookId = book?._id ?? '';

  return (
    <div className="bg-[#60351B]/10 rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-5 mb-4 sm:mb-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
        {/* Book Cover */}
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-20 h-28 sm:w-20 sm:h-28 lg:w-[86px] lg:h-[126px] rounded-md overflow-hidden">
            {book?.coverImage ? (
              <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#8B7355] via-[#6B5344] to-[#4A3728] flex items-center justify-center">
                <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-serif text-[#210C00] leading-tight mb-1 line-clamp-2">
            {book?.title || 'Book Title'}
          </h3>
          {name && (
            <p className="text-[11px] sm:text-xs font-bold text-[#210C00]/70 mb-1">~ {name}</p>
          )}
          <p className="text-[10px] sm:text-[11px] text-[#3A1B08] mb-2">
            {book?.pageCount ? `${book.pageCount} ${content.bookCard.pagesLabel} • ` : ''}
            {book?.format || content.bookCard.formatLabel}
            {year ? ` • ${content.bookCard.firstPubLabel} ${year}` : ''}
          </p>

          {/* Ratings Section - desktop */}
          <div className="hidden md:block">
            <p className="text-xs sm:text-sm text-[#3A1B08] mb-1 capitalize">{content.bookCard.ratingsLabel}</p>
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={rating} size="sm" />
            </div>
            <p className="text-[10px] text-[#3A1B08]/80">
              {ratingsCount} {content.bookCard.ratingsLabel}
            </p>
          </div>
        </div>

        {/* Progress - currently reading */}
        {activeTabIndex === 1 && (
          <div className="flex flex-col items-center sm:items-start justify-center w-full sm:w-auto lg:w-[280px] xl:w-[343px] mt-2 sm:mt-0">
            <p className="text-xs sm:text-sm text-[#3A1B08] mb-2">
              {content.bookCard.pageLabel} {entry.pagesRead}
            </p>
            <ProgressBar progress={entry.percentage ?? 0} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-0">
          {/* To Read Tab Buttons */}
          {activeTabIndex === 0 && (
            <>
              <button className="flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full border border-[#210C00] text-xs sm:text-sm font-semibold text-[#210C00] hover:bg-white/50 transition-colors whitespace-nowrap">
                {content.bookCard.wantToReadButton}
              </button>
              <Link
                href={bookId ? `/view-detail?id=${bookId}` : '#'}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white text-xs sm:text-sm font-semibold hover:bg-[#4A2518] transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {content.bookCard.writeReviewButton}
              </Link>
            </>
          )}

          {/* Currently Reading Tab Buttons */}
          {activeTabIndex === 1 && (
            <>
              <button
                onClick={() => onLogSession(entry)}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white text-xs sm:text-sm font-semibold hover:bg-[#4A2518] transition-colors whitespace-nowrap"
              >
                {content.bookCard.logSessionButton}
              </button>
              <Link
                href={bookId ? `/view-detail?id=${bookId}` : '#'}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white text-xs sm:text-sm font-semibold hover:bg-[#4A2518] transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {content.bookCard.writeReviewButton}
              </Link>
            </>
          )}

          {/* Completed Tab Buttons */}
          {activeTabIndex === 2 && (
            <>
              <button className="flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full bg-[#210C00]/10 border border-[#210C00] text-xs sm:text-sm font-semibold text-[#210C00] hover:bg-[#210C00]/20 transition-colors whitespace-nowrap">
                {content.bookCard.readButton}
              </button>
              <Link
                href={bookId ? `/view-detail?id=${bookId}` : '#'}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white text-xs sm:text-sm font-semibold hover:bg-[#4A2518] transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {content.bookCard.writeReviewButton}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Ratings Section */}
      <div className="block md:hidden mt-3 pt-3 border-t border-[#60351B]/10">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <span className="text-xs text-[#3A1B08] capitalize">{content.bookCard.ratingsLabel}</span>
          <StarRating rating={rating} size="sm" />
          <span className="text-[10px] text-[#3A1B08]/80">{ratingsCount}</span>
        </div>
      </div>
    </div>
  );
}

// Skeleton Card
function SkeletonCard() {
  return (
    <div className="bg-[#60351B]/10 rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-5 mb-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-28 rounded-md bg-[#60351B]/20 flex-shrink-0" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-5 bg-[#60351B]/20 rounded w-3/4" />
          <div className="h-3 bg-[#60351B]/15 rounded w-1/2" />
          <div className="h-3 bg-[#60351B]/15 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// Log Session Modal Component
function LogSessionModal({
  isOpen,
  onClose,
  content,
  entry,
  onSubmitSession,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: PageContent;
  entry: ReadingEntry | null;
  onSubmitSession: (readingId: string, pagesRead: number, feeling: string | null) => Promise<void>;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [pagesRead, setPagesRead] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const bookTitle = entry?.book?.title ?? content.logSession.bookTitle;
  const currentPage = entry?.pagesRead ?? 0;
  const totalPages = entry?.book?.pageCount ?? 0;

  // Reset on open for each entry
  useEffect(() => {
    if (isOpen) { setPagesRead(0); setSelectedFeeling(null); }
  }, [isOpen, entry?._id]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarCompensation = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarCompensation > 0) document.body.style.paddingRight = `${scrollBarCompensation}px`;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || '';
      document.body.style.paddingRight = prevPaddingRight || '';
    };
  }, [isOpen]);

  // Focus trap and Escape key
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
      )
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            (last as HTMLElement).focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            (first as HTMLElement).focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    first?.focus?.();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmitSession(entry._id, pagesRead, selectedFeeling);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setPagesRead(0);
    setSelectedFeeling(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[367px] bg-[#F6F1EA]/95 border-[1.5px] border-[#200C00] rounded-[22px] shadow-lg p-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[#210C00]">{content.logSession.title}</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#210C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Book Title */}
        <p className="text-sm text-[#210C00]/60 mb-6 line-clamp-1">{bookTitle}</p>

        {/* Pages Read */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#210C00]/80 mb-2">
            {content.logSession.pagesReadLabel}
          </label>
          <input
            type="number"
            min={0}
            max={totalPages || undefined}
            value={pagesRead}
            onChange={(e) => setPagesRead(Number(e.target.value))}
            className="w-full h-11 px-4 rounded-full border border-[#210C00] bg-[#ECE7DF] text-sm text-[#210C00] focus:outline-none focus:border-[#60351B]"
          />
          {totalPages > 0 && (
            <p className="text-[11px] text-[#210C00]/60 mt-2">
              {content.logSession.currentPageLabel
                .replace('{current}', String(currentPage))
                .replace('{total}', String(totalPages))}
            </p>
          )}
        </div>

        {/* Feeling Options */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#210C00]/80 mb-3">{content.logSession.feelingLabel}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'engaging', label: content.logSession.engagingOption, emoji: '📚' },
              { key: 'steady', label: content.logSession.steadyOption, emoji: '⚖️' },
              { key: 'emotional', label: content.logSession.emotionalOption, emoji: '💭' },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedFeeling(option.key)}
                className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-[22px] border transition-colors ${
                  selectedFeeling === option.key
                    ? 'border-[#60351B] bg-[#60351B]/10'
                    : 'border-[#210C00] bg-[#ECE7DF] hover:bg-[#E0DBD3]'
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="text-[11px] text-[#210C00]/80">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={submitting}
            className="flex-1 h-10 rounded-[18px] border border-[#210C00] text-sm font-medium text-[#210C00] hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            {content.logSession.resetButton}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-10 rounded-[18px] bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2518] transition-colors shadow-md disabled:opacity-50"
          >
            {submitting ? 'Saving…' : content.logSession.submitButton}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function MyBooksPage(): JSX.Element {
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>(['Fiction', 'To read']);
  const [readings, setReadings] = useState<ReadingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [logSessionEntry, setLogSessionEntry] = useState<ReadingEntry | null>(null);

  // Get active tab from pathname
  const pathname = usePathname();
  const activeTabIndex = pathname?.includes('/my-books/currently-reading')
    ? 1
    : pathname?.includes('/my-books/completed')
    ? 2
    : 0;

  // Mobile menu context
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();

  // Log Session modal state
  const [logSessionOpen, setLogSessionOpen] = useState(false);

  const loadReadings = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await readingApi.getAll();
      if (res && res.data) setReadings(res.data as ReadingEntry[]);
    } catch (e) {
      console.error('Failed to load reading list', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch page content and data
  useEffect(() => {
    fetchPageContent().then(setContent);
    userApi.getProfile().then((u: any) => setUserData(u?.data || u)).catch(() => {});
    loadReadings();
  }, [loadReadings]);

  // Tab → status mapping
  const statusMap = ['want_to_read', 'currently_reading', 'finished'] as const;
  const tabReadings = readings.filter((r) => r.status === statusMap[activeTabIndex]);

  // Search filter
  const filtered = query
    ? tabReadings.filter((r) => {
        const title = r.book?.title?.toLowerCase() ?? '';
        const author = authorName(r).toLowerCase();
        const q = query.toLowerCase();
        return title.includes(q) || author.includes(q);
      })
    : tabReadings;

  const handleLogSession = (entry: ReadingEntry) => {
    setLogSessionEntry(entry);
    setLogSessionOpen(true);
  };

  const handleSessionSubmit = async (
    readingId: string,
    pagesRead: number,
    _feeling: string | null
  ) => {
    await readingApi.updateProgress(readingId, pagesRead);
    await loadReadings();
  };

  const tabs = [
    { key: 'to-read', label: content.tabs.toRead, href: '/my-books' },
    { key: 'currently-reading', label: content.tabs.currentlyReading, href: '/my-books/currently-reading' },
    { key: 'completed', label: content.tabs.completed, href: '/my-books/completed' },
  ];

  // User display
  const displayName = userData?.name || userData?.username || 'My Account';
  const userInitials = displayName
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  function pickRandomBook() {
    const POOL = filtered.map((r) => r.book?.title).filter(Boolean) as string[];
    if (POOL.length) setQuery(POOL[Math.floor(Math.random() * POOL.length)]);
  }

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      {/* Mobile Top Bar */}
      <MobileTopBar />

      {/* Sidebar - Desktop */}
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onToggle={toggleMobileMenu}
        activeIcon={activeIcon}
        setActiveIcon={setActiveIcon}
        hideHeader
      />

      {/* Main Content */}
      <div className="w-full lg:ml-24">
        {/* Top Bar - Desktop/Tablet */}
        <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder={content.header.searchPlaceholder}
                  initialFilters={filters}
                  onApplyFilters={setFilters}
                  onPickRandom={pickRandomBook}
                  onFilterOpenChange={() => {}}
                />
              </div>
              <UserNavbar />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="inline-flex gap-2 sm:gap-4 lg:gap-6 p-1">
              {tabs.map((tab, i) => {
                const isActive = i === activeTabIndex;
                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#60351B] text-white shadow-sm'
                        : 'border border-[#210C00]/12 text-[#210C00] hover:bg-[#60351B]/10'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Book Cards */}
          <div className="space-y-4 sm:space-y-5">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#60351B]/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#60351B]/50" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#210C00] mb-2">
                  {query ? 'No results found' : content.emptyState.title}
                </h3>
                <p className="text-sm text-[#210C00]/60">
                  {query ? `No books matching "${query}"` : content.emptyState.description}
                </p>
              </div>
            ) : (
              filtered.map((entry) => (
                <BookCard
                  key={entry._id}
                  entry={entry}
                  content={content}
                  activeTabIndex={activeTabIndex}
                  onLogSession={handleLogSession}
                />
              ))
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Log Session Modal */}
      <LogSessionModal
        isOpen={logSessionOpen}
        onClose={() => setLogSessionOpen(false)}
        content={content}
        entry={logSessionEntry}
        onSubmitSession={handleSessionSubmit}
      />
    </main>
  );
}
