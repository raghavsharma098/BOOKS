'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, recommendationsApi, readingApi, communityApi, bookClubsApi, booksApi, eventsApi, giveawaysApi, blogsApi, pollsApi, getImageUrl } from '../../lib/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileDrawer from '../components/MobileDrawer';
import UserNavbar from '../components/UserNavbar';
import { useMobileMenu } from '../contexts/MobileMenuContext';

// Placeholder images
import cover1 from '../../images/Book cover.png';

import readBookIcon from '../../images/readbook.png';
import reviewImg from '../../images/review.png';
import bookCover2 from '../../images/Book cover (2).png';
import bookCover3 from '../../images/Book cover (3).png';
import cardImg3 from '../../images/Book cover (4).png';
import cardImg4 from '../../images/Book cover (5).png';
import bookBundle1 from '../../images/Book Bundle1.png';
import bookBundle2 from '../../images/Book Bundle2.png';
import trophyIcon from '../../images/trophy.png';
import user2 from '../../images/user2.png';
import redBook from '../../images/redbook.png';
import arrowIcon from '../../images/arrow.png';
import settingIcon from '../../images/setting.png';
import bellIcon from '../../images/bell.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic content
interface DashboardContent {
  hero: {
    greeting: string;
    subGreeting: string;
    statusText: string;
    buttonText: string;
    heroImage: string;
  };
  sections: {
    popularNow: { title: string; viewAllText: string };
    trending: { title: string };
    mostReviewed: { title: string; viewAllText: string };
    featuredEvents: { title: string; viewAllText: string };
    giveaways: { title: string };
    reviewRatings: { title: string };
    bookClub: { title: string };
    authors: { title: string };
    readingChallenge: { title: string; description: string };
    featuredBlogs: { title: string; viewAllText: string };
    bestChoice: { title: string; pollLabel: string };
    newsletter: { title: string; subtitle: string; placeholder: string; buttonText: string };
  };
  footer: {
    copyright: string;
    links: { label: string; href: string }[];
  };
}

// Default content (placeholders)
const defaultContent: DashboardContent = {
  hero: {
    greeting: 'Happy reading,',
    subGreeting: 'Guest',
    statusText: "Wow! you've delved deep into the wizarding world's secrets. Have Harry's parents died yet? Oops looks like you're not there yet. Get reading now!",
    buttonText: 'Start Exploring',
    heroImage: '',
  },
  sections: {
    popularNow: { title: 'Popular Now', viewAllText: 'View all Books' },
    trending: { title: 'Trending this week' },
    mostReviewed: { title: 'Most Reviewed Books', viewAllText: 'View all Books' },
    featuredEvents: { title: 'Featured Events', viewAllText: 'View all Events' },
    giveaways: { title: 'Giveaways & Winners' },
    reviewRatings: { title: 'Review & Ratings' },
    bookClub: { title: 'Book Club' },
    authors: { title: 'Favourite writers & Authors' },
    readingChallenge: { title: '2026 Reading Challenge', description: 'A personal reading goal to stay consistent throughout the year' },
    featuredBlogs: { title: 'Featured Blogs', viewAllText: 'View all Blogs' },
    bestChoice: { title: "2025 Best Choice's of Reader", pollLabel: 'Best Choice 2025 Poll' },
    newsletter: { title: 'Subscribe to our newsletter', subtitle: 'Subscribe our newsletter to get updates regularly.', placeholder: 'Enter your email', buttonText: 'Subscribe' },
  },
  footer: {
    copyright: '© 2026 Copyright All Rights Reserved',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
  },
};

