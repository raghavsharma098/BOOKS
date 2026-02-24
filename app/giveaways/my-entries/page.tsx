'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import MobileDrawer from '../../components/MobileDrawer';
import MobileTopBar from '../../components/MobileTopBar';
import SearchBar from '../../components/SearchBar';
import UserNavbar from '../../components/UserNavbar';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import { giveawaysApi, userApi, getImageUrl } from '../../../lib/api';
import bellIcon from '../../../images/bell.png';
import trophyIcon from '../../../images/trophy.png';
import trophyIcon1 from '../../../images/whitetrophy.png';
import yellowTrophy from '../../../images/trophy.png';
import leftarrow from '../../../images/leftarrow.png';
import clockIcon from '../../../images/whiteclock.png';
import calendarIcon from '../../../images/calendar.png';
import userIcon from '../../../images/user2.png';

interface Giveaway {
  _id?: string;
  title?: string;
  description?: string;
  coverImage?: string;
  book?: { title?: string; author?: { name?: string }; coverImage?: string };
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

const SAMPLE = {
  id: 'sample-1',
  title: 'Literary Fiction Bundle - 5 Modern Classics',
  subtitle: 'Book Bundle',
  author: 'Various Authors',
  cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
  prize: '5 Book Bundle',
  date: 'Feb 20, 2026',
  entries: 1923,
  winners: [{ name: 'Emma Rodriguez' }, { name: 'ammy tarker' }],
};

export default function MyEntriesPage(): JSX.Element {
  const router = useRouter();
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [wonEntries, setWonEntries] = useState<any[]>([]);
  const [pendingEntries, setPendingEntries] = useState<any[]>([]);
  const [completedEntries, setCompletedEntries] = useState<any[]>([]);

  function formatDate(dateStr?: string) {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function normalizeGiveaway(g: any) {
    return {
      title: g.title,
      subtitle: g.book?.title || g.subtitle || '',
      author: g.book?.author?.name || g.author || '',
      cover: g.coverImage || g.book?.coverImage || g.cover || '',
      prize: g.prize || '',
      date: formatDate(g.endDate || g.date),
      entries: g.entryCount || (g.entries && g.entries.length) || 0,
      winners: (g.winners || []).map((w: any) => ({ name: w.user?.name || w.name || '', profilePicture: w.user?.profilePicture || '' })),
      isOpen: (g.status === 'active') || (g.endDate ? new Date(g.endDate) > new Date() : true),
    };
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [profileRes, giveawaysRes]: any[] = await Promise.all([
          userApi.getProfile().catch(() => null),
          giveawaysApi.getAll({ limit: 100 }).catch(() => ({ data: [] })),
        ]);

        const user = profileRes?.data || profileRes || null;
        const allGiveaways: any[] = giveawaysRes?.data || [];

        if (!mounted) return;
        setUserData(user);

        const entered = allGiveaways.filter((g) => g.hasEntered);
        const userId = user?._id || user?.id || null;

        const winners = entered.filter((g) => (g.winners || []).some((w: any) => {
          const uid = typeof w.user === 'string' ? w.user : w.user?._id || w.user?.id;
          return (uid && userId && uid.toString() === userId.toString()) || (w.user?.name && user?.name && w.user.name === user.name);
        }));

        const pending = entered.filter((g) => !winners.includes(g) && (g.status === 'active' || (g.endDate && new Date(g.endDate) > new Date())));
        const completed = entered.filter((g) => !winners.includes(g) && (g.status === 'completed' || (g.endDate && new Date(g.endDate) <= new Date())));

        setWonEntries(winners);
        setPendingEntries(pending);
        setCompletedEntries(completed);
      } catch (err) {
        console.error('Failed to load my entries', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  function formatEntries(count?: number) {
    return (count || 0).toLocaleString();
  }

  function EntryCard({ item, variant = 'default' }: { item: any; variant?: 'winner' | 'pending' | 'completed' | 'default' }) {
    const isWinner = variant === 'winner';
    const isPending = variant === 'pending';
    const hasEntered = variant !== 'default';

    if (variant === 'pending') {
      const isOpen = item.isOpen ?? true;

      return (
        <div className="w-full max-w-full lg:max-w-[595px] h-auto min-h-[200px] sm:min-h-[238px] bg-[rgba(255,255,255,0.7)] rounded-[16px] sm:rounded-[24px] border-[1.6px] border-[rgba(96,53,27,0.15)] border-t-[1.6px] border-t-[rgba(33,12,0,0.3)] p-3 sm:p-4 flex gap-3 sm:gap-4 items-stretch shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
          {/* Cover */}
          <div className="relative flex-shrink-0 -ml-3 sm:-ml-4 -mt-3 sm:-mt-4 -mb-3 sm:-mb-4 w-[90px] sm:w-[120px] md:w-[140px] lg:w-[160px] min-h-[200px] sm:min-h-[238px] rounded-l-[16px] sm:rounded-l-[24px] overflow-hidden">
            {item.cover ? (
              <img src={getImageUrl(item.cover || item.coverImage)} alt={item.title} className="w-full h-full object-cover rounded-l-[16px] sm:rounded-l-[24px]" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#D0744C] to-[#8B5A3C] flex items-center justify-center text-white text-[10px] sm:text-xs font-medium px-2 text-center">{item.title}</div>
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
              <h3 className="font-sf font-[590] text-[14px] sm:text-[16px] md:text-[18px] leading-[1.25] text-[rgba(33,12,0,1)] mb-1 line-clamp-2">{item.title}</h3>
              <p className="text-[10px] sm:text-[11px] md:text-[12px] text-[rgba(33,12,0,0.5)] mb-1 sm:mb-2 line-clamp-1">{item.subtitle}</p>
              <p className="text-[10px] sm:text-[11px] md:text-[12px] text-[rgba(33,12,0,0.6)] mb-2 sm:mb-3">{item.author}</p>

              <div className="flex flex-col gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-[11px] text-[rgba(33,12,0,0.6)]">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 flex-shrink-0"><Image src={trophyIcon} alt="Trophy" width={16} height={16} className="object-contain" /></div>
                  <span className="truncate">{item.prize || `${item.numberOfWinners || 1} Book Bundle`}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 flex-shrink-0"><Image src={calendarIcon} alt="Deadline" width={16} height={16} className="object-contain" /></div>
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 flex-shrink-0"><Image src={userIcon} alt="Entries" width={16} height={16} className="object-contain" /></div>
                  <span>{formatEntries(item.entries)}</span>
                </div>
              </div>
            </div>

            <button disabled={hasEntered || !isOpen} className={`mt-2 sm:mt-3 w-full py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] md:text-[13px] font-medium transition-all ${hasEntered ? 'bg-green-100 text-green-700 border border-green-200' : isOpen ? 'bg-gradient-to-b from-[#60351B] to-[#4A2816] text-white hover:from-[#4A2816] hover:to-[#3A1E10]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
              {hasEntered ? '✓ Submitted' : 'Enter Giveaway'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-full sm:max-w-[500px] lg:max-w-[595px] bg-[rgba(255,255,255,0.9)] rounded-[12px] sm:rounded-[14px] lg:rounded-[16px] p-3 sm:p-3.5 lg:p-4 flex gap-3 sm:gap-3.5 lg:gap-4 items-stretch shadow-sm border border-[rgba(96,53,27,0.06)]">
        <div className={`${variant === 'winner' ? '-ml-3 sm:-ml-3.5 lg:-ml-4 -mt-3 sm:-mt-3.5 lg:-mt-4 -mb-3 sm:-mb-3.5 lg:-mb-4 self-stretch rounded-l-[6px] sm:rounded-l-[7px] lg:rounded-l-[8px]' : 'rounded-[6px] sm:rounded-[7px] lg:rounded-[8px]'} relative w-[90px] sm:w-[110px] md:w-[120px] lg:w-[140px] overflow-hidden flex-shrink-0 shadow-md`}> 
          <img src={getImageUrl(item.cover || item.coverImage)} alt={item.title} className="w-full h-full object-cover" />
          {isWinner && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
              <div className="rounded-full flex items-center justify-center gap-1 sm:gap-1.5 text-white font-medium w-[60px] h-[20px] sm:w-[70px] sm:h-[22px] md:w-[76px] md:h-[24px] lg:w-[82px] lg:h-[26px] px-1.5 sm:px-2" style={{ background: 'linear-gradient(90deg, #FE9A00 0%, #E17100 100%)', boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0 flex items-center justify-center">
                  <Image src={trophyIcon1} alt="trophy" width={14} height={14} className="object-contain" />
                </div>
                <span className="text-[9px] sm:text-[10px] lg:text-[12px]">Winner</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h3 className="text-[13px] sm:text-[14px] lg:text-[16px] font-semibold text-[#210C00] leading-tight line-clamp-2">{item.title}</h3>
                <p className="text-[10px] sm:text-[11px] lg:text-[12px] text-[rgba(33,12,0,0.6)] mt-0.5 sm:mt-1 line-clamp-1">{item.subtitle}</p>
                <p className="text-[9px] sm:text-[10px] lg:text-[11px] text-[rgba(33,12,0,0.6)] mt-0.5 sm:mt-1">{item.author}</p>
              </div>
              {isPending && <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs lg:text-sm font-medium flex-shrink-0">Submitted</div>}
            </div>

            <div className="mt-2 sm:mt-3 lg:mt-4">
              <div className="w-full sm:w-[320px] md:w-[360px] lg:w-[394px] h-[50px] sm:h-[55px] md:h-[60px] lg:h-[65px] rounded-[12px] sm:rounded-[14px] lg:rounded-[16px] bg-[rgba(96,53,27,0.1)] flex flex-col justify-center gap-[8px] sm:gap-[10px] lg:gap-[12px] px-3 sm:px-[14px] lg:px-[16px] py-2 sm:py-[8px] lg:py-[10px] text-sm" style={{ boxShadow: 'inset 0px 0px 4px 0px rgba(96,53,27,0.25)' }}>
                <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0">
                    <Image src={trophyIcon} alt="Prize" width={16} height={16} className="object-contain" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] lg:text-[11px] uppercase text-[rgba(33,12,0,0.45)]">Prize</div>
                </div>
                <div className="font-semibold text-[11px] sm:text-[12px] lg:text-[14px]">{item.prize}</div>
              </div>
            </div>

            {isWinner && (
              <div className="w-full sm:w-[320px] md:w-[360px] lg:w-[392px] h-[30px] sm:h-[32px] md:h-[34px] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] pl-2 sm:pl-3 flex items-center gap-1.5 sm:gap-2 mt-2 bg-[rgba(240,253,244,1)]" style={{ borderTop: '0.8px solid rgba(185,248,207,1)', boxSizing: 'border-box' }}>
                {/* mail icon (inline SVG) */}
                <div className="w-4 h-4 sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 8.25V17.25C3 18.4926 4.00736 19.5 5.25 19.5H18.75C19.9926 19.5 21 18.4926 21 17.25V8.25" stroke="#60D39F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 6.75C21 5.50736 19.9926 4.5 18.75 4.5H5.25C4.00736 4.5 3 5.50736 3 6.75V8.25L12 13.5L21 8.25V6.75Z" stroke="#60D39F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <div className="text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] font-medium text-[rgba(33,12,0,1)]">
                  Confirmation email sent
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center justify-between">
            <div className="text-[10px] sm:text-[11px] lg:text-[12px] text-[rgba(33,12,0,0.6)]">{isPending ? `${item.date} • ${item.entries} entries` : ''}</div>
            <div>
              {variant === 'default' && <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#60351B] text-white text-[11px] sm:text-[12px] lg:text-[14px]">Enter Giveaway</button>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      {/* Mobile Top Bar */}
      <MobileTopBar>
        <SearchBar asHeader placeholder="Search giveaways, books..." showFilters={true} onApplyFilters={() => {}} onFilterOpenChange={() => {}} />
      </MobileTopBar>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onToggle={toggleMobileMenu}
        activeIcon={activeIcon}
        setActiveIcon={setActiveIcon}
        hideHeader
      />

      {/* Sidebar - Desktop */}
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* Main Content */}
      <div className="w-full lg:ml-24">
        {/* Top Bar - Desktop/Tablet */}
        <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                <SearchBar placeholder="Search giveaways, books..." showFilters={true} onApplyFilters={() => {}} onFilterOpenChange={() => {}} />
              </div>
              <UserNavbar />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[rgba(33,12,0,0.6)] hover:text-[#210C00]">
            <Image src={leftarrow} alt="back" width={16} height={16} />
            <span className="text-sm">Back to events</span>
          </button>
        </div>

        <div className="mb-6">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-bold mb-1">My Entries</h1>
            <p className="text-[13px] text-[rgba(33,12,0,0.6)] mb-0">Track your giveaway entries and results</p>
          </div>
        </div>

        <section className={`mb-10 ${!loading && wonEntries.length === 0 ? 'mt-8 sm:mt-0' : ''}`}>
          <div className="flex items-center mb-8 justify-start sm:justify-between">
            <h2 className="font-sf font-[510] text-[30px] leading-[36px] tracking-[-0.75px] text-[#210C00] whitespace-nowrap relative -top-3 sm:top-0 sm:left-auto" style={{ left: '2px', transform: 'rotate(0deg)', opacity: 1 }}>
              <Image src={yellowTrophy} alt="trophy" width={24} height={24} className="inline-block mr-2" />
              <span className="hidden sm:inline"> </span>Congratulations!🎉
            </h2>
            <span className="text-sm text-[rgba(33,12,0,0.45)] whitespace-nowrap relative -left-8 sm:left-auto top-4 sm:top-0">{loading ? '—' : `${wonEntries.length} giveaways won`}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {loading ? (
              <>
                <EntryCard item={SAMPLE} variant="winner" />
                <EntryCard item={{ ...SAMPLE, cover: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80' }} variant="winner" />
              </>
            ) : (
              <>
                {wonEntries.length > 0 ? (
                  <>
                    {wonEntries.map((g) => (
                      <EntryCard key={g._id || g.id} item={normalizeGiveaway(g)} variant="winner" />
                    ))}

                    {Array.from({ length: Math.max(0, 2 - wonEntries.length) }).map((_, i) => (
                      <EntryCard key={`mock-won-${i}`} item={i === 0 ? SAMPLE : { ...SAMPLE, cover: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80' }} variant="winner" />
                    ))}
                  </>
                ) : (
                  <>
                    <EntryCard item={SAMPLE} variant="winner" />
                    <EntryCard item={{ ...SAMPLE, cover: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80' }} variant="winner" />
                  </>
                )}
              </>
            )}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sf font-[510] text-[30px] leading-[36px] tracking-[-0.75px] text-[#210C00]">Pending Results</h2>
            <span className="text-sm text-[rgba(33,12,0,0.45)]">{loading ? '—' : `${pendingEntries.length} giveaways pending`}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {loading ? (
              <>
                <EntryCard item={SAMPLE} variant="pending" />
                <EntryCard item={{ ...SAMPLE, cover: 'https://images.unsplash.com/photo-1529488219244-9a0f4beae5d8?auto=format&fit=crop&w=900&q=80' }} variant="pending" />
              </>
            ) : (
              <>
                {pendingEntries.length > 0 ? (
                  <>
                    {pendingEntries.map((g) => (
                      <EntryCard key={g._id || g.id} item={normalizeGiveaway(g)} variant="pending" />
                    ))}

                    {Array.from({ length: Math.max(0, 2 - pendingEntries.length) }).map((_, i) => (
                      <EntryCard key={`mock-pending-${i}`} item={i === 0 ? SAMPLE : { ...SAMPLE, cover: 'https://images.unsplash.com/photo-1529488219244-9a0f4beae5d8?auto=format&fit=crop&w=900&q=80' }} variant="pending" />
                    ))}
                  </>
                ) : (
                  <>
                    <EntryCard item={SAMPLE} variant="pending" />
                    <EntryCard item={{ ...SAMPLE, cover: 'https://images.unsplash.com/photo-1529488219244-9a0f4beae5d8?auto=format&fit=crop&w=900&q=80' }} variant="pending" />
                  </>
                )}
              </>
            )}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sf font-[510] text-[30px] leading-[36px] tracking-[-0.75px] text-[#210C00]">Completed</h2>
            <span className="text-sm text-[rgba(33,12,0,0.45)]">{loading ? '—' : `${completedEntries.length} giveaways`}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {loading ? (
              <>
                <CompletedGiveawayCard giveaway={{ ...SAMPLE, coverImage: SAMPLE.cover }} />
                <CompletedGiveawayCard giveaway={{ ...SAMPLE, coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80' }} />
              </>
            ) : (
              <>
                {completedEntries.length > 0 ? (
                  <>
                    {completedEntries.map((g) => (
                      <CompletedGiveawayCard key={g._id || g.id} giveaway={g} />
                    ))}

                    {Array.from({ length: Math.max(0, 2 - completedEntries.length) }).map((_, i) => (
                      <CompletedGiveawayCard key={`mock-completed-${i}`} giveaway={i === 0 ? { ...SAMPLE, coverImage: SAMPLE.cover } : { ...SAMPLE, coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80' }} />
                    ))}
                  </>
                ) : (
                  <>
                    <CompletedGiveawayCard giveaway={{ ...SAMPLE, coverImage: SAMPLE.cover }} />
                    <CompletedGiveawayCard giveaway={{ ...SAMPLE, coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80' }} />
                  </>
                )}
              </>
            )}
          </div>
        </section>
          </div>
        </div>
      </div>
    </main>
  );
}
// Completed Giveaway Card Component
function CompletedGiveawayCard({ giveaway }: { giveaway: any }) {
  return (
    <>
      {/* Mobile layout - compact card */}
      <div className="md:hidden w-full max-w-full h-auto min-h-[200px] sm:min-h-[220px] bg-[rgba(255,255,255,0.7)] rounded-[12px] sm:rounded-[16px] border-[0.8px] border-[rgba(96,53,27,0.1)] border-t-[0.8px] border-t-[rgba(96,53,27,0.2)] p-3 sm:p-4 flex gap-3 sm:gap-4 items-stretch" style={{ boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)' }}>
        {/* Cover */}
        <div className="relative flex-shrink-0 -ml-3 sm:-ml-4 -mt-3 sm:-mt-4 -mb-3 sm:-mb-4 w-[90px] sm:w-[120px] min-h-[200px] sm:min-h-[220px] rounded-l-[12px] sm:rounded-l-[16px] overflow-hidden">
          {giveaway.coverImage || giveaway.book?.coverImage ? (
            <img
              src={getImageUrl(giveaway.coverImage || giveaway.book?.coverImage)}
              alt={giveaway.title}
              className="w-full h-full object-cover grayscale-[30%] rounded-l-[12px] sm:rounded-l-[16px]"
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
            <h3 className="text-[12px] sm:text-[14px] font-semibold text-[#210C00] leading-tight mb-1 line-clamp-2">
              {giveaway.title || 'Literary Fiction Bundle - 5 Modern Classics'}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[rgba(33,12,0,0.5)] mb-1 line-clamp-1">{giveaway.description?.substring(0, 30) || 'Book Bundle'}</p>
            <p className="text-[10px] sm:text-[11px] text-[rgba(33,12,0,0.6)] mb-2">{giveaway.book?.author?.name || 'Various Authors'}</p>

            <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-[rgba(33,12,0,0.6)] mb-2">
              <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0">
                <Image src={trophyIcon} alt="Prize" width={16} height={16} className="object-contain" />
              </div>
              <span>{giveaway.numberOfWinners || 5} Book Bundle</span>
            </div>

            {/* Winners (mobile) */}
            <div className="mt-3 bg-[rgba(96,53,27,0.1)] p-3 rounded-lg">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-[#D0744C] font-medium mb-2">
                <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0">
                  <Image src={trophyIcon} alt="Winners" width={16} height={16} className="object-contain" />
                </div>
                <span>{giveaway.numberOfWinners || 2} Winners</span>
              </div>

              {/* Winner chips - stacked on mobile, row on sm+ */}
              <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
                {(giveaway.winners || []).slice(0, 2).map((winner: any, idx: number) => (
                  <div key={idx} className="w-full sm:flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[rgba(96,53,27,0.15)]">
                    <div className="w-5 h-5 rounded-full bg-[#D0744C] flex items-center justify-center text-white text-[8px] font-medium overflow-hidden flex-shrink-0">
                      {winner.user?.profilePicture ? (
                        <img src={winner.user.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (winner.user?.name || 'W')[0]
                      )}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-[#210C00] truncate">{winner.user?.name || 'Winner'}</span>
                  </div>
                ))}

                {(!giveaway.winners || giveaway.winners.length === 0) && (
                  <>
                    <div className="w-full sm:flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[rgba(96,53,27,0.15)]">
                      <div className="w-5 h-5 rounded-full bg-[#D0744C] flex items-center justify-center text-white text-[8px] font-medium flex-shrink-0">E</div>
                      <span className="text-[9px] sm:text-[10px] text-[#210C00] truncate">Emma Rodriguez</span>
                    </div>
                    <div className="w-full sm:flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[rgba(96,53,27,0.15)]">
                      <div className="w-5 h-5 rounded-full bg-[#8B5A3C] flex items-center justify-center text-white text-[8px] font-medium flex-shrink-0">A</div>
                      <span className="text-[9px] sm:text-[10px] text-[#210C00] truncate">anny tarker</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout - original card with absolute positioned winners */}
      <div className="hidden md:flex w-full max-w-full lg:max-w-[595px] h-auto min-h-[280px] bg-[rgba(255,255,255,0.7)] rounded-[16px] border-[0.8px] border-[rgba(96,53,27,0.1)] border-t-[0.8px] border-t-[rgba(96,53,27,0.2)] p-[0.8px] gap-4 items-stretch relative" style={{ boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)' }}>
        {/* Cover */}
        <div className="relative flex-shrink-0 -ml-4 -mt-4 -mb-4 w-[150px] lg:w-[175px] min-h-[240px] rounded-l-[24px] overflow-hidden">
          {giveaway.coverImage || giveaway.book?.coverImage ? (
            <img
              src={getImageUrl(giveaway.coverImage || giveaway.book?.coverImage)}
              alt={giveaway.title}
              className="w-full h-full object-cover grayscale-[30%] rounded-l-[24px]"
              style={{ transform: 'translate(14px, 16px)' }}
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
        <div className="flex-1 flex flex-col justify-between min-w-0 relative">
          <div className="mt-[16px]">
            <h3 className="text-[14px] lg:text-[15px] font-semibold text-[#210C00] leading-tight mb-1 line-clamp-2">
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
              className="absolute left-0" 
              style={{ width: '364px', height: '120px', top: '135px', boxShadow: 'inset 0px 0px 4px 0px rgba(96,53,27,0.18)' }}
            >
                {/* Top-left: trophy + count */}
                <div className="absolute left-4 top-3 flex items-center gap-[12px]">
                  <div className="w-4 h-4 flex-shrink-0">
                    <Image src={trophyIcon} alt="Winners" width={16} height={16} className="object-contain" />
                  </div>
                  <span className="text-[13px] font-medium text-[#D0744C]">{giveaway.numberOfWinners || 2} Winners</span>
                </div>

                {/* Right (vertically centered): winner chips (single row, gap 12px) */}
                <div className="absolute right-4 top-2/3 -translate-y-1/2 transform flex items-center gap-[12px]">
                  {(giveaway.winners || []).slice(0, 2).map((winner: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-[20px] bg-white border border-[rgba(96,53,27,0.08)] shadow-sm min-w-[140px] lg:min-w-[160px] h-[48px]">
                      <div className="w-8 h-8 rounded-full bg-[#D0744C] flex items-center justify-center text-white text-[10px] font-medium overflow-hidden flex-shrink-0">
                        {winner.user?.profilePicture ? (
                          <img src={winner.user.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (winner.user?.name || 'W')[0]
                        )}
                      </div>
                      <span className="text-[13px] text-[#210C00] truncate">{winner.user?.name || 'Winner'}</span>
                    </div>
                  ))}

                  {(!giveaway.winners || giveaway.winners.length === 0) && (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-[20px] bg-white border border-[rgba(96,53,27,0.08)] shadow-sm min-w-[140px] lg:min-w-[160px] h-[48px]">
                        <div className="w-8 h-8 rounded-full bg-[#D0744C] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">E</div>
                        <span className="text-[13px] text-[#210C00] truncate">Emma Rodriguez</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-[20px] bg-white border border-[rgba(96,53,27,0.08)] shadow-sm min-w-[140px] lg:min-w-[160px] h-[48px]">
                        <div className="w-8 h-8 rounded-full bg-[#8B5A3C] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">A</div>
                        <span className="text-[13px] text-[#210C00] truncate">anny tarker</span>
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