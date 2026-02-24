'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMobileMenu } from '../contexts/MobileMenuContext';
// @ts-ignore - react-dom types may be missing in the workspace
import { createPortal } from 'react-dom';

// Dynamic placeholder content for the filter panel (admin-configurable)
interface FilterContent {
  title: string;
  moodLabel: string;
  showBooksLabel: string;
  matchAnyLabel: string;
  matchAllLabel: string;
  paceLabel: string;
  typeLabel: string;
  pagesLabel: string;
  pickRandomLabel: string;
  applyLabel: string;
  moods: string[];
  paceOptions: string[];
  typeOptions: string[];
  pageOptions: string[];
}

const defaultFilterContent: FilterContent = {
  title: 'Filter all books',
  moodLabel: "I'm in the mood for something...",
  showBooksLabel: 'Show books with...',
  matchAnyLabel: 'any of the selected moods',
  matchAllLabel: 'all of the selected moods',
  paceLabel: 'Pace',
  typeLabel: 'Type',
  pagesLabel: 'Pages',
  pickRandomLabel: 'Pick a random book',
  applyLabel: 'Apply',
  moods: ['Adventurous', 'hopeful', 'funny', 'reflective', 'challenging', 'informative', 'hopeful', 'relaxing', 'dark', 'inspiring', 'lighthearted'],
  paceOptions: ['Slow', 'Medium', 'Fast'],
  typeOptions: ['Fiction', 'Non-Fiction'],
  pageOptions: ['<200', '<500-600', '800+'],
};

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  /** optional additional classes applied to the outer container(s) */
  className?: string;
  /** when true the SearchBar renders inline for header usage (no fixed/mobile-centred positioning) */
  asHeader?: boolean;
  /** optional: initial filters to show in the parent page (keeps tags in sync) */
  initialFilters?: string[];
  /** optional: called when the user clicks "Apply filters" in the filter panel */
  onApplyFilters?: (filters: string[]) => void;
  /** optional: called when the filter panel opens/closes so parent UI can react */
  onFilterOpenChange?: (open: boolean) => void;
  /** optional: called by the "Pick random book" control (pages that support it can pass a handler) */
  onPickRandom?: () => void;
  /** optional: when false, hide filter button + panel (useful when parent provides its own filter UI) */
  showFilters?: boolean;
  /** optional: custom filter content for dynamic placeholders */
  filterContent?: Partial<FilterContent>;
};

