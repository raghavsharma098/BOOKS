'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, getImageUrl } from '../../../lib/api';
import Sidebar from '../../components/Sidebar';
import SearchBar from '../../components/SearchBar';
import MobileTopBar from '../../components/MobileTopBar';
import MobileDrawer from '../../components/MobileDrawer';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    backLink: string;
    title: string;
    subtitle: string;
  };
  filters: {
    allGenres: string;
    mostActive: string;
    recent: string;
    popular: string;
  };
  discussionCard: {
    participantsLabel: string;
    commentsLabel: string;
    lastActivityLabel: string;
    joinButton: string;
    viewButton: string;
  };
  featured: {
    title: string;
    badge: string;
  };
  loadMore: {
    button: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    backLink: 'Back to Community',
    title: 'Book Discussions',
    subtitle: 'Join conversations about your favorite books. Share insights, ask questions, and connect with fellow readers.',
  },
  filters: {
    allGenres: 'All Genres',
    mostActive: 'Most Active',
    recent: 'Recent',
    popular: 'Popular',
  },
  discussionCard: {
    participantsLabel: 'participants',
    commentsLabel: 'comments',
    lastActivityLabel: 'Last activity',
    joinButton: 'Join Discussion',
    viewButton: 'View Discussion',
  },
  featured: {
    title: 'Featured Discussions',
    badge: 'Featured',
  },
  loadMore: {
    button: 'Load More Discussions',
  },
};

// Discussion data interface
interface DiscussionItem {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
  };
  topic: string;
  description: string;
  participants: number;
  comments: number;
  lastActivity: string;
  isFeatured: boolean;
  activeUsers: { id: string; name: string; avatar: string }[];
}

