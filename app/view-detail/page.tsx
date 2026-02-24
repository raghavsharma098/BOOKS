'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { booksApi, reviewsApi, userApi, authorsApi, readingApi, getImageUrl } from '../../lib/api';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import MobileDrawer from '../components/MobileDrawer';
import MobileTopBar from '../components/MobileTopBar';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';

// Placeholder images
import bellIcon from '../../images/bell.png';
import user2 from '../../images/human.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    searchPlaceholder: string;
  };
  bookInfo: {
    ratingsLabel: string;
    reviewsLabel: string;
    pagesLabel: string;
    firstPubLabel: string;
    wantToReadButton: string;
    buyButton: string;
  };
  author: {
    title: string;
    booksLabel: string;
    followersLabel: string;
    followButton: string;
    showMoreLink: string;
    showLessLink: string;
  };
  genres: {
    title: string;
  };
  description: {
    title: string;
  };
  images: {
    title: string;
  };
  bookDetails: {
    editorsTitle: string;
    languagesTitle: string;
    formatTitle: string;
    reviewedByTitle: string;
  };
  ratings: {
    title: string;
    subtitle: string;
    writeReviewButton: string;
    addReviewPlaceholder: string;
  };
  community: {
    title: string;
    readerFriendsTitle: string;
    otherReviewersTitle: string;
    reviewsLabel: string;
    followButton: string;
  };
  survey: {
    paceTitle: string;
    plotTitle: string;
    charactersTitle: string;
    diverseTitle: string;
    flawsTitle: string;
    yesLabel: string;
    complicatedLabel: string;
    noLabel: string;
    naLabel: string;
  };
  moreEditions: {
    title: string;
    viewAllLink: string;
  };
  shelf: {
    title: string;
    toRead: string;
    currentlyReading: string;
    read: string;
    continueButton: string;
  };
  reviewModal: {
    myRatingsTitle: string;
    clearButton: string;
    bookShelvesTitle: string;
    selectReasonTitle: string;
    paceTitle: string;
    reviewPlaceholder: string;
    resetButton: string;
    submitButton: string;
  };
  footer: {
    copyright: string;
    links: string[];
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    searchPlaceholder: 'Search book by name, author...',
  },
  bookInfo: {
    ratingsLabel: 'ratings',
    reviewsLabel: 'reviews',
    pagesLabel: 'pages',
    firstPubLabel: 'first pub',
    wantToReadButton: 'Want to read',
    buyButton: 'Buy',
  },
  author: {
    title: 'About the Author',
    booksLabel: 'books',
    followersLabel: 'followers',
    followButton: 'Follow',
    showMoreLink: 'Show more',
    showLessLink: 'Show less',
  },
  genres: {
    title: 'Genre & Tags',
  },
  description: {
    title: 'Description',
  },
  images: {
    title: 'Images',
  },
  bookDetails: {
    editorsTitle: 'Editors',
    languagesTitle: 'Languages',
    formatTitle: 'Paperback',
    reviewedByTitle: 'Reviewed By',
  },
  ratings: {
    title: 'Ratings & Reviews',
    subtitle: 'Rating & review given by the community of different writers and readers of books.',
    writeReviewButton: 'Write a review',
    addReviewPlaceholder: 'Add review',
  },
  community: {
    title: 'Community Ratings',
    readerFriendsTitle: 'Reader Friends',
    otherReviewersTitle: 'Other Reviewers',
    reviewsLabel: 'Reviews',
    followButton: 'Follow',
  },
  survey: {
    paceTitle: 'Pace',
    plotTitle: 'Plot or character driven?',
    charactersTitle: 'Loveable characters?',
    diverseTitle: 'Diverse cast of characters?',
    flawsTitle: 'Flaws of characters a main focus?',
    yesLabel: 'Yes',
    complicatedLabel: 'Complicated',
    noLabel: 'No',
    naLabel: 'N/A',
  },
  moreEditions: {
    title: 'More Editions',
    viewAllLink: 'View all Books',
  },
  shelf: {
    title: 'Choose shelf for this book',
    toRead: 'To read',
    currentlyReading: 'Currently reading',
    read: 'Read',
    continueButton: 'Continue',
  },
  reviewModal: {
    myRatingsTitle: 'My Ratings',
    clearButton: 'Clear',
    bookShelvesTitle: 'Book Shelves',
    selectReasonTitle: 'Select a reason',
    paceTitle: 'Pace',
    reviewPlaceholder: 'Enter your review',
    resetButton: 'Reset',
    submitButton: 'Submit',
  },
  footer: {
    copyright: '© 2026 Copyright All Rights Reserved.',
    links: ['Home', 'About us', 'Careers', 'Blog'],
  },
};

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/view-detail`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Star Rating Component
function StarRating({ rating, size = 'sm', interactive = false, onChange }: { 
  rating: number; 
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={star <= rating ? 'rgba(255, 77, 0, 0.59)' : 'none'}
            stroke={star <= rating ? 'rgba(255, 77, 0, 0.59)' : 'rgba(96, 53, 27, 0.3)'}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// Rating Bar Component
function RatingBar({ label, percentage }: { label: string; percentage: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="w-3 text-xs sm:text-sm font-medium text-[#210C00]">{label}</span>
      <div className="flex-1 h-2 sm:h-2.5 bg-[#210C00]/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#60351B] rounded-full transition-all" style={{ width: percentage }} />
      </div>
    </div>
  );
}

// Survey Block Component
type SurveyStats = { yes: number; complicated: number; no: number; na: number } | null;
function SurveyBlock({ title, color, content, stats }: { title: string; color: string; content: PageContent; stats: SurveyStats }) {
  const colorMap: Record<string, string> = {
    orange: 'bg-[#FF4D00]',
    purple: 'bg-[#8C56FF]',
    blue: 'bg-[#0096FF]',
    green: 'bg-[#22C55E]',
    red: 'bg-[#FF4D64]',
  };

  if (!stats) {
    return (
      <div className="mb-4">
        <p className="text-xs sm:text-sm font-medium text-[#210C00]/90 mb-1">{title}</p>
        <p className="text-[10px] sm:text-xs text-[#210C00]/35 italic">No community data yet.</p>
      </div>
    );
  }

  const total = (stats.yes + stats.complicated + stats.no + stats.na) || 1;
  const yesPct  = Math.round(stats.yes        / total * 100);
  const compPct = Math.round(stats.complicated / total * 100);
  const noPct   = Math.round(stats.no          / total * 100);
  const naPct   = 100 - yesPct - compPct - noPct;

  const yesN  = Math.round(20 * yesPct  / 100);
  const compN = Math.round(20 * compPct / 100);
  const noN   = Math.round(20 * noPct   / 100);
  const naN   = 20 - yesN - compN - noN;
  const circles = [
    ...Array(yesN).fill(1),
    ...Array(compN).fill(0.75),
    ...Array(noN).fill(0.5),
    ...Array(Math.max(0, naN)).fill(0.25),
  ];

  return (
    <div className="mb-4">
      <p className="text-xs sm:text-sm font-medium text-[#210C00]/90 mb-2">{title}</p>
      <div className="flex gap-0.5 mb-2">
        {circles.map((opacity, i) => (
          <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colorMap[color]}`} style={{ opacity }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] sm:text-xs text-[#210C00]/60">
        <span className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded-full ${colorMap[color]}`} />
          {content.survey.yesLabel} ({yesPct}%)
        </span>
        <span className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded-full ${colorMap[color]} opacity-75`} />
          {content.survey.complicatedLabel} ({compPct}%)
        </span>
        <span className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded-full ${colorMap[color]} opacity-50`} />
          {content.survey.noLabel} ({noPct}%)
        </span>
        <span className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded-full ${colorMap[color]} opacity-25`} />
          {content.survey.naLabel} ({naPct}%)
        </span>
      </div>
    </div>
  );
}

