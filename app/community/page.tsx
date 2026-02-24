'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, getImageUrl, reviewsApi } from '../../lib/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import TopBarWrapper from '../components/TopBarWrapper';
import TopBar from '../components/TopBar';
import MobileDrawer from '../components/MobileDrawer';
import { useMobileMenu } from '../contexts/MobileMenuContext';

// Placeholder images
import bellIcon from '../../images/bell.png';
import yellowFeatured from '../../images/yellowfeatured.png';
import filterIcon from '../../icons/filter.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    title: string;
    subtitle: string;
  };
  featured: {
    title: string;
    countLabel: string;
    followButton: string;
    likesLabel: string;
    commentsLabel: string;
    viewDiscussionLink: string;
  };
  filters: {
    allGenres: string;
    recent: string;
    popular: string;
  };
  allReviews: {
    title: string;
    readMoreLink: string;
    loadMoreButton: string;
    byLabel: string;
  };
  reviewCard: {
    followButton: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    title: 'Community Reviews',
    subtitle: 'Discover thoughtful book reviews from readers. Engage with reviews through likes and comments, or follow readers whose perspectives resonate with you.',
  },
  featured: {
    title: 'Featured Review',
    countLabel: 'featured review',
    followButton: 'Follow',
    likesLabel: 'likes',
    commentsLabel: 'comments',
    viewDiscussionLink: 'View book discussion',
  },
  filters: {
    allGenres: 'All Genres',
    recent: 'Recent',
    popular: 'Popular',
  },
  allReviews: {
    title: 'All Reviews',
    readMoreLink: 'Read more',
    loadMoreButton: 'Load More Reviews',
    byLabel: 'by',
  },
  reviewCard: {
    followButton: 'Follow',
  },
};

// Review data interface
interface ReviewItem {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  category: string;
  rating: number;
  reviewText: string;
  reviewer: {
    id: string;
    name: string;
    avatar: string;
    date: string;
  };
  likes: number;
  comments: number;
}

// Placeholder featured review
const placeholderFeaturedReview: ReviewItem = {
  id: 'featured-1',
  bookTitle: 'The Remains of the Day',
  bookAuthor: 'Kazuo Ishiguro',
  bookCover: '',
  category: 'Literary Fiction',
  rating: 5,
  reviewText: "Ishiguro's masterful exploration of memory, dignity, and regret. The unreliable narrator slowly reveals layers of self-deception, making this a profound meditation on what we choose to remember and what we choose to forget. Stevens' journey forces us to confront our own rationalizations and the cost of emotional repression. A quiet masterpiece that lingers long after the final page.",
  reviewer: {
    id: '1',
    name: 'Sarah Chen',
    avatar: '',
    date: 'Jan 16, 2024',
  },
  likes: 23,
  comments: 7,
};

