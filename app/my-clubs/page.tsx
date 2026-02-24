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
import UserNavbar from '../components/UserNavbar';
import { useMobileMenu } from '../contexts/MobileMenuContext';

// Placeholder images
import sideBarLogo from '../../images/side bar logo.png';
import cover1 from '../../images/Book cover.png';
import user2 from '../../images/user2.png';
import bellIcon from '../../images/bell.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    backText: string;
    backHref: string;
    title: string;
    subtitle: string;
    countLabel: string;
  };
  clubCard: {
    publicBadge: string;
    privateBadge: string;
    currentlyReadingLabel: string;
    membersLabel: string;
    joinButtonText: string;
  };
  emptyState: {
    title: string;
    subtitle: string;
    browseButtonText: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    backText: 'Back to Clubs',
    backHref: '/clubs',
    title: 'My Clubs',
    subtitle: 'Your reading communities and discussions',
    countLabel: 'Clubs found',
  },
  clubCard: {
    publicBadge: 'Public',
    privateBadge: 'Private',
    currentlyReadingLabel: 'CURRENTLY READING',
    membersLabel: 'members',
    joinButtonText: 'Join Club',
  },
  emptyState: {
    title: 'No clubs yet',
    subtitle: 'Join a book club to start discussing with fellow readers',
    browseButtonText: 'Browse Clubs',
  },
};