// Review Card Component
function ReviewCard({ 
  review, 
  content,
  showFollowButton = true 
}: { 
  review: any; 
  content: PageContent;
  showFollowButton?: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [followError, setFollowError] = useState(false);

  const text = review?.reviewText || review?.content || '';
  if (!text) return null;   // skip silently if no content

  const userId = review?.user?._id || review?.user?.id;
  const displayName = review?.user?.name || review?.user?.username || 'Reader';

  async function handleFollow() {
    if (!userId) return;
    setFollowing(true);
    setFollowError(false);
    try {
      await userApi.followUser(userId);
      setFollowed(true);
    } catch {
      setFollowError(true);
      setTimeout(() => setFollowError(false), 2000);
    } finally {
      setFollowing(false);
    }
  }

  function goToProfile() {
    if (userId) router.push(`/profile/${userId}`);
  }

  return (
    <div className="flex gap-3 sm:gap-4 py-4 border-b border-[#60351B]/10 last:border-b-0">
      {/* Clickable avatar */}
      <button
        onClick={goToProfile}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#D0C4B0] flex items-center justify-center flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-[#60351B]/30 transition-all"
        aria-label={`View ${displayName}'s profile`}
      >
        {review?.user?.profilePicture ? (
          <img src={getImageUrl(review.user.profilePicture)} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <Image src={user2} alt={displayName} width={48} height={48} className="w-full h-full object-cover" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div>
            {/* Clickable name */}
            <button
              onClick={goToProfile}
              className="text-sm font-medium text-[#210C00] hover:underline text-left"
            >
              {displayName}
            </button>
            {(review?.user?.stats?.totalReviews ?? review?.user?.reviewCount ?? 0) > 0 && (
              <p className="text-[10px] sm:text-xs text-[#210C00]/60">{review?.user?.stats?.totalReviews ?? review?.user?.reviewCount} {content.community.reviewsLabel}</p>
            )}
          </div>
          {showFollowButton && !followed && (
            <button
              onClick={handleFollow}
              disabled={following}
              className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-[#60351B]/20 text-[#210C00] hover:bg-[#60351B]/30 disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              {following ? '…' : followError ? 'Error' : content.community.followButton}
            </button>
          )}
          {showFollowButton && followed && (
            <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-[#60351B] text-white whitespace-nowrap">
              ✓ Following
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-[#210C00]/70 leading-relaxed line-clamp-4 mb-2">{text}</p>
        <div className="flex items-center gap-2">
          <StarRating rating={review?.rating || 0} size="sm" />
          <span className="text-[10px] text-[#60351B]/80">
            {review?.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

// Similar Book Card Component
function SimilarBookCard({ book }: { book: any }) {
  return (
    <Link 
      href={`/view-detail?id=${book._id}`}
      className="flex flex-col items-center group"
    >
      <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-32 lg:h-48 rounded-md overflow-hidden shadow-md group-hover:shadow-lg transition-shadow mb-2">
        {book.coverImage ? (
          <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#8B7355] via-[#6B5344] to-[#4A3728] flex items-center justify-center">
            <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" />
            </svg>
          </div>
        )}
      </div>
      <p className="text-xs sm:text-sm font-medium text-[#210C00] text-center line-clamp-1">{book.title || 'Book name'}</p>
      <p className="text-[10px] sm:text-xs text-[#CC3E00] text-center">{book.author?.name || 'Author'}</p>
    </Link>
  );
}

// Main Content Component
import Custom404 from '../404/page';

function ViewDetailContent(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get('id');

  // State
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [bookData, setBookData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);
  const [authorExpanded, setAuthorExpanded] = useState(false);
  const [bookShelf, setBookShelf] = useState<string | null>(null);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Mobile menu
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();

  // Modals
  const [reviewOpen, setReviewOpen] = useState(false);
  const [shelfPickerOpen, setShelfPickerOpen] = useState(false);
  const [shelfPickerSelection, setShelfPickerSelection] = useState<string>('to read');

  // Review form state
  const [reviewStarRating, setReviewStarRating] = useState<number>(0);
  const [reviewBookShelf, setReviewBookShelf] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState<string | null>(null);
  const [reviewPace, setReviewPace] = useState<string>('');
  const [reviewContent, setReviewContent] = useState<string>('');
  const [reviewPlotDriven, setReviewPlotDriven] = useState<string>('');
  const [reviewLoveableChars, setReviewLoveableChars] = useState<string>('');
  const [reviewDiverseCast, setReviewDiverseCast] = useState<string>('');
  const [reviewFlawsFocus, setReviewFlawsFocus] = useState<string>('');

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setBookLoading(true);
        const [pageContent, bookRes, userRes]: any[] = await Promise.all([
          fetchPageContent(),
          bookId ? booksApi.getById(bookId).catch(() => null) : Promise.resolve(null),
          userApi.getProfile().catch(() => null),
        ]);
        setContent(pageContent);
        const book = bookRes?.data || null;
        const user = userRes?.data || null;
        setBookData(book);
        setUserData(user);

        // Restore persisted shelf state
        const savedShelf = localStorage.getItem(`shelf_${bookId}`);
        if (savedShelf) setBookShelf(savedShelf);

        // Restore persisted follow state (check localStorage first, then fall back to author followers array)
        const authorId = book?.author?._id;
        if (authorId) {
          const savedFollow = localStorage.getItem(`follow_author_${authorId}`);
          if (savedFollow !== null) {
            setIsFollowingAuthor(savedFollow === 'true');
          } else if (user?._id && Array.isArray(book?.author?.followers)) {
            setIsFollowingAuthor(book.author.followers.some((f: any) => String(f) === String(user._id)));
          }
        }

        if (bookId) {
          const [reviewsRes, editionsRes]: any[] = await Promise.all([
            reviewsApi.getByBook(bookId).catch(() => ({ data: [] })),
            booksApi.getEditions(bookId, 6).catch(() => ({ data: [] })),
          ]);
          setReviews(reviewsRes?.data || []);
          setSimilarBooks(editionsRes?.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch book data:', err);
      } finally {
        setBookLoading(false);
      }
    }
    fetchData();
  }, [bookId]);

  // render custom 404 inline when there's no book
  if (!bookLoading && (!bookId || !bookData)) {
    return <Custom404 />;
  }

  // redirect to 404 if fetch completed but no book data found (fallback)
  useEffect(() => {
    if (!bookLoading) {
      if (bookId && !bookData) {
        router.replace('/404');
      }
      if (!bookId) {
        router.replace('/404');
      }
    }
  }, [bookLoading, bookData, bookId, router]);

  // Lock body scroll when modals open
  useEffect(() => {
    if (reviewOpen || shelfPickerOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [reviewOpen, shelfPickerOpen]);

  // Review form helpers
  function resetReviewForm() {
    setReviewStarRating(0);
    setReviewBookShelf(null);
    setReviewReason(null);
    setReviewPace('');
    setReviewContent('');
    setReviewPlotDriven('');
    setReviewLoveableChars('');
    setReviewDiverseCast('');
    setReviewFlawsFocus('');
  }

  async function confirmShelfSelection() {
    setBookShelf(shelfPickerSelection);
    setReviewBookShelf(shelfPickerSelection);
    setShelfPickerOpen(false);
    if (bookId) {
      // Persist to localStorage so it survives page reload
      localStorage.setItem(`shelf_${bookId}`, shelfPickerSelection);
      const statusMap: Record<string, string> = {
        'to read': 'want_to_read',
        'currently reading': 'currently_reading',
        'read': 'finished',
      };
      const status = statusMap[shelfPickerSelection] || 'want_to_read';
      readingApi.addToReading(bookId, status).catch(() => {/* silent */});
    }
  }

  async function handleFollowAuthor() {
    if (!userData) { router.push('/login'); return; }
    if (!bookData?.author?._id) return;
    setFollowingAuthor(true);
    try {
      const res: any = await authorsApi.follow(bookData.author._id);
      setIsFollowingAuthor(res.isFollowing);
      // Persist to localStorage so it survives page reload
      localStorage.setItem(`follow_author_${bookData.author._id}`, String(res.isFollowing));
      setBookData((prev: any) => ({
        ...prev,
        author: { ...prev.author, followersCount: res.followersCount },
      }));
    } catch (err) {
      console.error('Follow failed:', err);
    } finally {
      setFollowingAuthor(false);
    }
  }

  async function handleSubmitReview() {
    if (!userData) { router.push('/login'); return; }
    if (!bookId || !reviewContent.trim()) return;
    setReviewSubmitting(true);
    try {
      await reviewsApi.create({
        bookId,
        rating: reviewStarRating || 1,
        reviewText: reviewContent.trim(),
        ...(reviewPace && { pace: reviewPace.toLowerCase() }),
        ...(reviewPlotDriven && { plotDriven: reviewPlotDriven }),
        ...(reviewLoveableChars && { loveableCharacters: reviewLoveableChars }),
        ...(reviewDiverseCast && { diverseCast: reviewDiverseCast }),
        ...(reviewFlawsFocus && { flawsFocus: reviewFlawsFocus }),
      });
      // Re-fetch reviews so we get fully populated user + correct fields
      const refreshed: any = await reviewsApi.getByBook(bookId).catch(() => ({ data: [] }));
      setReviews(refreshed?.data || []);
      resetReviewForm();
      setReviewOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  }

  // Rating distribution from real book data
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = bookData?.ratingDistribution?.[star] || 0;
    const total = bookData?.totalRatings || 1;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { label: String(star), pct: `${pct}%` };
  });

  // Survey stats computed from loaded reviews
  function tallyChoices(values: string[], yesVals: string[], compVals: string[], noVals: string[]): SurveyStats {
    if (!values.length) return null;
    let yes = 0, complicated = 0, no = 0, na = 0;
    values.forEach((v) => {
      const l = v.toLowerCase();
      if (yesVals.includes(l)) yes++;
      else if (compVals.includes(l)) complicated++;
      else if (noVals.includes(l)) no++;
      else na++;
    });
    return yes + complicated + no + na > 0 ? { yes, complicated, no, na } : null;
  }
  const surveyStats = {
    pace:              tallyChoices(reviews.map((r: any) => r.pace).filter(Boolean),               ['fast'], ['medium'], ['slow']),
    plotDriven:        tallyChoices(reviews.map((r: any) => r.plotDriven).filter(Boolean),         ['yes'],  ['complicated'], ['no']),
    loveableChars:     tallyChoices(reviews.map((r: any) => r.loveableCharacters).filter(Boolean), ['yes'],  ['complicated'], ['no']),
    diverseCast:       tallyChoices(reviews.map((r: any) => r.diverseCast).filter(Boolean),        ['yes'],  ['complicated'], ['no']),
    flawsFocus:        tallyChoices(reviews.map((r: any) => r.flawsFocus).filter(Boolean),         ['yes'],  ['complicated'], ['no']),
  };

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      {/* Shelf Picker Modal */}
      {shelfPickerOpen && (
        <div 
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[995] flex items-center justify-center p-4"
          onClick={() => setShelfPickerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-[#E4DDD1] border border-[#60351B]/20 rounded-2xl shadow-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#210C00]">{content.shelf.title}</h3>
              <button 
                onClick={() => setShelfPickerOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#210C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { value: 'to read', label: content.shelf.toRead },
                { value: 'currently reading', label: content.shelf.currentlyReading },
                { value: 'read', label: content.shelf.read },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setShelfPickerSelection(option.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border transition-colors ${
                    shelfPickerSelection === option.value
                      ? 'border-[#60351B] bg-white'
                      : 'border-[#210C00]/10 hover:bg-white/50'
                  }`}
                >
                  {shelfPickerSelection === option.value && (
                    <svg width="14" height="14" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L4 7L9 1" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <span className="text-sm text-[#210C00] capitalize">{option.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={confirmShelfSelection}
              className="w-full py-2.5 rounded-full bg-[#60351B] text-white font-semibold text-sm hover:bg-[#4A2518] transition-colors"
            >
              {content.shelf.continueButton}
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewOpen && (
        <div 
          className="fixed inset-0 bg-black/25 backdrop-blur-md z-[90] flex items-center justify-center p-4"
          onClick={() => setReviewOpen(false)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] bg-[#E4DDD1] border border-[#210C00] rounded-2xl shadow-2xl overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={() => setReviewOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full z-10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#210C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Book info header */}
            <div className="flex gap-4 sm:gap-5 p-5 sm:p-8 pb-4 sm:pb-6 border-b border-[#60351B]/20">
              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded overflow-hidden flex-shrink-0">
                {bookData?.coverImage ? (
                  <img src={getImageUrl(bookData.coverImage)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#8B7355] to-[#4A3728]" />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-lg sm:text-2xl font-serif text-[#210C00] mb-1">{bookData?.title || 'Book Title'}</h2>
                <p className="text-xs sm:text-sm text-[#6B4A33] mb-1">by {bookData?.author?.name || 'Unknown'}</p>
                <p className="text-[10px] sm:text-xs text-[#3A1B08]">
                  {bookData?.pageCount || 0} {content.bookInfo.pagesLabel} • {bookData?.format || 'paperback'} • {content.bookInfo.firstPubLabel} {bookData?.publicationDate ? new Date(bookData.publicationDate).getFullYear() : 'N/A'}
                </p>
              </div>
            </div>

            {/* My Ratings */}
            <div className="px-5 sm:px-8 py-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-[#210C00]/70">{content.reviewModal.myRatingsTitle}</span>
                <StarRating rating={reviewStarRating} size="lg" interactive onChange={setReviewStarRating} />
                <button
                  onClick={() => setReviewStarRating(0)}
                  className="text-xs text-[#8B7355] hover:underline"
                >
                  {content.reviewModal.clearButton}
                </button>
              </div>
            </div>

            {/* Book Shelves */}
            <div className="px-5 sm:px-8 py-3">
              <p className="text-sm font-medium text-[#210C00]/80 mb-3">{content.reviewModal.bookShelvesTitle}</p>
              <div className="flex flex-wrap gap-4">
                {['to read', 'currently reading', 'read', 'Do not finish'].map((shelf) => (
                  <label key={shelf} className="flex items-center gap-2 cursor-pointer">
                    <span
                      onClick={() => setReviewBookShelf(shelf)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        reviewBookShelf === shelf ? 'border-[#60351B] bg-[#60351B]' : 'border-[#A89A8C]'
                      }`}
                    >
                      {reviewBookShelf === shelf && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm text-[#210C00]">{shelf}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="px-5 sm:px-8 py-3">
              <p className="text-sm font-medium text-[#210C00]/80 mb-3">{content.reviewModal.selectReasonTitle}</p>
              <div className="flex flex-wrap gap-4">
                {['slow', 'emotionally heavy', 'not engaging'].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <span
                      onClick={() => setReviewReason(reason)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        reviewReason === reason ? 'border-[#60351B] bg-[#60351B]' : 'border-[#A89A8C]'
                      }`}
                    >
                      {reviewReason === reason && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm text-[#210C00]">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pace */}
            <div className="px-5 sm:px-8 py-3">
              <p className="text-sm font-medium text-[#210C00]/80 mb-3">{content.reviewModal.paceTitle}</p>
              <div className="flex flex-wrap gap-4">
                {['Slow', 'Medium', 'Fast'].map((pace) => (
                  <label key={pace} className="flex items-center gap-2 cursor-pointer">
                    <span
                      onClick={() => setReviewPace(reviewPace === pace ? '' : pace)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        reviewPace === pace ? 'border-[#60351B] bg-[#60351B]' : 'border-[#A89A8C]'
                      }`}
                    >
                      {reviewPace === pace && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm text-[#210C00]">{pace}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Survey questions */}
            {([
              { label: content.survey.plotTitle,        val: reviewPlotDriven,   set: setReviewPlotDriven },
              { label: content.survey.charactersTitle,  val: reviewLoveableChars, set: setReviewLoveableChars },
              { label: content.survey.diverseTitle,     val: reviewDiverseCast,  set: setReviewDiverseCast },
              { label: content.survey.flawsTitle,       val: reviewFlawsFocus,   set: setReviewFlawsFocus },
            ] as { label: string; val: string; set: (v: string) => void }[]).map(({ label, val, set }) => (
              <div key={label} className="px-5 sm:px-8 py-2">
                <p className="text-sm font-medium text-[#210C00]/80 mb-2">{label}</p>
                <div className="flex flex-wrap gap-4">
                  {(['yes', 'complicated', 'no', 'na'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <span
                        onClick={() => set(val === opt ? '' : opt)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          val === opt ? 'border-[#60351B] bg-[#60351B]' : 'border-[#A89A8C]'
                        }`}
                      >
                        {val === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="text-sm text-[#210C00] capitalize">{opt === 'na' ? 'N/A' : opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Review textarea */}
            <div className="px-5 sm:px-8 py-4">
              <p className="text-sm font-medium text-[#210C00]/80 mb-3">{content.reviewModal.myRatingsTitle}</p>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder={content.reviewModal.reviewPlaceholder}
                className="w-full h-28 p-4 rounded-lg border border-[#210C00]/10 bg-[#CC3E00]/10 text-sm text-[#60351B]/80 placeholder:text-[#60351B]/40 resize-none focus:outline-none focus:border-[#60351B]/30"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 px-5 sm:px-8 py-5 border-t border-[#60351B]/20">
              <button
                onClick={resetReviewForm}
                className="px-6 py-2 rounded-full border border-[#210C00]/20 text-sm font-medium text-[#210C00] hover:bg-white/50 transition-colors"
              >
                {content.reviewModal.resetButton}
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                className="px-6 py-2 rounded-full bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2518] transition-colors disabled:opacity-60"
              >
                {reviewSubmitting ? 'Submitting…' : content.reviewModal.submitButton}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Main Content */}
      <div className="w-full lg:ml-24">
        {/* Loading */}
        {bookLoading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#60351B]" />
              <p className="mt-4 text-sm sm:text-base text-[#60351B] font-medium">Loading...</p>
            </div>
          </div>
        )}

        {!bookLoading && (
          <>
            {/* Top Bar with Search - Desktop */}
            <div className="sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3 hidden sm:block">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                  <SearchBar
                    placeholder={content.header.searchPlaceholder}
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
            <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mt-14 sm:mt-0">
              <div className="max-w-6xl mx-auto">
                {/* Book Header Section */}
                <div className="bg-[#60351B]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8">
                    {/* Book Cover */}
                    <div className="w-32 sm:w-40 md:w-48 lg:w-56 mx-auto sm:mx-0 flex-shrink-0">
                      <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                        {bookData?.coverImage ? (
                          <img src={getImageUrl(bookData.coverImage)} alt={bookData.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#8B7355] via-[#6B5344] to-[#4A3728] flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-[#210C00] mb-2 sm:mb-3">
                        {bookData?.title || 'Book Title'}
                      </h1>
                      <p className="text-sm sm:text-base text-[#210C00]/70 font-medium mb-2 sm:mb-3">
                        ~ {bookData?.author?.name || 'Unknown Author'}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <StarRating rating={bookData?.averageRating || 4.5} size="md" />
                        <span className="text-xs sm:text-sm text-[#3A1B08]/80">
                          {bookData?.ratingsCount?.toLocaleString() || '4,113,458'} {content.bookInfo.ratingsLabel} • {reviews.length || '99,449'} {content.bookInfo.reviewsLabel}
                        </span>
                      </div>

                      {/* Book Details */}
                      <p className="text-xs sm:text-sm text-[#3A1B08] mb-4 sm:mb-6">
                        {bookData?.pageCount || 341} {content.bookInfo.pagesLabel} • {bookData?.format || 'hardcover'} • {content.bookInfo.firstPubLabel} {bookData?.publicationDate ? new Date(bookData.publicationDate).getFullYear() : '1998'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                        <button
                          onClick={() => { setShelfPickerSelection('to read'); setShelfPickerOpen(true); }}
                          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#210C00] text-sm font-medium text-[#210C00] hover:bg-white/50 transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          {bookShelf || content.bookInfo.wantToReadButton}
                        </button>
                        {bookData?.buyLink ? (
                          <a
                            href={bookData.buyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2518] transition-colors"
                          >
                            {content.bookInfo.buyButton}
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 9l6 6 6-6"/>
                            </svg>
                          </a>
                        ) : (
                          <button disabled className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#60351B]/40 text-white text-sm font-medium cursor-not-allowed">
                            {content.bookInfo.buyButton}
                          </button>
                        )}
                        <button className="w-9 h-9 rounded-full bg-[#60351B]/15 flex items-center justify-center hover:bg-[#60351B]/25 transition-colors">
                          <svg className="w-4 h-4 text-[#60351B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                          </svg>
                        </button>
                        <button className="w-9 h-9 rounded-full bg-[#60351B]/15 flex items-center justify-center hover:bg-[#60351B]/25 transition-colors">
                          <svg className="w-4 h-4 text-[#60351B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Left Column - Description, Images */}
                  <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Description */}
                    <section>
                      <h2 className="text-sm sm:text-base font-medium text-[#210C00]/90 mb-3">
                        {content.description.title}
                      </h2>
                      <p className="text-sm sm:text-base text-[#210C00]/60 leading-relaxed">
                        {bookData?.description || 'No description available for this book. Check back later for more information about the plot, characters, and themes explored in this title.'}
                      </p>
                    </section>

                    {/* Images */}
                    <section>
                      <h2 className="text-sm sm:text-base font-medium text-[#210C00]/90 mb-3">
                        {content.images.title}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {(bookData?.images?.length > 0 ? bookData.images : Array(4).fill(null)).map((img: string | null, i: number) => (
                          <div key={i} className="aspect-[4/3] rounded-md overflow-hidden border border-[#210C00] bg-gradient-to-br from-[#D0C4B0] to-[#B8A996]">
                            {img ? (
                              <img src={getImageUrl(img)} alt={`Book image ${i + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#60351B]/20" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Ratings & Reviews */}
                    <section>
                      <h2 className="text-base sm:text-lg font-medium text-[#210C00]/90 mb-3">
                        {content.ratings.title}
                      </h2>
                      
                      {/* Add Review Row */}
                      <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#D0C4B0] flex items-center justify-center overflow-hidden">
                          <Image src={user2} alt="" width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#210C00]/80 bg-[#60351B]/5 flex items-center justify-center hover:bg-[#60351B]/10 transition-colors">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                            </svg>
                          </button>
                          <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#210C00]/80 flex items-center justify-center hover:bg-[#60351B]/10 transition-colors">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3"/>
                            </svg>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={content.ratings.addReviewPlaceholder}
                          className="flex-1 min-w-[200px] px-4 py-2.5 sm:py-3 rounded-full border border-[#210C00]/80 bg-transparent text-sm text-[#210C00] placeholder:text-[#210C00]/40 focus:outline-none"
                        />
                        <div className="hidden sm:flex">
                          <StarRating rating={0} size="md" interactive />
                        </div>
                        {userData ? (
                          <button
                            onClick={() => setReviewOpen(true)}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#60351B] text-white text-xs sm:text-sm font-medium hover:bg-[#4A2518] transition-colors whitespace-nowrap"
                          >
                            {content.ratings.writeReviewButton}
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push('/login')}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-[#60351B] text-[#60351B] text-xs sm:text-sm font-medium hover:bg-[#60351B]/10 transition-colors whitespace-nowrap"
                          >
                            Log in to review
                          </button>
                        )}
                      </div>

                      {/* Community Ratings */}
                      <h3 className="text-sm sm:text-base font-medium text-[#210C00]/90 mb-2">
                        {content.community.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#210C00]/60 mb-4">
                        {content.ratings.subtitle}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-6">
                        {/* Big rating number */}
                        <div className="text-center sm:text-left">
                          <span className="text-5xl sm:text-6xl font-semibold text-[#210C00]">{(bookData?.averageRating || 0).toFixed(1)}</span>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                            <StarRating rating={bookData?.averageRating || 0} size="sm" />
                            <span className="text-sm text-[#210C00]/60">{(bookData?.totalRatings || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Rating bars */}
                        <div className="flex-1 space-y-1.5">
                          {ratingDistribution.map((r) => (
                            <RatingBar key={r.label} label={r.label} percentage={r.pct} />
                          ))}
                        </div>
                      </div>

                      {/* Survey Results Card */}
                      <div className="bg-[#60351B]/5 rounded-xl p-4 sm:p-6 shadow-inner border border-[#60351B]/10 mb-6">
                        {reviews.length === 0 && (
                          <p className="text-xs text-[#210C00]/40 italic mb-3">No community survey responses yet. Be the first to review this book!</p>
                        )}
                        <SurveyBlock title={content.survey.paceTitle}       color="orange" content={content} stats={surveyStats.pace} />
                        <SurveyBlock title={content.survey.plotTitle}        color="purple" content={content} stats={surveyStats.plotDriven} />
                        <SurveyBlock title={content.survey.charactersTitle}  color="blue"   content={content} stats={surveyStats.loveableChars} />
                        <SurveyBlock title={content.survey.diverseTitle}     color="green"  content={content} stats={surveyStats.diverseCast} />
                        <SurveyBlock title={content.survey.flawsTitle}       color="red"    content={content} stats={surveyStats.flawsFocus} />
                      </div>

                      {/* Reader Reviews — split by follow status */}
                      {(() => {
                        const withText = reviews.filter((r: any) => r?.reviewText || r?.content);
                        // Build a Set of IDs the current user follows
                        const followingIds = new Set<string>(
                          (userData?.following ?? []).map((f: any) =>
                            typeof f === 'string' ? f : (f?._id ?? f?.id ?? '')
                          ).filter(Boolean)
                        );
                        const friendReviews = withText.filter((r: any) =>
                          r?.user?._id && followingIds.has(String(r.user._id))
                        );
                        const otherReviews = withText.filter((r: any) =>
                          !r?.user?._id || !followingIds.has(String(r.user._id))
                        );
                        return (
                          <>
                            <h3 className="text-sm sm:text-base font-medium text-[#210C00] mb-2">
                              {content.community.readerFriendsTitle}
                            </h3>
                            <div className="mb-6">
                              {friendReviews.length > 0 ? (
                                friendReviews.map((review: any) => (
                                  <ReviewCard key={review._id} review={review} content={content} showFollowButton={false} />
                                ))
                              ) : (
                                <p className="text-xs text-[#210C00]/40 italic py-3">
                                  {userData ? 'None of the people you follow have reviewed this book yet.' : 'Log in to see reviews from people you follow.'}
                                </p>
                              )}
                            </div>

                            <h3 className="text-sm sm:text-base font-medium text-[#210C00] mb-2">
                              {content.community.otherReviewersTitle}
                            </h3>
                            <div>
                              {otherReviews.length > 0 ? (
                                otherReviews.map((review: any) => (
                                  <ReviewCard key={review._id} review={review} content={content} showFollowButton={true} />
                                ))
                              ) : (
                                <p className="text-xs text-[#210C00]/40 italic py-3">
                                  {withText.length === 0 ? (userData ? 'No reviews yet. Be the first!' : 'No reviews yet.') : 'No other reviewers yet.'}
                                </p>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </section>
                  </div>

                  {/* Right Column - Author, Genre, Details */}
                  <div className="space-y-6 sm:space-y-8">
                    {/* About Author */}
                    <section className="bg-white/50 rounded-xl p-4 sm:p-5 border border-[#210C00]/5">
                      <h2 className="text-sm sm:text-base font-medium text-[#3A1B08] mb-3">
                        {content.author.title}
                      </h2>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#D0C4B0] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {bookData?.author?.profilePhoto ? (
                            <img src={getImageUrl(bookData.author.profilePhoto)} alt={bookData.author.name} className="w-full h-full object-cover" />
                          ) : (
                            <Image src={user2} alt="" width={48} height={48} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div>
                              <p className="text-sm font-medium text-[#3A1B08]">{bookData?.author?.name || 'Author'}</p>
                              <p className="text-[10px] text-[#210C00]/70">
                                {bookData?.author?.totalBooks || 0} {content.author.booksLabel} • {(bookData?.author?.followersCount || 0).toLocaleString()} {content.author.followersLabel}
                              </p>
                            </div>
                            <button
                              onClick={handleFollowAuthor}
                              disabled={followingAuthor}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                isFollowingAuthor
                                  ? 'bg-[#60351B] text-white hover:bg-[#4A2518]'
                                  : 'bg-[#60351B]/20 text-[#210C00] hover:bg-[#60351B]/30'
                              }`}
                            >
                              {followingAuthor ? '…' : isFollowingAuthor ? '✓ Following' : content.author.followButton}
                            </button>
                          </div>
                          <p className={`text-xs sm:text-sm text-[#210C00]/60 leading-relaxed mt-2 ${authorExpanded ? '' : 'line-clamp-3'}`}>
                            {bookData?.author?.bio || 'Although she writes under the pen name J.K. Rowling, pronounced like rolling, her name when her first Harry Potter book was published was simply Joanne Rowling. Anticipating that the target audience of young boys might not want...'}
                          </p>
                          <button 
                            onClick={() => setAuthorExpanded(!authorExpanded)}
                            className="text-xs text-[#3A1B08]/80 underline decoration-dotted mt-1"
                          >
                            {authorExpanded ? content.author.showLessLink : content.author.showMoreLink}
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Genre & Tags */}
                    <section>
                      <h2 className="text-sm sm:text-base font-medium text-[#210C00]/90 mb-3">
                        {content.genres.title}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {(bookData?.genres || ['Fiction', 'Fantasy', 'Young Adult', 'Magic']).map((genre: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-full text-xs border border-[#210C00] bg-[#60351B]/20 text-[#210C00]/90"
                          >
                            {genre}
                          </span>
                        ))}
                        {(bookData?.moods || []).map((mood: string, i: number) => (
                          <span
                            key={`mood-${i}`}
                            className="px-3 py-1.5 rounded-full text-xs border border-[#210C00] bg-[#60351B]/20 text-[#210C00]/90"
                          >
                            {mood}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* Book Details */}
                    <section className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-[#210C00]/90 mb-1">{content.bookDetails.editorsTitle}</h3>
                        <p className="text-xs sm:text-sm text-[#210C00]/60">
                          {bookData?.editors?.length > 0 ? bookData.editors.join(', ') : '—'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#210C00]/90 mb-1">{content.bookDetails.languagesTitle}</h3>
                        <p className="text-xs sm:text-sm text-[#210C00]/60">{bookData?.language || '—'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#210C00]/90 mb-1">{content.bookDetails.formatTitle}</h3>
                        <p className="text-xs sm:text-sm text-[#210C00]/60">
                          {bookData?.format || '—'}{bookData?.pageCount ? `, ${bookData.pageCount} pages` : ''}
                          {bookData?.isbn ? <><br />ISBN: {bookData.isbn}</> : null}
                        </p>
                      </div>

                      {/* Reviewed By */}
                      <div>
                        <h3 className="text-sm font-medium text-[#210C00]/90 mb-2">{content.bookDetails.reviewedByTitle}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-[#D0C4B0] overflow-hidden">
                              {bookData?.author?.profilePhoto ? (
                                <img src={getImageUrl(bookData.author.profilePhoto)} alt={bookData.author.name} className="w-full h-full object-cover" />
                              ) : (
                                <Image src={user2} alt="" width={36} height={36} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#3A1B08]">{bookData?.author?.name || '—'}</p>
                              <p className="text-[9px] text-[#210C00]/60">{bookData?.author?.totalBooks || 0} books • {(bookData?.author?.followersCount || 0).toLocaleString()} followers</p>
                            </div>
                          </div>
                          <button
                            onClick={handleFollowAuthor}
                            disabled={followingAuthor}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              isFollowingAuthor
                                ? 'bg-[#60351B] text-white hover:bg-[#4A2518]'
                                : 'bg-[#60351B]/20 text-[#210C00] hover:bg-[#60351B]/30'
                            }`}
                          >
                            {followingAuthor ? '…' : isFollowingAuthor ? '✓ Following' : content.author.followButton}
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* More Editions */}
                <section className="mt-8 sm:mt-12 -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8 py-8 sm:py-10 bg-[#60351B]/20">
                  <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-[#210C00]">
                        {content.moreEditions.title}
                      </h2>
                      <Link href="/search-book" className="text-sm sm:text-base text-[#CC3E00]/80 underline decoration-dotted hover:text-[#CC3E00]">
                        {content.moreEditions.viewAllLink}
                      </Link>
                    </div>
                    {bookLoading ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                        {Array(6).fill(0).map((_, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                            <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-32 lg:h-48 rounded-md bg-[#60351B]/20" />
                            <div className="h-3 w-16 rounded bg-[#60351B]/15" />
                            <div className="h-2.5 w-12 rounded bg-[#60351B]/10" />
                          </div>
                        ))}
                      </div>
                    ) : similarBooks.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                        {similarBooks.map((book, i) => (
                          <SimilarBookCard key={book._id || i} book={book} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <svg className="w-12 h-12 text-[#60351B]/25 mb-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <p className="text-sm font-medium text-[#210C00]/50">No other editions found</p>
                        <p className="text-xs text-[#210C00]/35 mt-1">We couldn&apos;t find other books by this author, publisher, or editors yet.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Footer */}
                <footer className="mt-8 sm:mt-12 py-6 border-t border-[#210C00]/30">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#210C00]/60">
                    <p>{content.footer.copyright}</p>
                    <nav className="flex items-center gap-4">
                      {content.footer.links.map((link, i) => (
                        <React.Fragment key={link}>
                          <a href="#" className="hover:text-[#210C00] transition-colors">{link}</a>
                          {i < content.footer.links.length - 1 && <span className="w-1 h-1 rounded-full bg-[#210C00]/30" />}
                        </React.Fragment>
                      ))}
                    </nav>
                    <div className="flex items-center gap-3">
                      {['twitter', 'instagram', 'facebook', 'linkedin'].map((social) => (
                        <a key={social} href="#" className="w-7 h-7 rounded-full bg-[#210C00]/5 flex items-center justify-center hover:bg-[#210C00]/10 transition-colors">
                          <svg className="w-3.5 h-3.5 text-[#210C00]/50" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        </a>
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

// Wrapper with Suspense
export default function ViewDetailPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F2F0E4]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#60351B]" />
          <p className="mt-4 text-base text-[#60351B] font-medium">Loading...</p>
        </div>
      </div>
    }>
      <ViewDetailContent />
    </Suspense>
  );
}
