'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { userApi, getImageUrl } from '../../../lib/api';
import Sidebar from '../../components/Sidebar';
import SearchBar from '../../components/SearchBar';
import MobileTopBar from '../../components/MobileTopBar';
import MobileDrawer from '../../components/MobileDrawer';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

// Placeholder images
import bellIcon from '../../../images/bell.png';
import circleIcon from '../../../images/circle.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    title: string;
    subtitle: string;
    shareProgressButton: string;
  };
  activeChallenge: {
    title: string;
    overallProgress: string;
    aheadOfSchedule: string;
    onTrackLabel: string;
    daysRemaining: string;
    addBookButton: string;
    adjustGoalButton: string;
  };
  discoverChallenges: {
    title: string;
    subtitle: string;
    goalLabel: string;
    durationLabel: string;
    startsLabel: string;
    participantsLabel: string;
    joinButton: string;
    genreSpecificBadge: string;
  };
  completedChallenges: {
    title: string;
    subtitle: string;
    completedLabel: string;
    completedOnLabel: string;
    shareButton: string;
  };
  footer: {
    copyright: string;
    links: string[];
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    title: 'Your Reading Journey',
    subtitle: 'Track your progress and achieve your reading goals at your own pace',
    shareProgressButton: 'Share Progress',
  },
  activeChallenge: {
    title: 'Active Challenge',
    overallProgress: 'Overall Progress',
    aheadOfSchedule: "You're ahead of schedule",
    onTrackLabel: 'On track to complete by',
    daysRemaining: 'days remaining',
    addBookButton: 'Add Book to Challenge',
    adjustGoalButton: 'Adjust Goal',
  },
  discoverChallenges: {
    title: 'Discover Challenges',
    subtitle: 'Join community challenges or create your own',
    goalLabel: 'Goal:',
    durationLabel: 'Duration:',
    startsLabel: 'Starts:',
    participantsLabel: 'participants',
    joinButton: 'Join Challenge',
    genreSpecificBadge: 'Genre-specific',
  },
  completedChallenges: {
    title: 'Completed Challenges',
    subtitle: 'Celebrate your achievements',
    completedLabel: 'Completed',
    completedOnLabel: 'Completed on',
    shareButton: 'Share',
  },
  footer: {
    copyright: '© 2026 Copyright All Rights Reserved.',
    links: ['Home', 'About us', 'Careers', 'Blog'],
  },
};

// Challenge data interface
interface ChallengeData {
  id: string;
  title: string;
  description: string;
  icon: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  progress: number;
  isAhead: boolean;
  targetDate: string;
  booksCompleted: number;
  totalBooks: number;
}

// Discover Challenge interface
interface DiscoverChallenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  duration: string;
  starts: string;
  participants: number;
  badge: string;
}

// Completed Challenge interface
interface CompletedChallenge {
  id: string;
  title: string;
  booksCompleted: number;
  totalBooks: number;
  completedOn: string;
  icon: 'trophy-gold' | 'trophy-bronze';
}

// Placeholder active challenge
const placeholderActiveChallenge: ChallengeData = {
  id: '1',
  title: '2026 Reading Challenge',
  description: 'A personal reading goal to stay consistent throughout the year',
  icon: '',
  startDate: 'January 1, 2026',
  endDate: 'December 31, 2026',
  daysRemaining: 328,
  progress: 75,
  isAhead: true,
  targetDate: 'October',
  booksCompleted: 32,
  totalBooks: 40,
};

// Placeholder discover challenges
const placeholderDiscoverChallenges: DiscoverChallenge[] = [
  {
    id: '1',
    title: 'Classic Literature Journey',
    description: 'Explore 15 classic novels throughout the year',
    goal: '15 books',
    duration: '12 months',
    starts: 'January 1, 2026',
    participants: 856,
    badge: 'Genre-specific',
  },
  {
    id: '2',
    title: 'Classic Literature Journey',
    description: 'Explore 15 classic novels throughout the year',
    goal: '15 books',
    duration: '12 months',
    starts: 'January 1, 2026',
    participants: 856,
    badge: 'Genre-specific',
  },
  {
    id: '3',
    title: 'Classic Literature Journey',
    description: 'Explore 15 classic novels throughout the year',
    goal: '15 books',
    duration: '12 months',
    starts: 'January 1, 2026',
    participants: 856,
    badge: 'Genre-specific',
  },
];