// Club type from backend
interface Club {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  privacy: 'public' | 'private';
  clubType: string;
  genreFocus?: string;
  memberCount: number;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
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
}

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/my-clubs`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Club Card Component
function ClubCard({ club, content, fallbackBanner }: { club: Club; content: PageContent; fallbackBanner: string }) {
  const currentBook = club.selectedBooks?.find(b => b.isCurrentRead)?.book || club.selectedBooks?.[0]?.book;
  
  // Default tags based on club type
  const defaultTags = ['Emotional Intelligence', 'Memoir', 'Healing'];
  const displayTags = club.tags && club.tags.length > 0 ? club.tags : defaultTags;
  
  return (
    <Link href={`/clubs/${club._id}`} className="block bg-white rounded-[24px] shadow-sm border border-[#210C00]/10 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      {/* Banner Image */}
      <div className="relative h-32 sm:h-40 md:h-44 overflow-hidden">
        {club.coverImage ? (
          <img src={getImageUrl(club.coverImage)} alt={club.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-[#60351B] font-bold text-xs">II</span>
                <span className="text-[#60351B] text-xs font-medium">logo</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a365d] tracking-wide">BOOK CLUB</h3>
              <p className="text-[#1a365d]/70 text-xs sm:text-sm">twitch.tv/booklovers</p>
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

        {/* Approval Status Badge */}
        {club.status && club.status !== 'approved' && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
            club.status === 'pending'   ? 'bg-yellow-400 text-yellow-900' :
            club.status === 'rejected'  ? 'bg-red-500 text-white' :
            club.status === 'suspended' ? 'bg-gray-500 text-white' :
            'bg-gray-300 text-gray-700'
          }`}>
            {club.status === 'pending'   ? 'Pending Approval' :
             club.status === 'rejected'  ? 'Rejected' :
             club.status === 'suspended' ? 'Suspended' :
             club.status === 'draft'     ? 'Draft' : club.status}
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <div className="p-3 sm:p-4 md:p-5">
        {/* Club Name */}
        <h3 className="font-sf text-[24px] font-semibold text-[#210C00] mb-2 line-clamp-1" style={{ lineHeight: '33px', letterSpacing: '-0.6px' }}>
          {club.name}
        </h3>
        
        {/* Club Tags */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          {club.clubType && (
            <span
              className="inline-flex items-center text-[10px] sm:text-xs text-[#60351B]"
              style={{
                height: '26px',
                borderRadius: '16px',
                gap: '6px',
                padding: '5px 6px',
                background: '#FFD4DE',
                boxShadow: '0px 4px 6px -1px #0000001A',
              }}
            >
              {club.clubType === 'emotional' && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              )}
              {club.clubType === 'genre' && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              )}
              {club.clubType === 'author-led' && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              )}
              {club.clubType === 'editorial' && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              )}
              {club.clubType === 'emotional' ? 'Emotional Theme' :
               club.clubType === 'genre' ? 'Genre-Based' :
               club.clubType === 'author-led' ? 'Author-Led' :
               club.clubType === 'editorial' ? 'Editorial' :
               club.clubType}
            </span>
          )}
          {club.creator && (
            <span 
              className="inline-flex items-center gap-[6px] rounded-full text-[#210C00]/70 text-[10px] sm:text-xs"
              style={{
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '5px',
                paddingBottom: '5px',
                background: '#34B1FF26',
                border: '0.8px solid #60351B33'
              }}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
              {club.creator.name || 'Elena Rodriguez'}
            </span>
          )}
        </div>
        
        {/* Description */}
        <p 
          className="font-sf font-normal text-[15px] mb-3 sm:mb-4"
          style={{ lineHeight: '24.38px', letterSpacing: '0px', color: '#210C00CC' }}
        >
          {club.description || 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.'}
        </p>
        
        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
          {displayTags.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx} 
              className="px-3 py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs text-[#210C00]/60"
              style={{
                background: '#60351B26',
                border: '0.8px solid #60351B1A'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Currently Reading */}
        {currentBook && (
        <div 
          className="rounded-[16px] mt-3 sm:mt-4"
          style={{ 
            padding: '12.8px', 
            background: '#60351B14', 
            border: '0.8px solid #60351B1A' 
          }}
        >
          <p 
            className="font-sf font-semibold text-[12px] uppercase mb-2"
            style={{ lineHeight: '16px', letterSpacing: '0.3px', color: '#210C0099' }}
          >
            {content.clubCard.currentlyReadingLabel}
          </p>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-10 sm:w-10 sm:h-12 rounded overflow-hidden flex-shrink-0 bg-[#210C00]/5">
              {currentBook?.coverImage ? (
                <img src={getImageUrl(currentBook.coverImage)} alt={currentBook.title} className="w-full h-full object-cover" />
              ) : (
                <Image src={cover1} alt="Book cover" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-[#210C00] truncate leading-tight">
                {currentBook?.title}
              </p>
              <p className="text-[10px] sm:text-xs text-[#210C00]/50 truncate leading-tight">
                {currentBook?.author?.name}
              </p>
              {/* Progress Bar */}
              <div className="mt-2 w-full h-[6px] bg-[#E8E4DC] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#8B7355] to-[#60351B] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(65, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Member Count */}
        <div className="flex items-center gap-1.5 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#210C00]/10">
          <div className="flex -space-x-1.5">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#D0744C] border-2 border-white flex items-center justify-center overflow-hidden">
                <Image src={user2} alt="Member" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <span 
            className="text-[10px] sm:text-xs ml-1 relative"
            style={{ height: '20px', lineHeight: '20px', top: '-1.2px', color: '#210C00B2' }}
          >
            {club.memberCount || 47} {content.clubCard.membersLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MyClubsPage(): JSX.Element {
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
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [pageContent, clubsData, userProfile]: any[] = await Promise.all([
          fetchPageContent(),
          bookClubsApi.getMine().catch(() => ({ data: [] })),
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

  // Filter clubs by search
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Placeholder clubs for empty state / fallback
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
    },
    {
      _id: '2',
      name: 'Navigating Grief Through Literature',
      description: 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.',
      privacy: 'public',
      clubType: 'emotional',
      memberCount: 47,
      creator: { _id: '2', name: 'Elena Rodriguez' },
      tags: ['Emotional Intelligence', 'Memoir', 'Healing'],
    },
  ];

  const displayClubs = filteredClubs;

  function handleApplyFilters() {
    setSearchFilterOpen(false);
  }

  function pickRandomClub() {
    if (clubs.length > 0) {
      const rnd = clubs[Math.floor(Math.random() * clubs.length)];
      router.push(`/clubs/${rnd._id}`);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      {/* Mobile Top Bar */}
            <MobileTopBar>
              <div className="flex-1">
                <SearchBar asHeader value={searchQuery} onChange={setSearchQuery} placeholder="Search book by name, author..." showFilters={true} />
              </div>
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

      {/* Main Content Area */}
      <div className="w-full lg:ml-12">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#60351B]" />
              <p className="mt-4 text-sm sm:text-base text-[#60351B] font-medium">Loading your clubs...</p>
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
            <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
              <div className="max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                    <SearchBar
                      placeholder="Search book by name, author..."
                      onFilterOpenChange={setSearchFilterOpen}
                      onApplyFilters={handleApplyFilters}
                      onPickRandom={pickRandomClub}
                    />
                  </div>
                  <UserNavbar />
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mt-14 sm:mt-0">
              <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <Link 
                  href={content.header.backHref} 
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#210C00]/70 hover:text-[#210C00] transition-colors mb-4 sm:mb-6"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {content.header.backText}
                </Link>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00] mb-1">
                      {content.header.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#210C00]/60">
                      {content.header.subtitle}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-[#210C00]/50">
                    {displayClubs.length} {content.header.countLabel}
                  </p>
                </div>

                {/* Clubs Grid */}
                {displayClubs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                    {displayClubs.map((club) => (
                      <ClubCard key={club._id} club={club} content={content} fallbackBanner="" />
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-16 sm:py-24">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#60351B]/10 flex items-center justify-center mb-4 sm:mb-6">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#60351B]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#210C00] mb-2">
                      {content.emptyState.title}
                    </h3>
                    <p className="text-sm text-[#210C00]/60 text-center max-w-sm mb-6">
                      {content.emptyState.subtitle}
                    </p>
                    <Link
                      href="/clubs"
                      className="px-6 py-2.5 rounded-full bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2518] transition-colors"
                    >
                      {content.emptyState.browseButtonText}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
