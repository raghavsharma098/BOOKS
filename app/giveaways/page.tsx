'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import MobileDrawer from '../components/MobileDrawer';
import MobileTopBar from '../components/MobileTopBar';
import SearchBar from '../components/SearchBar';
import UserNavbar from '../components/UserNavbar';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import { giveawaysApi, userApi, getImageUrl } from '../../lib/api';
import bellIcon from '../../images/bell.png';
import leftarrow from '../../images/leftarrow.png';
import trophyIcon from '../../images/trophy.png';
import calendarIcon from '../../images/calendar.png';
import clockIcon from '../../images/whiteclock.png';
import userIcon from '../../images/user2.png';
import featuredBadge from '../../images/yellowfeatured.png';
import Featured from '../../images/featured.png';
import surpriseIcon from '../../icons/surprise.png';


// Placeholder data structure for giveaways
interface Giveaway {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  book?: {
    title?: string;
    author?: { name?: string };
    coverImage?: string;
  };
  prize?: string;
  endDate?: string;
  entryCount?: number;
  entries?: any[];
  status?: 'active' | 'completed' | 'upcoming';
  isFeatured?: boolean;
  numberOfWinners?: number;
  winners?: { user?: { name?: string; profilePicture?: string } }[];
  hasEntered?: boolean;
}

