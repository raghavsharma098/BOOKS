'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SearchBar from '../components/SearchBar';

import card1 from './images/card1.png';
import { booksApi } from '../../lib/api';

export default function Enjoy(): JSX.Element {
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
    if (next.has(id)) next.delete(id); else next.add(id);
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
    <main className="relative min-h-screen flex items-start justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(242, 240, 228, 1)' }}>
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: `url('/quiz-background.jpg')`, backgroundRepeat: 'repeat', backgroundPosition: 'center', backgroundSize: 'auto', backgroundBlendMode: 'multiply', opacity: 0.13 }} />

      <section className="w-full max-w-[1280px] px-4 sm:px-6 md:px-12 py-8 sm:py-12 relative z-10">
        <div className="mx-auto">
          {/* Header section with title and search */}
          <div className="flex flex-col gap-6">
            {/* Title and subtitle */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px]" style={{
                fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                fontWeight: 400,
                lineHeight: '100%',
                letterSpacing: '0.05em',
                color: 'rgba(12, 20, 33, 1)',
              }}>Pick a book you enjoyed recently</h1>

              <p className="mt-4 text-sm sm:text-base md:text-lg max-w-md mx-auto" style={{
                fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                fontWeight: 400,
                lineHeight: '126%',
                letterSpacing: '0.01em',
                color: 'rgba(12, 20, 33, 1)',
              }}>Select the genres that interest you. We'll use this to recommend books that match your taste.</p>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:max-w-xs lg:max-w-[310px] ml-auto">
              <div className="relative flex-1">
              <SearchBar value={query} onChange={setQuery} placeholder="Search book by name, author..." showFilters={false} onPickRandom={pickRandomBook} />
            </div>
              <button className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center" style={{ border: '1px solid rgba(243,244,246,1)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} aria-label="Filter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M7 12h10M10 18h4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {/* Book Grid */}
          <div className="mt-8 sm:mt-10 md:mt-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
              {fetchLoading ? (
                <div className="col-span-full text-center py-8 text-gray-500">Loading books...</div>
              ) : visible.map((b) => (
                <div key={b._id} className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[135px]">
                  <button
                    type="button"
                    onClick={() => toggle(b._id)}
                    aria-pressed={selected.has(b._id)}
                    className="relative transition-transform hover:scale-[1.02] w-full aspect-[135/198]"
                    style={{
                      background: '#fff',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 2,
                      borderBottomRightRadius: 2,
                      borderBottomLeftRadius: 6,
                      boxShadow: '-8px 11px 9px 0px rgba(0, 0, 0, 0.47), 0px 5px 5.3px 0px rgba(255, 255, 255, 0.25), inset 7px 0px 4px 0px rgba(0, 0, 0, 0.45)',
                      overflow: 'visible',
                      transition: 'all 180ms ease',
                    }} 
                  >
                    {selected.has(b._id) && (
                      <div className="absolute left-1/2 top-[57%] w-[138%] h-[149%]" style={{
                        transform: 'translate(-50%, calc(-50% + 12px))',
                        borderRadius: 11,
                        background: 'rgba(96, 53, 27, 0.08)',
                        boxShadow: '0 10px 20px rgba(96, 53, 27, 0.12), inset 0px 0px 5.1px 0px rgba(96, 53, 27, 0.25)',
                        zIndex: 0,
                        transition: 'all 180ms ease',
                        pointerEvents: 'none',
                      }} />
                    )}

                    {b.coverImage ? (
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="w-full h-full object-cover relative z-[1]"
                        style={{
                          borderTopLeftRadius: 6,
                          borderTopRightRadius: 2,
                          borderBottomRightRadius: 2,
                          borderBottomLeftRadius: 6,
                        }}
                      />
                    ) : (
                      <Image
                        src={card1}
                        alt={b.title}
                        width={135}
                        height={198}
                        className="w-full h-full object-cover relative z-[1]"
                        style={{
                          borderTopLeftRadius: 6,
                          borderTopRightRadius: 2,
                          borderBottomRightRadius: 2,
                          borderBottomLeftRadius: 6,
                        }}
                      />
                    )}

                    {selected.has(b._id) && (
                      <span className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 text-[#5C2F1E] text-xs font-medium z-[2]">✓</span>
                    )} 
                  </button>

                  <div className="text-xs sm:text-sm" style={{
                    fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                    fontWeight: 510,
                    lineHeight: '17px',
                    textAlign: 'center',
                    color: 'rgba(0,0,0,1)'
                  }}>{b.title}</div>
                  <div className="text-[10px] sm:text-xs" style={{
                    marginTop: 2,
                    fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                    fontWeight: 510,
                    lineHeight: '17px',
                    textAlign: 'center',
                    color: 'rgba(204,62,0,1)'
                  }}>{b.author?.name || b.author}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-sm text-[#0C1421] underline order-2 sm:order-1 hover:text-gray-900"
            >
              Skip for now
            </button>

            <div className="flex items-center justify-center order-1 sm:order-2">
              <div className="text-sm text-[#0C1421]">2</div>
            </div>

            <button 
              onClick={handleContinue}
              disabled={loading}
              className="px-6 py-3 bg-[#5C2F1E] text-white rounded-xl shadow-sm text-sm sm:text-base order-3 hover:bg-[#4A2518] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
