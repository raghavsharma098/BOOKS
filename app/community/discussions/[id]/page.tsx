'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { userApi, getImageUrl } from '../../../../lib/api';
import Sidebar from '../../../components/Sidebar';
import SearchBar from '../../../components/SearchBar';
import MobileTopBar from '../../../components/MobileTopBar';
import MobileDrawer from '../../../components/MobileDrawer';
import UserNavbar from '../../../components/UserNavbar';
import { useMobileMenu } from '../../../contexts/MobileMenuContext';

// Placeholder images
import bellIcon from '../../../../images/bell.png';
import pencilIcon from '../../../../images/pencil.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    backLink: string;
    title: string;
  };
  bookDetails: {
    byLabel: string;
    ratingLabel: string;
    pagesLabel: string;
    formatLabel: string;
    firstPubLabel: string;
    wantToReadButton: string;
    viewDetailsButton: string;
  };
  discussion: {
    title: string;
    replyButton: string;
    likesLabel: string;
    writeReplyPlaceholder: string;
    postButton: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    backLink: 'Back to Community',
    title: 'Reader Reviews & Discussion',
  },
  bookDetails: {
    byLabel: 'by',
    ratingLabel: 'rating',
    pagesLabel: 'pages',
    formatLabel: 'Hardcover',
    firstPubLabel: 'First pub',
    wantToReadButton: 'Want to read',
    viewDetailsButton: 'View Details',
  },
  discussion: {
    title: 'Reader Reviews & Discussion',
    replyButton: 'Reply',
    likesLabel: 'likes',
    writeReplyPlaceholder: 'Write a reply...',
    postButton: 'Post',
  },
};

// Book data interface
interface BookData {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  ratingsCount: number;
  genres: string[];
  pages: number;
  format: string;
  firstPublished: string;
}

// Comment data interface
interface CommentData {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  date: string;
  text: string;
  likes: number;
  isLiked: boolean;
  replies: CommentData[];
}

// Placeholder book data
const placeholderBook: BookData = {
  id: '1',
  title: 'The Cambers of Secrets',
  author: 'J. K. Rowlings',
  cover: '',
  rating: 4.5,
  ratingsCount: 567,
  genres: ['Local vintage', '0-6 min ready'],
  pages: 341,
  format: 'Hardcover',
  firstPublished: '1998',
};