// Placeholder discussions
const placeholderDiscussions: DiscussionItem[] = [
  {
    id: '1',
    book: { id: '1', title: 'The Remains of the Day', author: 'Kazuo Ishiguro', cover: '' },
    topic: 'Memory, Dignity & Regret',
    description: "Exploring Ishiguro's masterful use of the unreliable narrator and the profound themes of self-deception and emotional repression.",
    participants: 47,
    comments: 156,
    lastActivity: '2 hours ago',
    isFeatured: true,
    activeUsers: [
      { id: '1', name: 'Sarah Chen', avatar: '' },
      { id: '2', name: 'Marcus Webb', avatar: '' },
      { id: '3', name: 'Elena Rodriguez', avatar: '' },
    ],
  },
  {
    id: '2',
    book: { id: '2', title: 'Pachinko', author: 'Min Jin Lee', cover: '' },
    topic: 'Generational Saga & Identity',
    description: 'Discussing the multigenerational story of Korean families in Japan and themes of belonging, sacrifice, and cultural identity.',
    participants: 38,
    comments: 124,
    lastActivity: '5 hours ago',
    isFeatured: true,
    activeUsers: [
      { id: '4', name: 'David Kim', avatar: '' },
      { id: '5', name: 'Alika Obeng', avatar: '' },
    ],
  },
  {
    id: '3',
    book: { id: '3', title: 'Normal People', author: 'Sally Rooney', cover: '' },
    topic: 'Communication & Connection',
    description: 'Analyzing the complex relationship dynamics and the role of class, power, and miscommunication in intimacy.',
    participants: 52,
    comments: 189,
    lastActivity: '1 day ago',
    isFeatured: false,
    activeUsers: [
      { id: '6', name: 'James Patterson', avatar: '' },
      { id: '7', name: 'Lisa Wong', avatar: '' },
      { id: '8', name: 'Tom Hardy', avatar: '' },
    ],
  },
  {
    id: '4',
    book: { id: '4', title: 'A Little Life', author: 'Hanya Yanagihara', cover: '' },
    topic: 'Trauma & Friendship',
    description: 'A deep dive into the emotional journey of four friends and the lasting impacts of childhood trauma.',
    participants: 29,
    comments: 87,
    lastActivity: '3 days ago',
    isFeatured: false,
    activeUsers: [
      { id: '9', name: 'Anna Smith', avatar: '' },
    ],
  },
  {
    id: '5',
    book: { id: '5', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: '' },
    topic: 'The American Dream',
    description: 'Examining the themes of wealth, class, and the corruption of the American Dream in the Jazz Age.',
    participants: 63,
    comments: 234,
    lastActivity: '6 hours ago',
    isFeatured: false,
    activeUsers: [
      { id: '10', name: 'Mike Johnson', avatar: '' },
      { id: '11', name: 'Rachel Green', avatar: '' },
    ],
  },
  {
    id: '6',
    book: { id: '6', title: '1984', author: 'George Orwell', cover: '' },
    topic: 'Surveillance & Control',
    description: 'Discussing the relevance of Orwell\'s dystopian vision in modern society and technology.',
    participants: 71,
    comments: 267,
    lastActivity: '12 hours ago',
    isFeatured: false,
    activeUsers: [
      { id: '12', name: 'Chris Wilson', avatar: '' },
      { id: '13', name: 'Amy Lee', avatar: '' },
      { id: '14', name: 'Bob Martin', avatar: '' },
    ],
  },
];

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/discussions`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Discussion Card Component
function DiscussionCard({ discussion, content }: { discussion: DiscussionItem; content: PageContent }) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-[#210C00]/5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Book Cover */}
        <div className="w-20 sm:w-24 flex-shrink-0 mx-auto sm:mx-0">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-[#8B7355] via-[#6B5344] to-[#4A3728]">
            {discussion.book.cover ? (
              <img src={discussion.book.cover} alt={discussion.book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Discussion Content */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          {/* Featured Badge */}
          {discussion.isFeatured && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#D0744C]/10 text-[#D0744C] border border-[#D0744C]/20 mb-2">
              {content.featured.badge}
            </span>
          )}

          {/* Book Title & Author */}
          <h3 className="text-sm sm:text-base font-semibold text-[#210C00] mb-0.5 line-clamp-1">
            {discussion.book.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-[#210C00]/50 mb-2">
            by {discussion.book.author}
          </p>

          {/* Discussion Topic */}
          <p className="text-xs sm:text-sm font-medium text-[#60351B] mb-1">
            {discussion.topic}
          </p>
          <p className="text-[10px] sm:text-xs text-[#210C00]/60 leading-relaxed line-clamp-2 mb-3">
            {discussion.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-[10px] sm:text-xs text-[#210C00]/50 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              {discussion.participants} {content.discussionCard.participantsLabel}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              {discussion.comments} {content.discussionCard.commentsLabel}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {content.discussionCard.lastActivityLabel} {discussion.lastActivity}
            </span>
          </div>

          {/* Active Users & Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Active Users Avatars */}
            <div className="flex items-center -space-x-2">
              {discussion.activeUsers.slice(0, 4).map((user, index) => (
                <div
                  key={user.id}
                  className="w-7 h-7 rounded-full bg-[#D0C4B0] border-2 border-white flex items-center justify-center"
                  style={{ zIndex: discussion.activeUsers.length - index }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[8px] font-medium text-[#60351B]">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
              ))}
              {discussion.activeUsers.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-[#60351B]/10 border-2 border-white flex items-center justify-center">
                  <span className="text-[8px] font-medium text-[#60351B]">+{discussion.activeUsers.length - 4}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/community/discussions/${discussion.id}`}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#60351B] text-white hover:bg-[#4A2518] transition-colors"
              >
                {content.discussionCard.viewButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscussionsPage(): JSX.Element {
  const router = useRouter();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();

  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [discussions, setDiscussions] = useState<DiscussionItem[]>(placeholderDiscussions);
  const [activeTab, setActiveTab] = useState<'most-active' | 'recent' | 'popular'>('most-active');
  const [searchQuery, setSearchQuery] = useState('');

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

        // Fetch discussions data
        // const discussionsData = await discussionsApi.getAll();
        // setDiscussions(discussionsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter discussions
  const featuredDiscussions = discussions.filter(d => d.isFeatured);
  const regularDiscussions = discussions.filter(d => !d.isFeatured);

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
      <div className="w-full lg:ml-24">
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
                    placeholder="Search discussions..."
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
                      {userData?.name || 'User'}
                    </span>
                  </div>
                  <button aria-label="Notifications" className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
                    <Image src={bellIcon} alt="Notifications" width={18} height={18} className="object-contain sm:w-[22px] sm:h-[22px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="pl-4 pr-4 sm:pl-8 sm:pr-8 lg:pl-28 lg:pr-12 py-4 sm:py-6 lg:py-8 mt-14 sm:mt-0">
              <div className="max-w-5xl mx-auto lg:mx-0">
                {/* Back Link */}
                <Link 
                  href="/community"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#210C00]/60 hover:text-[#210C00] transition-colors mb-4"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {content.header.backLink}
                </Link>

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00] mb-2">
                    {content.header.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#210C00]/60 max-w-2xl leading-relaxed">
                    {content.header.subtitle}
                  </p>
                </div>

                {/* Filters & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
                  {/* Genre Filter */}
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#210C00]/10 text-[11px] sm:text-xs text-[#210C00]/70 hover:bg-[#210C00]/5 transition-colors w-fit">
                    {content.filters.allGenres}
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Sort Tabs */}
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-white rounded-lg p-0.5 sm:p-1 border border-[#210C00]/10 w-full sm:w-fit overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('most-active')}
                      className={`flex-1 sm:flex-none px-2.5 sm:px-3 sm:px-4 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                        activeTab === 'most-active'
                          ? 'bg-[#60351B] text-white'
                          : 'text-[#210C00]/60 hover:bg-[#210C00]/5'
                      }`}
                    >
                      {content.filters.mostActive}
                    </button>
                    <button
                      onClick={() => setActiveTab('recent')}
                      className={`flex-1 sm:flex-none px-2.5 sm:px-3 sm:px-4 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                        activeTab === 'recent'
                          ? 'bg-[#60351B] text-white'
                          : 'text-[#210C00]/60 hover:bg-[#210C00]/5'
                      }`}
                    >
                      {content.filters.recent}
                    </button>
                    <button
                      onClick={() => setActiveTab('popular')}
                      className={`flex-1 sm:flex-none px-2.5 sm:px-3 sm:px-4 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                        activeTab === 'popular'
                          ? 'bg-[#60351B] text-white'
                          : 'text-[#210C00]/60 hover:bg-[#210C00]/5'
                      }`}
                    >
                      {content.filters.popular}
                    </button>
                  </div>
                </div>

                {/* Featured Discussions */}
                {featuredDiscussions.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#D0744C]">✦</span>
                      <h2 className="text-base sm:text-lg font-semibold text-[#210C00]">
                        {content.featured.title}
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {featuredDiscussions.map((discussion) => (
                        <DiscussionCard key={discussion.id} discussion={discussion} content={content} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Discussions */}
                <div className="space-y-4">
                  {regularDiscussions.map((discussion) => (
                    <DiscussionCard key={discussion.id} discussion={discussion} content={content} />
                  ))}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center mt-6 sm:mt-8">
                  <button className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white border border-[#210C00]/20 text-xs sm:text-sm text-[#210C00]/70 hover:bg-[#210C00]/5 transition-colors">
                    {content.loadMore.button}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
