'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SearchBar from '../components/SearchBar';

import card1 from '../../images/card1.png';
import { booksApi, getImageUrl } from '../../lib/api';

// Admin panel content interface
interface PageContent {
  title: string;
  subtitle: string;
  skipText: string;
  continueText: string;
  savingText: string;
  loadingText: string;
  searchPlaceholder: string;
  backgroundImage: string;
}

const defaultContent: PageContent = {
  title: 'Pick a book you enjoyed recently',
  subtitle: "Select the genres that interest you. We'll use this to recommend books that match your taste.",
  skipText: 'Skip for now',
  continueText: 'Continue',
  savingText: 'Saving...',
  loadingText: 'Loading books...',
  searchPlaceholder: 'Search book by name, author...',
  backgroundImage: '/quiz-background.jpg',
};

export default function Enjoy(): JSX.Element {
  const [content] = useState<PageContent>(defaultContent);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const router = useRouter();

  // Fetch books from backend
  useEffect(() => {
    async function fetchBooks() {
      try {
        setFetchLoading(true);
        const res: any = await booksApi.getAll({ limit: 12 });
        setBooks(res?.data || []);
      } catch (err) {
        console.error('Failed to fetch books:', err);
      } finally {
        setFetchLoading(false);
      }
    }
    fetchBooks();
  }, []);

  function pickRandomBook() {
    // prefer titles from the fetched list; fallback to a small static pool
    const pool = (books || []).map((b: any) => b.title).filter(Boolean);
    const fallback = ['Harry Potter', 'The Merge', 'Little Women', 'The Chamber of Secrets'];
    const source = pool.length ? pool : fallback;
    const rnd = source[Math.floor(Math.random() * source.length)];
    setQuery(rnd);
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function handleContinue() {
    console.log('Continue button clicked - navigating to dashboard');
    setLoading(true);

    // Navigate to dashboard immediately
    // The quiz preferences are already saved from quiz3.tsx
    router.push('/dashboard');
  }

  const visible = books.filter((b) => {
    const t = (b.title || '').toLowerCase();
    const a = (b.author?.name || b.author || '').toLowerCase();
    const q = query.toLowerCase();
    return t.includes(q) || a.includes(q);
  });

  return (
    <main className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 bg-[#F2F0E4]">
      {/* Background pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-center bg-repeat opacity-[0.13]"
        style={{
          backgroundImage: `url('${content.backgroundImage}')`,
          backgroundBlendMode: 'multiply',
        }}
      />

      <section className="w-full max-w-[1280px] px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-12 relative z-10">
        <div className="mx-auto">
          {/* Header section with title and search */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Title and subtitle */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[42px] font-normal tracking-wide text-[#0C1421] leading-tight">
                {content.title}
              </h1>

              <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base lg:text-lg max-w-md mx-auto text-[#0C1421] leading-[126%] tracking-wide">
                {content.subtitle}
              </p>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:max-w-xs lg:max-w-[310px] ml-auto">
              <div className="relative flex-1">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder={content.searchPlaceholder}
                  showFilters={false}
                  onPickRandom={pickRandomBook}
                />
              </div>
              <button
                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                aria-label="Filter"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6h16M7 12h10M10 18h4"
                    stroke="#374151"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Book Grid */}
          <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 justify-items-center">
              {fetchLoading ? (
                <div className="col-span-full text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  {content.loadingText}
                </div>
              ) : (
                visible.map((b) => (
                  <div
                    key={b._id}
                    className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[120px] sm:max-w-[135px]"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(b._id)}
                      aria-pressed={selected.has(b._id)}
                      className="relative transition-transform hover:scale-[1.02] w-full aspect-[135/198] bg-white rounded-tl-md rounded-tr-sm rounded-br-sm rounded-bl-md overflow-visible shadow-[inset_7px_0px_4px_0px_rgba(0,0,0,0.45),-8px_11px_9px_0px_rgba(0,0,0,0.47),0px_5px_5.3px_0px_rgba(255,255,255,0.25)]"
                    >
                      {/* Selection highlight */}
                      {selected.has(b._id) && (
                        <div
                          className="absolute left-1/2 top-[57%] w-[138%] h-[149%] -translate-x-1/2 rounded-xl bg-[rgba(96,53,27,0.08)] shadow-[0_10px_20px_rgba(96,53,27,0.12),inset_0px_0px_5.1px_0px_rgba(96,53,27,0.25)] pointer-events-none z-0 transition-all duration-200"
                          style={{ transform: 'translate(-50%, calc(-50% + 12px))' }}
                        />
                      )}

                      {/* Book cover */}
                      {b.coverImage ? (
                        <img
                          src={getImageUrl(b.coverImage)}
                          alt={b.title}
                          className="w-full h-full object-cover relative z-[1] rounded-tl-md rounded-tr-sm rounded-br-sm rounded-bl-md"
                        />
                      ) : (
                        <Image
                          src={card1}
                          alt={b.title}
                          width={135}
                          height={198}
                          className="w-full h-full object-cover relative z-[1] rounded-tl-md rounded-tr-sm rounded-br-sm rounded-bl-md"
                        />
                      )}

                      {/* Selection checkmark */}
                      {selected.has(b._id) && (
                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-white/90 text-[#5C2F1E] text-xs font-medium z-[2]">
                          ✓
                        </span>
                      )}
                    </button>

                    {/* Book title */}
                    <div className="text-[10px] sm:text-xs md:text-sm font-medium leading-tight text-center text-black line-clamp-2">
                      {b.title}
                    </div>

                    {/* Author name */}
                    <div className="text-[9px] sm:text-[10px] md:text-xs font-medium leading-tight text-center text-[#CC3E00] -mt-1">
                      {b.author?.name || b.author}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-6 sm:mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-2 sm:px-4">
            {/* Skip link */}
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xs sm:text-sm text-[#0C1421] underline order-2 sm:order-1 hover:text-gray-900 transition-colors"
            >
              {content.skipText}
            </button>

            {/* Page indicator */}
            <div className="flex items-center justify-center order-1 sm:order-2">
              <div className="text-xs sm:text-sm text-[#0C1421]">2</div>
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={loading}
              className="
                px-5 sm:px-6 py-2.5 sm:py-3
                bg-[#5C2F1E] text-white
                rounded-xl shadow-sm
                text-xs sm:text-sm md:text-base
                order-3
                hover:bg-[#4A2518] transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? content.savingText : content.continueText}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