// Placeholder discussion comments
const placeholderComments: CommentData[] = [
  {
    id: '1',
    user: { id: '1', name: 'Sarah Chen', avatar: '' },
    date: 'Jan 16, 2024',
    text: "Ishiguro's masterful exploration of memory, dignity, and regret. The unreliable narrator slowly reveals layers of self-deception, making this a profound meditation on what we choose to remember and what we choose to forget. Stevens' journey forces us to confront our own rationalizations and the cost of emotional repression.",
    likes: 79,
    isLiked: false,
    replies: [
      {
        id: '2',
        user: { id: '2', name: 'Marcus Webb', avatar: '' },
        date: 'Jan 16, 2024',
        text: "Excellent point about the unreliable narrator. I found the revelation about Stevens' feelings for Miss Kenton particularly devastating because he himself doesn't fully acknowledge them ever as we can see.",
        likes: 14,
        isLiked: false,
        replies: [],
      },
      {
        id: '3',
        user: { id: '3', name: 'Elena Rodriguez', avatar: '' },
        date: 'Jan 16, 2024',
        text: "The way Ishiguro handles emotional repression through the lens of British class structure is remarkable. Stevens' notion of \"dignity\" becomes both his armor and his prison.",
        likes: 41,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: '4',
    user: { id: '4', name: 'David Kim', avatar: '' },
    date: 'Jan 18, 2024',
    text: "What struck me most was how Ishiguro uses the road trip structure to mirror Stevens' gradual journey toward self-awareness. The physical distance from Darlington Hall allows the psychological distance from his carefully constructed identity. Each conversation along the way chips away at his defenses.",
    likes: 33,
    isLiked: true,
    replies: [
      {
        id: '5',
        user: { id: '5', name: 'Alika Obeng', avatar: '' },
        date: 'Jan 19, 2024',
        text: "The road trip as a metaphor for introspection is such a classic device, but Ishiguro subverts it beautifully. Even at the end, Stevens can't fully break free from his self-deception—which feels more honest than a complete transformation would have been.",
        likes: 6,
        isLiked: false,
        replies: [],
      },
      {
        id: '6',
        user: { id: '6', name: 'James Patterson', avatar: '' },
        date: 'Jan 17, 2024',
        text: "I've been thinking about how the post-war setting amplifies this theme. Stevens is trying to understand a life lived in service to values that history has revealed to be deeply flawed. The personal and political intersect so elegantly.",
        likes: 9,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: '7',
    user: { id: '7', name: 'Elena Rodriguez', avatar: '' },
    date: 'Jan 19, 2024',
    text: "The novel's treatment of memory fascinates me—how Stevens reshapes his recollections to maintain his sense of dignity and purpose. Ishiguro shows us that memory isn't just about what happened, but about the story we tell ourselves about what happened. The gap between these versions is where the tragedy lives.",
    likes: 18,
    isLiked: false,
    replies: [
      {
        id: '8',
        user: { id: '8', name: 'Sarah Chen', avatar: '' },
        date: 'Jun 8, 2024',
        text: "Yes! And what makes it so powerful is that Ishiguro never explicitly tells us Stevens is unreliable. We have to read between the lines, which implicates us in the same act of interpretation and judgment that Stevens applies to his own past.",
        likes: 22,
        isLiked: false,
        replies: [],
      },
    ],
  },
];

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/book-discussion`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Star Rating Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses} ${star <= Math.floor(rating) ? 'text-[#D0744C]' : star - 0.5 <= rating ? 'text-[#D0744C]/50' : 'text-[#210C00]/20'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// Comment Component with nested replies
function Comment({ 
  comment, 
  content, 
  depth = 0,
  onReply,
  onLike,
}: { 
  comment: CommentData; 
  content: PageContent; 
  depth?: number;
  onReply: (commentId: string) => void;
  onLike: (commentId: string) => void;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const maxDepth = 2;

  return (
    <div className={`${depth > 0 ? 'ml-6 sm:ml-10 pl-4 border-l-2 border-[#210C00]/10' : ''}`}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#D0C4B0] flex items-center justify-center flex-shrink-0">
          {comment.user.avatar ? (
            <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-[#60351B]">
              {comment.user.name.split(' ').map(n => n[0]).join('')}
            </span>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[#210C00]">{comment.user.name}</span>
            <span className="text-xs text-[#210C00]/40">{comment.date}</span>
          </div>

          {/* Comment Text */}
          <p className="text-xs sm:text-sm text-[#210C00]/80 leading-relaxed mb-2">
            {comment.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                comment.isLiked ? 'text-[#D0744C]' : 'text-[#210C00]/50 hover:text-[#D0744C]'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {comment.likes}
            </button>
            {depth < maxDepth && (
              <button 
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1.5 text-xs text-[#210C00]/50 hover:text-[#60351B] transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 10h10a5 5 0 015 5v6M3 10l6 6M3 10l6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {content.discussion.replyButton}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={content.discussion.writeReplyPlaceholder}
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#210C00]/10 text-sm text-[#210C00] placeholder:text-[#210C00]/40 focus:outline-none focus:border-[#60351B]/30"
              />
              <button 
                onClick={() => {
                  onReply(comment.id);
                  setReplyText('');
                  setShowReplyInput(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#60351B] text-white text-xs font-medium hover:bg-[#4A2518] transition-colors"
              >
                {content.discussion.postButton}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              content={content} 
              depth={depth + 1}
              onReply={onReply}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookDiscussionPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();

  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [book, setBook] = useState<BookData>(placeholderBook);
  const [comments, setComments] = useState<CommentData[]>(placeholderComments);
  const [searchQuery, setSearchQuery] = useState('');
  const [readingStatus, setReadingStatus] = useState<string>('want-to-read');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // User data
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reading status options
  const statusOptions = [
    { value: 'want-to-read', label: 'Want to read' },
    { value: 'currently-reading', label: 'Currently reading' },
    { value: 'read', label: 'Read' },
  ];

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

        // Fetch book and discussion data
        // const bookData = await booksApi.get(params.id);
        // setBook(bookData);
        // const discussionData = await discussionsApi.get(params.id);
        // setComments(discussionData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  // Handle like
  const handleLike = (commentId: string) => {
    setComments(prev => {
      const toggleLike = (cmts: CommentData[]): CommentData[] => {
        return cmts.map(c => {
          if (c.id === commentId) {
            return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
          }
          if (c.replies.length > 0) {
            return { ...c, replies: toggleLike(c.replies) };
          }
          return c;
        });
      };
      return toggleLike(prev);
    });
  };

  // Handle reply
  const handleReply = (commentId: string) => {
    // In real implementation, this would add a reply to the comment
    console.log('Reply to comment:', commentId);
  };

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
            {/* Top Bar - Desktop/Tablet */}
            <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
              <div className="max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                    <SearchBar
                      placeholder="Search book by name, author..."
                      onFilterOpenChange={() => {}}
                      onApplyFilters={() => {}}
                      onPickRandom={() => {}}
                    />
                  </div>
                  <UserNavbar />
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
              <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <Link 
                  href="/community"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#210C00]/60 hover:text-[#210C00] transition-colors mb-4 sm:mb-6"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {content.header.backLink}
                </Link>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                  {/* Left Sidebar - Book Details */}
                  <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-[0px_8px_10px_-6px_#0000001A,0px_20px_25px_-5px_#0000001A] border border-[#210C00]/5 sticky top-24">
                      {/* Book Cover */}
                      <div className="aspect-[2/3] rounded-lg overflow-hidden mb-4 max-w-[200px] mx-auto lg:max-w-none bg-[#E0E0E0]">
                        {book.cover ? (
                          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-[#60351B]/30" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Book Title */}
                      <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-1 text-center lg:text-left">
                        {book.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#210C00]/60 mb-3 text-center lg:text-left">
                        {content.bookDetails.byLabel} {book.author}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                        <StarRating rating={book.rating} size="sm" />
                        {/* show count of people who rated */}
                        <span className="text-[12px] leading-[17px] font-sf font-normal text-[#3A1B08CC] whitespace-nowrap">
                          {book.ratingsCount.toLocaleString()} ratings · {comments.length} reviews 
                        </span>
                      </div>



                      {/* Book Info (single line) */}
                      <p className="text-[14px] leading-[17px] text-[#3A1B08] font-sf font-normal whitespace-nowrap text-center lg:text-left mb-4" style={{letterSpacing: '0%', verticalAlign: 'middle'}}>
                        {book.pages} {content.bookDetails.pagesLabel} · {content.bookDetails.formatLabel} {content.bookDetails.firstPubLabel} {book.firstPublished}
                      </p>

                      {/* Reading Status Dropdown */}
                      <div className="mb-3 flex justify-center">
                        <button
                          className="w-[334px] flex items-center justify-center gap-[10px] px-[15px] py-[8px] rounded-[40px] bg-white text-[#60351B] text-sm font-medium transition-colors border border-[#210C00] shadow-[
                            -0.5px_-0.5px_0px_0px_#60351B0D,
                            10px_10px_21.21px_-3.75px_#60351B0E,
                            5.9px_5.9px_8.35px_-3px_#60351B31,
                            2.66px_2.66px_3.76px_-2.25px_#60351B3B,
                            1.21px_1.21px_1.71px_-1.5px_#60351B3F,
                            0.44px_0.44px_0.63px_-1px_#60351B42
                          ]"
                        >
                          <Image src={pencilIcon} alt="Want to read" width={16} height={16} className="object-contain" />
                          <span>{content.bookDetails.wantToReadButton}</span>
                        </button>
                      </div>

                      {/* View Details Button */}
                      <Link
                        href={`/view-detail?id=${book.id}`}
                        className="block w-full text-center flex items-center justify-center gap-[10px] px-[15px] py-[8px] rounded-[40px] bg-[#60351B] text-white text-sm font-medium transition-colors shadow-[
                          -0.5px_-0.5px_0px_0px_#60351B0D,
                          10px_10px_21.21px_-3.75px_#60351B0E,
                          5.9px_5.9px_8.35px_-3px_#60351B31,
                          2.66px_2.66px_3.76px_-2.25px_#60351B3B,
                          1.21px_1.21px_1.71px_-1.5px_#60351B3F,
                          0.44px_0.44px_0.63px_-1px_#60351B42
                        ]"
                      >
                        {content.bookDetails.viewDetailsButton}
                      </Link>
                    </div>
                  </div>

                  {/* Right Side - Discussion */}
                  <div className="flex-1 min-w-0">
                    {/* Discussion Header */}
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#210C00] mb-6">
                      {content.discussion.title}
                    </h1>

                    {/* Comments List - each comment card */}
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-[0px_8px_10px_-6px_#0000001A,0px_20px_25px_-5px_#0000001A] border border-[#210C00]/5 mb-4">
                        <Comment 
                          comment={comment} 
                          content={content}
                          onReply={handleReply}
                          onLike={handleLike}
                        />
                      </div>
                    ))}


                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
