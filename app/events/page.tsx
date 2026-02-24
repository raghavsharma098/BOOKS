'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, eventsApi, getImageUrl, tokenManager } from '../../lib/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import TopBarWrapper from '../components/TopBarWrapper';
import MobileDrawer from '../components/MobileDrawer';
import { useMobileMenu } from '../contexts/MobileMenuContext';

// Placeholder images

import bellIcon from '../../images/bell.png';
import calendarIcon from '../../images/calendar.png';
import yellowFeaturedIcon from '../../images/yellowfeatured.png';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso?: string | null): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function categoryLabel(type?: string): string {
  if (!type) return 'Event';
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

// ─── filter tabs ─────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: 'all', label: 'All Events' },
  { key: 'reading', label: 'Readings' },
  { key: 'launch', label: 'Launches' },
  { key: 'festival', label: 'Festivals' },
  { key: 'meetup', label: 'Meetups' },
  { key: 'signing', label: 'Signings' },
  { key: 'author_talk', label: 'Author Talks' },
  { key: 'workshop', label: 'Workshops' },
];

// ─── EventCard ───────────────────────────────────────────────────────────────
function EventCard({ event }: { event: any }) {
  const cover = event.coverImage ? getImageUrl(event.coverImage) : null;
  return (
    <div className="bg-white bg-opacity-100 rounded-xl overflow-hidden shadow-sm border border-[#210C00]/5 hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-36 sm:h-40 md:h-44 flex-shrink-0">
        {event.type && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-1 rounded text-[8px] sm:text-[9px] font-semibold bg-[#60351B]/80 text-white backdrop-blur-sm uppercase tracking-wide">
              {categoryLabel(event.type)}
            </span>
          </div>
        )}
        {event.isFreeEntry && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 rounded-full text-[8px] sm:text-[9px] font-medium bg-[#2D8B4E] text-white">Free Entry</span>
          </div>
        )}
        <div className="w-full h-full bg-gradient-to-br from-[#8B7355] via-[#6B5344] to-[#4A3728]">
          {cover ? (
            <img src={cover} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-sf font-[590] text-[18px] sm:text-[20px] lg:text-[24px] leading-[24px] sm:leading-[26px] lg:leading-[30px] text-[#210C00] mb-2 line-clamp-2">{event.title}</h3>

        <div className="flex items-center gap-1 sm:gap-1.5 mt-3 mb-1">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#60351B] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="font-sf font-[590] text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] text-[#210C00]/70">
            {formatDate(event.startDate)}
          </span>
          <span className="font-sf font-[590] text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] text-[#210C00]/70">· {formatTime(event.startDate)}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 mb-3">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#60351B] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-sf font-[590] text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] text-[#210C00]/70">
            {[event.venue, event.city].filter(Boolean).join(', ') || 'Location TBD'}
          </span>
        </div>
        <div className="mt-1">
          <button className="w-[110px] sm:w-[133px] h-[26px] sm:h-[29px] rounded-[26843500px] border-[0.8px] border-[#210C0080] bg-[#60351B33] text-[#210C00] font-sf font-[590] text-[10px] sm:text-[12px] leading-[14px] sm:leading-[16px] flex items-center justify-center">
            Compass editorial
          </button>
        </div>

        {event.rsvpCount > 0 && (
          <div className="text-[10px] sm:text-xs text-[#210C00]/50 mb-3">{event.rsvpCount} going</div>
        )}

        <hr className="mt-1.5 sm:mt-2 border-t-[0.8px] border-[#60351B1A] mb-2 sm:mb-3" />
        <div className="mt-2 sm:mt-3 flex justify-start">
          <Link
            href={`/events/${event._id}`}
            className="font-sf font-[590] text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] text-[#60351B] inline-flex items-center gap-1 transition-colors"
          >
            View Details
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EventsPage(): JSX.Element {
  const router = useRouter();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();

  const [userData, setUserData] = useState<any>(null);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Date filter state
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ label: string; start?: Date; end?: Date } | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  const [rsvpDone, setRsvpDone] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 12;

  const isLoggedIn = !!((tokenManager.getUser() as any)?._id);
  const isVerifiedAuthor = userData?.role === 'verified_author' || userData?.isVerified === true;

  const fetchEvents = useCallback(async (pg: number, filter: string, city: string, dateRange?: { start?: Date; end?: Date } | null) => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, any> = { page: pg, limit: LIMIT, upcoming: true };
      if (filter !== 'all') {
        const typeMap: Record<string, string> = {
          reading: 'Reading', launch: 'Launch', festival: 'Festival',
          meetup: 'Meetup', signing: 'Signing', author_talk: 'Author Talk', workshop: 'Workshop',
        };
        params.type = typeMap[filter] || filter;
      }
      if (city) params.city = city;
      // Add date range to params if API supports it
      if (dateRange?.start) {
        params.startDate = dateRange.start.toISOString();
      }
      if (dateRange?.end) {
        params.endDate = dateRange.end.toISOString();
      }

      const [eventsRes, featuredRes, userRes]: any[] = await Promise.all([
        eventsApi.getAll(params).catch(() => null),
        pg === 1 ? eventsApi.getFeatured(3).catch(() => null) : Promise.resolve(null),
        userApi.getProfile().catch(() => null),
      ]);

      if (eventsRes?.data) {
        // Client-side date filtering as fallback
        let filteredData = eventsRes.data;
        if (dateRange?.start || dateRange?.end) {
          filteredData = (eventsRes.data as any[]).filter((event: any) => {
            if (!event.startDate) return false;
            const eventDate = new Date(event.startDate);
            eventDate.setHours(0, 0, 0, 0);
            if (dateRange.start && eventDate < dateRange.start) return false;
            if (dateRange.end) {
              const endOfDay = new Date(dateRange.end);
              endOfDay.setHours(23, 59, 59, 999);
              if (eventDate > endOfDay) return false;
            }
            return true;
          });
        }
        setAllEvents(filteredData);
        setTotalPages(eventsRes.pages || 1);
        if (pg === 1 && filter === 'all' && !city) {
          const citySet = new Set<string>((eventsRes.data as any[]).map((e: any) => e.city).filter(Boolean));
          setCities(Array.from(citySet).sort());
        }
      }
      if (featuredRes?.data) setFeaturedEvents(featuredRes.data);
      if (userRes?.data) setUserData(userRes.data);
    } catch (err: any) {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(1, 'all', '', null);
  }, [fetchEvents]);

  useEffect(() => {
    setPage(1);
    fetchEvents(1, activeFilter, cityFilter, dateFilter);
  }, [activeFilter, cityFilter, dateFilter, fetchEvents]);

  // Calendar helper functions
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleDateFilterSelect = (filterType: string, date?: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterType) {
      case 'all':
        setDateFilter(null);
        break;
      case 'today':
        setDateFilter({ label: 'Today', start: today, end: today });
        break;
      case 'this_week': {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        setDateFilter({ label: 'This Week', start: today, end: endOfWeek });
        break;
      }
      case 'this_month': {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setDateFilter({ label: 'This Month', start: today, end: endOfMonth });
        break;
      }
      case 'specific':
        if (date) {
          setDateFilter({ label: formatDate(date.toISOString()), start: date, end: date });
        }
        break;
    }
    setShowDateDropdown(false);
  };

  const isDateInFilter = (day: number) => {
    if (!dateFilter?.start) return false;
    const date = new Date(calendarYear, calendarMonth, day);
    return date >= dateFilter.start && date <= (dateFilter.end || dateFilter.start);
  };

  async function handleRsvp(eventId: string) {
    if (!isLoggedIn) { router.push('/login'); return; }
    setRsvpLoading(eventId);
    try {
      await eventsApi.rsvp(eventId, 'going');
      setRsvpDone((prev) => new Set([...prev, eventId]));
      setAllEvents((prev) => prev.map((e) => e._id === eventId ? { ...e, rsvpCount: (e.rsvpCount || 0) + 1 } : e));
      setFeaturedEvents((prev) => prev.map((e) => e._id === eventId ? { ...e, rsvpCount: (e.rsvpCount || 0) + 1 } : e));
    } catch { /* ignore */ }
    finally { setRsvpLoading(null); }
  }

  const filteredCities = cityInput
    ? cities.filter((c) => c.toLowerCase().includes(cityInput.toLowerCase()))
    : cities;

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      <TopBarWrapper>
        <SearchBar
          asHeader
          placeholder="Search book by name, author..."
          onFilterOpenChange={() => {}}
          onApplyFilters={() => {}}
          onPickRandom={() => {}}
        />
      </TopBarWrapper>
      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      <div className="w-full lg:ml-24">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 hidden sm:block bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 max-w-[280px] sm:max-w-sm md:max-w-md lg:-ml-8">
              <SearchBar placeholder="Search book by name, author..." onFilterOpenChange={() => {}} onApplyFilters={() => {}} onPickRandom={() => {}} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {userData?.profilePicture ? (
                    <img src={getImageUrl(userData.profilePicture)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                <span className="hidden md:block text-xs sm:text-sm font-medium text-[#0C1421] truncate max-w-[100px]">
                  {userData?.name || 'User'}
                </span>
              </div>
              <button aria-label="Notifications" className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
                <Image src={bellIcon} alt="Notifications" width={18} height={18} className="object-contain sm:w-[22px] sm:h-[22px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mt-14 sm:mt-0">
          <div className="max-w-6xl mx-auto lg:mx-16">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="mb-1 text-[#210C00] font-[590] font-sf text-[24px] sm:text-[32px] lg:text-[42px] leading-[32px] sm:leading-[44px] lg:leading-[60px] tracking-[-0.5px] sm:tracking-[-1px] lg:tracking-[-1.5px] align-middle">
                  Book Events
                </h1>
                <p className="text-xs sm:text-sm text-[#210C00]/60">Discover curated literary events—from intimate readings to grand festivals</p>
              </div>
              {/* always show Add Event for testing */}
              <Link
                href="/create-event"
                className="inline-flex items-center gap-[6px] sm:gap-[8px] justify-center w-[120px] sm:w-[142px] h-[38px] sm:h-[44px] px-3 sm:px-[18px] py-2 sm:py-[10px] rounded-[26843500px] text-white text-xs sm:text-sm font-medium transition-colors self-start sm:self-auto border border-[#000]/20"
                style={{ background: 'linear-gradient(180deg, #60351B 0%, #4A2816 100%)' }}
              >
                <Image src={calendarIcon} alt="" width={14} height={14} className="object-contain filter brightness-0 invert sm:w-4 sm:h-4" />
                Add Event
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2">
              {/* All Dates filter */}
              <div className="relative" ref={dateDropdownRef}>
                <button
                  onClick={() => { setShowDateDropdown((v) => !v); setShowCityDropdown(false); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[26843500px] border border-[#210C00]/10 text-xs sm:text-sm transition-colors ${dateFilter ? 'bg-[#60351B] text-white' : 'bg-white text-[#210C00]/70 hover:bg-[#210C00]/5'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {dateFilter?.label || 'All Dates'}
                  {dateFilter && (
                    <span onClick={(e) => { e.stopPropagation(); setDateFilter(null); }} className="ml-1 font-bold cursor-pointer hover:opacity-70">×</span>
                  )}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showDateDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-[#210C00]/10 rounded-lg shadow-lg z-20 overflow-hidden">
                    {/* Quick filters */}
                    <div className="p-2 border-b border-[#210C00]/5 flex flex-wrap gap-1">
                      <button onClick={() => handleDateFilterSelect('all')} className={`px-2.5 py-1 rounded text-xs transition-colors ${!dateFilter ? 'bg-[#60351B] text-white' : 'bg-[#60351B]/10 text-[#60351B] hover:bg-[#60351B]/20'}`}>All</button>
                      <button onClick={() => handleDateFilterSelect('today')} className={`px-2.5 py-1 rounded text-xs transition-colors ${dateFilter?.label === 'Today' ? 'bg-[#60351B] text-white' : 'bg-[#60351B]/10 text-[#60351B] hover:bg-[#60351B]/20'}`}>Today</button>
                      <button onClick={() => handleDateFilterSelect('this_week')} className={`px-2.5 py-1 rounded text-xs transition-colors ${dateFilter?.label === 'This Week' ? 'bg-[#60351B] text-white' : 'bg-[#60351B]/10 text-[#60351B] hover:bg-[#60351B]/20'}`}>This Week</button>
                      <button onClick={() => handleDateFilterSelect('this_month')} className={`px-2.5 py-1 rounded text-xs transition-colors ${dateFilter?.label === 'This Month' ? 'bg-[#60351B] text-white' : 'bg-[#60351B]/10 text-[#60351B] hover:bg-[#60351B]/20'}`}>This Month</button>
                    </div>
                    {/* Calendar header */}
                    <div className="p-2 border-b border-[#210C00]/5 flex items-center justify-between">
                      <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else { setCalendarMonth(m => m - 1); } }} className="p-1 hover:bg-[#210C00]/5 rounded">
                        <svg className="w-4 h-4 text-[#210C00]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                      </button>
                      <span className="text-sm font-medium text-[#210C00]">{monthNames[calendarMonth]} {calendarYear}</span>
                      <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else { setCalendarMonth(m => m + 1); } }} className="p-1 hover:bg-[#210C00]/5 rounded">
                        <svg className="w-4 h-4 text-[#210C00]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                      </button>
                    </div>
                    {/* Calendar grid */}
                    <div className="p-2">
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                          <div key={d} className="text-center text-[10px] font-medium text-[#210C00]/40 py-1">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-7" />
                        ))}
                        {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                          const day = i + 1;
                          const isSelected = isDateInFilter(day);
                          const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth && new Date().getFullYear() === calendarYear;
                          return (
                            <button
                              key={day}
                              onClick={() => handleDateFilterSelect('specific', new Date(calendarYear, calendarMonth, day))}
                              className={`h-7 rounded text-xs transition-colors ${isSelected ? 'bg-[#60351B] text-white' : isToday ? 'bg-[#60351B]/10 text-[#60351B] font-medium' : 'text-[#210C00]/70 hover:bg-[#210C00]/5'}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* City Dropdown */}
              <div className="relative" ref={cityDropdownRef}>
                <button
                  onClick={() => { setShowCityDropdown((v) => !v); setShowDateDropdown(false); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[26843500px] bg-white border border-[#210C00]/10 text-xs sm:text-sm text-[#210C00]/70 hover:bg-[#210C00]/5 transition-colors"
                >
                  {cityFilter || 'All Cities'}
                  {cityFilter && (
                    <span onClick={(e) => { e.stopPropagation(); setCityFilter(''); setCityInput(''); }} className="ml-1 text-[#60351B] font-bold cursor-pointer">×</span>
                  )}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showCityDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#210C00]/10 rounded-lg shadow-lg z-20 overflow-hidden">
                    <div className="p-2 border-b border-[#210C00]/5">
                      <input autoFocus value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="Search city..." className="w-full text-xs px-2 py-1 border border-[#210C00]/10 rounded outline-none" />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <button onClick={() => { setCityFilter(''); setCityInput(''); setShowCityDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-[#60351B]/5 text-[#210C00]/70">All Cities</button>
                      {filteredCities.map((c) => (
                        <button key={c} onClick={() => { setCityFilter(c); setCityInput(''); setShowCityDropdown(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-[#60351B]/5 ${cityFilter === c ? 'text-[#60351B] font-medium' : 'text-[#210C00]/70'}`}>{c}</button>
                      ))}
                      {filteredCities.length === 0 && <p className="px-3 py-2 text-xs text-[#210C00]/40 italic">No cities found</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Type Filter Tabs */}
              <div className="flex items-center gap-1 sm:gap-2 flex-nowrap overflow-x-auto">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeFilter === tab.key ? 'bg-[#60351B] text-white' : 'bg-white text-[#210C00]/70 hover:bg-[#210C00]/5 border border-[#210C00]/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-24">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#60351B]" />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="text-center py-16">
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <button onClick={() => fetchEvents(page, activeFilter, cityFilter, dateFilter)} className="px-4 py-2 bg-[#60351B] text-white text-sm rounded-lg">Retry</button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Featured Events — first page, no filter */}
                {featuredEvents.length > 0 && activeFilter === 'all' && !cityFilter && page === 1 && (
                  <div className="mb-8 sm:mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Image src={yellowFeaturedIcon} alt="" width={20} height={20} className="object-contain" />
                      <h2 className="font-sf font-[590] text-[22px] sm:text-[26px] lg:text-[30px] leading-[28px] sm:leading-[32px] lg:leading-[36px] text-[#210C00]">Featured Events</h2>
                      <span className="ml-auto text-xs text-[#210C00]/50">{featuredEvents.length} featured</span>
                    </div>

                    {featuredEvents.map((event) => {
                      const cover = event.coverImage ? getImageUrl(event.coverImage) : null;
                      return (
                        <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#210C00]/5 mb-4">
                          <div className="flex flex-col md:flex-row items-stretch">
                            <div className="relative w-full md:w-2/5 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] flex-shrink-0">
                              {event.isFreeEntry && (
                                <div className="absolute top-3 left-3 z-10">
                                  <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#2D8B4E] text-white">Free Entry</span>
                                </div>
                              )}
                            <div className="absolute inset-0 bg-center bg-cover" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
                                {!cover && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex-1 p-4 sm:p-6 pl-4 sm:pl-8 lg:pl-12 flex flex-col justify-between">
                              <div>
                                {event.type && categoryLabel(event.type) !== 'Launch' && (
                                  <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-semibold bg-[#60351B]/10 text-[#60351B] mb-2 uppercase tracking-wide">{categoryLabel(event.type)}</span>
                                )}
                                <h3 className="font-sf font-[590] text-[22px] sm:text-[28px] lg:text-[36px] leading-[28px] sm:leading-[36px] lg:leading-[45px] text-[#210C00] mb-2">{event.title}</h3>
                                {event.description && (
                                  <p className="font-sf font-[400] text-[16px] leading-[26px] text-[#210C00]/B2 pt-4 mb-4 line-clamp-3">{event.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
                                  <div>
                                    <p className="text-[9px] sm:text-[10px] text-[#210C00]/40 mb-0.5">DATE</p>
                                    <div className="flex items-center gap-1 text-[#210C00] text-[12px] sm:text-[14px]">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-[#60351B1A] p-1.5 sm:p-2 text-[#60351B]">
                                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                                      </div>
                                      {formatDate(event.startDate)}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[9px] sm:text-[10px] text-[#210C00]/40 mb-0.5">TIME</p>
                                    <div className="flex items-center gap-1 text-[#210C00] text-[12px] sm:text-[14px]">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-[#60351B1A] p-1.5 sm:p-2 text-[#60351B]">
                                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                      </div>
                                      {formatTime(event.startDate)}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[9px] sm:text-[10px] text-[#210C00]/40 mb-0.5">LOCATION</p>
                                    <div className="flex items-center gap-1 text-[#210C00] text-[12px] sm:text-[14px]">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-[#60351B1A] p-1.5 sm:p-2 text-[#60351B]">
                                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                      </div>
                                      {[event.venue, event.city].filter(Boolean).join(', ') || 'TBD'}
                                    </div>
                                  </div>
                                  {event.rsvpCount > 0 && (
                                    <div>
                                      <p className="text-[9px] sm:text-[10px] text-[#210C00]/40 mb-0.5">GOING</p>
                                      <div className="font-medium text-[#210C00]">{event.rsvpCount}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 sm:mt-6">
                                <hr className="border-t-[1.6px] border-[#60351B1A]" />
                                <div className="flex justify-end rounded-[26843500px]">
                                  <Link href={`/events/${event._id}`} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mt-3 sm:mt-4 rounded-[26843500px] bg-[#60351B] text-white text-xs sm:text-sm font-medium hover:bg-[#4A2518] transition-colors">
                                    View Event
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* All / Filtered Events */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-sf font-[590] text-[22px] sm:text-[26px] lg:text-[30px] leading-[28px] sm:leading-[32px] lg:leading-[36px] text-[#210C00]">
                      {activeFilter === 'all' && !cityFilter ? 'Upcoming Events' : 'Events'}
                    </h2>
                    <span className="text-xs text-[#210C00]/50">{allEvents.length} events</span>
                  </div>

                  {allEvents.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-[#210C00]/5">
                      <svg className="w-12 h-12 mx-auto text-[#210C00]/20 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <p className="text-sm text-[#210C00]/50">No events found{cityFilter ? ` in ${cityFilter}` : ''}.</p>
                      {(activeFilter !== 'all' || cityFilter) && (
                        <button onClick={() => { setActiveFilter('all'); setCityFilter(''); }} className="mt-3 text-xs text-[#60351B] underline">
                          Clear filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {allEvents.map((event) => (
                        <EventCard key={event._id} event={event} />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
                      <button
                        disabled={page <= 1}
                        onClick={() => { const p = page - 1; setPage(p); fetchEvents(p, activeFilter, cityFilter, dateFilter); }}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#210C00]/10 text-xs sm:text-sm text-[#210C00]/70 hover:bg-[#210C00]/5 disabled:opacity-40"
                      >← Prev</button>
                      <span className="text-xs sm:text-sm text-[#210C00]/60">Page {page} of {totalPages}</span>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => { const p = page + 1; setPage(p); fetchEvents(p, activeFilter, cityFilter, dateFilter); }}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#210C00]/10 text-xs sm:text-sm text-[#210C00]/70 hover:bg-[#210C00]/5 disabled:opacity-40"
                      >Next →</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