// Placeholder completed challenges
const placeholderCompletedChallenges: CompletedChallenge[] = [
  {
    id: '1',
    title: '2025 Reading Challenge',
    booksCompleted: 42,
    totalBooks: 40,
    completedOn: 'December 28, 2025',
    icon: 'trophy-gold',
  },
  {
    id: '2',
    title: 'Fall Reading Challenge 2025',
    booksCompleted: 8,
    totalBooks: 8,
    completedOn: 'November 30, 2025',
    icon: 'trophy-bronze',
  },
];

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/challenge-details`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Trophy Icon Component
function TrophyIcon({ type }: { type: 'trophy-gold' | 'trophy-bronze' }) {
  const color = type === 'trophy-gold' ? '#D0744C' : '#8B7355';
  return (
    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill={color}>
        <path d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V8C18 10.21 16.21 12 14 12H13.9C13.64 14.04 12.5 15.79 10.81 16.83L12 19H16V21H8V19L9.19 16.83C7.5 15.79 6.36 14.04 6.1 12H6C3.79 12 2 10.21 2 8V7C2 5.9 2.9 5 4 5H6V4C6 2.9 6.9 2 8 2H12ZM4 7V8C4 9.1 4.9 10 6 10V7H4ZM18 7H16V10C17.1 10 18 9.1 18 8V7Z"/>
      </svg>
    </div>
  );
}

// Challenge Badge Component  
function ChallengeBadge({ year }: { year: string }) {
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#60351B] flex flex-col items-center justify-center text-white">
      <span className="text-lg sm:text-xl font-bold">{year}</span>
      <svg className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
        <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" />
      </svg>
    </div>
  );
}

// Discover Challenge Card Component
function DiscoverChallengeCard({ challenge, content }: { challenge: DiscoverChallenge; content: PageContent }) {
  return (
    <div className="relative w-full bg-white rounded-xl p-6 sm:p-7 shadow-sm border border-[#210C00]/5">
      {/* top-left circle icon */}
      <div className="absolute top-3 left-3 w-12 h-12 p-3 rounded-[20px] bg-[#60351B1A] flex items-center justify-center">
        <Image src={circleIcon} alt="" width={24} height={24} className="object-contain" />
      </div>
      {/* Badge */}
      <div className="flex justify-end mb-3">
        <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#D0744C]/10 text-[#D0744C] border border-[#D0744C]/20">
          {challenge.badge}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="text-sm sm:text-base font-semibold text-[#210C00] mb-1">
        {challenge.title}
      </h3>
      <p className="text-[10px] sm:text-xs text-[#210C00]/60 mb-4 leading-relaxed">
        {challenge.description}
      </p>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#210C00]/50">{content.discoverChallenges.goalLabel}</span>
          <span className="font-medium text-[#210C00]">{challenge.goal}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#210C00]/50">{content.discoverChallenges.durationLabel}</span>
          <span className="font-medium text-[#210C00]">{challenge.duration}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#210C00]/50">{content.discoverChallenges.startsLabel}</span>
          <span className="font-medium text-[#210C00]">{challenge.starts}</span>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-1.5 text-xs text-[#210C00]/50 mb-4">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
        {challenge.participants} {content.discoverChallenges.participantsLabel}
      </div>

      {/* Join Button */}
      <button className="w-full py-2.5 rounded-lg bg-transparent border border-[#210C00]/20 text-sm font-medium text-[#210C00]/70 hover:bg-[#210C00]/5 transition-colors">
        {content.discoverChallenges.joinButton}
      </button>
    </div>
  );
}

// Completed Challenge Card Component
function CompletedChallengeCard({ challenge, content }: { challenge: CompletedChallenge; content: PageContent }) {
  return (
    <div className="w-full bg-white rounded-xl p-6 sm:p-7 shadow-sm border border-[#210C00]/5">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[#210C00] mb-1">
            <span className="text-[48px] leading-[48px] font-normal" style={{ fontFamily: 'SF Pro', fontStyle: 'normal', opacity: 1 }}>🏆</span>
            {challenge.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-[#210C00]/70 mb-1">
            {content.completedChallenges.completedLabel} {challenge.booksCompleted} of {challenge.totalBooks} books
          </p>
          <p className="text-[10px] sm:text-xs text-[#210C00]/50">
            {content.completedChallenges.completedOnLabel} {challenge.completedOn}
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent text-xs font-medium text-[#D0744C] hover:bg-[#D0744C]/5 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
          {content.completedChallenges.shareButton}
        </button>
      </div>
    </div>
  );
}

export default function ChallengeDetailsPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();

  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeData>(placeholderActiveChallenge);
  const [discoverChallenges, setDiscoverChallenges] = useState<DiscoverChallenge[]>(placeholderDiscoverChallenges);
  const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>(placeholderCompletedChallenges);

  // User data
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [pageContent, userProfile]: any[] = await Promise.all([
          fetchPageContent(),
          userApi.getProfile().catch(() => null),
        ]);
        setContent(pageContent);
        setUserData(userProfile?.data || null);

        // Fetch challenge data
        // const challengeData = await challengesApi.get(params.id);
        // setActiveChallenge(challengeData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      {/* Mobile Top Bar */}
      <MobileTopBar />

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

      {/* Main Content Area */}
      <div className="w-full lg:ml-24 max-w-7xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#60351B]" />
              <p className="mt-4 text-sm sm:text-base text-[#60351B] font-medium">Loading...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Top Bar with Search */}
            <div className="sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3 hidden sm:block">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                  <SearchBar
                    placeholder="Search book by name, author..."
                    onFilterOpenChange={() => {}}
                    onApplyFilters={() => {}}
                    onPickRandom={() => {}}
                  />
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
                      {userData?.name || 'Alexender Raghav'}
                    </span>
                  </div>
                  <button aria-label="Notifications" className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
                    <Image src={bellIcon} alt="Notifications" width={18} height={18} className="object-contain sm:w-[22px] sm:h-[22px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mt-14 sm:mt-0">
              <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00] mb-2">
                    {content.header.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#210C00]/60 max-w-2xl">
                    {content.header.subtitle}
                  </p>
                </div>

                {/* Active Challenge Section */}
                <div className="mb-8 sm:mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00]">
                      {content.activeChallenge.title}
                    </h2>
                    <button className="flex items-center gap-1.5 text-xs text-[#210C00]/60 hover:text-[#210C00] transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {content.header.shareProgressButton}
                    </button>
                  </div>

                  {/* Active Challenge Card */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
                      {/* Challenge Badge */}
                      <ChallengeBadge year="2026" />

                      {/* Challenge Info */}
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-[#210C00] mb-1">
                          {activeChallenge.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#210C00]/60 mb-2">
                          {activeChallenge.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#210C00]/50">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {activeChallenge.startDate} - {activeChallenge.endDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v6l4 2"/>
                            </svg>
                            {activeChallenge.daysRemaining} {content.activeChallenge.daysRemaining}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-[#210C00]">
                          {content.activeChallenge.overallProgress}
                        </span>
                        {activeChallenge.isAhead && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {content.activeChallenge.aheadOfSchedule}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-3 bg-[#E8E4D9] rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-[#D0744C] rounded-full transition-all duration-500"
                          style={{ width: `${activeChallenge.progress}%` }}
                        />
                      </div>

                      <p className="text-[10px] sm:text-xs text-[#210C00]/50">
                        {content.activeChallenge.onTrackLabel} {activeChallenge.targetDate}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="flex-1 py-2.5 sm:py-3 rounded-lg bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2518] transition-colors">
                        {content.activeChallenge.addBookButton}
                      </button>
                      <button className="px-6 py-2.5 sm:py-3 rounded-lg bg-transparent border border-[#210C00]/20 text-[#210C00]/70 text-sm font-medium hover:bg-[#210C00]/5 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                        </svg>
                        {content.activeChallenge.adjustGoalButton}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Discover Challenges Section */}
                <div className="mb-8 sm:mb-10">
                  <div className="mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-1">
                      {content.discoverChallenges.title}
                    </h2>
                    <p className="text-xs text-[#210C00]/50">
                      {content.discoverChallenges.subtitle}
                    </p>
                  </div>

                  {/* Challenge Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {discoverChallenges.map((challenge) => (
                      <DiscoverChallengeCard key={challenge.id} challenge={challenge} content={content} />
                    ))}
                  </div>
                </div>

                {/* Completed Challenges Section */}
                <div className="mb-8 sm:mb-10">
                  <div className="mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-1">
                      {content.completedChallenges.title}
                    </h2>
                    <p className="text-xs text-[#210C00]/50">
                      {content.completedChallenges.subtitle}
                    </p>
                  </div>

                  {/* Completed Challenge Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {completedChallenges.map((challenge) => (
                      <CompletedChallengeCard key={challenge.id} challenge={challenge} content={content} />
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-[#210C00]/10 pt-6 pb-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#210C00]/50">
                    <p>{content.footer.copyright}</p>
                    <div className="flex items-center gap-4 sm:gap-6">
                      {content.footer.links.map((link, index) => (
                        <Link key={index} href="#" className="hover:text-[#210C00] transition-colors">
                          {link}
                        </Link>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Social Icons */}
                      {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                        <Link key={social} href="#" className="w-7 h-7 rounded-full bg-[#210C00]/5 flex items-center justify-center hover:bg-[#210C00]/10 transition-colors">
                          <svg className="w-3.5 h-3.5 text-[#210C00]/50" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
