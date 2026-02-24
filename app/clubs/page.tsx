'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bookClubsApi, userApi, getImageUrl } from '../../lib/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileDrawer from '../components/MobileDrawer';
import { useMobileMenu } from '../contexts/MobileMenuContext';

// Placeholder images
import bellIcon from '../../images/bell.png';
import cover1 from '../../images/Book cover.png';
import user2 from '../../images/user2.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    title: string;
    subtitle: string;
    createButtonText: string;
  };
  search: {
    placeholder: string;
    filterAll: string;
    filterEmotional: string;
    filterGenre: string;
    filterAuthorLed: string;
    filterEditorial: string;
  };
  featured: {
    title: string;
    countLabel: string;
  };
  allClubs: {
    title: string;
    countLabel: string;
  };
  clubCard: {
    publicBadge: string;
    privateBadge: string;
    membersLabel: string;
    joinButtonText: string;
    emotionalThemeLabel: string;
    genreBasedLabel: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    title: 'Book Clubs',
    subtitle: 'Join focused reading groups that explore books through deep discussion and shared understanding. From emotional themes to genre analysis, find your community of thoughtful readers.',
    createButtonText: '+ Create Club',
  },
  search: {
    placeholder: 'Search clubs by name, theme, or topic...',
    filterAll: 'All Clubs',
    filterEmotional: 'Emotional',
    filterGenre: 'Genre',
    filterAuthorLed: 'Author-Led',
    filterEditorial: 'Editorial',
  },
  featured: {
    title: 'Featured Clubs',
    countLabel: 'featured clubs',
  },
  allClubs: {
    title: 'All Clubs',
    countLabel: 'featured clubs',
  },
  clubCard: {
    publicBadge: 'Public',
    privateBadge: 'Private',
    membersLabel: 'members',
    joinButtonText: 'Join Club',
    emotionalThemeLabel: 'Emotional Theme',
    genreBasedLabel: 'Genre-Based',
  },
};