// Fetch dashboard content from admin panel
async function fetchDashboardContent(): Promise<DashboardContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/dashboard`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Book Card Component
function BookCard({ book, index, fallbackCover }: { book: any; index: number; fallbackCover: any }) {
  const rawCover = book?.coverUrl || book?.coverImage;
  const coverSrc = rawCover ? getImageUrl(rawCover) : fallbackCover;
  const title = book?.title || `Book ${index + 1}`;
  const author = book?.author?.name || (typeof book?.author === 'string' ? book.author : `Author ${index + 1}`);

  return (
    <div className="flex-shrink-0 w-24 xs:w-28 sm:w-32 md:w-[135px] flex flex-col items-center">
      <div className="w-full aspect-[135/197] rounded-l-md rounded-r-sm overflow-hidden bg-neutral-200 shadow-[-10px_10px_4px_rgba(0,0,0,0.28)]">
        {typeof coverSrc === 'string' ? (
          <img src={coverSrc} alt={title} className="w-full h-full object-cover rounded-l-md" />
        ) : (
          <Image src={coverSrc} alt={title} className="w-full h-full object-cover" />
        )}
      </div>
      <p className="mt-1 text-xs sm:text-sm font-medium text-center text-black truncate w-full px-1">{title}</p>
      <p className="text-[10px] sm:text-xs text-center text-orange-600 truncate w-full px-1">{author}</p>
    </div>
  );
}

// Section Header Component
function SectionHeader({ title, viewAllText, viewAllHref }: { title: string; viewAllText?: string; viewAllHref?: string }) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-[#210C00]">{title}</h2>
      {viewAllText && viewAllHref && (
        <Link href={viewAllHref} className="text-xs sm:text-sm md:text-lg text-orange-600/80 underline hover:text-orange-700">
          {viewAllText}
        </Link>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event, fallbackImage }: { event: any; fallbackImage: any }) {
  const imageSrc = event?.coverImage ? getImageUrl(event.coverImage) : fallbackImage;
  const title = event?.title || 'Featured Event Coming Soon';
  const typeLabel = event?.type
    ? event.type.charAt(0).toUpperCase() + event.type.slice(1)
    : 'Event';
  const locationLabel = event?.venue || event?.city || 'In Person';

  return (
    <div className="relative w-full h-56 sm:h-64 md:h-[280px] rounded border border-[#210C00]/30 bg-[#60351B]/10 shadow-inner overflow-hidden">
      <div className="absolute inset-4 sm:inset-6 md:inset-8 rounded overflow-hidden shadow-lg">
        {typeof imageSrc === 'string' ? (
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Image src={imageSrc} alt={title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#210C00] via-[#210C00]/60 to-transparent" />
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
          <div className="flex gap-2 mb-2">
            <button className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#60351B] text-white text-[10px] sm:text-xs font-medium">
              {typeLabel}
            </button>
            {event && (
              <button className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-medium truncate max-w-[120px]">
                {locationLabel}
              </button>
            )}
          </div>
          <h3 className="text-white font-bold text-xs sm:text-sm md:text-base line-clamp-2">{title}</h3>
        </div>
      </div>
    </div>
  );
}

// Giveaway Card Component
function GiveawayCard({ giveaway, fallbackImage, entered = false, entering = false, onEnter }: { giveaway: any; fallbackImage: any; entered?: boolean; entering?: boolean; onEnter?: () => void; }) {
  const title = giveaway?.title || 'Giveaway Coming Soon';
  const endDate = giveaway?.endDate ? new Date(giveaway.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
  const entries = giveaway?.entryCount || giveaway?.entries?.length || 0;
  const isOpen = giveaway?.status === 'active';
  const bookTitle = giveaway?.book?.title || 'Book Bundle';
  const authorName = giveaway?.book?.author?.name;

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-[238px] rounded-2xl border border-[#60351B]/20 bg-white/70 shadow-md flex overflow-hidden">
      <div className="relative w-28 sm:w-36 md:w-40 h-full flex-shrink-0">
        {giveaway?.coverImage || giveaway?.book?.coverImage ? (
          <img src={getImageUrl(giveaway.coverImage || giveaway.book?.coverImage)} alt={title} className="absolute top-4 sm:top-6 left-1 sm:left-2 w-24 sm:w-32 md:w-36 h-36 sm:h-44 md:h-48 object-cover rounded-l-md rounded-r-sm" />
        ) : (
          <Image src={fallbackImage} alt="bundle" className="absolute top-4 sm:top-6 left-1 sm:left-2 w-24 sm:w-32 md:w-36 h-36 sm:h-44 md:h-48 object-cover rounded-l-md rounded-r-sm" />
        )}
        <span className="absolute top-2 sm:top-3 right-1 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#60351B]/60 text-white text-[10px] sm:text-xs flex items-center gap-1">
          <svg className="w-2.5 sm:w-3 h-2.5 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {giveaway ? (isOpen ? 'Open' : 'Closed') : '–'}
        </span>
      </div>
      <div className="flex-1 pr-3 pl-2 py-3 sm:pr-4 sm:pl-3 sm:py-4 flex flex-col justify-start">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[#210C00] line-clamp-2">{title}</h3>
        <span className="text-xs sm:text-sm font-semibold text-[#210C00]/70 mt-1">{bookTitle}</span>
        {authorName && <p className="text-[10px] sm:text-xs text-[#210C00]/60 mt-1">{authorName}</p>}
        <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-[#210C00]/60">
          <span className="flex items-center gap-1">
            <svg className="w-2.5 sm:w-3 h-2.5 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {endDate}
          </span>
          <span className="flex items-center gap-1">
            <Image src={user2} alt="" width={12} height={12} className="rounded-full w-2.5 sm:w-3 h-2.5 sm:h-3" />
            {entries.toLocaleString()} entries
          </span>
        </div>
        {/* optional enter button */}
        {isOpen && !entered && onEnter && (
          <button
            onClick={onEnter}
            disabled={entering}
            className="mt-3 w-full py-2 rounded-2xl bg-gradient-to-b from-[#60351B] to-[#4A2816] text-white text-xs sm:text-sm font-medium shadow-md text-center disabled:opacity-60 hover:from-[#7a4424] transition-colors"
          >
            {entering ? 'Entering…' : 'Enter Giveaway'}
          </button>
        )}
      </div>
    </div>
  );
}

// Blog Card Component
function BlogCard({ image, blog, title, category, rotated = false, wide = false }: {
  image?: any;
  blog?: any;
  title?: string;
  category?: string;
  rotated?: boolean;
  wide?: boolean;
}) {
  const displayTitle = blog?.title || title || 'Featured Blog';
  const displayCategory = blog?.type
    ? blog.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : (blog?.tags?.[0]) || category || 'Reading Tips';
  const urlImage = typeof blog?.coverImage === 'string' && blog.coverImage ? getImageUrl(blog.coverImage) : null;
  const href = blog?._id ? `/blog/${blog.slug || blog._id}` : null;

  const card = (
    <div className={`relative w-full ${wide ? 'h-40 sm:h-48 md:h-[189px]' : 'h-36 sm:h-44 md:h-[189px]'} rounded border border-[#210C00]/30 bg-[#60351B]/10 shadow-inner overflow-hidden ${rotated ? 'rotate-180' : ''}`}>
      <div className="absolute inset-3 sm:inset-4 rounded overflow-hidden shadow-lg">
        {urlImage ? (
          <img src={urlImage} alt={displayTitle} className={`w-full h-full object-cover ${rotated ? 'rotate-180' : ''}`} />
        ) : image ? (
          <Image src={image} alt={displayTitle} className={`w-full h-full object-cover ${rotated ? 'rotate-180' : ''}`} />
        ) : (
          <div className="w-full h-full bg-[#60351B]/30" />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#210C00]/80 to-transparent ${rotated ? 'rotate-180' : ''}`} />
      </div>
      <span className={`absolute ${rotated ? 'bottom-4 sm:bottom-5 right-5 sm:right-7' : 'top-4 sm:top-5 left-5 sm:left-7'} px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-[#60351B]/50 text-white text-[10px] sm:text-xs font-medium z-10 ${rotated ? 'rotate-180' : ''}`}>
        {displayCategory}
      </span>
      <h4 className={`absolute ${rotated ? 'top-4 sm:top-6' : 'bottom-4 sm:bottom-6'} left-5 sm:left-7 right-5 sm:right-7 text-white font-bold text-xs sm:text-sm z-10 line-clamp-2 ${rotated ? 'rotate-180' : ''}`}>
        {displayTitle}
      </h4>
    </div>
  );

  return href ? (
    <Link href={href} className="block hover:opacity-90 transition-opacity">{card}</Link>
  ) : (
    card
  );
}

// Author Card Component
function AuthorCard({ author }: { author: any }) {
  const name = author?.name || 'Author Name';
  const booksRead = author?.booksRead;
  const books = booksRead ? `${booksRead} book${booksRead !== 1 ? 's' : ''} read` : author?.totalBooks ? `${author.totalBooks} books` : 'Writer';
  // photo is used if available; badge indicates verification
  const isVerified = author?.isVerified || author?.status === 'verified';
  // Prefer the claimed user's profile picture, fall back to author's own photo
  const rawPhoto = author?.claimedBy?.profilePicture || author?.profilePhoto || null;
  const photoSrc = rawPhoto ? getImageUrl(rawPhoto) : null;

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-[#210C00]">
          {photoSrc ? (
            <img src={photoSrc} alt={name} className="w-full h-full object-cover" />
          ) : (
            <Image src={user2} alt={name} className="w-full h-full object-cover" />
          )}
        </div>
        {isVerified && (
          <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#60351B] border-2 border-white" title="Verified Author">
            <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
              <path d="M10.28 2.28L5 7.56 2.72 5.28a1 1 0 00-1.44 1.44l3 3a1 1 0 001.44 0l6-6a1 1 0 00-1.44-1.44z" />
            </svg>
          </span>
        )}
      </div>
      <span className="text-xs sm:text-sm font-medium text-[#210C00] text-center truncate w-full">{name}</span>
      <span className="text-[10px] sm:text-xs text-[#210C00]/60 text-center">{books}</span>
    </div>
  );
}

// Book Club Card Component
function BookClubCard({ club, backgroundImage, isMember }: { club: any; backgroundImage: any; isMember?: boolean }) {
  const name = club?.name || 'Book Club';
  const description = club?.description || 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.';
  const themeLabel = (() => {
    switch (club?.clubType) {
      case 'emotional': return '♥ Emotional Theme';
      case 'genre': return `📚 ${club?.genreFocus || 'Genre Club'}`;
      case 'buddy_read': return '👥 Buddy Read';
      case 'author_led': return '✍️ Author Led';
      case 'editorial_pick': return '⭐ Editorial Pick';
      default: return '📖 Book Club';
    }
  })();

  return (
    <div className="relative w-full h-32  border-amber-900 border-[2px] bg-[#60351B4A] bg-gradient-to-t from-[#442a1a] to-[#e4ab89] sm:h-36 md:h-[150px] rounded-[22px] overflow-hidden ">
      {club?.coverImage ? (
        <img
          src={getImageUrl(club.coverImage)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
          style={{ opacity: 0.7 }}
        />
      ) : (
        <Image
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full  object-cover scale-[1.02]"
          style={{ opacity: 0.7 }}
        />
      )}
      <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col">
        <h3 className="text-sm sm:text-base md:text-lg font-medium text-[#210C00]">{name}</h3>
        <button className="self-start mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#FFE5CF] border-t border-[#60351B]/15 text-[8px] sm:text-[9px] font-semibold text-[#210C00] flex items-center gap-1">
          {themeLabel}
        </button>
        <p className="text-[8px] sm:text-[9px] text-[#6B4A33] mt-1 sm:mt-2 line-clamp-2">{description}</p>
        <Link href={`/clubs/${club?._id || ''}`} className="absolute bottom-2 sm:bottom-3 right-3 sm:right-4 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-b from-[#60351B] to-[#4A2816] text-white text-[10px] sm:text-xs font-medium">
          {isMember ? 'View Club' : 'Join Club'}
        </Link>
      </div>
    </div>
  );
}

// Poll Bar Component
function PollBar({ rank, option, votes, percentage, isVoted, isVoting, onClick }: { rank: number; option: string; votes: number; percentage: number; isVoted?: boolean; isVoting?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={isVoted || isVoting}
      className={`relative w-full h-8 sm:h-9 rounded-lg overflow-hidden border transition-all ${isVoted
          ? 'border-amber-400 ring-2 ring-amber-400/50 cursor-default'
          : onClick
            ? 'border-[#60351B] hover:border-white/60 hover:scale-[1.01] cursor-pointer active:scale-[0.99]'
            : 'border-[#60351B]'
        } bg-white/10`}
    >
      <div className="absolute inset-y-0 left-0 bg-white/10 rounded-lg transition-all duration-500" style={{ width: `${percentage}%` }} />
      <div className="absolute inset-0 flex items-center justify-between px-3 sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-white font-bold text-xs sm:text-sm">{rank}.</span>
          <span className="text-white font-bold text-xs sm:text-base">{option}</span>
          {isVoted && <span className="text-amber-300 text-xs">✓</span>}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline text-white/80 text-[8px] italic">{isVoting ? '…' : `${votes.toLocaleString()} votes`}</span>
          <span className="text-white font-bold text-xs sm:text-sm">{percentage}%</span>
        </div>
      </div>
    </button>
  );
}

export default function DashboardPage(): JSX.Element {
  const router = useRouter();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic content state
  const [content, setContent] = useState<DashboardContent>(defaultContent);

  // Backend data state
  const [userData, setUserData] = useState<any>(null);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
  const [mostReviewedBooks, setMostReviewedBooks] = useState<any[]>([]);
  const [currentReading, setCurrentReading] = useState<any[]>([]);
  const [bookClubs, setBookClubs] = useState<any[]>([]);
  const [myClubIds, setMyClubIds] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<any[]>([]);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<number>(0);
  const [finishedReadingsList, setFinishedReadingsList] = useState<any[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookCardExpanded, setBookCardExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enteredGiveaways, setEnteredGiveaways] = useState<Set<string>>(new Set());
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [winnersModal, setWinnersModal] = useState<any | null>(null);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [activePoll, setActivePoll] = useState<any | null>(null);
  const [votingBookId, setVotingBookId] = useState<string | null>(null);

  const handleGiveawayCardClick = async (giveaway: any) => {
    if (!giveaway?._id) return;
    if (giveaway.status === 'active') {
      handleEnterGiveaway(giveaway._id);
    } else {
      // fetch full detail to get populated winners
      setWinnersLoading(true);
      setWinnersModal(giveaway); // open modal immediately with basic data
      try {
        const res: any = await giveawaysApi.getById(giveaway._id);
        setWinnersModal(res?.data || res || giveaway);
      } catch {
        // keep the basic data
      } finally {
        setWinnersLoading(false);
      }
    }
  };

  // Fetch data on mount
  const handleEnterGiveaway = async (id: string) => {
    if (!id || enteredGiveaways.has(id) || enteringId) return;
    setEnteringId(id);
    try {
      await giveawaysApi.enter(id);
      setEnteredGiveaways((prev) => new Set(prev).add(id));
    } catch (err: any) {
      // If already entered, still mark as entered
      if (err?.message?.toLowerCase().includes('already')) {
        setEnteredGiveaways((prev) => new Set(prev).add(id));
      } else {
        alert(err?.message || 'Could not enter giveaway');
      }
    } finally {
      setEnteringId(null);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch page content and API data in parallel
        const [
          pageContent,
          userProfile,
          popularBooksData,
          recommendedBooks,
          trendingData,
          reviewedData,
          currentBooks,
          clubs,
          myClubsData,
          eventsData,
          giveawaysData,
          finishedData,
          blogsData,
          activePollData,
        ]: any[] = await Promise.all([
          fetchDashboardContent(),
          userApi.getProfile().catch(() => null),
          // Popular Now – most clicked books of all time
          booksApi.getPopular(8).catch(() => ({ data: [] })),
          // Personalized recommendations (for hero/reading context)
          recommendationsApi.getPersonalized({ limit: 12 }).catch(() => ({ data: [] })),
          // Trending this week – sorted by weeklyViews
          booksApi.getTrendingWeekly(8).catch(() => ({ data: [] })),
          // Most reviewed – sorted by totalReviews desc
          booksApi.getAll({ sortBy: 'totalReviews:desc', limit: 8 }).catch(() => ({ data: [] })),
          readingApi.getCurrentlyReading().catch(() => ({ data: [] })),
          bookClubsApi.getAll().catch(() => ({ data: [] })),
          bookClubsApi.getMine().catch(() => ({ data: [] })),
          // Featured events only (admin-flagged)
          eventsApi.getFeatured(4).catch(() => ({ data: [] })),
          giveawaysApi.getAll({ limit: 2 }).catch(() => ({ data: [] })),
          readingApi.getFinished().catch(() => ({ data: [] })),
          // Blogs
          // Fetch published/featured blogs (backend filters visibility for public users)
          blogsApi.getAll({ limit: 6 }).catch(() => ({ data: [] })),
          // Active reader's choice poll (admin-created)
          pollsApi.getActive().catch(() => ({ data: null })),
        ]);

        setContent(pageContent);
        setUserData(userProfile?.data || null);
        setPopularBooks(popularBooksData?.data || []);
        setRecommendations(recommendedBooks?.data || []);
        setTrendingBooks(trendingData?.data || []);
        setMostReviewedBooks(reviewedData?.data || []);
        const currentReadingList: any[] = currentBooks?.data || [];
        setCurrentReading(currentReadingList);
        setBookClubs(clubs?.data || []);
        const joinedIds = new Set<string>((myClubsData?.data || []).map((c: any) => String(c._id || c.club?._id || '')));
        setMyClubIds(joinedIds);
        setEvents(eventsData?.data || []);
        setGiveaways(giveawaysData?.data || []);
        const finishedList: any[] = Array.isArray(finishedData?.data) ? finishedData.data : [];
        setFinishedBooks(finishedList.length);
        setFinishedReadingsList(finishedList);

        // Derive favourite authors from reading history (finished + currently reading)
        const allReadings = [...finishedList, ...currentReadingList];
        const authorMap = new Map<string, any>();
        for (const r of allReadings) {
          const author = r.book?.author;
          if (!author || typeof author !== 'object') continue;
          const key = String(author._id || author);
          if (!authorMap.has(key)) {
            authorMap.set(key, { ...author, booksRead: 0 });
          }
          authorMap.get(key)!.booksRead += 1;
        }
        const derivedAuthors = Array.from(authorMap.values())
          .sort((a, b) => b.booksRead - a.booksRead)
          .slice(0, 6);
        setAuthors(derivedAuthors);

        setBlogs(blogsData?.data || []);
        setActivePoll(activePollData?.data || null);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // Derived values
  const readingGoal = userData?.readingGoals?.yearlyTarget || 12;
  const currentBook = currentReading[0];
  const reviewBook = mostReviewedBooks[reviewIndex];
  const publishYear = currentBook?.book?.publicationDate
    ? new Date(currentBook.book.publicationDate).getFullYear()
    : null;

  // Best choice poll – use admin-created active poll; fall back to empty
  const pollBooks = activePoll?.books || [];
  const totalPollVotes = activePoll?.totalVotes ?? pollBooks.reduce((s: number, b: any) => s + (b.voteCount || 0), 0);
  const pollBars = pollBooks.map((pb: any, i: number) => ({
    rank: i + 1,
    title: pb.book?.title || `Book ${i + 1}`,
    author: pb.book?.author?.name || '',
    cover: pb.book?.coverImage ? getImageUrl(pb.book.coverImage) : null,
    bookId: String(pb.book?._id || ''),
    votes: pb.voteCount || 0,
    percentage: pb.percentage ?? (totalPollVotes > 0 ? Math.round(((pb.voteCount || 0) / totalPollVotes) * 100) : 0),
  }));

  async function handleVote(bookId: string) {
    if (!activePoll?._id || votingBookId) return;
    setVotingBookId(bookId);
    try {
      const res: any = await pollsApi.vote(activePoll._id, bookId);
      if (res?.data) {
        // Merge vote counts back into existing populated books — don't replace book objects
        setActivePoll((prev: any) => {
          if (!prev) return prev;
          const updatedCounts: Record<string, { voteCount: number; percentage: number }> = {};
          (res.data.books || []).forEach((b: any) => {
            updatedCounts[String(b.book)] = { voteCount: b.voteCount, percentage: b.percentage };
          });
          return {
            ...prev,
            userVotedBook: res.data.userVotedBook,
            totalVotes: res.data.totalVotes,
            books: prev.books.map((pb: any) => {
              const id = String(pb.book?._id || pb.book);
              const updated = updatedCounts[id];
              return updated ? { ...pb, ...updated } : pb;
            }),
          };
        });
      }
    } catch (err: any) {
      alert(err?.message || 'Could not record vote');
    } finally {
      setVotingBookId(null);
    }
  }

  // No placeholder books – show empty state when no data from backend

  function handleApplyFilters() {
    setSearchFilterOpen(false);
  }

  function pickRandomBook() {
    const POOL = ['Harry Potter', 'The Merge', 'Little Women', 'The Chambers of Secrets'];
    const rnd = POOL[Math.floor(Math.random() * POOL.length)];
    router.push(`/search-book?q=${encodeURIComponent(rnd)}`);
  }

  // Update greeting with user name
  const greeting = content.hero.greeting;
  const userName = userData?.name || content.hero.subGreeting;
  // Hero status text: show current book info if reading, else default
  const heroStatusText = currentBook?.book
    ? `Currently reading "${currentBook.book.title}" — ${currentBook.pagesRead || 0} of ${currentBook.book.pageCount || '?'} pages done. Keep going!`
    : content.hero.statusText;

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      {/* Mobile Top Bar */}
      <MobileTopBar>
        <SearchBar
          asHeader
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search books, authors..."
          showFilters={true}
        />
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
      <div className="w-full lg:pl-16">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#60351B]" />
              <p className="mt-4 text-sm sm:text-base text-[#60351B] font-medium">Loading your personalized dashboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="text-center max-w-md">
              <div className="text-red-600 text-lg sm:text-xl font-semibold mb-2">Unable to load dashboard</div>
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

        {/* Main Dashboard Content */}
        {!loading && !error && (
          <>
            {/* Top Bar with Search and User - Desktop/Tablet only */}
            <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
              <div className="max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-pl-24">
                    <SearchBar
                      placeholder="Search Book by name, author"
                      onFilterOpenChange={setSearchFilterOpen}
                      onApplyFilters={handleApplyFilters}
                      onPickRandom={pickRandomBook}
                    />
                  </div>
                  <UserNavbar />
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <section className="relative px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 pt-4 sm:pt-6 pb-6 sm:pb-8 lg:pt-12 lg:pb-16 mt-14 sm:mt-0">
              <div className="max-w-7xl mx-auto sm:ml-4 lg:ml-12">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 sm:gap-8">
                  {/* Greeting */}
                  <div className="lg:max-w-md">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#210C00]" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {greeting}
                    </h1>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#210C00]" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {userName}
                    </h2>
                    <p className="hidden lg:block mt-6 text-sm text-black/80 leading-relaxed max-w-sm">
                      {heroStatusText}
                    </p>
                    <button className="hidden lg:inline-flex mt-6 px-6 py-2.5 rounded-full bg-[#60351B] text-white text-sm font-medium shadow-lg hover:bg-[#4A2518] transition-colors">
                      {content.hero.buttonText}
                    </button>
                  </div>

                  {/* Hero Image + Currently Reading Card */}
                  <div className="relative flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                    {/* Currently Reading Card container */}
                    <div className={`relative w-full sm:w-auto ${bookCardExpanded ? '' : ''}`} style={{ minHeight: bookCardExpanded ? 'auto' : '12rem' }}>{/* reserve height */}
                      {/* Currently Reading Card */}
                      <div className={`bg-[#60351B33] rounded-lg p-3 sm:p-4 md:p-5 shadow-lg flex-1 min-w-0 transition-all duration-300 ${bookCardExpanded ? 'relative w-full sm:absolute sm:top-0 sm:right-0 z-20 sm:w-[320px] md:w-[360px] lg:w-[400px] xl:w-[450px]' : 'w-full sm:w-[280px] md:w-[320px] lg:w-[360px] xl:w-[400px]'}`}>
                        {/* inside-card cover image (only when collapsed) */}
                        {!bookCardExpanded && currentBook?.book?.coverImage && (
                          <div className="absolute left-3 top-3 sm:relative sm:left-auto sm:top-auto w-[70px] sm:w-[100px] lg:w-[120px] rounded-lg overflow-hidden shadow-xl"
                            style={{ aspectRatio: '2/3' }}>
                            <img
                              src={getImageUrl(currentBook.book.coverImage)}
                              alt={currentBook.book.title || 'Currently reading'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {!bookCardExpanded ? (
                          /* Collapsed View */
                          <div className="pl-[85px] sm:pl-[120px] lg:pl-[140px] -mt-0 sm:-mt-44">
                            <p className="text-[10px] sm:text-xs text-[#210C00]/60 text-right mb-1 sm:mb-2">~ {currentBook?.book?.author?.name || 'Author'}</p>
                            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-[#210C00] leading-tight mb-2 sm:mb-3">
                              {currentBook?.book?.title || 'No book in progress'}
                            </h3>
                            <p className="text-xs sm:text-sm text-orange-600 mb-1 sm:mb-2">
                              <span className="font-semibold">{currentBook?.pagesRead || 0}</span>
                              <span className="text-[#210C00]/60"> / {currentBook?.book?.pageCount || '?'} Pages</span>
                            </p>
                            <p className="text-[10px] sm:text-xs text-[#210C00]/70 leading-relaxed line-clamp-3 mb-3 sm:mb-4">
                              {currentBook?.book?.description?.substring(0, 120) || 'Start reading a book to track your progress here.'}
                            </p>
                            {currentBook?.book && (
                              <button
                                onClick={() => setBookCardExpanded(true)}
                                className="w-full py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white text-xs sm:text-sm font-medium hover:bg-[#4A2518] transition-colors"
                              >
                                Continue Review
                              </button>
                            )}
                          </div>
                        ) : (
                          /* Expanded View */
                          <>
                            {/* Close button */}
                            <button
                              onClick={() => setBookCardExpanded(false)}
                              className="absolute top-2 right-2 w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors z-10"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="#210C00" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </button>

                            {/* Editor's Choice Tag */}
                            <div className="flex justify-end mb-2 pr-8 sm:pr-0">
                              <span className="px-3 py-1 bg-[#60351B] text-white text-[10px] sm:text-xs rounded-full"># Editor's Choice</span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                              {/* Book Cover */}
                              <div className="w-[120px] sm:w-[120px] md:w-[140px] aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 shadow-md mx-auto sm:mx-0">
                                {currentReading[0]?.book?.coverImage ? (
                                  <img src={getImageUrl(currentReading[0].book.coverImage)} alt="Book cover" className="w-full h-full object-cover" />
                                ) : (
                                  <Image src={cover1} alt="Book cover" className="w-full h-full object-cover" />
                                )}
                              </div>

                              {/* Book Details */}
                              <div className="flex-1 min-w-0 text-center sm:text-left">
                                <p className="text-[10px] sm:text-xs text-[#210C00]/60 mb-1">~ {currentBook?.book?.author?.name || 'Author'}</p>
                                <h3 className="text-base sm:text-xl md:text-2xl font-medium text-[#210C00] leading-tight mb-2">
                                  {currentBook?.book?.title || 'No book in progress'}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <svg key={i} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.round(currentBook?.book?.averageRating || 0) ? 'text-[#E09D4A]' : 'text-[#E09D4A]/30'}`} viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-[9px] sm:text-xs text-[#210C00]/60">
                                    {(currentBook?.book?.totalRatings || 0).toLocaleString()} ratings
                                  </span>
                                </div>

                                <p className="text-[10px] sm:text-sm text-[#210C00]/70 mb-2 sm:mb-3">
                                  {currentBook?.book?.pageCount || '?'} pages
                                  {publishYear ? ` • first pub ${publishYear}` : ''}
                                </p>

                                <p className="text-[10px] sm:text-sm text-[#210C00]/80 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
                                  {currentBook?.book?.description?.substring(0, 200) || 'Add a book to your reading list to see details here.'}
                                </p>

                                <button
                                  onClick={() => router.push(`/view-detail?id=${currentBook?.book?._id || ''}`)}
                                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white text-xs sm:text-sm font-medium hover:bg-[#4A2518] transition-colors w-full sm:w-auto"
                                >
                                  View Detail
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Genre Tags */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#210C00]/10">
                              <span className="w-5 h-5 rounded-full bg-[#210C00]/10 flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" stroke="#210C00" strokeWidth="2" />
                                </svg>
                              </span>
                              {(currentBook?.book?.genres || []).slice(0, 4).map((genre: string, idx: number) => (
                                <span key={idx} className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#210C00]/20 text-[9px] sm:text-xs text-[#210C00]/80">
                                  {genre}
                                </span>
                              ))}
                              <span className="text-[10px] sm:text-xs text-orange-600 cursor-pointer hover:underline">more tags</span>
                            </div>

                            {/* Reader Friends Section - hidden on mobile for space */}
                            <div className="hidden sm:block mt-4 pt-4 border-t border-[#210C00]/10">
                              <h4 className="text-sm sm:text-base font-medium text-[#210C00] mb-3">Reader Friends</h4>
                              <p className="text-xs text-[#210C00]/50 italic">No reading activity from friends yet.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Popular Now Section */}
            <section className="px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 lg:py-8">
              <div className="max-w-7xl mx-auto sm:ml-4 lg:ml-12">
                {/* when card is expanded we remove header link and defer showing it inside the list */}
                <SectionHeader
                  title={content.sections.popularNow.title}
                  viewAllText={bookCardExpanded ? undefined : content.sections.popularNow.viewAllText}
                  viewAllHref={bookCardExpanded ? undefined : "/search-book"}
                />
                {popularBooks.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-sm text-[#210C00]/40 italic">No books yet — check back soon.</div>
                ) : (
                  <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-10 xl:gap-[74px] overflow-x-auto pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:mx-0 lg:px-0 lg:overflow-visible lg:flex-wrap scrollbar-hide snap-x snap-mandatory touch-pan-x">
                    {/* ensure carousel items have fixed width on very small screens */}
                    {popularBooks.slice(0, bookCardExpanded ? 4 : 6).map((book, idx) => (
                      <React.Fragment key={book._id || idx}>
                        {bookCardExpanded && idx === 3 && (
                          <Link
                            href="/search-book"
                            className="self-start -mt-16 text-xs sm:text-sm md:text-lg text-orange-600/80 underline hover:text-orange-700 mb-2"
                          >
                            {content.sections.popularNow.viewAllText}
                          </Link>
                        )}
                        <Link
                          href={`/view-detail?id=${book._id || ''}`}
                          className={`snap-start flex-shrink-0 w-[90px] sm:w-auto ${bookCardExpanded && idx === 3 ? 'sm:-ml-48' : ''}`}
                        >
                          <BookCard book={book} index={idx} fallbackCover={cover1} />
                        </Link>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Trending This Week Section */}
            <section className="px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 lg:py-8">
              <div className="max-w-7xl mx-auto sm:ml-4 lg:ml-12">
                <SectionHeader title={content.sections.trending.title} />
                {trendingBooks.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-sm text-[#210C00]/40 italic border border-[#210C00]/20 rounded-lg">
                    No trending books this week yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {trendingBooks.slice(0, 2).map((book: any, idx) => (
                      <Link
                        key={idx}
                        href={`/view-detail?id=${book._id || ''}`}
                        className="flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 lg:p-10 rounded border border-[#210C00]/30 bg-transparent shadow-inner hover:bg-[#60351B]/5 transition-colors"
                      >
                        <div className="w-20 sm:w-24 md:w-[135px] aspect-[135/197] rounded-l-md rounded-r-sm overflow-hidden flex-shrink-0">
                          {book.coverImage ? (
                            <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#60351B]/20 flex items-center justify-center">
                              <svg className="w-8 h-8 text-[#60351B]/40" viewBox="0 0 24 24" fill="currentColor"><path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.round(book.averageRating || 0) ? 'text-[#F08252]' : 'text-[#F08252]/30'}`}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" />
                              </svg>
                            ))}
                          </div>
                          <h3 className="text-base sm:text-lg md:text-2xl font-normal text-[#210C00] truncate">{book.title}</h3>
                          <p className="text-xs sm:text-sm text-orange-600 italic truncate mt-0.5 sm:mt-1">
                            {book.author?.name || (typeof book.author === 'string' ? book.author : '')}
                          </p>
                          {book.description && (
                            <p className="hidden sm:block text-[10px] sm:text-xs text-black/80 mt-1 sm:mt-2 line-clamp-2 md:line-clamp-3">
                              {book.description}
                            </p>
                          )}
                          <span className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-black underline underline-offset-2 decoration-dotted flex items-center gap-1">
                            Read more
                            <Image src={readBookIcon} alt="" width={14} height={14} className="sm:w-4 sm:h-4" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Most Reviewed Books + Review & Ratings Section */}
            <section className="ml-0 sm:ml-4 lg:ml-12 px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 lg:py-8">
              <div className="max-w-7xl mx-auto sm:ml-4 lg:ml-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_380px] gap-4 sm:gap-6 lg:gap-8">
                  {/* Most Reviewed Books */}
                  <div>
                    <SectionHeader
                      title={content.sections.mostReviewed.title}
                      viewAllText={content.sections.mostReviewed.viewAllText}
                      viewAllHref="/search-book"
                    />
                    {mostReviewedBooks.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-sm text-[#210C00]/40 italic">No reviewed books yet.</div>
                    ) : (
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-x-8 xl:gap-x-12 lg:gap-y-6 xl:gap-y-8">
                        {mostReviewedBooks.slice(0, 8).map((book, idx) => (
                          <Link key={idx} href={`/view-detail?id=${book._id || ''}`}>
                            <BookCard book={book} index={idx} fallbackCover={cover1} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Review & Ratings */}
                  <div className="bg-[#60351B]/20 py-4 sm:py-6 md:py-8 px-3 sm:px-4 rounded-lg">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-[#210C00] text-center mb-3 sm:mb-4">
                      {content.sections.reviewRatings.title}
                    </h2>
                    <div className="relative aspect-[559/387] w-full max-w-[1800px] overflow-hidden mb-3 sm:mb-4">
                      {reviewBook?.coverImage ? (
                        <img src={getImageUrl(reviewBook.coverImage)} alt={reviewBook.title} className="w-full h-full object-cover" />
                      ) : (
                        <Image src={reviewImg} alt="review" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h3 className="text-base sm:text-xl md:text-2xl font-normal text-[#210C00] text-center">
                      {reviewBook?.title || 'No reviewed books yet'}
                    </h3>
                    <p className="text-xs sm:text-sm italic text-orange-600 text-center mt-0.5 sm:mt-1">
                      {reviewBook?.author?.name || ''}
                    </p>
                    <p className="text-[10px] sm:text-xs text-black text-center mt-2 sm:mt-3 line-clamp-4 leading-relaxed">
                      {reviewBook?.description?.substring(0, 200) || ''}
                    </p>
                    <div className="mt-4 sm:mt-6 flex items-center justify-center gap-4">
                      <button
                        onClick={() => setReviewIndex(i => Math.max(0, i - 1))}
                        disabled={reviewIndex === 0}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#210C00]/30 flex items-center justify-center hover:bg-[#60351B]/10 transition-colors disabled:opacity-30"
                      >
                        <span className="text-xl sm:text-2xl text-[#210C00]">‹</span>
                      </button>
                      <Link
                        href={reviewBook?._id ? `/view-detail?id=${reviewBook._id}` : '/search-book'}
                        className="text-xs sm:text-sm text-black underline underline-offset-2 decoration-dotted flex items-center gap-1.5 hover:text-orange-600 transition-colors"
                      >
                        <span>Read more</span>
                        <Image src={readBookIcon} alt="" width={16} height={16} className="sm:w-5 sm:h-5" />
                      </Link>
                      <button
                        onClick={() => setReviewIndex(i => Math.min(mostReviewedBooks.length - 1, i + 1))}
                        disabled={reviewIndex >= mostReviewedBooks.length - 1}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#210C00]/30 flex items-center justify-center hover:bg-[#60351B]/10 transition-colors disabled:opacity-30"
                      >
                        <span className="text-xl sm:text-2xl text-[#210C00]">›</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Events & Giveaways Section */}
            <section className="ml-0 sm:ml-4 lg:ml-12 px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 lg:py-8">
              <div className="max-w-[1320px] mx-auto sm:ml-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {/* Featured Events */}
                  <div>
                    <SectionHeader
                      title={content.sections.featuredEvents.title}
                      viewAllText={content.sections.featuredEvents.viewAllText}
                      viewAllHref="/events"
                    />
                    {events.length === 0 ? (
                      <div className="flex items-center justify-center py-8 h-32 text-sm text-[#210C00]/40 italic border border-[#210C00]/20 rounded-lg">
                        No featured events right now.
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {events[0] && (
                          <Link href={`/events/${events[0]._id}`}>
                            <EventCard event={events[0]} fallbackImage={bookCover2} />
                          </Link>
                        )}
                        {events[1] && (
                          <Link href={`/events/${events[1]._id}`}>
                            <EventCard event={events[1]} fallbackImage={bookCover3} />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Giveaways & Winners */}
                  <div className="p-4 sm:p-6 md:p-10 rounded bg-gradient-to-br from-[#E4DDD1]/80 to-[#754D35]/80">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-[#210C00] text-center mb-4 sm:mb-6">
                      {content.sections.giveaways.title}
                    </h2>
                    {giveaways.length === 0 ? (
                      <div className="flex items-center justify-center py-6 text-sm text-[#210C00]/40 italic">
                        No active giveaways right now.
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {giveaways[0] && (
                          <div onClick={() => handleGiveawayCardClick(giveaways[0])} className="cursor-pointer">
                            <GiveawayCard
                              giveaway={giveaways[0]}
                              fallbackImage={bookBundle1}
                              entered={enteredGiveaways.has(giveaways[0]._id)}
                              entering={enteringId === giveaways[0]._id}
                              onEnter={() => handleEnterGiveaway(giveaways[0]._id)}
                            />
                          </div>
                        )}
                        {giveaways[1] && (
                          <div onClick={() => handleGiveawayCardClick(giveaways[1])} className="cursor-pointer">
                            <GiveawayCard
                              giveaway={giveaways[1]}
                              fallbackImage={bookBundle2}
                              entered={enteredGiveaways.has(giveaways[1]._id)}
                              entering={enteringId === giveaways[1]._id}
                              onEnter={() => handleEnterGiveaway(giveaways[1]._id)}
                            />
                          </div>
                        )}                      </div>
                    )}
                    {/* Enter / Status button */}
                    {giveaways[0]?._id && (
                      giveaways[0].status !== 'active' ? (
                        <button
                          onClick={() => handleGiveawayCardClick(giveaways[0])}
                          className="block w-full mt-4 py-2 rounded-2xl bg-gradient-to-b from-[#8B5A3C] to-[#60351B] text-white text-xs sm:text-sm font-medium shadow-md text-center hover:opacity-90 transition-opacity"
                        >
                          🏆 See Winners
                        </button>
                      ) : enteredGiveaways.has(giveaways[0]._id) ? (
                        <div className="w-full mt-4 py-2.5 rounded-2xl bg-gradient-to-b from-green-700 to-green-900 text-white text-xs sm:text-sm font-medium shadow-md text-center">
                          🎉 You&apos;re entered! Results will be announced soon.
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnterGiveaway(giveaways[0]._id)}
                          disabled={enteringId === giveaways[0]._id}
                          className="block w-full mt-4 py-2 rounded-2xl bg-gradient-to-b from-[#60351B] to-[#4A2816] text-white text-xs sm:text-sm font-medium shadow-md text-center disabled:opacity-60 hover:from-[#7a4424] transition-colors"
                        >
                          {enteringId === giveaways[0]._id ? 'Entering…' : 'Enter Giveaway'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Book Clubs + Favourite Authors Section */}
            <section className="px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 lg:py-8">
              <div className="max-w-7xl mx-auto sm:ml-4 lg:ml-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {/* Book Clubs */}
                  <div className="bg-[#60351B]/10 border border-[#210C00]/30 p-4 sm:p-6 md:p-8 rounded shadow-inner">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-[#210C00] text-center mb-4 sm:mb-6">
                      {content.sections.bookClub.title}
                    </h2>
                    {bookClubs.length === 0 ? (
                      <div className="flex items-center justify-center py-6 text-sm text-[#210C00]/40 italic">No clubs yet.</div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {bookClubs[0] && <BookClubCard club={bookClubs[0]} backgroundImage={cardImg3} isMember={myClubIds.has(String(bookClubs[0]._id))} />}
                        {bookClubs[1] && <BookClubCard club={bookClubs[1]} backgroundImage={cardImg4} isMember={myClubIds.has(String(bookClubs[1]._id))} />}
                      </div>
                    )}
                  </div>

                  {/* Favourite Authors */}
                  <div className="bg-[#60351B]/10 border border-[#210C00]/30 rounded p-4 sm:p-6 md:p-8">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-[#210C00] text-center mb-6 sm:mb-8">
                      {content.sections.authors.title}
                    </h2>
                    {authors.length === 0 ? (
                      <div className="flex items-center justify-center py-6 text-sm text-[#210C00]/40 italic">Start reading books to see your favourite authors here.</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {authors.slice(0, 6).map((author, idx) => (
                          <AuthorCard key={idx} author={author} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Reading Challenge + Featured Blogs Row */}
            <section className="px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 lg:py-8">
              <div className="max-w-7xl mx-auto sm:ml-4 lg:ml-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Reading Challenge */}
                <div className="bg-[#60351B]/10 border border-[#210C00]/30 rounded p-4 sm:p-6 md:p-8 shadow-inner">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-[#210C00] mb-4 sm:mb-6">Reading Challenges</h2>
                  <div className="bg-[#60351B]/10 border border-[#210C00]/30 rounded p-4 sm:p-6 shadow-inner">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <Image src={redBook} alt="book" className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 object-cover rounded-l-md rounded-r-sm flex-shrink-0" />
                      <div>
                        <h3 className="text-base sm:text-lg md:text-2xl font-semibold text-[#210C00]">
                          {content.sections.readingChallenge.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#210C00]/70 mt-0.5 sm:mt-1">
                          {content.sections.readingChallenge.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <Image src={arrowIcon} alt="" width={16} height={16} className="sm:w-5 sm:h-5" />
                      <span className="text-2xl sm:text-3xl font-semibold text-[#210C00]">{finishedBooks}</span>
                      <span className="text-sm sm:text-lg text-[#210C00]/60">of {readingGoal} books completed</span>
                    </div>
                    <div className="w-full h-2.5 sm:h-3 rounded-full bg-[#60351B]/10 overflow-hidden mb-1 sm:mb-2">
                      <div
                        className="h-full bg-orange-600 rounded-full transition-all"
                        style={{ width: `${Math.min((finishedBooks / readingGoal) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#60351B]/60 mb-4 sm:mb-6">
                      {finishedBooks === 0
                        ? 'Start reading to track progress!'
                        : finishedBooks >= readingGoal
                          ? '🎉 Goal complete!'
                          : finishedBooks / readingGoal >= 0.5
                            ? "You're on track!"
                            : 'Keep reading — you can do it!'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => router.push('/challenges')}
                        className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-[#60351B] text-white font-semibold text-xs sm:text-base"
                      >
                        View challenge details
                      </button>
                      <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/70 border-t border-[#60351B]/20 text-[#210C00] font-semibold text-xs sm:text-sm">
                        <Image src={settingIcon} alt="" width={14} height={14} className="sm:w-4 sm:h-4" />
                        Adjust goal
                      </button>
                    </div>
                  </div>
                </div>

                {/* Featured Blogs */}
                <div>
                  <SectionHeader
                    title={content.sections.featuredBlogs.title}
                    viewAllText={content.sections.featuredBlogs.viewAllText}
                    viewAllHref="/blog"
                  />
                  {blogs.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-[#210C00]/40 italic border border-[#210C00]/20 rounded-lg">
                      No featured posts yet.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <BlogCard blog={blogs[0]} />
                        {blogs[1] && <BlogCard blog={blogs[1]} rotated />}
                      </div>
                      {blogs[2] && <BlogCard blog={blogs[2]} wide />}
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Best Choice Poll Section – only shown when there are popular books with ratings */}
            {pollBars.length > 0 && (
              <section className="ml-0 sm:ml-4 lg:ml-12 px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 lg:py-8">
                <div className="max-w-[1368px] mx-auto sm:-ml-6 lg:-ml-10">
                  <div className="flex flex-col lg:flex-row overflow-hidden rounded-lg">
                    {/* Left - Book Covers */}
                    <div className="bg-[#60351B]/10 p-4 sm:p-6 lg:p-10 w-full lg:w-1/2">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-[#210C00] mb-4 sm:mb-6">
                        {activePoll?.title || content.sections.bestChoice.title}
                      </h2>
                      <div className="flex gap-2 sm:gap-4 md:gap-8 lg:gap-[60px] justify-center mb-4 sm:mb-6 overflow-x-auto pb-2">
                        {pollBars.map((b: any, idx: number) => {
                          const isVoted = activePoll?.userVotedBook === b.bookId;
                          return (
                            <div key={idx} className="flex pb-4 flex-col  items-center gap-2">
                              <div className={`w-20  sm:w-24 md:w-[135px] shadow-[-10px_10px_20px_#000000] aspect-[135/197] rounded-l-md rounded-r-sm overflow-hidden  ring-2 transition-all ${isVoted ? 'ring-amber-400 scale-105' : 'ring-transparent'}`}>
                                {b.cover ? (
                                  <img src={b.cover} alt={b.title} className="w-full h-full  object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-[#60351B]/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-[#60351B]/40" viewBox="0 0 24 24" fill="currentColor"><path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" /></svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 sm:gap-4 md:gap-8 lg:gap-[60px] justify-center text-center overflow-x-auto pb-2">
                        {pollBars.map((b: any, idx: number) => (
                          <div key={idx} className="w-20 sm:w-24 md:w-[135px]">
                            <p className="text-xs sm:text-sm font-medium text-black truncate">{b.title}</p>
                            <p className="text-[10px] sm:text-xs text-orange-600 truncate">{b.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right - Poll */}
                    <div className="bg-[#60351B] p-4 sm:p-6 lg:p-10 w-full lg:w-1/2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Which is the best?</h3>
                        <span className="px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-medium">
                          {activePoll?.year ? `Poll ${activePoll.year}` : content.sections.bestChoice.pollLabel}
                        </span>
                      </div>
                      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        {pollBars.map((b: any) => {
                          const isVoted = activePoll?.userVotedBook === b.bookId;
                          return (
                            <PollBar
                              key={b.rank}
                              rank={b.rank}
                              option={b.title}
                              votes={b.votes}
                              percentage={b.percentage}
                              isVoted={isVoted}
                              isVoting={votingBookId === b.bookId}
                              onClick={!isVoted ? () => handleVote(b.bookId) : undefined}
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs text-white/80 italic">{totalPollVotes.toLocaleString()} votes</span>
                        <Link href="/search-book" className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#F2F0E4] text-[#210C00] font-bold text-xs sm:text-sm shadow-lg">
                          Show more
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Newsletter Section */}
            <section className="px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 lg:py-8">
              <div className="max-w-7xl mx-auto sm:ml-4 lg:ml-12">
                <div className="rounded-xl sm:rounded-[22px] p-4 sm:p-6 md:p-8 lg:px-20 lg:py-10 border border-[#210C00]/50 bg-gradient-to-r from-[#60351B]/65 to-[#F6E1CE]/87 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-4xl font-normal text-white mb-1 sm:mb-2">
                        {content.sections.newsletter.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/60">
                        {content.sections.newsletter.subtitle}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <input
                        type="email"
                        placeholder={content.sections.newsletter.placeholder}
                        className="flex-1 lg:w-[265px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#210C00] bg-transparent text-white placeholder:text-white/50 text-xs sm:text-sm"
                      />
                      <button className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white font-medium text-xs sm:text-sm shadow-lg border-b-[3px] border-[#210C00]">
                        {content.sections.newsletter.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Section */}
            <footer className="px-3 sm:px-4 lg:px-8 pl-4 sm:pl-6 lg:pl-12 py-4 sm:py-6 border-t border-[#210C00]/50">
              <div className="max-w-7xl mx-auto sm:ml-4 lg:ml-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <p className="text-[10px] sm:text-xs text-[#210C00]/75">{content.footer.copyright}</p>
                <nav className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-[#210C00]/60">
                  {content.footer.links.map((link, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="w-1 h-1 rounded-full bg-[#210C00]/30" />}
                      <Link href={link.href} className="hover:text-[#210C00] transition-colors">{link.label}</Link>
                    </React.Fragment>
                  ))}
                </nav>
                <div className="flex items-center gap-2 sm:gap-3">
                  <a href="#" aria-label="Twitter" className="text-[#210C00]/60 hover:text-[#210C00]">
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="sm:w-4 sm:h-4">
                      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                  <a href="#" aria-label="Instagram" className="text-[#210C00]/60 hover:text-[#210C00]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="sm:w-4 sm:h-4">
                      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" />
                    </svg>
                  </a>
                  <a href="#" aria-label="Facebook" className="text-[#210C00]/60 hover:text-[#210C00]">
                    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" className="sm:w-3 sm:h-4">
                      <path d="M8.6 0H6.9C5.3 0 4.5.9 4.5 2.2V3.8H3v2.6h1.5V14h2.6V6.4H9.8L10 3.8H7.9V2.6c0-.6.2-.9.7-.9h.9V0z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="text-[#210C00]/60 hover:text-[#210C00]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:w-4 sm:h-4">
                      <rect x="2" y="6" width="4" height="12" rx="1" />
                      <path d="M9 10.5v7h4v-3.7c0-1.98 3-2.14 3 0V17.5h4v-4.58c0-4.36-4.66-4.2-6.18-2.05V10.5H9z" />
                      <circle cx="4" cy="4" r="1.3" />
                    </svg>
                  </a>
                </div>
              </div>
            </footer>
          </>
        )}
      </div>

      {/* Winners Modal */}
      {winnersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setWinnersModal(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#F9F5EF] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with cover */}
            <div className="relative h-36 sm:h-44 bg-gradient-to-br from-[#60351B] to-[#210C00] flex items-end p-4">
              {(winnersModal.coverImage || winnersModal.book?.coverImage) && (
                <img
                  src={getImageUrl(winnersModal.coverImage || winnersModal.book?.coverImage)}
                  alt={winnersModal.title}
                  className="absolute left-4 bottom-4 w-20 h-28 object-cover rounded-lg shadow-lg"
                />
              )}
              <div className="ml-28 pb-1">
                <span className="inline-block px-2 py-0.5 rounded-full bg-[#8B5A3C]/80 text-white text-[10px] font-medium mb-1 capitalize">
                  {winnersModal.status?.replace(/_/g, ' ')}
                </span>
                <h2 className="text-white font-semibold text-sm sm:text-base line-clamp-2 leading-tight">
                  {winnersModal.title}
                </h2>
              </div>
              <button
                onClick={() => setWinnersModal(null)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {winnersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#60351B] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-[#210C00] mb-3 flex items-center gap-2">
                    <span>🏆</span>
                    <span>
                      {winnersModal.winners?.length > 0
                        ? `Winner${winnersModal.winners.length > 1 ? 's' : ''} (${winnersModal.winners.length})`
                        : 'No winners announced yet'}
                    </span>
                  </h3>

                  {winnersModal.winners?.length > 0 ? (
                    <ul className="space-y-2">
                      {winnersModal.winners.map((w: any, i: number) => {
                        const userName = w.user?.name || w.user?.username || `Winner ${i + 1}`;
                        const avatar = w.user?.profilePicture;
                        return (
                          <li key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#60351B]/8 border border-[#210C00]/10">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#D0744C] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {avatar ? (
                                <img src={getImageUrl(avatar)} alt={userName} className="w-full h-full object-cover" />
                              ) : (
                                userName[0]?.toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#210C00] truncate">{userName}</p>
                              {w.selectedAt && (
                                <p className="text-[10px] text-[#210C00]/50">
                                  Selected {new Date(w.selectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <span className="ml-auto text-[#D0744C]">🎉</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#210C00]/50 text-center py-4">
                      Winners will be announced soon. Check back later!
                    </p>
                  )}

                  <button
                    onClick={() => setWinnersModal(null)}
                    className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-b from-[#60351B] to-[#4A2816] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