export default function GiveawaysPage(): JSX.Element {
  const router = useRouter();
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [featuredGiveaway, setFeaturedGiveaway] = useState<Giveaway | null>(null);
  const [activeGiveaways, setActiveGiveaways] = useState<Giveaway[]>([]);
  const [completedGiveaways, setCompletedGiveaways] = useState<Giveaway[]>([]);
  const [userEntries, setUserEntries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Enter giveaway confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);

  // Demo / placeholder giveaways shown alongside real data
  const DUMMY_GIVEAWAY: Giveaway = {
    _id: 'dummy-active-1',
    title: 'Sample Giveaway — Book Bundle',
    description: 'Demo giveaway used to preview the UI. No entry required.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    book: { title: 'Sample Bundle', author: { name: 'Various Authors' }, coverImage: '' },
    prize: 'Book Bundle',
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    entryCount: 123,
    entries: [],
    status: 'active',
    isFeatured: false,
    numberOfWinners: 1,
    winners: [],
    hasEntered: false,
  };

  const DUMMY_COMPLETED: Giveaway = {
    _id: 'dummy-completed-1',
    title: 'Completed Demo Giveaway',
    description: 'This is a demo of a completed giveaway with winners shown.',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
    book: { title: 'Demo Book', author: { name: 'Demo Author' }, coverImage: '' },
    prize: 'Book Bundle',
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    entryCount: 987,
    entries: [],
    status: 'completed',
    isFeatured: false,
    numberOfWinners: 2,
    winners: [ { user: { name: 'Emma Rodriguez' } }, { user: { name: 'anny tarker' } } ],
    hasEntered: false,
  };

  const DUMMY_FEATURED: Giveaway = {
    _id: 'dummy-featured-1',
    title: 'Demo Featured Giveaway',
    description: 'Enter for a chance to win a signed first edition of this beloved fantasy novel. A magical tale of two young illusionists locked in a competition that spans years.',
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
    book: { title: 'The Night Circus', author: { name: 'Erin Morgenstern' }, coverImage: '' },
    prize: 'Signed Copy',
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    entryCount: 450,
    entries: [],
    status: 'active',
    isFeatured: true,
    numberOfWinners: 1,
    winners: [],
    hasEntered: false,
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [profileRes, allGiveawaysRes]: any[] = await Promise.all([
          userApi.getProfile().catch(() => null),
          giveawaysApi.getAll({ limit: 20 }).catch(() => ({ data: [] })),
        ]);

        setUserData(profileRes?.data || null);

        const allGiveaways: Giveaway[] = allGiveawaysRes?.data || [];

        // Mock featured giveaway (used when API returns none) — keeps UI fully functional locally
        // Separate featured, active, and completed
        const featured = allGiveaways.find((g) => g.isFeatured) || allGiveaways[0] || DUMMY_FEATURED;
        const active = allGiveaways.filter((g) => g.status === 'active' || (!g.status && g.endDate && new Date(g.endDate) > new Date()));
        const completed = allGiveaways.filter((g) => g.status === 'completed' || (!g.status && g.endDate && new Date(g.endDate) <= new Date()));

        // If backend returned nothing, inject demo placeholders so the UI remains functional
        const finalFeatured = featured || DUMMY_FEATURED;
        const finalActive = active.length > 0 ? active : (allGiveaways.length > 0 ? allGiveaways.slice(0, 4) : [DUMMY_GIVEAWAY]);
        const finalCompleted = completed.length > 0 ? completed : [DUMMY_COMPLETED];

        setFeaturedGiveaway(finalFeatured);
        setActiveGiveaways(finalActive);
        setCompletedGiveaways(finalCompleted);

        // Track user entries
        const entered = allGiveaways.filter((g) => g.hasEntered).map((g) => g._id);
        setUserEntries(entered);
      } catch (err) {
        console.error('Failed to fetch giveaways:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Open confirmation modal
  function openEnterModal(giveaway: Giveaway) {
    setSelectedGiveaway(giveaway);
    setConfirmModalOpen(true);
  }

  // Close confirmation modal
  function closeEnterModal() {
    setConfirmModalOpen(false);
    setSelectedGiveaway(null);
  }

  // Confirm entry and call API
  async function confirmEnterGiveaway() {
    if (!selectedGiveaway) return;
    try {
      await giveawaysApi.enter(selectedGiveaway._id);
      setUserEntries((prev) => [...prev, selectedGiveaway._id]);
      closeEnterModal();
    } catch (err) {
      console.error('Failed to enter giveaway:', err);
    }
  }

  // Legacy function for backward compatibility
  async function handleEnterGiveaway(id: string) {
    // Find giveaway and open modal
    const giveaway = [...activeGiveaways, featuredGiveaway, ...completedGiveaways].find(g => g?._id === id);
    if (giveaway) {
      openEnterModal(giveaway);
    }
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatEntries(count?: number) {
    return (count || 0).toLocaleString();
  }

  function isOpen(g: Giveaway) {
    if (g.status === 'completed') return false;
    if (g.status === 'active') return true;
    if (g.endDate) return new Date(g.endDate) > new Date();
    return true;
  }

  return (
    <main className="min-h-screen bg-[#F2F0E4]">
      {/* Enter Giveaway Confirmation Modal */}
      {confirmModalOpen && selectedGiveaway && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#E8E4D9] rounded-2xl shadow-2xl w-full max-w-[520px] p-5 sm:p-6 relative">
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] p-3 flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(180deg, #60351B 0%, #4A2816 100%)', boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <Image src={surpriseIcon} alt="Surprise" width={24} height={24} className="object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-[#210C00]">Enter Giveaway</h3>
                <p className="text-xs sm:text-sm text-[#210C00]/60">Confirm your entry</p>
              </div>
              <button
                onClick={closeEnterModal}
                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 text-[#210C00]/70" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Giveaway Title */}
            <h4 className="text-base sm:text-lg font-semibold text-[#210C00] mb-2 sm:mb-3">
              {selectedGiveaway.title || 'Advanced Reading Copy: Upcoming Release'}
            </h4>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#210C00]/70 leading-relaxed mb-4 sm:mb-5">
              {selectedGiveaway.description || 'Be among the first to read this highly anticipated debut novel exploring memory, identity, and the stories we tell ourselves.'}
            </p>

            {/* Prize & Deadline Card */}
            <div className="bg-[#F5F2E8] rounded-xl p-3 sm:p-4 mb-4 sm:mb-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-[#210C00]/50 uppercase tracking-wide mb-1">Prize</p>
                  <p className="text-sm sm:text-base font-semibold text-[#210C00]">
                    {selectedGiveaway.prize || 'ARC + Author Q&A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-[#210C00]/50 uppercase tracking-wide mb-1">Deadline</p>
                  <p className="text-sm sm:text-base font-semibold text-[#210C00]">
                    {formatDate(selectedGiveaway.endDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white/50 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 border border-[#60351B]/10">
              <p className="text-[10px] sm:text-xs text-[#210C00]/60 leading-relaxed">
                By entering this giveaway, you confirm that you agree to the platform's terms. Winners will be selected randomly and notified after the entry deadline. One entry per user.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeEnterModal}
                className="flex-1 h-11 sm:h-12 rounded-xl border border-[#210C00]/20 text-sm sm:text-base font-medium text-[#210C00] hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnterGiveaway}
                className="flex-1 h-11 sm:h-12 rounded-xl bg-[#60351B] text-white text-sm sm:text-base font-medium hover:bg-[#4A2816] transition-colors shadow-md"
              >
                Confirm Entry
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* mobile search bar */}
      <MobileTopBar>
        <div className="flex-1">
          <SearchBar asHeader value={searchQuery} onChange={setSearchQuery} placeholder="Search book by name, author..." showFilters={true} />
        </div>
      </MobileTopBar>

      {/* Main Content */}
      <div className="w-full lg:ml-24">
        {/* Top Bar - Desktop/Tablet */}
        <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                <SearchBar asHeader value={searchQuery} onChange={setSearchQuery} placeholder="Search book by name, author..." showFilters={true} />
              </div>
              <UserNavbar />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          <div className="max-w-7xl mx-auto">
            {/* Back link */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <button type="button" onClick={() => router.back()} aria-label="Back" className="flex items-center gap-1.5 sm:gap-2 text-[rgba(33,12,0,0.6)] hover:text-[#210C00]">
                <Image src={leftarrow} alt="back" width={16} height={16} className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Back to events</span>
              </button>
            </div>

            {/* Page title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
              <div>
                <h1 className="text-[24px] sm:text-[32px] md:text-[36px] lg:text-[40px] font-bold text-[#210C00] leading-tight">Giveaways</h1>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] text-[rgba(33,12,0,0.6)] mt-0.5 sm:mt-1">Enter for a chance to win books and literary prizes</p>
              </div>
              <Link href="/giveaways/my-entries" className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white text-[12px] sm:text-[13px] md:text-sm font-medium hover:bg-[#4A2816] transition-colors">
                My Entries
          </Link>
        </div>

        {/* Featured Giveaway */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
              <Image src={featuredBadge} alt="Featured" className="object-contain" width={24} height={24} />
            </div>
            <h2 className="text-[16px] sm:text-[18px] md:text-[20px] font-semibold text-[#60351B]">Featured Giveaway</h2>
          </div>

          {featuredGiveaway ? (
            <>
              {/* Mobile layout - vertical stack with image on top */}
              <div className="md:hidden w-full max-w-full h-auto bg-[rgba(255,255,255,0.7)] rounded-[16px] sm:rounded-[24px] border-[1.6px] border-[rgba(96,53,27,0.15)] border-t-[1.6px] border-t-[rgba(33,12,0,0.3)] overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
                {/* Cover - full width on top */}
                <div className="relative w-full h-[180px] sm:h-[220px]">
                  {featuredGiveaway.coverImage || featuredGiveaway.book?.coverImage ? (
                    <img src={getImageUrl(featuredGiveaway.coverImage || featuredGiveaway.book?.coverImage)} alt={featuredGiveaway.title} className="w-full h-full object-cover rounded-l-[16px] sm:rounded-l-[24px]" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#D0744C] to-[#8B5A3C] flex items-center justify-center text-white text-[10px] sm:text-xs font-medium px-2 text-center">{featuredGiveaway.title}</div>
                  )}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-[60px] sm:w-[70px] h-[22px] sm:h-[25px] rounded-[26843500px] pt-[2px] sm:pt-[3px] pr-[5px] sm:pr-[8px] pb-[2px] sm:pb-[3px] pl-[5px] sm:pl-[8px] gap-[3px] sm:gap-[4px] bg-[rgba(96,53,27,0.6)] flex items-center justify-center text-[9px] sm:text-[10px] font-medium text-white" style={{ boxShadow: '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 flex-shrink-0">
                      <Image src={clockIcon} alt="clock" width={12} height={12} className="object-contain" />
                    </div>
                    {isOpen(featuredGiveaway) ? 'Open' : 'Closed'}
                  </div>
                </div>

                {/* Content - below image */}
                <div className="flex flex-col justify-between min-w-0 p-3 sm:p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <h3 className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[1.25] text-[rgba(33,12,0,1)]">
                        {featuredGiveaway.title || 'Win a First Edition'}
                      </h3>
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[#60351B] text-white text-[8px] sm:text-[10px] font-medium shadow-sm whitespace-nowrap flex items-center gap-1">
                          <Image src={Featured} alt="Featured" width={14} height={14} className="object-contain" />
                          Featured
                        </span>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-[rgba(33,12,0,0.5)] mb-1 sm:mb-2 line-clamp-1">{featuredGiveaway.book?.title || 'The Night Circus'} • {featuredGiveaway.book?.author?.name || 'Erin Morgenstern'}</p>

                    <p className="text-[10px] sm:text-[11px] text-[rgba(33,12,0,0.6)] mb-2 sm:mb-3">
                      {featuredGiveaway.description || 'Enter for a chance to win a signed first edition of this beloved fantasy novel.'}
                    </p>

                    {/* pills on mobile - horizontal row */}
                    <div className="w-full flex flex-row gap-2 sm:gap-3 mb-3">
                      <div className="flex-1 h-[70px] sm:h-[84px] rounded-[16px] sm:rounded-[20px] border-[0.8px] border-[rgba(96,53,27,0.1)] bg-[rgba(96,53,27,0.08)] p-2.5 sm:p-4 flex flex-col items-start justify-center gap-0.5 sm:gap-1 text-left">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                          <Image src={trophyIcon} alt="Prize" width={20} height={20} className="object-contain" />
                        </div>
                        <div className="text-[8px] sm:text-[10px] uppercase text-[rgba(33,12,0,0.45)]">Prize</div>
                        <div className="font-sf font-[590] text-[11px] sm:text-[14px] leading-[1.4] text-[rgba(33,12,0,1)] truncate w-full">{featuredGiveaway.prize || 'Signed First Edition'}</div>
                      </div>
                      <div className="flex-1 h-[70px] sm:h-[84px] rounded-[16px] sm:rounded-[20px] border-[0.8px] border-[rgba(96,53,27,0.1)] bg-[rgba(96,53,27,0.08)] p-2.5 sm:p-4 flex flex-col items-start justify-center gap-0.5 sm:gap-1 text-left">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                          <Image src={calendarIcon} alt="Deadline" width={20} height={20} className="object-contain" />
                        </div>
                        <div className="text-[8px] sm:text-[10px] uppercase text-[rgba(33,12,0,0.45)]">Deadline</div>
                        <div className="font-sf font-[590] text-[11px] sm:text-[14px] leading-[1.4] text-[rgba(33,12,0,1)] truncate w-full">{formatDate(featuredGiveaway.endDate)}</div>
                      </div>
                      <div className="flex-1 h-[70px] sm:h-[84px] rounded-[16px] sm:rounded-[20px] border-[0.8px] border-[rgba(96,53,27,0.1)] bg-[rgba(96,53,27,0.08)] p-2.5 sm:p-4 flex flex-col items-start justify-center gap-0.5 sm:gap-1 text-left">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                          <Image src={userIcon} alt="Entries" width={20} height={20} className="object-contain" />
                        </div>
                        <div className="text-[8px] sm:text-[10px] uppercase text-[rgba(33,12,0,0.45)]">Entries</div>
                        <div className="font-sf font-[590] text-[11px] sm:text-[14px] leading-[1.4] text-[rgba(33,12,0,1)] truncate w-full">{formatEntries(featuredGiveaway.entryCount || featuredGiveaway.entries?.length)}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnterGiveaway(featuredGiveaway._id)}
                    disabled={userEntries.includes(featuredGiveaway._id) || !isOpen(featuredGiveaway)}
                    className={`mt-2 sm:mt-3 w-full py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-medium transition-all ${
                      userEntries.includes(featuredGiveaway._id)
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : isOpen(featuredGiveaway)
                        ? 'bg-gradient-to-b from-[#60351B] to-[#4A2816] text-white hover:from-[#4A2816] hover:to-[#3A1E10]'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {userEntries.includes(featuredGiveaway._id) ? '✓ Submitted' : 'Enter Giveaway'}
                  </button>
                </div>
              </div>

              {/* Desktop layout - original large card */}
              <div className="hidden md:flex w-full mx-auto max-w-full bg-[rgba(255,255,255,0.7)] rounded-[24px] border-[1.6px] border-[rgba(96,53,27,0.15)] border-t-[1.6px] border-t-[rgba(33,12,0,0.3)] p-6 md:p-8 md:pr-8 lg:pr-8 xl:pr-8 flex-col md:flex-row gap-6 overflow-hidden items-stretch md:h-auto lg:h-[430.8px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
                {/* Left: framed cover */}
                <div className="relative flex-shrink-0 self-stretch">
                  <div className="-ml-6 md:-ml-8 -mt-6 md:-mt-8 -mb-6 md:-mb-8 w-[220px] md:w-[260px] lg:w-[320px] h-[340px] md:h-[380px] lg:h-[430.8px] rounded-l-[24px] overflow-hidden shadow-lg flex-shrink-0 relative">
                    {featuredGiveaway.coverImage || featuredGiveaway.book?.coverImage ? (
                      <img src={getImageUrl(featuredGiveaway.coverImage || featuredGiveaway.book?.coverImage)} alt={featuredGiveaway.title} className="w-full h-full object-cover rounded-l-[24px] rotate-0 opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium px-3">{featuredGiveaway.title}</div>
                    )}

                    {/* small status badge on cover */}
                    <div className={`absolute top-3 right-3 w-[79px] h-[28px] rounded-[26843500px] pt-[3px] pr-[8px] pb-[3px] pl-[8px] gap-[4px] bg-[rgba(96,53,27,0.6)] flex items-center justify-center text-[12px] font-medium text-white`} style={{ boxShadow: '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.1)' }}>
                      <div className="w-3 h-3 flex-shrink-0">
                        <Image src={clockIcon} alt="clock" width={12} height={12} className="object-contain" />
                      </div>
                      {isOpen(featuredGiveaway) ? 'Open' : 'Closed'}
                    </div>
                  </div>
                </div>

                {/* Right: content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="font-sf font-[590] text-[22px] md:text-[26px] lg:text-[30px] leading-[1.25] tracking-[0px] text-[rgba(33,12,0,1)]">
                        {featuredGiveaway.title || 'Win a First Edition'}
                      </h3>
                      <span className="flex-shrink-0 px-3 py-1 rounded-full bg-[#60351B] text-white text-xs font-medium shadow-sm flex items-center gap-1">
                      <Image src={Featured} alt="Featured" width={16} height={16} className="object-contain" />
                      Featured
                    </span>
                    </div>

                    <p className="font-sf font-[400] text-[14px] md:text-[16px] lg:text-[18px] leading-[1.5] text-[rgba(33,12,0,0.7)] mb-4">{featuredGiveaway.book?.title || 'The Night Circus'} • {featuredGiveaway.book?.author?.name || 'Erin Morgenstern'}</p>

                    <p className="font-sf font-[400] text-[14px] md:text-[16px] lg:text-[18px] leading-[1.6] text-[rgba(33,12,0,0.8)] mb-4 md:mb-6 max-w-[720px]">
                      {featuredGiveaway.description || 'Enter for a chance to win a signed first edition of this beloved fantasy novel. A magical tale of two young illusionists locked in a competition that spans years.'}
                    </p>

                    {/* Meta pills */}
                    <div className="w-full flex gap-2 md:gap-4 mb-4 md:mb-6 flex-nowrap items-start overflow-x-auto">
                      <div className="flex-1 min-w-0 h-[70px] md:h-[83.6px] rounded-[16px] md:rounded-[20px] border-[0.8px] border-[rgba(96,53,27,0.1)] bg-[rgba(96,53,27,0.08)] p-3 md:p-[16.8px] flex flex-col items-start justify-center gap-[1px] text-left">
                        <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                          <Image src={trophyIcon} alt="Prize" width={24} height={24} className="object-contain" />
                        </div>
                        <div className="text-[9px] md:text-[11px] uppercase text-[rgba(33,12,0,0.45)]">Prize</div>
                        <div className="font-sf font-[590] text-[13px] md:text-[16px] leading-[1.4] text-[rgba(33,12,0,1)]">{featuredGiveaway.prize || 'Signed First Edition'}</div>
                      </div>

                      <div className="flex-1 min-w-0 h-[70px] md:h-[83.6px] rounded-[16px] md:rounded-[20px] border-[0.8px] border-[rgba(96,53,27,0.1)] bg-[rgba(96,53,27,0.08)] p-3 md:p-[16.8px] flex flex-col items-start justify-center gap-[1px] text-left">
                        <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                          <Image src={calendarIcon} alt="Deadline" width={24} height={24} className="object-contain" />
                        </div>
                        <div className="text-[9px] md:text-[11px] uppercase text-[rgba(33,12,0,0.45)]">Deadline</div>
                        <div className="font-sf font-[590] text-[13px] md:text-[16px] leading-[1.4] text-[rgba(33,12,0,1)]">{formatDate(featuredGiveaway.endDate)}</div>
                      </div>

                      <div className="flex-1 min-w-0 h-[70px] md:h-[83.6px] rounded-[16px] md:rounded-[20px] border-[0.8px] border-[rgba(96,53,27,0.1)] bg-[rgba(96,53,27,0.08)] p-3 md:p-[16.8px] flex flex-col items-start justify-center gap-[1px] text-left">
                        <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                          <Image src={userIcon} alt="Entries" width={24} height={24} className="object-contain" />
                        </div>
                        <div className="text-[9px] md:text-[11px] uppercase text-[rgba(33,12,0,0.45)]">Entries</div>
                        <div className="font-sf font-[590] text-[13px] md:text-[16px] leading-[1.4] text-[rgba(33,12,0,1)]">{formatEntries(featuredGiveaway.entryCount || featuredGiveaway.entries?.length)}</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <button
                      onClick={() => handleEnterGiveaway(featuredGiveaway._id)}
                      disabled={userEntries.includes(featuredGiveaway._id) || !isOpen(featuredGiveaway)}
                      className={`w-full h-10 md:h-12 rounded-[18px] text-base md:text-lg font-semibold text-white shadow-xl transition-all ${
                        userEntries.includes(featuredGiveaway._id)
                          ? 'bg-green-600 cursor-default'
                          : isOpen(featuredGiveaway)
                          ? 'bg-gradient-to-b from-[#60351B] to-[#4A2816] hover:from-[#4A2816] hover:to-[#3A1E10]'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {userEntries.includes(featuredGiveaway._id) ? '✓ Submitted' : 'Enter Giveaway'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/70 rounded-[16px] sm:rounded-[20px] md:rounded-[24px] border border-[rgba(96,53,27,0.1)] p-4 sm:p-6 md:p-8 text-center text-[12px] sm:text-[13px] md:text-[14px] text-[rgba(33,12,0,0.5)]">No featured giveaway available</div>
          )}
        </div>

        {/* Active Giveaways */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[16px] sm:text-[18px] md:text-[20px] font-semibold text-[#210C00]">Active Giveaways</h2>
            <span className="text-[12px] sm:text-[13px] md:text-[14px] text-[rgba(33,12,0,0.5)]">{activeGiveaways.length} active</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {activeGiveaways.slice(0, 4).map((giveaway, idx) => (
              <GiveawayCard
                key={giveaway._id || idx}
                giveaway={giveaway}
                hasEntered={userEntries.includes(giveaway._id)}
                onEnter={() => handleEnterGiveaway(giveaway._id)}
                formatDate={formatDate}
                formatEntries={formatEntries}
                isOpen={isOpen(giveaway)}
              />
            ))}

            {/* Demo card showing Submitted state */}
            <GiveawayCard
              key="demo-submitted"
              giveaway={DUMMY_GIVEAWAY}
              hasEntered={true}
              onEnter={() => { /* no-op for demo */ }}
              formatDate={formatDate}
              formatEntries={formatEntries}
              isOpen={true}
            />

            {/* Additional mock cards for layout testing */}
            <GiveawayCard
              key="demo-2"
              giveaway={DUMMY_GIVEAWAY}
              hasEntered={false}
              onEnter={() => { /* no-op for demo */ }}
              formatDate={formatDate}
              formatEntries={formatEntries}
              isOpen={true}
            />
            <GiveawayCard
              key="demo-3"
              giveaway={DUMMY_GIVEAWAY}
              hasEntered={false}
              onEnter={() => { /* no-op for demo */ }}
              formatDate={formatDate}
              formatEntries={formatEntries}
              isOpen={true}
            />
          </div>

          {activeGiveaways.length === 0 && (
            <div className="bg-white/50 rounded-[12px] sm:rounded-[16px] border border-[rgba(96,53,27,0.1)] p-4 sm:p-6 md:p-8 text-center text-[12px] sm:text-[13px] md:text-[14px] text-[rgba(33,12,0,0.5)]">
              No active giveaways at the moment
            </div>
          )}
        </div>

        {/* Completed Giveaways */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[16px] sm:text-[18px] md:text-[20px] font-semibold text-[#210C00]">Completed</h2>
            <span className="text-[12px] sm:text-[13px] md:text-[14px] text-[rgba(33,12,0,0.5)]">{completedGiveaways.length} giveaways</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {completedGiveaways.slice(0, 2).map((giveaway, idx) => (
              <CompletedGiveawayCard
                key={giveaway._id || idx}
                giveaway={giveaway}
              />
            ))}

            {/* Demo card for completed giveaways */}
            <CompletedGiveawayCard giveaway={DUMMY_COMPLETED} />
          </div>

          {completedGiveaways.length === 0 && (
            <div className="bg-white/50 rounded-[12px] sm:rounded-[16px] border border-[rgba(96,53,27,0.1)] p-4 sm:p-6 md:p-8 text-center text-[12px] sm:text-[13px] md:text-[14px] text-[rgba(33,12,0,0.5)]">
              No completed giveaways yet
            </div>
          )}
        </div>

        {/* Load more */}
        <div className="flex justify-center mt-6 sm:mt-8 mb-8 sm:mb-12">
          <button className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-white border border-[rgba(96,53,27,0.15)] text-[#210C00] text-[12px] sm:text-[13px] md:text-[14px] font-medium hover:bg-[#F5F2E8] transition-colors">
            Load More Reviews
          </button>
        </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Active Giveaway Card Component
function GiveawayCard({
  giveaway,
  hasEntered,
  onEnter,
  formatDate,
  formatEntries,
  isOpen,
}: {
  giveaway: Giveaway;
  hasEntered: boolean;
  onEnter: () => void;
  formatDate: (d?: string) => string;
  formatEntries: (c?: number) => string;
  isOpen: boolean;
}) {
  return (
    <div className="w-full max-w-full lg:max-w-[700px] h-auto min-h-[200px] sm:min-h-[238px] bg-[rgba(255,255,255,0.7)] rounded-[16px] sm:rounded-[24px] border-[1.6px] border-[rgba(96,53,27,0.15)] border-t-[1.6px] border-t-[rgba(33,12,0,0.3)] p-3 sm:p-4 flex gap-3 sm:gap-4 items-stretch shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
      {/* Cover */}
      <div className="relative flex-shrink-0 -ml-3 sm:-ml-4 -mt-3 sm:-mt-4 -mb-3 sm:-mb-4 w-[90px] sm:w-[120px] md:w-[140px] lg:w-[160px] min-h-[200px] sm:min-h-[238px] rounded-l-[16px] sm:rounded-l-[24px] overflow-hidden">
        {giveaway.coverImage || giveaway.book?.coverImage ? (
          <img
            src={getImageUrl(giveaway.coverImage || giveaway.book?.coverImage)}
            alt={giveaway.title}
            className="w-full h-full object-cover rounded-l-[16px] sm:rounded-l-[24px]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#D0744C] to-[#8B5A3C] flex items-center justify-center text-white text-[10px] sm:text-xs font-medium px-2 text-center">
            {giveaway.title}
          </div>
        )}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-[60px] sm:w-[70px] md:w-[79px] h-[22px] sm:h-[25px] md:h-[28px] rounded-[26843500px] pt-[2px] sm:pt-[3px] pr-[5px] sm:pr-[8px] pb-[2px] sm:pb-[3px] pl-[5px] sm:pl-[8px] gap-[3px] sm:gap-[4px] bg-[rgba(96,53,27,0.6)] flex items-center justify-center text-[9px] sm:text-[10px] md:text-[12px] font-medium text-white" style={{ boxShadow: '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 flex-shrink-0">
            <Image src={clockIcon} alt="clock" width={12} height={12} className="object-contain" />
          </div>
          {isOpen ? 'Open' : 'Closed'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-sf font-[590] text-[14px] sm:text-[16px] md:text-[18px] leading-[1.25] text-[rgba(33,12,0,1)] mb-1 line-clamp-2">
            {giveaway.title || 'Literary Fiction Bundle - 5 Modern Classics'}
          </h3>
          <p className="text-[10px] sm:text-[11px] md:text-[12px] text-[rgba(33,12,0,0.5)] mb-1 sm:mb-2 line-clamp-1">{giveaway.description?.substring(0, 30) || 'Book Bundle'}</p>
          <p className="text-[10px] sm:text-[11px] md:text-[12px] text-[rgba(33,12,0,0.6)] mb-2 sm:mb-3">{giveaway.book?.author?.name || 'Various Authors'}</p>

          <div className="flex flex-col gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-[11px] text-[rgba(33,12,0,0.6)]">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 flex-shrink-0">
                <Image src={trophyIcon} alt="Trophy" width={16} height={16} className="object-contain" />
              </div>
              <span className="truncate">{giveaway.numberOfWinners || 5} Book Bundle</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 flex-shrink-0">
                <Image src={calendarIcon} alt="Deadline" width={16} height={16} className="object-contain" />
              </div>
              <span>{formatDate(giveaway.endDate)}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 flex-shrink-0">
                <Image src={userIcon} alt="Entries" width={16} height={16} className="object-contain" />
              </div>
              <span>{formatEntries(giveaway.entryCount || giveaway.entries?.length)} entries</span>
            </div>
          </div>
        </div>

        <button
          onClick={onEnter}
          disabled={hasEntered || !isOpen}
          className={`mt-2 sm:mt-3 w-full py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] md:text-[13px] font-medium transition-all ${
            hasEntered
              ? 'bg-green-100 text-green-700 border border-green-200'
              : isOpen
              ? 'bg-gradient-to-b from-[#60351B] to-[#4A2816] text-white hover:from-[#4A2816] hover:to-[#3A1E10]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {hasEntered ? '✓ Submitted' : 'Enter Giveaway'}
        </button>
      </div>
    </div>
  );
}

// Completed Giveaway Card Component
function CompletedGiveawayCard({ giveaway }: { giveaway: Giveaway }) {
  return (
    <>
      {/* Mobile layout - compact card */}
      <div className="md:hidden w-full max-w-full h-auto min-h-[200px] sm:min-h-[238px] bg-[rgba(255,255,255,0.7)] rounded-[16px] sm:rounded-[24px] border-[1.6px] border-[rgba(96,53,27,0.15)] border-t-[1.6px] border-t-[rgba(33,12,0,0.3)] p-3 sm:p-4 flex gap-3 sm:gap-4 items-stretch shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
        {/* Cover */}
        <div className="relative flex-shrink-0 -ml-3 sm:-ml-4 -mt-3 sm:-mt-4 -mb-3 sm:-mb-4 w-[90px] sm:w-[120px] min-h-[200px] sm:min-h-[238px] rounded-l-[16px] sm:rounded-l-[24px] overflow-hidden">
          {giveaway.coverImage || giveaway.book?.coverImage ? (
            <img
              src={getImageUrl(giveaway.coverImage || giveaway.book?.coverImage)}
              alt={giveaway.title}
              className="w-full h-full object-cover grayscale-[30%] rounded-l-[16px] sm:rounded-l-[24px]" style={{ objectPosition: '50% center' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#8B8B8B] to-[#6B6B6B] flex items-center justify-center text-white text-[10px] sm:text-xs font-medium px-2 text-center">
              {giveaway.title}
            </div>
          )}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-[60px] sm:w-[70px] h-[22px] sm:h-[25px] rounded-[26843500px] pt-[2px] sm:pt-[3px] pr-[5px] sm:pr-[8px] pb-[2px] sm:pb-[3px] pl-[5px] sm:pl-[8px] gap-[3px] sm:gap-[4px] bg-[rgba(96,53,27,0.6)] flex items-center justify-center text-[9px] sm:text-[10px] font-medium text-white" style={{ boxShadow: '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 flex-shrink-0">
              <Image src={clockIcon} alt="clock" width={12} height={12} className="object-contain" />
            </div>
            Closed
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[1.25] text-[rgba(33,12,0,1)] mb-1 line-clamp-2">
              {giveaway.title || 'Literary Fiction Bundle - 5 Modern Classics'}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[rgba(33,12,0,0.5)] mb-1 sm:mb-2 line-clamp-1">{giveaway.description?.substring(0, 30) || 'Book Bundle'}</p>
            <p className="text-[10px] sm:text-[11px] text-[rgba(33,12,0,0.6)] mb-2 sm:mb-3">{giveaway.book?.author?.name || 'Various Authors'}</p>

            <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-[rgba(33,12,0,0.6)] mb-2">
              <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0">
                <Image src={trophyIcon} alt="Prize" width={16} height={16} className="object-contain" />
              </div>
              <span>{giveaway.numberOfWinners || 5} Book Bundle</span>
            </div>

            {/* Winners section wrapped in styled div */}
            <div className="w-full rounded-[12px] p-2 sm:p-3" style={{ boxShadow: 'inset 0px 0px 4px 0px rgba(96,53,27,0.18)' }}>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-[#D0744C] font-medium mb-2">
                <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0">
                  <Image src={trophyIcon} alt="Winners" width={16} height={16} className="object-contain" />
                </div>
                <span>{giveaway.numberOfWinners || 2} Winners</span>
              </div>

              {/* Winner chips */}
              <div className="flex flex-col md:flex-row gap-2">
                {(giveaway.winners || []).slice(0, 2).map((winner, idx) => (
                  <div key={idx} className="flex-1 flex items-center gap-1.5 px-2 py-1.5 h-[32px] rounded-full bg-white border border-[rgba(96,53,27,0.08)] shadow-sm">
                    <div className="w-4 h-4 rounded-full bg-[#D0744C] flex items-center justify-center text-white text-[7px] font-medium overflow-hidden flex-shrink-0">
                      {winner.user?.profilePicture ? (
                        <img src={winner.user.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (winner.user?.name || 'W')[0]
                      )}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-[#210C00] truncate flex-1">{winner.user?.name || 'Winner'}</span>
                  </div>
                ))}

                {(!giveaway.winners || giveaway.winners.length === 0) && (
                  <>
                    <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 h-[32px] rounded-full bg-white border border-[rgba(96,53,27,0.08)] shadow-sm">
                      <div className="w-4 h-4 rounded-full bg-[#D0744C] flex items-center justify-center text-white text-[7px] font-medium flex-shrink-0">E</div>
                      <span className="text-[9px] sm:text-[10px] text-[#210C00] truncate flex-1">Emma Rodriguez</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 h-[32px] rounded-full bg-white border border-[rgba(96,53,27,0.08)] shadow-sm">
                      <div className="w-4 h-4 rounded-full bg-[#8B5A3C] flex items-center justify-center text-white text-[7px] font-medium flex-shrink-0">A</div>
                      <span className="text-[9px] sm:text-[10px] text-[#210C00] truncate flex-1">anny tarker</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout - original card with absolute positioned winners */}
      <div className="hidden md:flex w-full max-w-full md:max-w-[580px] lg:max-w-[640px] h-auto min-h-[238px] bg-[rgba(255,255,255,0.7)] rounded-[16px] border-[0.8px] border-[rgba(96,53,27,0.1)] border-t-[0.8px] border-t-[rgba(96,53,27,0.2)] p-[0.8px] gap-4 items-stretch relative" style={{ boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)' }}>
        {/* Cover */}
        <div className="relative flex-shrink-0 -ml-4 -mt-4 -mb-4 w-[130px] md:w-[150px] lg:w-[175px] h-[220px] md:h-[238px] rounded-l-[24px] overflow-hidden">
          {giveaway.coverImage || giveaway.book?.coverImage ? (
            <img
              src={getImageUrl(giveaway.coverImage || giveaway.book?.coverImage)}
              alt={giveaway.title}
              className="w-full h-full object-cover object-bottom grayscale-[30%] rounded-l-[24px]  "
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#8B8B8B] to-[#6B6B6B] flex items-center justify-center text-white text-xs font-medium px-2 text-center">
              {giveaway.title}
            </div>
          )}
          <div className="absolute top-6 right-3 w-[79px] h-[28px] rounded-[26843500px] pt-[3px] pr-[8px] pb-[3px] pl-[8px] gap-[4px] bg-[rgba(96,53,27,0.6)] flex items-center justify-center text-[12px] font-medium text-white" style={{ boxShadow: '0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div className="w-3 h-3 flex-shrink-0">
              <Image src={clockIcon} alt="clock" width={12} height={12} className="object-contain" />
            </div>
            Closed
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-start min-w-0 relative pt-4">
          <div className="mt-0">
            <h3 className="text-[18px] font-[590] text-[#210C00] leading-[22.5px] mb-1 line-clamp-2">
              {giveaway.title || 'Literary Fiction Bundle - 5 Modern Classics'}
            </h3>
            <p className="text-[12px] text-[rgba(33,12,0,0.5)] mb-2 line-clamp-1">{giveaway.description?.substring(0, 30) || 'Book Bundle'}</p>
            <p className="text-[12px] text-[rgba(33,12,0,0.6)] mb-3">{giveaway.book?.author?.name || 'Various Authors'}</p>

            <div className="flex items-center gap-1.5 text-[11px] text-[rgba(33,12,0,0.6)] mb-3">
              <div className="w-4 h-4 flex-shrink-0">
                <Image src={trophyIcon} alt="Prize" width={16} height={16} className="object-contain" />
              </div>
              <span>{giveaway.numberOfWinners || 5} Book Bundle</span>
            </div>

            <div
              className="absolute left-0 w-full md:w-[380px] lg:w-[430px] h-[94px]" 
              style={{ top: '125px', boxShadow: 'inset 0px 0px 4px 0px rgba(96,53,27,0.18)',borderRadius:'16px' }}
            >
                {/* Top-left: trophy + count */}
                <div className="absolute left-4 top-3 flex items-center gap-[12px]">
                  <div className="w-4 h-4 flex-shrink-0">
                    <Image src={trophyIcon} alt="Winners" width={16} height={16} className="object-contain" />
                  </div>
                  <span className="text-[13px] font-medium text-[#D0744C]">{giveaway.numberOfWinners || 2} Winners</span>
                </div>

                {/* Right (vertically centered): winner chips (single row, gap 12px) */}
                <div className="absolute right-2 md:right-4 top-2/3 -translate-y-1/2 transform flex items-center gap-2 md:gap-[12px]">
                  {(giveaway.winners || []).slice(0, 2).map((winner, idx) => (
                    <div key={idx} className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-[20px] bg-white border border-[rgba(96,53,27,0.08)] shadow-sm min-w-[140px] md:min-w-[160px] lg:min-w-[190px] h-[36px] md:h-[40px]">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#D0744C] flex items-center justify-center text-white text-[7px] md:text-[8px] font-medium overflow-hidden flex-shrink-0">
                        {winner.user?.profilePicture ? (
                          <img src={winner.user.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (winner.user?.name || 'W')[0]
                        )}
                      </div>
                      <span className="flex-1 text-center text-[10px] md:text-[12px] font-[590] leading-[16px] text-[#210C00] truncate">{winner.user?.name || 'Winner'}</span>
                    </div>
                  ))}

                  {(!giveaway.winners || giveaway.winners.length === 0) && (
                    <>
                      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-[20px] bg-white border border-[rgba(96,53,27,0.08)] shadow-sm min-w-[140px] md:min-w-[160px] lg:min-w-[190px] h-[36px] md:h-[40px]">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#D0744C] flex items-center justify-center text-white text-[7px] md:text-[8px] font-medium flex-shrink-0">E</div>
                        <span className="flex-1 text-center text-[10px] md:text-[12px] font-[590] leading-[16px] text-[#210C00] truncate">Emma Rodriguez</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-[20px] bg-white border border-[rgba(96,53,27,0.08)] shadow-sm min-w-[140px] md:min-w-[160px] lg:min-w-[190px] h-[36px] md:h-[40px]">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#8B5A3C] flex items-center justify-center text-white text-[7px] md:text-[8px] font-medium flex-shrink-0">A</div>
                        <span className="flex-1 text-center text-[10px] md:text-[12px] font-[590] leading-[16px] text-[#210C00] truncate">anny tarker</span>
                      </div>
                    </>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