// Club type from backend
interface Club {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  clubLogo?: string;
  privacy: 'public' | 'private';
  clubType: string;
  genreFocus?: string;
  memberCount: number;
  creator?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  selectedBooks?: {
    book: {
      _id: string;
      title: string;
      coverImage?: string;
      author?: { name: string };
    };
    isCurrentRead: boolean;
  }[];
  tags?: string[];
  isFeatured?: boolean;
}

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/clubs`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Club Card Component
function ClubCard({ club, content }: { club: Club; content: PageContent }) {
  const defaultTags = ['Emotional Intelligence', 'Memoir', 'Healing'];
  const displayTags = club.tags && club.tags.length > 0 ? club.tags : defaultTags;

  return (
    <Link href={`/clubs/${club._id}`} className="block bg-white rounded-xl shadow-sm border border-[#210C00]/10 overflow-hidden hover:shadow-md transition-shadow">
      {/* Banner Image */}
      <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden">
        {club.coverImage ? (
          <img src={getImageUrl(club.coverImage)} alt={club.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-[#60351B] font-bold text-xs">II</span>
                <span className="text-[#60351B] text-xs font-medium">logo</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1a365d] tracking-wide">BOOK CLUB</h3>
              <p className="text-[#1a365d]/70 text-xs">twitch.tv/booklovers</p>
            </div>
          </div>
        )}

        {/* Privacy Badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
          club.privacy === 'public'
            ? 'bg-green-500 text-white'
            : 'bg-orange-500 text-white'
        }`}>
          {club.privacy === 'public' ? content.clubCard.publicBadge : content.clubCard.privateBadge}
        </div>

        {/* Club Logo */}
        {club.clubLogo && (
          <div className="absolute bottom-2 right-2 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white shadow-md overflow-hidden p-1">
            <img src={club.clubLogo} alt="Club logo" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-4">
        {/* Club Name */}
        <h3 className="text-sm sm:text-base font-semibold text-[#210C00] mb-2 line-clamp-1">
          {club.name}
        </h3>

        {/* Club Tags */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B] text-[10px] sm:text-xs">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {content.clubCard.emotionalThemeLabel}
          </span>
          {club.creator && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#210C00]/5 text-[#210C00]/70 text-[10px] sm:text-xs">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
              {club.creator.name}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[10px] sm:text-xs text-[#210C00]/70 leading-relaxed line-clamp-2 mb-3">
          {club.description}
        </p>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {displayTags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-full border border-[#210C00]/15 text-[9px] sm:text-[10px] text-[#210C00]/60">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer: Members & Join Button */}
        <div className="flex items-center justify-between pt-3 border-t border-[#210C00]/10">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#D0744C] border-2 border-white flex items-center justify-center overflow-hidden">
                  <Image src={user2} alt="Member" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-[#210C00]/60 ml-1">
              {club.memberCount || 47} {content.clubCard.membersLabel}
            </span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="px-3 sm:px-4 py-1.5 rounded-lg bg-[#60351B] text-white text-[10px] sm:text-xs font-medium hover:bg-[#4A2518] transition-colors"
          >
            {content.clubCard.joinButtonText}
          </button>
        </div>
      </div>
    </Link>
  );
}

// Featured Club Card Component (larger, horizontal layout)
function FeaturedClubCard({ club, content }: { club: Club; content: PageContent }) {
  const defaultTags = ['Emotional Intelligence', 'Memoir', 'Healing'];
  const displayTags = club.tags && club.tags.length > 0 ? club.tags : defaultTags;

  return (
    <Link href={`/clubs/${club._id}`} className="block bg-white rounded-xl shadow-sm border border-[#210C00]/10 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Banner Image */}
        <div className="relative h-44 sm:h-52 md:h-auto md:w-1/2 overflow-hidden">
          {club.coverImage ? (
            <img src={getImageUrl(club.coverImage)} alt={club.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-400 via-blue-400 to-purple-400 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-white/80 text-sm">Welcome to our page</p>
                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">Book Club</h3>
                <p className="text-white/60 text-xs mt-2">Your address here · YourWebHere.com · +01 1234567890</p>
              </div>
            </div>
          )}

          {/* Privacy Badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-medium ${
            club.privacy === 'public'
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 text-white'
          }`}>
            {club.privacy === 'public' ? content.clubCard.publicBadge : content.clubCard.privateBadge}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-6 md:w-1/2 flex flex-col justify-center">
          {/* Club Name */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#210C00] mb-3">
            {club.name}
          </h3>

          {/* Club Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4CAF50]/10 text-[#4CAF50] text-xs">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Genre-Based
            </span>
            {club.creator && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#210C00]/5 text-[#210C00]/70 text-xs">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
                {club.creator.name}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#210C00]/70 leading-relaxed mb-4">
            {club.description}
          </p>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {displayTags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-full border border-[#210C00]/15 text-xs text-[#210C00]/60">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer: Members & Join Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((_, idx) => (
                  <div key={idx} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D0744C] border-2 border-white flex items-center justify-center overflow-hidden">
                    <Image src={user2} alt="Member" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-[#210C00]/60 ml-1">
                {club.memberCount || 47} {content.clubCard.membersLabel}
              </span>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="px-5 sm:px-6 py-2 rounded-lg bg-[#60351B] text-white text-xs sm:text-sm font-medium hover:bg-[#4A2518] transition-colors"
            >
              {content.clubCard.joinButtonText}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ClubsPage(): JSX.Element {
  const router = useRouter();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();

  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);

  // Data state
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'emotional' | 'genre' | 'author-led' | 'editorial'>('all');

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [pageContent, clubsData, userProfile]: any[] = await Promise.all([
          fetchPageContent(),
          bookClubsApi.getAll().catch(() => ({ data: [] })),
          userApi.getProfile().catch(() => null),
        ]);

        setContent(pageContent);
        setClubs(clubsData?.data || []);
        setUserData(userProfile?.data || null);
      } catch (err: any) {
        console.error('Error fetching clubs:', err);
        setError(err?.message || 'Failed to load clubs');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Placeholder clubs for fallback
  const placeholderClubs: Club[] = [
    {
      _id: '1',
      name: 'Navigating Grief Through Literature',
      description: 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.',
      privacy: 'public',
      clubType: 'emotional',
      memberCount: 47,
      creator: { _id: '1', name: 'Elena Rodriguez' },
      tags: ['Emotional Intelligence', 'Memoir', 'Healing'],
      isFeatured: true,
    },
    {
      _id: '2',
      name: 'Navigating Grief Through Literature',
      description: 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.',
      privacy: 'public',
      clubType: 'genre',
      memberCount: 47,
      creator: { _id: '2', name: 'Elena Rodriguez' },
      tags: ['Emotional Intelligence', 'Memoir', 'Healing'],
    },
    {
      _id: '3',
      name: 'Navigating Grief Through Literature',
      description: 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.',
      privacy: 'public',
      clubType: 'emotional',
      memberCount: 47,
      creator: { _id: '3', name: 'Elena Rodriguez' },
      tags: ['Emotional Intelligence', 'Memoir', 'Healing'],
    },
    {
      _id: '4',
      name: 'Navigating Grief Through Literature',
      description: 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.',
      privacy: 'public',
      clubType: 'author-led',
      memberCount: 47,
      creator: { _id: '4', name: 'Elena Rodriguez' },
      tags: ['Emotional Intelligence', 'Memoir', 'Healing'],
    },
    {
      _id: '5',
      name: 'Highlighting Exceptional Indie Books',
      description: 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.',
      privacy: 'public',
      clubType: 'editorial',
      memberCount: 47,
      creator: { _id: '5', name: 'Marcus Rodriguez' },
      tags: ['Emotional Intelligence', 'Memoir', 'Healing'],
    },
    {
      _id: '6',
      name: 'Navigating Grief Through Literature',
      description: 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.',
      privacy: 'public',
      clubType: 'emotional',
      memberCount: 47,
      creator: { _id: '6', name: 'Elena Rodriguez' },
      tags: ['Emotional Intelligence', 'Memoir', 'Healing'],
    },
  ];

  const displayClubs = clubs.length > 0 ? clubs : placeholderClubs;

  // Filter clubs
  const filteredClubs = displayClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || club.clubType === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const featuredClubs = filteredClubs.filter(c => c.isFeatured);
  const allClubs = filteredClubs;

  const filterTabs = [
    { key: 'all', label: content.search.filterAll },
    { key: 'emotional', label: content.search.filterEmotional },
    { key: 'genre', label: content.search.filterGenre },
    { key: 'author-led', label: content.search.filterAuthorLed },
    { key: 'editorial', label: content.search.filterEditorial },
  ] as const;

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
      <div className="w-full lg:ml-1">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#60351B]" />
              <p className="mt-4 text-sm sm:text-base text-[#60351B] font-medium">Loading clubs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="text-center max-w-md">
              <div className="text-red-600 text-lg sm:text-xl font-semibold mb-2">Unable to load clubs</div>
              <p className="text-sm sm:text-base text-gray-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 sm:px-6 py-2 bg-[#60351B] text-white rounded-lg hover:bg-[#4A2518] transition-colors text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
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
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00] mb-2">
                      {content.header.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#210C00]/60 max-w-xl leading-relaxed">
                      {content.header.subtitle}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/clubs/create')}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#60351B] text-white text-xs sm:text-sm font-medium hover:bg-[#4A2518] transition-colors self-start"
                  >
                    {content.header.createButtonText}
                  </button>
                </div>

                {/* Search & Filters */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#210C00]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={content.search.placeholder}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#E8E4D9] text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20"
                      />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                      {filterTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveFilter(tab.key)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
                            activeFilter === tab.key
                              ? 'bg-[#60351B] text-white'
                              : 'bg-white border border-[#210C00]/15 text-[#210C00]/70 hover:bg-[#210C00]/5'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Featured Clubs Section */}
                {featuredClubs.length > 0 && (
                  <div className="mb-8 sm:mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#210C00]">
                        <span className="text-amber-500">✨</span>
                        {content.featured.title}
                      </h2>
                      <span className="text-xs sm:text-sm text-[#210C00]/50">
                        {featuredClubs.length} {content.featured.countLabel}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {featuredClubs.slice(0, 1).map((club) => (
                        <FeaturedClubCard key={club._id} club={club} content={content} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Clubs Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00]">
                      {content.allClubs.title}
                    </h2>
                    <span className="text-xs sm:text-sm text-[#210C00]/50">
                      {allClubs.length} {content.allClubs.countLabel}
                    </span>
                  </div>

                  {allClubs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {allClubs.map((club) => (
                        <ClubCard key={club._id} club={club} content={content} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#60351B]/10 flex items-center justify-center mb-4 sm:mb-6">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#60351B]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-[#210C00] mb-2">
                        No clubs found
                      </h3>
                      <p className="text-sm text-[#210C00]/60 text-center max-w-sm mb-6">
                        Try adjusting your search or filters to find book clubs
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