// Placeholder reviews
const placeholderReviews: ReviewItem[] = [
  {
    id: '1',
    bookTitle: 'Pachinko',
    bookAuthor: 'Min Jin Lee',
    bookCover: '',
    category: 'Literary Fiction',
    rating: 5,
    reviewText: "A sweeping multigenerational saga that traces the Korean diaspora in Japan with remarkable intimacy...",
    reviewer: { id: '2', name: 'Elena Rodriguez', avatar: '', date: 'Jan 12, 2024' },
    likes: 56,
    comments: 18,
  },
  {
    id: '2',
    bookTitle: 'Pachinko',
    bookAuthor: 'Min Jin Lee',
    bookCover: '',
    category: 'Literary Fiction',
    rating: 5,
    reviewText: "A sweeping multigenerational saga that traces the Korean diaspora in Japan with remarkable intimacy...",
    reviewer: { id: '3', name: 'Elena Rodriguez', avatar: '', date: 'Jan 12, 2024' },
    likes: 56,
    comments: 18,
  },
  {
    id: '3',
    bookTitle: 'Pachinko',
    bookAuthor: 'Min Jin Lee',
    bookCover: '',
    category: 'Literary Fiction',
    rating: 5,
    reviewText: "A sweeping multigenerational saga that traces the Korean diaspora in Japan with remarkable intimacy...",
    reviewer: { id: '4', name: 'Elena Rodriguez', avatar: '', date: 'Jan 12, 2024' },
    likes: 56,
    comments: 18,
  },
  {
    id: '4',
    bookTitle: 'Pachinko',
    bookAuthor: 'Min Jin Lee',
    bookCover: '',
    category: 'Literary Fiction',
    rating: 5,
    reviewText: "A sweeping multigenerational saga that traces the Korean diaspora in Japan with remarkable intimacy...",
    reviewer: { id: '5', name: 'Elena Rodriguez', avatar: '', date: 'Jan 12, 2024' },
    likes: 56,
    comments: 18,
  },
  {
    id: '5',
    bookTitle: 'Pachinko',
    bookAuthor: 'Min Jin Lee',
    bookCover: '',
    category: 'Literary Fiction',
    rating: 5,
    reviewText: "A sweeping multigenerational saga that traces the Korean diaspora in Japan with remarkable intimacy...",
    reviewer: { id: '6', name: 'Elena Rodriguez', avatar: '', date: 'Jan 12, 2024' },
    likes: 56,
    comments: 18,
  },
  {
    id: '6',
    bookTitle: 'Pachinko',
    bookAuthor: 'Min Jin Lee',
    bookCover: '',
    category: 'Literary Fiction',
    rating: 5,
    reviewText: "A sweeping multigenerational saga that traces the Korean diaspora in Japan with remarkable intimacy...",
    reviewer: { id: '7', name: 'Elena Rodriguez', avatar: '', date: 'Jan 12, 2024' },
    likes: 56,
    comments: 18,
  },
];

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/community`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Star Rating Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  // make small stars larger for readability
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses} ${star <= rating ? 'text-[#D0744C]' : 'text-[#210C00]/20'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// Review Card Component
function ReviewCard({ review, content }: { review: ReviewItem; content: PageContent }) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes);

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-[#210C00]/5 hover:shadow-md transition-shadow">
      {/* Book Cover */}
      <div className="relative overflow-hidden mb-3 w-full max-w-[216px] aspect-[2/3] mx-auto">
        <img
          src={review.bookCover || '/images/book-icon.png'}
          alt={review.bookTitle}
          className="w-full h-full object-cover rounded-tl-[12px] rounded-tr-[2px] rounded-br-[2px] rounded-bl-[12px] opacity-100 shadow-[0px_25px_50px_-12px_#00000040,7px_0px_4px_0px_#00000073_inset,-8px_11px_9px_0px_#00000040,-24px_27px_22.4px_11px_#60351B2B]"
        />
      </div>

      {/* Book Info */}
      <h3 className="text-xs sm:text-sm font-semibold text-[#210C00] mb-0.5 line-clamp-1">{review.bookTitle}</h3>
      <p className="text-[14px] sm:text-[16px] leading-[20px] sm:leading-[24px] font-normal font-sf text-[#210C0099] mb-2">
        {content.allReviews.byLabel} {review.bookAuthor}
      </p>

      {/* Category Badge with star indicator */}
      <div className="mb-3 flex items-center gap-2">
        {/* star group: each star has its own background and border */}
        <div className="inline-flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3 h-3 text-[#FE9A00]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.402 8.176L12 18.897l-7.336 3.858 1.402-8.176L.132 9.21l8.200-1.192z" />
            </svg>
          ))}
        </div>
        <span className="inline-block px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-medium bg-[#60351B]/10 text-[#60351B] border border-[#60351B]/20">
          {review.category}
        </span>
      </div>

      {/* Reviewer Info */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D0C4B0] flex items-center justify-center flex-shrink-0">
            {review.reviewer.avatar ? (
              <img src={review.reviewer.avatar} alt={review.reviewer.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-[8px] font-medium text-[#60351B]">
                {review.reviewer.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="relative font-sf font-[590] text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] text-[#210C00] truncate">
              {review.reviewer.name}
            </p>
            <p className="relative -top-0.5 text-[9px] sm:text-[12px] text-[#210C00]/40">{review.reviewer.date}</p>
          </div>
        </div>
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-2 sm:px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-medium transition-colors flex-shrink-0 ${
            isFollowing
              ? 'bg-[#60351B] text-white'
              : 'bg-[#60351B] text-white hover:bg-[#4A2518]'
          }`}
        >
          {isFollowing ? (
            'Following'
          ) : (
            <>
              <span className="mr-1">+</span>
              {content.reviewCard.followButton}
            </>
          )}
        </button>
      </div>

      {/* Review Text */}
      <p className="font-sf font-normal text-[13px] sm:text-[15px] leading-[20px] sm:leading-[24.38px] text-[#210C00CC] mb-2 line-clamp-3">
        {review.reviewText}
      </p>

      {/* Read More Link */}
      <Link
        href={`/community/reviews/${review.id}`}
        className="text-[10px] sm:text-xs text-[#D0744C] hover:underline"
      >
        {content.allReviews.readMoreLink}
      </Link>

      {/* Likes & Comments */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#210C00]/5">
        <button onClick={async () => {
            try {
              await reviewsApi.toggleLike(review.id);
              setLiked(!liked);
              setLikeCount(prev => liked ? prev - 1 : prev + 1);
            } catch (e) {
              console.error('like error', e);
            }
          }}
          className="flex items-center gap-1 text-[#210C00]/50 hover:text-[#D0744C] transition-colors">
          <svg className={`w-3.5 h-3.5 ${liked ? 'text-[#D0744C]' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <span className="text-[10px]">{likeCount}</span>
        </button>
        <button onClick={() => router.push(`/community/reviews/${review.id}`)} className="flex items-center gap-1 text-[#210C00]/50 hover:text-[#60351B] transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span className="text-[10px]">{review.comments}</span>
        </button>
      </div>
    </div>
  );
}

export default function CommunityPage(): JSX.Element {
  const router = useRouter();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();

  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [reviews, setReviews] = useState<ReviewItem[]>(placeholderReviews);
  const [featuredReview, setFeaturedReview] = useState<ReviewItem>(placeholderFeaturedReview);
  const [likedFeatured, setLikedFeatured] = useState(false);
  const [featuredLikeCount, setFeaturedLikeCount] = useState(featuredReview.likes);
  const [activeTab, setActiveTab] = useState<'recent' | 'popular'>('recent');
  const [isFollowingFeatured, setIsFollowingFeatured] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All Genres');

  // Genre options
  const genres = [
    'All Genres',
    'Literary Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Non-Fiction',
    'Poetry',
    'Magical Realism',
    'Historical Fiction',
    'Biography',
  ];

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

        // Fetch reviews data
        // const reviewsData = await reviewsApi.getAll();
        // setReviews(reviewsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      {/* Mobile Top Bar wrapper */}
      <TopBarWrapper>
        <SearchBar
          asHeader
          className="w-full"
          placeholder="Search books..."
          onFilterOpenChange={() => {}}
          onApplyFilters={() => {}}
          onPickRandom={() => {}}
        />
      </TopBarWrapper>

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
            <div className="pl-8 sm:pl-10 lg:pl-14 pr-3 sm:pr-4 lg:pr-8 py-4 sm:py-6 lg:py-8 mt-14 sm:mt-0">
              <div className="max-w-screen-xl mx-auto lg:mx-4">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                  <h1 className="font-sf font-[590] text-[28px] sm:text-[36px] lg:text-[42px] leading-[32px] sm:leading-[38px] lg:leading-[40px] tracking-[-0.5px] sm:tracking-[-0.9px] text-[#210C00] mb-2 not-italic">
                    {content.header.title}
                  </h1>
                  <p className="text-[14px] sm:text-[16px] lg:text-[18px] leading-[22px] sm:leading-[26px] lg:leading-[28px] font-normal font-sf text-[#210C0099] max-w-[687px]">
                    {content.header.subtitle}
                  </p>
                </div>

                {/* Featured Review Section */}
                <div className="mb-8 sm:mb-10">
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                        <Image src={yellowFeatured} alt="Featured" className="object-contain" />
                      </div>
                      <h2 className="font-sf font-[590] text-[22px] sm:text-[26px] lg:text-[30px] leading-[28px] sm:leading-[32px] lg:leading-[36px] text-[#210C00]">
                        {content.featured.title}
                      </h2>
                    </div>
                    <span className="text-[10px] sm:text-xs text-[#210C00]/50">1 {content.featured.countLabel}</span>
                  </div>

                  {/* Featured Review Card */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5 text-2xl">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Book Cover */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0 w-[140px] sm:w-[160px] lg:w-[180px] h-auto aspect-[2/3] relative shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1),7px_0px_4px_0px_rgba(0,0,0,0.45)_inset,-8px_11px_9px_0px_rgba(0,0,0,0.47),0px_5px_5.3px_0px_rgba(255,255,255,0.25),-24px_27px_22.4px_11px_rgba(96,53,27,0.17)]">
                        <div className="rounded-tl-[6px] rounded-tr-[2px] rounded-br-[2px] rounded-bl-[6px] overflow-hidden w-full h-full">
                          <img
                            src={featuredReview.bookCover || '/images/book-icon.png'}
                            alt={featuredReview.bookTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        {/* Reviewer Info */}
                        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-[#D0C4B0] flex items-center justify-center flex-shrink-0">
                              {featuredReview.reviewer.avatar ? (
                                <img src={featuredReview.reviewer.avatar} alt={featuredReview.reviewer.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-xs font-medium text-[#60351B]">
                                  {featuredReview.reviewer.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="relative top-1 text-[14px] sm:text-[18px] lg:text-[20px] font-medium text-[#210C00] truncate">{featuredReview.reviewer.name}</p>
                              <p className="relative -top-0.5 text-[10px] sm:text-[12px] text-[#210C00]/40">{featuredReview.reviewer.date}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsFollowingFeatured(!isFollowingFeatured)}
                            className={`text-[10px] sm:text-xs font-medium transition-colors w-[80px] sm:w-[90px] lg:w-[105.66px] h-[30px] sm:h-[33px] lg:h-[36px] rounded-[20px] bg-gradient-to-b from-[#60351B] to-[#4A2816] shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)] flex-shrink-0 ${
                              isFollowingFeatured
                                ? 'text-[#60351B] bg-white border border-[#60351B]'
                                : 'text-white'
                            }`}
                          >
                            {isFollowingFeatured ? (
                              'Following'
                            ) : (
                              <>
                                <span className="mr-1">+</span>
                                {content.featured.followButton}
                              </>
                            )}
                          </button>
                        </div>

                        {/* Book Title & Rating */}
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[#210C00] mb-1 line-clamp-2">
                          {featuredReview.bookTitle}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                          <p className="text-xs text-[#210C00]/50">{content.allReviews.byLabel} {featuredReview.bookAuthor}</p>
                          <span className="text-[#210C00]/20">•</span>
                          <StarRating rating={featuredReview.rating} size="sm" />
                          <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-medium bg-[#60351B]/10 text-[#60351B] border border-[#60351B]/20">
                            {featuredReview.category}
                          </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-xs sm:text-sm lg:text-base text-[#210C00]/70 leading-relaxed mb-3 sm:mb-4 line-clamp-4 sm:line-clamp-none">
                          {featuredReview.reviewText}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#210C00]/50">
                          <button
                            onClick={async () => {
                              try {
                                await reviewsApi.toggleLike(featuredReview.id);
                                setLikedFeatured(!likedFeatured);
                                setFeaturedLikeCount(prev => likedFeatured ? prev - 1 : prev + 1);
                              } catch (e) {
                                console.error('featured like error', e);
                              }
                            }}
                            className="flex items-center gap-1.5 hover:text-[#D0744C] transition-colors"
                          >
                            <svg className={`w-4 h-4 ${likedFeatured ? 'text-[#D0744C]' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                            {featuredLikeCount} {content.featured.likesLabel}
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-[#60351B] transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                            {featuredReview.comments} {content.featured.commentsLabel}
                          </button>
                          <Link href={`/community/reviews/${featuredReview.id}`} className="flex items-center gap-1 hover:text-[#60351B] transition-colors">
                            {content.featured.viewDiscussionLink}
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  {/* All Reviews Title & Genre Filter */}
                  <div className="flex flex-col items-start gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                        className="inline-flex items-center font-sf font-[590] text-[13px] sm:text-[14px] lg:text-[16px] leading-[20px] sm:leading-[24px] text-[#210C00B2] hover:bg-[#210C00]/5 transition-colors w-[140px] sm:w-[160px] lg:w-[175.28px] h-[40px] sm:h-[45px] lg:h-[49.6px] rounded-[20px] px-3 sm:pl-[20px] bg-[#FFFFFFB2] border border-[#60351B33] border-t-[0.8px] shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)] gap-2 sm:gap-[12px]">
                        <Image src={filterIcon} alt="Filter" width={20} height={20} className="flex-shrink-0" />
                        {selectedGenre}
                        <svg className={`w-4 h-4 ml-1 transition-transform ${genreDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="#210C00B2" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>

                    {/* render dropdown in flow */}
                    {genreDropdownOpen && (
                      <div
                        className="mt-2 z-50 bg-white rounded-2xl py-2 inline-block min-w-[180px] sm:min-w-[220px] max-w-[280px] shadow-[0px_10px_40px_rgba(0,0,0,0.15)] max-h-[300px] overflow-y-auto"
                      >
                        {genres.map((genre) => (
                          <button
                            key={genre}
                            onClick={() => {
                              setSelectedGenre(genre);
                              setGenreDropdownOpen(false);
                            }}
                            className={`block w-full text-left px-3 sm:px-4 py-2 sm:py-3 font-sf text-[14px] sm:text-[16px] leading-[20px] sm:leading-[24px] transition-colors ${
                              selectedGenre === genre
                                ? 'bg-[#60351B] text-white font-[590] rounded-lg mx-2 w-[calc(100%-16px)]'
                                : 'text-[#210C00] hover:bg-[#210C00]/5'
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    )}

                    <h2 className="font-sf mt-2 font-[590] text-[22px] sm:text-[26px] lg:text-[30px] leading-[24px] sm:leading-[26px] lg:leading-[28px] text-[#210C00] not-italic">
                      {content.allReviews.title}
                    </h2>
                  </div>

                  {/* Recent / Popular Tabs */}
                  <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-[#210C00]/10 self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTab('recent')}
                      className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors ${
                        activeTab === 'recent'
                          ? 'bg-[#60351B] text-white'
                          : 'text-[#210C00]/60 hover:bg-[#210C00]/5'
                      }`}
                    >
                      {content.filters.recent}
                    </button>
                    <button
                      onClick={() => setActiveTab('popular')}
                      className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors ${
                        activeTab === 'popular'
                          ? 'bg-[#60351B] text-white'
                          : 'text-[#210C00]/60 hover:bg-[#210C00]/5'
                      }`}
                    >
                      {content.filters.popular}
                    </button>
                  </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} content={content} />
                  ))}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center mt-6 sm:mt-8">
                  <button className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white border border-[#210C00]/20 text-xs sm:text-sm text-[#210C00]/70 hover:bg-[#210C00]/5 transition-colors">
                    {content.allReviews.loadMoreButton}
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