export default function SearchBar({ value: controlledValue, onChange, placeholder = 'Search...', className = '', asHeader = false, initialFilters, onApplyFilters, onFilterOpenChange, onPickRandom, showFilters = true, filterContent: customFilterContent }: Props) {
  // Merge custom filter content with defaults
  const filterContent = { ...defaultFilterContent, ...customFilterContent };
  
  const [query, setQuery] = useState<string>(controlledValue ?? '');
  useEffect(() => {
    if (controlledValue !== undefined) setQuery(controlledValue);
  }, [controlledValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onChange?.(e.target.value);
  }

  // --- Filter panel state (copied from search-book page) ---
  const [filters, setFilters] = useState<string[]>(initialFilters ?? []);

  // keep internal filters in sync with parent-provided initialFilters
  useEffect(() => {
    if (initialFilters) setFilters(initialFilters);
  }, [initialFilters]);

  // filter modal state + selections
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [matchAllMoods, setMatchAllMoods] = useState(false); // false => any
  const [selectedPace, setSelectedPace] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  function toggleMood(m: string) {
    setSelectedMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }
  function togglePace(p: string) {
    setSelectedPace((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }
  function toggleType(t: string) {
    setSelectedType((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }
  function togglePageRange(r: string) {
    setSelectedPages((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  function handleApplyFilters() {
    const newFilters: string[] = [];
    selectedMoods.forEach((m) => newFilters.push(m));
    selectedPace.forEach((p) => newFilters.push(p + ' pace'));
    selectedType.forEach((t) => newFilters.push(t));
    selectedPages.forEach((p) => newFilters.push(`Pages ${p}`));
    setFilters(newFilters);
    // notify parent page (if provided) so tags / external state stay in sync
    onApplyFilters?.(newFilters);
    setIsFilterOpen(false);
  }

  // router + shared mobile/menu state
  const router = useRouter();
  const { setActiveIcon, setMobileMenuOpen } = useMobileMenu();

  // refs + panel positioning for anchored popup
  const filterBtnRef = useRef<HTMLButtonElement | null>(null);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const [panelCoords, setPanelCoords] = useState<{ top: number; left: number; arrowLeft: number } | null>(null);

  function doSearch() {
    const q = query.trim();
    if (!q) return;
    // navigate to search results page with query param
    router.push(`/search-book?q=${encodeURIComponent(q)}`);
    // highlight Home in the shared sidebar/navbar
    setActiveIcon?.('home');
    // close mobile drawer if open
    setMobileMenuOpen?.(false);
  }

  useEffect(() => {
    if (!isFilterOpen) {
      setPanelCoords(null);
      return;
    }
    
    // On mobile, skip positioning since panel is full width and centered via CSS
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      setPanelCoords(null);
      return;
    }
    
    const compute = () => {
      // Skip on mobile - already handled by CSS
      if (window.innerWidth < 640) {
        setPanelCoords(null);
        return;
      }
      
      const btn = filterBtnRef.current;
      const panel = filterPanelRef.current;
      const header = topBarRef.current;
      if (!btn || !panel) return;
      const btnRect = btn.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;

      const headerBottom = header ? header.getBoundingClientRect().bottom + scrollY : 0;
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

  // notify parent when filter panel open state changes
  useEffect(() => { onFilterOpenChange?.(isFilterOpen); }, [isFilterOpen, onFilterOpenChange]);

  // prevent background scrolling while filter modal is open (lock both <html> and <body>)
  useEffect(() => {
    if (!isFilterOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    
    // Only calculate scrollbar width on desktop (mobile doesn't have visible scrollbars)
    const isMobile = window.innerWidth < 640;
    const scrollBarWidth = isMobile ? 0 : (window.innerWidth - document.documentElement.clientWidth);

    // lock scrolling on the page (covers cases where a scroll container is attached to html)
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = originalBodyOverflow || '';
      document.documentElement.style.overflow = originalHtmlOverflow || '';
      document.body.style.paddingRight = originalBodyPaddingRight || '';
    };
  }, [isFilterOpen]);

  function removeFilter(filter: string) {
    setFilters((prev) => prev.filter((f) => f !== filter));
  }

  return (
    <div
      ref={topBarRef}
      className={`${asHeader ? 'w-full' : 'fixed lg:static left-1/2 lg:left-auto top-14 lg:top-auto -translate-x-[45%] lg:-translate-x-1 lg:translate-x-0 w-[92%] lg:w-full z-[60] lg:z-auto'} ${className || ''}`}
      style={{ maxWidth: 720 }}
    >
      {/* Search input + filter button (same markup & behaviour as in search-book) */}
      <div className={`${asHeader ? 'relative flex items-center w-full sm:w-[310px] md:w-[360px] lg:w-[400px] h-11 sm:h-12 gap-[10px] px-[14px] bg-[rgba(246,241,234,0.96)] rounded-[12px] border border-[rgba(33,12,0,0.08)] shadow-sm' : 'relative flex items-center w-full sm:w-[310px] md:w-[360px] lg:w-[400px] h-11 sm:h-12 gap-2 sm:gap-3 px-3 sm:px-4 bg-[rgba(246,241,234,0.96)] rounded-[12px] border border-[rgba(33,12,0,0.08)] shadow-sm'} ${className || ''}`} style={{ boxShadow: '0px 6px 20px rgba(33,12,0,0.08)' }}>
        <button type="button" aria-label="Search" onClick={() => doSearch()} className="flex-shrink-0 flex items-center justify-center">
          <svg className="text-[#6B4A33] w-[18px] h-[18px] sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-4.35-4.35" stroke="#6B4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="11" cy="11" r="6" stroke="#6B4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <input
          id="search"
          aria-label="Search books"
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm sm:text-base text-[#0C1421] placeholder:text-[#6B4A33]/60"
        />

        {showFilters && (
          <button 
            ref={filterBtnRef} 
            id="filter-button" 
            type="button" 
            onClick={() => setIsFilterOpen(true)} 
            aria-expanded={isFilterOpen} 
            aria-controls="filter-panel" 
            className="absolute right-3 top-1/2 -translate-y-1/2 flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-[#6B4A33] hover:bg-[#6B4A33]/10 transition-colors"
          >
            <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="#6B4A33" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter panel (anchored popup) — rendered into a portal so the backdrop covers the full viewport */}
      {isFilterOpen && typeof document !== 'undefined' ? createPortal(
        <>
          {/* full-page backdrop (blur + intercept clicks) */}
          <div
            className="fixed inset-0 filter-backdrop z-[9998]"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setIsFilterOpen(false)}
          />

          <div
            id="filter-panel"
            role="dialog"
            aria-modal="true"
            className={`fixed inset-0 flex items-center justify-center fixed z-[10000] flex items-start justify-center ${panelCoords ? '' : 'inset-x-4 top-16'}`}
            style={panelCoords ? { 
              top: `${panelCoords.top}px`, 
              left: `${panelCoords.left}px`
            } : undefined}
          >
            <div 
              ref={filterPanelRef} 
              className="relative bg-white/40 p-6 rounded-xl shadow-xl relative rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 md:p-8 w-full max-w-full sm:max-w-[520px] md:max-w-[600px] lg:max-w-[680px] max-h-[85vh] overflow-y-auto hide-scrollbar border border-[rgba(33,12,0,0.2)] sm:border-[rgba(33,12,0,0.15)]"
              style={{ 
                backdropFilter: 'blur(10px)',
                background:" rgba(255,255,255,0.2)",
                boxShadow: '0px 8px 32px rgba(33, 12, 0, 0.25), 0px 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {/* Close button */}
              <button 
                aria-label="Close filters" 
                onClick={() => setIsFilterOpen(false)} 
                className="absolute right-4 top-4 sm:right-5 sm:top-5 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-6 sm:h-6">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#210C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Title */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#210C00] mb-4 sm:mb-5 pr-12">
                {filterContent.title}
              </h2>

              {/* Mood label */}
              <p className="text-sm sm:text-base text-[#6B4A33] mb-3 sm:mb-4">
                {filterContent.moodLabel}
              </p>

              {/* Moods grid - responsive columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-2.5 sm:gap-x-4 sm:gap-y-3 mb-5 sm:mb-6">
                {filterContent.moods.map((m, idx) => {
                  const sel = selectedMoods.includes(m);
                  return (
                    <label key={`${m}-${idx}`} className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => toggleMood(m)}
                        className="sr-only"
                        aria-checked={sel}
                        aria-label={m}
                      />
                      <span
                        aria-hidden
                        className="flex-shrink-0 w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-[4px] border-2 border-[#60351B] flex items-center justify-center transition-all group-hover:border-[#D0744C]"
                        style={{ background: sel ? '#5F3824' : 'transparent' }}
                      >
                        {sel && (
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm sm:text-base text-[#210C00] capitalize">{m}</span>
                    </label>
                  );
                })}
              </div>

              {/* Show books with label */}
              <p className="text-sm sm:text-base text-[#6B4A33] mb-3">
                {filterContent.showBooksLabel}
              </p>

              {/* Any / All moods radio buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-5 sm:mb-6">
                <button 
                  type="button" 
                  onClick={() => setMatchAllMoods(false)} 
                  className="flex items-center gap-2.5 sm:gap-3"
                >
                  <span className={`w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${!matchAllMoods ? 'border-[#5F3824] bg-[#5F3824]' : 'border-[#60351B]'}`}>
                    {!matchAllMoods && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm sm:text-base text-[#210C00]">{filterContent.matchAnyLabel}</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => setMatchAllMoods(true)} 
                  className="flex items-center gap-2.5 sm:gap-3"
                >
                  <span className={`w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${matchAllMoods ? 'border-[#5F3824] bg-[#5F3824]' : 'border-[#60351B]'}`}>
                    {matchAllMoods && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm sm:text-base text-[#210C00]">{filterContent.matchAllLabel}</span>
                </button>
              </div>

              {/* Pace */}
              <div className="mb-5 sm:mb-6">
                <p className="text-sm sm:text-base text-[#6B4A33] mb-3">{filterContent.paceLabel}</p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {filterContent.paceOptions.map((p) => {
                    const sel = selectedPace.includes(p);
                    return (
                      <label key={p} className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => togglePace(p)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className="flex-shrink-0 w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-[4px] border-2 border-[#60351B] flex items-center justify-center transition-all group-hover:border-[#D0744C]"
                          style={{ background: sel ? '#5F3824' : 'transparent' }}
                        >
                          {sel && (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm sm:text-base text-[#210C00]">{p}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Type */}
              <div className="mb-5 sm:mb-6">
                <p className="text-sm sm:text-base text-[#6B4A33] mb-3">{filterContent.typeLabel}</p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {filterContent.typeOptions.map((t) => {
                    const sel = selectedType.includes(t);
                    return (
                      <label key={t} className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => toggleType(t)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className="flex-shrink-0 w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-[4px] border-2 border-[#60351B] flex items-center justify-center transition-all group-hover:border-[#D0744C]"
                          style={{ background: sel ? '#5F3824' : 'transparent' }}
                        >
                          {sel && (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm sm:text-base text-[#210C00]">{t}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pages */}
              <div className="mb-6 sm:mb-8">
                <p className="text-sm sm:text-base text-[#6B4A33] mb-3">{filterContent.pagesLabel}</p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {filterContent.pageOptions.map((r) => {
                    const sel = selectedPages.includes(r);
                    return (
                      <label key={r} className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => togglePageRange(r)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className="flex-shrink-0 w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-[4px] border-2 border-[#60351B] flex items-center justify-center transition-all group-hover:border-[#D0744C]"
                          style={{ background: sel ? '#5F3824' : 'transparent' }}
                        >
                          {sel && (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm sm:text-base text-[#210C00]">{r}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Pick a random book button - outlined style */}
                <button
                  type="button"
                  onClick={() => { onPickRandom?.(); setIsFilterOpen(false); }}
                  className="flex-1 sm:flex-initial px-6 py-3 sm:py-3.5 rounded-[18px] border-2 border-[#210C00] text-sm sm:text-base font-medium text-[#210C00] hover:bg-[#210C00]/5 transition-all"
                  style={{
                    boxShadow: '0px 2px 8px rgba(33, 12, 0, 0.1)',
                  }}
                >
                  {filterContent.pickRandomLabel}
                </button>

                {/* Apply button - filled style */}
                <button 
                  type="button" 
                  onClick={handleApplyFilters} 
                  className="flex-1 sm:flex-initial px-8 sm:px-10 py-3 sm:py-3.5 rounded-[18px] text-sm sm:text-base font-medium text-white transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(180deg, #60351B 0%, #4A2914 100%)',
                    boxShadow: '0px 4px 12px rgba(96, 53, 27, 0.35), 0px 2px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  {filterContent.applyLabel}
                </button>
              </div>
            </div>
          </div>
        </>, document.body) : null }

      <style jsx global>{`
        @keyframes filterBackdropFade {
          from { 
            background-color: rgba(0,0,0,0); 
            backdrop-filter: blur(0px); 
            -webkit-backdrop-filter: blur(0px); 
          }
          to { 
            background-color: rgba(0,0,0,0.3); 
            backdrop-filter: blur(8px); 
            -webkit-backdrop-filter: blur(8px); 
          }
        }
        @keyframes filterPanelSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .filter-backdrop { 
          animation: filterBackdropFade 250ms ease-out forwards; 
        }
        #filter-panel > div {
          animation: filterPanelSlideIn 300ms ease-out forwards;
        }
        /* hide scrollbar when panel is shown on larger screens */
        @media (min-width: 640px) {
          .hide-scrollbar {
            scrollbar-width: none; /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Webkit */
          }
        }
      `}</style>
    </div>
  );
}
