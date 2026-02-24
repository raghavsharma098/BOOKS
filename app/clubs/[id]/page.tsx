'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { bookClubsApi, userApi, getImageUrl } from '../../../lib/api';
import Sidebar from '../../components/Sidebar';
import SearchBar from '../../components/SearchBar';
import MobileTopBar from '../../components/MobileTopBar';
import MobileDrawer from '../../components/MobileDrawer';
import UserNavbar from '../../components/UserNavbar';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

// Placeholder images
import cover1 from '../../../images/Book cover.png';
import user2 from '../../../images/user2.png';
import bellIcon from '../../../images/bell.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    backText: string;
    backHref: string;
    onlineNowLabel: string;
    membersLabel: string;
    discussionsLabel: string;
  };
  about: {
    title: string;
    createdByLabel: string;
  };
  actions: {
    joinButtonText: string;
    leaveButtonText: string;
    notifyButtonText: string;
    shareButtonText: string;
  };
  currentlyReading: {
    title: string;
    progressLabel: string;
    thisWeekLabel: string;
  };
  activeMembers: {
    title: string;
    completeLabel: string;
    viewAllText: string;
  };
  memberTab?: {
    joinedLabel: string;
    progressLabel: string;
    ownerBadge: string;
    modBadge: string;
    memberBadge: string;
  };
  wantToRead: {
    title: string;
    booksLabel: string;
  };
  booksWeRead: {
    title: string;
    booksLabel: string;
    readLabel: string;
  };
  tabs: {
    discussions: string;
    members: string;
    about: string;
  };
  clubInfo: {
    aboutTitle: string;
    rulesTitle: string;
  };
  aboutTab?: {
    recentPostsTitle: string;
    likesLabel: string;
    repliesLabel: string;
    pinnedIcon: boolean;
  };
  discussion: {
    inputPlaceholder: string;
    sendButtonText: string;
    filterLabel: string;
    filterAll: string;
    filterPinned: string;
    filterRecent: string;
    filterPopular: string;
    discussionsLabel: string;
    ownerBadge: string;
    memberBadge: string;
    moderatorBadge: string;
    repliesLabel: string;
    replyButtonText: string;
  };
  relatedClubs: {
    title: string;
    seeMore: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    backText: 'Back to All Clubs',
    backHref: '/my-clubs',
    onlineNowLabel: 'online now',
    membersLabel: 'members',
    discussionsLabel: 'discussions',
  },
  about: {
    title: 'About This Club',
    createdByLabel: 'Created by',
  },
  actions: {
    joinButtonText: '+ Join Club',
    leaveButtonText: 'Leave Club',
    notifyButtonText: 'Notify',
    shareButtonText: 'Share',
  },
  currentlyReading: {
    title: 'Currently Reading',
    progressLabel: 'Club Progress',
    thisWeekLabel: 'THIS WEEK',
  },
  activeMembers: {
    title: 'Active Members',
    completeLabel: 'complete',
    viewAllText: 'View All Members',
  },
  memberTab: {
    joinedLabel: 'Joined',
    progressLabel: 'progress',
    ownerBadge: 'Owner',
    modBadge: 'Mod',
    memberBadge: 'Member',
  },
  wantToRead: {
    title: 'Want to Read',
    booksLabel: 'books',
  },
  booksWeRead: {
    title: "Books We've Read",
    booksLabel: 'books',
    readLabel: 'Read',
  },
  tabs: {
    discussions: 'Discussions',
    members: 'Members',
    about: 'About',
  },
  clubInfo: {
    aboutTitle: 'About This Club',
    rulesTitle: 'Club Rules',
  },
  aboutTab: {
    recentPostsTitle: 'Recent Discussions',
    likesLabel: '',
    repliesLabel: 'replies',
    pinnedIcon: true,
  },
  discussion: {
    inputPlaceholder: 'Share your thoughts with the club...',
    sendButtonText: 'Send',
    filterLabel: 'Filter by:',
    filterAll: 'All',
    filterPinned: 'Pinned',
    filterRecent: 'Recent',
    filterPopular: 'Popular',
    discussionsLabel: 'discussions',
    ownerBadge: 'Owner',
    memberBadge: 'Member',
    moderatorBadge: 'Moderator',
    repliesLabel: 'replies',
    replyButtonText: 'Reply',
  },
  relatedClubs: {
    title: 'Related Clubs',
    seeMore: 'See All',
  },
};

// Club type from backend
interface ClubDetail {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  clubLogo?: string;
  privacy: 'public' | 'private';
  clubType: string;
  genreFocus?: string;
  memberCount: number;
  discussionCount?: number;
  onlineCount?: number;
  creator?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt?: string;
  selectedBooks?: {
    book: {
      _id: string;
      title: string;
      coverImage?: string;
      author?: { name: string };
      pageCount?: number;
    };
    isCurrentRead: boolean;
    currentPage?: number;
    currentChapter?: string;
  }[];
  wantToReadBooks?: {
    _id: string;
    title: string;
    coverImage?: string;
    author?: { name: string };
  }[];
  members?: {
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    role?: 'owner' | 'moderator' | 'member';
    progress?: number;
    currentPage?: number;
    joinedAt?: string;
  }[];
  tags?: string[];
  isMember?: boolean;
  booksWeRead?: {
    _id: string;
    title: string;
    coverImage?: string;
    author?: { name: string };
    rating?: number;
    readDate?: string;
  }[];
  completedBooks?: {
    _id?: string;
    book: {
      _id: string;
      title: string;
      coverImage?: string;
      author?: { name: string };
    };
    finishedAt?: string;
    rating?: number;
  }[];
  clubRules?: string[];
  aboutText?: string;
  discussions?: {
    _id: string;
    author: {
      _id: string;
      name: string;
      avatar?: string;
      role: 'owner' | 'moderator' | 'member';
    };
    content: string;
    tags?: string[];
    likes: number;
    replyCount: number;
    createdAt: string;
    isPinned?: boolean;
    replies?: {
      _id: string;
      author: {
        _id: string;
        name: string;
        avatar?: string;
        role: 'owner' | 'moderator' | 'member';
      };
      content: string;
      likes: number;
      createdAt: string;
    }[];
  }[];
  relatedClubs?: {
    _id: string;
    name: string;
    coverImage?: string;
  }[];
  recentPosts?: {
    _id: string;
    author: {
      _id: string;
      name: string;
      avatar?: string;
    };
    content: string;
    likes: number;
    replyCount: number;
    createdAt: string;
    isPinned?: boolean;
  }[];
}

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/club-detail`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Member Progress Card Component
function MemberCard({ member, completeLabel }: { member: any; completeLabel: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0">
        {member.user?.avatar ? (
          <img src={member.user.avatar} alt={member.user.name} className="w-full h-full object-cover" />
        ) : (
          <Image src={user2} alt={member.user?.name || 'Member'} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-[#210C00] truncate">
          {member.user?.name || 'Member'}
        </p>
        <p className="text-[10px] sm:text-xs text-green-600">
          {member.progress || 0}% {completeLabel}
        </p>
      </div>
    </div>
  );
}

// Book Card Component
function BookCard({ book }: { book: any }) {
  return (
    <div className="flex-shrink-0 w-24 sm:w-28 md:w-32">
      <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#210C00]/5 shadow-md">
        {book.coverImage ? (
          <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <Image src={cover1} alt={book.title || 'Book'} className="w-full h-full object-cover" />
        )}
      </div>
      <p className="mt-1.5 text-[10px] sm:text-xs font-medium text-[#210C00] line-clamp-2 leading-tight">
        {book.title || 'Book Title'}
      </p>
      <p className="text-[9px] sm:text-[10px] text-[#210C00]/60 truncate">
        {book.author?.name || 'Author'}
      </p>
    </div>
  );
}

export default function ClubDetailPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const clubId = params?.id as string;
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();
  
  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);
  
  // Data state
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  
  // Tab and filter state
  const [activeTab, setActiveTab] = useState<'discussions' | 'members' | 'about'>('discussions');
  const [discussionFilter, setDiscussionFilter] = useState<'all' | 'pinned' | 'recent' | 'popular'>('all');
  const [discussionInput, setDiscussionInput] = useState('');
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Reading progress logging
  const [progressInput, setProgressInput] = useState('');
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      if (!clubId) return;
      
      try {
        setLoading(true);
        setError(null);

        const [pageContent, clubData, discussionsData, userProfile]: any[] = await Promise.all([
          fetchPageContent(),
          bookClubsApi.getById(clubId).catch(() => ({ data: null })),
          bookClubsApi.getDiscussions(clubId).catch(() => ({ data: [] })),
          userApi.getProfile().catch(() => null),
        ]);

        setContent(pageContent);
        const clubObj = clubData?.data || null;
        const userId = userProfile?.data?._id;
        // Compute isMember from the members array
        const alreadyMember = userId && Array.isArray(clubObj?.members)
          ? clubObj.members.some((m: any) => (m.user?._id ?? m.user)?.toString() === userId.toString())
          : false;
        // Compute isRequestPending from joinRequests array
        const alreadyRequested = userId && Array.isArray(clubObj?.joinRequests)
          ? clubObj.joinRequests.some((r: any) => (r.user?._id ?? r.user)?.toString() === userId.toString())
          : false;
        setIsRequestPending(alreadyRequested);
        // If the current user is the owner or an admin, expose join requests for management
        const isOwnerOrAdmin = userId && clubObj && (
          clubObj.creator?._id?.toString() === userId.toString() ||
          clubObj.creator?.toString() === userId.toString() ||
          (Array.isArray(clubObj.admins) && clubObj.admins.some((a: any) => (a._id ?? a)?.toString() === userId.toString()))
        );
        if (isOwnerOrAdmin) setJoinRequests(clubObj?.joinRequests || []);
        setClub(clubObj ? { ...clubObj, isMember: alreadyMember } : null);
        // Normalize API shape to match component interface
        const normalized = (discussionsData?.data || []).map((d: any) => ({
          ...d,
          author: {
            _id: d.createdBy?._id || '',
            name: d.createdBy?.name || 'Unknown',
            avatar: d.createdBy?.profilePicture || '',
            role: clubObj?.creator?._id && d.createdBy?._id === (clubObj.creator?._id?.toString?.() ?? clubObj.creator) ? 'owner' : 'member',
          },
          likes: d.likes || 0,
          tags: d.tags || [],
          replies: (d.replies || []).map((r: any) => ({
            ...r,
            author: {
              _id: r.user?._id || '',
              name: r.user?.name || 'Unknown',
              avatar: r.user?.profilePicture || '',
              role: clubObj?.creator?._id && r.user?._id === (clubObj.creator?._id?.toString?.() ?? clubObj.creator) ? 'owner' : 'member',
            },
            likes: r.likes || 0,
          })),
        }));
        setDiscussions(normalized);
        setUserData(userProfile?.data || null);
      } catch (err: any) {
        console.error('Error fetching club:', err);
        setError(err?.message || 'Failed to load club');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [clubId]);

  // Placeholder club data
  const placeholderClub: ClubDetail = {
    _id: clubId || '1',
    name: 'Navigating Grief Through Literature',
    description: 'A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply, creating a supportive environment where emotions and insights are shared freely.',
    privacy: 'public',
    clubType: 'emotional',
    memberCount: 247,
    discussionCount: 142,
    onlineCount: 8,
    creator: { _id: '1', name: 'Elena Rodriguez' },
    createdAt: 'November 15, 2020',
    tags: ['Emotional Intelligence', 'Memoir', 'Healing', 'Grief', 'Psychology'],
    selectedBooks: [{
      book: {
        _id: '1',
        title: 'The Year of Magical Thinking',
        author: { name: 'Joan Didion' },
        pageCount: 224,
      },
      isCurrentRead: true,
      currentPage: 145,
      currentChapter: 'Chapter 8: Memory and Time',
    }],
    wantToReadBooks: [
      { _id: '1', title: 'When Breath Becomes Air', author: { name: 'Paul Kalanithi' } },
      { _id: '2', title: 'The Body Keeps the Score', author: { name: 'Bessel van der Kolk' } },
      { _id: '3', title: 'Wild', author: { name: 'Cheryl Strayed' } },
      { _id: '4', title: "Man's Search for Meaning", author: { name: 'Viktor E. Frankl' } },
    ],
    members: [
      { user: { _id: '1', name: 'Elena Rodriguez' }, role: 'owner', progress: 68, joinedAt: 'Nov 2025' },
      { user: { _id: '2', name: 'Marcus Chen' }, role: 'moderator', progress: 72, joinedAt: 'Nov 2025' },
      { user: { _id: '3', name: 'Sarah Williams' }, role: 'member', progress: 65, joinedAt: 'Dec 2025' },
      { user: { _id: '4', name: 'James Patterson' }, role: 'member', progress: 58, joinedAt: 'Dec 2025' },
      { user: { _id: '5', name: 'Lisa Anderson' }, role: 'member', progress: 45, joinedAt: 'Dec 2025' },
      { user: { _id: '6', name: 'David Kim' }, role: 'member', progress: 68, joinedAt: 'Jan 2026' },
    ],
    isMember: false,
    booksWeRead: [
      { _id: '1', title: 'A Grief Observed', author: { name: 'C.S. Lewis' }, rating: 4.8, readDate: 'Dec 2025' },
      { _id: '2', title: 'The Comfort Book', author: { name: 'Matt Haig' }, rating: 4.6, readDate: 'Jan 2026' },
      { _id: '3', title: 'Crying in H Mart', author: { name: 'Michelle Zauner' }, rating: 4.9, readDate: 'Nov 2025' },
    ],
    clubRules: [
      'Respect everyone\'s emotions and experiences',
      'No spoilers without warnings',
      'Keep discussions thoughtful and supportive',
      'One book at a time, read at your own pace',
    ],
    aboutText: 'This club was founded to create a safe space for readers processing loss and change. We believe that literature can be a powerful tool for understanding and healing. Our discussions are guided by empathy and respect for each member\'s journey.',
    discussions: [
      {
        _id: '1',
        author: { _id: '1', name: 'Elena Rodriguez', role: 'owner' },
        content: 'Chapter 12 really resonated with me today. The way Haig explores the concept of regret and alternative lives—it made me think about the choices I\'ve made. What did this chapter make you reflect on?',
        tags: ['Chapter Discussion', 'Current Reading'],
        likes: 24,
        replyCount: 2,
        createdAt: '2 hours ago',
        isPinned: true,
        replies: [
          {
            _id: '1',
            author: { _id: '2', name: 'Marcus Chen', role: 'member' },
            content: 'The part about parallel lives really got me. It reminded me of a decision I made 5 years ago that completely changed my path. Sometimes I wonder about the "other" version of my life.',
            likes: 12,
            createdAt: '1 hour ago',
          },
          {
            _id: '2',
            author: { _id: '3', name: 'Sarah Williams', role: 'moderator' },
            content: 'I love how this book doesn\'t give easy answers. It sits with the complexity of choice and regret in a really mature way.',
            likes: 8,
            createdAt: '45 minutes ago',
          },
        ],
      },
    ],
    relatedClubs: [
      { _id: 'r1', name: 'Mindful Readers', coverImage: '' },
      { _id: 'r2', name: 'Healing Hearts', coverImage: '' },
      { _id: 'r3', name: 'Quiet Pages', coverImage: '' },
    ],
    recentPosts: [
      {
        _id: 'p1',
        author: { _id: '1', name: 'Elena Rodriguez', avatar: '' },
        content: 'Chapter 8 really hit me today. The way Didion describes time as both linear and circular when dealing with grief—how we move forward but also keep returning to the same moments. What passages stood out to you?',
        likes: 24,
        replyCount: 8,
        createdAt: '2 hours ago',
        isPinned: true,
      },
      {
        _id: 'p2',
        author: { _id: '2', name: 'Marcus Chen', avatar: '' },
        content: 'The section on page 147 about "the way life is" versus "the way we thought life would be" absolutely destroyed me. Didion captures that disorientation so perfectly.',
        likes: 18,
        replyCount: 5,
        createdAt: '5 hours ago',
      },
      {
        _id: 'p3',
        author: { _id: '3', name: 'Sarah Williams', avatar: '' },
        content: "I appreciate how this book doesn't offer easy answers. It sits with the complexity of grief instead of trying to resolve it. That's what I needed.",
        likes: 31,
        replyCount: 12,
        createdAt: '1 day ago',
      },
      {
        _id: 'p4',
        author: { _id: '4', name: 'James Patterson', avatar: '' },
        content: "Quick question: Is anyone else finding the medical details challenging? I understand why they're included but sometimes I need to take breaks. Just me?",
        likes: 15,
        replyCount: 9,
        createdAt: '2 days ago',
      },
    ],
  };

  async function handleLogProgress() {
    const pages = parseInt(progressInput, 10);
    if (isNaN(pages) || pages < 0 || !clubId) return;
    setSavingProgress(true);
    try {
      const res = await bookClubsApi.updateProgress(clubId, pages) as any;
      const { currentPage: cp, progress: prog, totalPages } = res.data || {};
      // Update the member entry in local state so UI reflects immediately
      setClub(prev => {
        if (!prev) return prev;
        const updatedMembers = (prev.members ?? []).map((m: any) => {
          const uid = m.user?._id ?? m.user;
          if (uid?.toString() === userData?._id?.toString()) {
            return { ...m, currentPage: cp ?? pages, progress: prog ?? 0 };
          }
          return m;
        });
        return { ...prev, members: updatedMembers };
      });
      setProgressSaved(true);
      setTimeout(() => setProgressSaved(false), 2500);
    } catch (err) {
      console.error('Failed to log progress:', err);
    } finally {
      setSavingProgress(false);
    }
  }

  const displayClub = club;
  // My reading progress from the members array
  const myMemberEntry = displayClub?.members?.find(
    (m: any) => (m.user?._id ?? m.user)?.toString() === userData?._id?.toString()
  );
  const myCurrentPage = myMemberEntry?.currentPage ?? 0;
  const myProgressPercent = myMemberEntry?.progress ?? 0;
  // Book with isCurrentRead flag, or first book as fallback
  const currentBook = displayClub?.selectedBooks?.find(b => b.isCurrentRead) ?? displayClub?.selectedBooks?.[0] ?? null;
  // All other selected books that are not the currently-reading one
  const queuedBooks = (displayClub?.selectedBooks || []).filter(b => !b.isCurrentRead).map(b => b.book);
  // Progress of current book — use the logged-in user's member entry
  const progressPercent = myProgressPercent;
  // Resolve author name — backend populates author as { name } or returns plain string.
  // Guard against raw MongoDB ObjectId strings (24-char hex) that arrive when populate fails.
  function resolveAuthor(book: any): string {
    if (!book) return '';
    if (book.author?.name) return book.author.name;
    if (typeof book.author === 'string' && !/^[a-f\d]{24}$/i.test(book.author)) return book.author;
    return '';
  }

  async function handleJoinClub() {
    if (!clubId) return;
    setJoining(true);
    try {
      await bookClubsApi.join(clubId);
      if (club?.privacy === 'private') {
        // Private club — request sent, waiting for owner approval
        setIsRequestPending(true);
      } else {
        setClub(prev => prev ? { ...prev, isMember: true, memberCount: (prev.memberCount || 0) + 1 } : prev);
      }
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('already a member')) {
        setClub(prev => prev ? { ...prev, isMember: true } : prev);
      } else if (msg.includes('already have a pending')) {
        setIsRequestPending(true);
      } else {
        console.error('Failed to join club:', err);
      }
    } finally {
      setJoining(false);
    }
  }

  async function handleAcceptRequest(reqUserId: string) {
    if (!clubId) return;
    setAcceptingRequest(reqUserId);
    try {
      await bookClubsApi.acceptJoinRequest(clubId, reqUserId);
      setJoinRequests(prev => prev.filter(r => (r.user?._id ?? r.user)?.toString() !== reqUserId));
      setClub(prev => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : prev);
    } catch (err: any) {
      console.error('Failed to accept request:', err);
    } finally {
      setAcceptingRequest(null);
    }
  }

  async function handleRejectRequest(reqUserId: string) {
    if (!clubId) return;
    try {
      await bookClubsApi.rejectJoinRequest(clubId, reqUserId);
      setJoinRequests(prev => prev.filter(r => (r.user?._id ?? r.user)?.toString() !== reqUserId));
    } catch (err: any) {
      console.error('Failed to reject request:', err);
    }
  }

  async function handleSendDiscussion() {
    if (!discussionInput.trim() || !clubId) return;
    const currentBook = displayClub?.selectedBooks?.find((b: any) => b.isCurrentRead) || displayClub?.selectedBooks?.[0];
    if (!currentBook?.book?._id) {
      alert('No book is selected for this club. An admin must add a book before discussions can be started.');
      return;
    }
    setSending(true);
    try {
      const res: any = await bookClubsApi.createDiscussion(clubId, {
        book: currentBook.book._id,
        title: discussionInput.trim().slice(0, 100),
        content: discussionInput.trim(),
      });
      const d = res?.data;
      if (d) {
        setDiscussions(prev => [{
          ...d,
          author: { _id: userData?._id || '', name: userData?.name || 'You', avatar: userData?.profilePicture || '', role: club?.creator?._id === userData?._id ? 'owner' : 'member' },
          likes: 0, tags: [], replies: [],
        }, ...prev]);
      }
      setDiscussionInput('');
    } catch (err: any) {
      console.error('Failed to post discussion:', err);
      alert(err?.message || 'Failed to post. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function handleSendReply(discussionId: string) {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res: any = await bookClubsApi.addReply(discussionId, replyText.trim());
      const r = res?.data;
      if (r) {
        const newReply = { ...r, author: { _id: userData?._id || '', name: userData?.name || 'You', avatar: userData?.profilePicture || '', role: club?.creator?._id === userData?._id ? 'owner' : 'member' }, likes: 0 };
        setDiscussions(prev => prev.map(d => d._id === discussionId ? { ...d, replyCount: d.replyCount + 1, replies: [...(d.replies || []), newReply] } : d));
      }
      setReplyText('');
      setReplyTo(null);
    } catch (err: any) {
      console.error('Failed to post reply:', err);
      alert(err?.message || 'Failed to post reply.');
    } finally {
      setSendingReply(false);
    }
  }

  const filteredDiscussions = discussions.filter((d: any) => {
    if (discussionFilter === 'pinned') return d.isPinned;
    return true;
  });

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
              <p className="mt-4 text-sm sm:text-base text-[#60351B] font-medium">Loading club...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="text-center max-w-md">
              <div className="text-red-600 text-lg sm:text-xl font-semibold mb-2">Unable to load club</div>
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
        {!loading && !error && displayClub && (
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
                  href={content.header.backHref} 
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#210C00]/70 hover:text-[#210C00] transition-colors mb-4 sm:mb-6"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {content.header.backText}
                </Link>

                {/* Hero Banner */}
                <div className="relative rounded-xl overflow-hidden mb-6 sm:mb-8">
                  {/* Banner Image */}
                  <div className="h-36 sm:h-44 md:h-52 lg:h-60 w-full">
                    {displayClub.coverImage ? (
                      <img src={getImageUrl(displayClub.coverImage)} alt={displayClub.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#8B7355] to-[#6B5344]">
                        <div className="w-full h-full bg-[url('/images/book-pattern.png')] bg-cover bg-center opacity-30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 sm:p-6 flex flex-col justify-end">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                        displayClub.privacy === 'public' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {displayClub.privacy === 'public' ? 'Public' : 'Private'}
                      </span>
                      {displayClub.clubType && (
                        <span
                          className="inline-flex items-center text-[10px] sm:text-xs text-[#60351B]"
                          style={{
                            height: '26px',
                            borderRadius: '16px',
                            gap: '6px',
                            padding: '5px 6px',
                            background: '#FFD4DE',
                            boxShadow: '0px 4px 6px -1px #0000001A',
                            opacity: 1,
                            transform: 'rotate(0deg)'
                          }}
                        >
                          {displayClub.clubType === 'emotional' && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          )}
                          {displayClub.clubType === 'genre' && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                            </svg>
                          )}
                          {displayClub.clubType === 'author-led' && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                            </svg>
                          )}
                          {displayClub.clubType === 'editorial' && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          )}
                          {displayClub.clubType === 'emotional' ? 'Emotional Theme' :
                           displayClub.clubType === 'genre' ? 'Genre-Based' :
                           displayClub.clubType === 'author-led' ? 'Author-Led' :
                           displayClub.clubType === 'editorial' ? 'Editorial' :
                           displayClub.clubType}
                        </span>
                      )}
                    </div>
                    
                    {/* Club Name */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-2 sm:mb-3">
                      {displayClub.name}
                    </h1>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90">
                      <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {displayClub.memberCount} {content.header.membersLabel}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {displayClub.discussionCount || 0} {content.header.discussionsLabel}
                      </span>
                    </div>
                  </div>
                  
                  {/* Online Now Badge */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] sm:text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {displayClub.onlineCount || 0} {content.header.onlineNowLabel}
                  </div>
                  
                  {/* Club Logo */}
                  <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl bg-white shadow-lg overflow-hidden flex items-center justify-center p-2">
                    {displayClub.clubLogo ? (
                      <img src={getImageUrl(displayClub.clubLogo)} alt="Club logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Left Column - About & Currently Reading (full width to match banner) */}
                  <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                    {/* About Section */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-3">
                            {content.about.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-[#210C00]/70 leading-relaxed mb-4">
                            {displayClub.description}
                          </p>
                          
                          {/* Creator */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden">
                              {displayClub.creator?.avatar ? (
                                <img src={displayClub.creator.avatar} alt={displayClub.creator.name} className="w-full h-full object-cover" />
                              ) : (
                                <Image src={user2} alt={displayClub.creator?.name || 'Creator'} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-[#210C00]">
                                {content.about.createdByLabel} {displayClub.creator?.name || 'Unknown'}
                              </p>
                              <p className="text-[10px] sm:text-xs text-[#210C00]/50">
                                {displayClub.createdAt ? new Date(displayClub.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                              </p>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {(displayClub.tags || []).map((tag, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-full border border-[#210C00]/15 text-[10px] sm:text-xs text-[#210C00]/70">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 sm:w-40">
                          <button
                            onClick={handleJoinClub}
                            disabled={joining || displayClub.isMember || isRequestPending}
                            className={`w-full py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                              displayClub.isMember
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : isRequestPending
                                ? 'bg-orange-100 text-orange-700 cursor-not-allowed'
                                : 'bg-[#60351B] text-white hover:bg-[#4A2518]'
                            }`}
                          >
                            {joining ? 'Sending...' : displayClub.isMember ? '✓ Joined' : isRequestPending ? '⏳ Request Pending' : content.actions.joinButtonText}
                          </button>
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 rounded-lg border border-[#210C00]/15 text-[#210C00]/70 text-xs sm:text-sm hover:bg-[#210C00]/5 transition-colors flex items-center justify-center gap-1.5">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {content.actions.notifyButtonText}
                            </button>
                            <button className="flex-1 py-2 rounded-lg border border-[#210C00]/15 text-[#210C00]/70 text-xs sm:text-sm hover:bg-[#210C00]/5 transition-colors flex items-center justify-center gap-1.5">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {content.actions.shareButtonText}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Members & Currently Reading */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Currently Reading — all selected books */}
                      {(displayClub.selectedBooks || []).length > 0 && (
                        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-md border border-[#210C00]/5">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base sm:text-lg font-semibold text-[#210C00]">
                              {content.currentlyReading.title}
                            </h2>
                            <span className="text-xs sm:text-sm text-[#210C00]/50">
                              {(displayClub.selectedBooks || []).length} book{(displayClub.selectedBooks || []).length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="space-y-4">
                            {(displayClub.selectedBooks || []).map((sb: any, idx: number) => {
                              const b = sb.book;
                              const authorName = resolveAuthor(b);
                              // Show progress for books flagged isCurrentRead, OR the first book
                              // when no book has the flag (e.g. club just created).
                              const hasAnyCurrentRead = (displayClub.selectedBooks || []).some((s: any) => s.isCurrentRead);
                              const showAsCurrent = sb.isCurrentRead || (!hasAnyCurrentRead && idx === 0);
                              // Use the logged-in user's saved page count from the members array
                              const displayProgress = showAsCurrent ? myProgressPercent : 0;
                              const displayPage = showAsCurrent ? myCurrentPage : 0;
                              const totalPages = b?.pageCount || 0;
                              const isMemberOrOwner = displayClub.isMember ||
                                displayClub.creator?._id?.toString() === userData?._id?.toString() ||
                                displayClub.creator?.toString() === userData?._id?.toString();
                              return (
                                <div key={b?._id || idx} className="flex flex-col sm:flex-row gap-6 sm:gap-5">
                                  {/* Cover */}
                                  <div className="w-24 sm:w-28 aspect-[2/3] rounded-lg overflow-hidden bg-[#210C00]/5 shadow-md flex-shrink-0">
                                    {b?.coverImage ? (
                                      <img src={getImageUrl(b.coverImage)} alt={b.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <Image src={cover1} alt={b?.title || 'Book'} className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="text-sm sm:text-base font-semibold text-[#210C00] truncate">{b?.title || 'Untitled'}</h3>
                                      {showAsCurrent && (
                                        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#60351B] text-white uppercase tracking-wide">Now Reading</span>
                                      )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#210C00]/60 mb-2">
                                      {authorName ? `by ${authorName}` : ''}
                                    </p>
                                    {showAsCurrent && (
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[10px] sm:text-xs text-[#210C00]/50">{content.currentlyReading.progressLabel}</span>
                                          <span className="text-xs font-semibold text-[#60351B]">
                                            {displayProgress}%
                                            {totalPages > 0 && (
                                              <span className="ml-1 text-[10px] font-normal text-[#210C00]/40">({displayPage}/{totalPages} pages)</span>
                                            )}
                                          </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-[#60351B]/10 overflow-hidden">
                                          <div className="h-full bg-[#60351B] rounded-full transition-all" style={{ width: `${displayProgress}%` }} />
                                        </div>
                                        {/* Log progress input — visible to members */}
                                        {isMemberOrOwner && (
                                          <div className="mt-3 flex items-center gap-2">
                                            <input
                                              type="number"
                                              min={0}
                                              max={totalPages || undefined}
                                              value={progressInput}
                                              onChange={(e) => setProgressInput(e.target.value)}
                                              placeholder={`Pages read${totalPages ? ` / ${totalPages}` : ''}`}
                                              className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-[#60351B]/20 bg-white text-[#210C00] placeholder-[#210C00]/30 focus:outline-none focus:ring-1 focus:ring-[#60351B]/40"
                                            />
                                            <button
                                              onClick={handleLogProgress}
                                              disabled={savingProgress || progressInput === ''}
                                              className="flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#60351B] text-white hover:bg-[#4A2816] disabled:opacity-50 transition-colors"
                                            >
                                              {savingProgress ? 'Saving…' : progressSaved ? '✓ Saved' : 'Log'}
                                            </button>
                                          </div>
                                        )}
                                        {sb.currentChapter && (
                                          <div className="mt-2 bg-[#60351B]/5 rounded-lg px-2.5 py-2">
                                            <span className="text-[9px] text-[#60351B] font-semibold uppercase tracking-wide">{content.currentlyReading.thisWeekLabel}</span>
                                            <p className="text-xs text-[#210C00] mt-0.5">{sb.currentChapter}</p>
                                          </div>
                                        )}
                                      </div>
                                    ) /* showAsCurrent */ }
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    {/* Active Members */}
                    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-md border border-[#210C00]/5">
                      <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">
                        {content.activeMembers.title}
                      </h2>
                      <div className="space-y-3 sm:space-y-4">
                        {(displayClub.members || []).map((m: any, idx: number) => (
                          <MemberCard
                            key={m.user?._id || idx}
                            member={m}
                            completeLabel={content.activeMembers.completeLabel}
                          />
                        ))}
                      </div>
                      {displayClub.members && displayClub.members.length > 5 && (
                        <button className="mt-4 text-xs font-medium text-[#60351B] hover:underline">
                          {content.activeMembers.viewAllText}
                        </button>
                      )}
                    </div>  {/* end Active Members */}
                    </div>  {/* end Active Members & Currently Reading grid */}

                    {/* Want to Read — books queued (not currently reading) */}
                    {queuedBooks.length > 0 && (
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#210C00]">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {content.wantToRead.title}
                        </h2>
                        <span className="text-xs sm:text-sm text-[#210C00]/50">{queuedBooks.length} {content.wantToRead.booksLabel}</span>
                      </div>
                      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        {queuedBooks.map((book: any) => (
                          <BookCard key={book._id} book={{ ...book, author: { name: resolveAuthor(book) } }} />
                        ))}
                      </div>
                    </div>
                    )}
                  </div>


                </div>

                {/* Books We've Read Section */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#210C00]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 4h4v4H4V4zm6 0h10v2H10V4zm0 4h7v2h-7V6zM4 10h4v4H4v-4zm6 0h10v2H10v-2zm0 4h7v2h-7v-2zM4 16h4v4H4v-4zm6 0h10v2H10v-2zm0 4h7v2h-7v-2z"/>
                      </svg>
                      {content.booksWeRead.title}
                    </h2>
                    <span className="text-xs sm:text-sm text-[#210C00]/50">
                      {((displayClub as any).completedBooks || displayClub.booksWeRead || []).length} {content.booksWeRead.booksLabel}
                    </span>
                  </div>
                  
                  {/* Completed books from backend, fallback to legacy booksWeRead */}
                  {(() => {
                    const books = (displayClub as any).completedBooks?.length
                      ? (displayClub as any).completedBooks.map((cb: any) => ({
                          _id: cb._id || cb.book?._id,
                          title: cb.book?.title,
                          coverImage: cb.book?.coverImage,
                          author: { name: resolveAuthor(cb.book) },
                          rating: cb.rating,
                          readDate: cb.finishedAt ? new Date(cb.finishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
                        }))
                      : (displayClub.booksWeRead || []);
                    if (books.length === 0) return (
                      <p className="text-sm text-[#210C00]/40 text-center py-6">No books completed yet</p>
                    );
                    return (
                      <div className="space-y-3">
                        {books.map((book: any) => (
                          <div key={book._id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-[#210C00]/5 transition-colors cursor-pointer group">
                            <div className="w-12 h-16 sm:w-14 sm:h-[72px] rounded-lg overflow-hidden bg-[#210C00]/5 shadow-sm flex-shrink-0">
                              {book.coverImage ? (
                                <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <Image src={cover1} alt={book.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-medium text-[#210C00] truncate">{book.title}</h4>
                              <p className="text-xs sm:text-sm text-[#210C00]/60 truncate">{book.author?.name ? `by ${book.author.name}` : ''}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {book.rating && (
                                  <span className="flex items-center gap-0.5 text-xs text-amber-500">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    {book.rating}
                                  </span>
                                )}
                                {book.readDate && (
                                  <span className="text-[10px] sm:text-xs text-[#210C00]/40">{content.booksWeRead.readLabel} {book.readDate}</span>
                                )}
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-[#210C00]/30 group-hover:text-[#210C00]/60 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Tabs Section */}
                <div className="mt-6">
                  <div className="bg-white rounded-xl shadow-sm border border-[#210C00]/5 overflow-hidden">
                    {/* Tab Headers */}
                    <div className="flex border-b border-[#210C00]/10">
                      <button
                        onClick={() => setActiveTab('discussions')}
                        className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                          activeTab === 'discussions'
                            ? 'bg-[#60351B] text-white'
                            : 'text-[#210C00]/70 hover:bg-[#210C00]/5'
                        }`}
                      >
                        {content.tabs.discussions}
                      </button>
                      <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                          activeTab === 'members'
                            ? 'bg-[#60351B] text-white'
                            : 'text-[#210C00]/70 hover:bg-[#210C00]/5'
                        }`}
                      >
                        {content.tabs.members}
                      </button>
                      <button
                        onClick={() => setActiveTab('about')}
                        className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                          activeTab === 'about'
                            ? 'bg-[#60351B] text-white'
                            : 'text-[#210C00]/70 hover:bg-[#210C00]/5'
                        }`}
                      >
                        {content.tabs.about}
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 sm:p-6">
                      {/* Discussions Tab */}
                      {activeTab === 'discussions' && (
                        <div className="space-y-6">
                          {/* About This Club - Brief */}
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-[#210C00] mb-2">
                              {content.clubInfo.aboutTitle}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#210C00]/70 leading-relaxed">
                              {displayClub.aboutText || displayClub.description}
                            </p>
                          </div>

                          {/* Club Rules */}
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-[#210C00] mb-3">
                              {content.clubInfo.rulesTitle}
                            </h3>
                            <div className="space-y-2">
                              {(displayClub.clubRules || []).map((rule, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="text-xs sm:text-sm text-[#210C00]/70">{rule}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Discussion Input */}
                          <div className="flex items-center gap-3 bg-[#210C00]/5 rounded-lg p-3 sm:p-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0">
                              {userData?.profilePicture ? (
                                <img src={getImageUrl(userData.profilePicture)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white text-xs font-semibold">
                                  {userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={discussionInput}
                              onChange={(e) => setDiscussionInput(e.target.value)}
                              placeholder={content.discussion.inputPlaceholder}
                              className="flex-1 bg-transparent text-xs sm:text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none"
                            />
                            <button
                              onClick={handleSendDiscussion}
                              disabled={sending || !discussionInput.trim()}
                              className="px-4 sm:px-6 py-2 rounded-lg bg-[#60351B] text-white text-xs sm:text-sm font-medium hover:bg-[#4A2518] transition-colors disabled:opacity-50"
                            >
                              {sending ? 'Posting...' : content.discussion.sendButtonText}
                            </button>
                          </div>

                          {/* Discussion Filters */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-[#210C00]/60">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {content.discussion.filterLabel}
                              </span>
                              {(['all', 'pinned', 'recent', 'popular'] as const).map((filter) => (
                                <button
                                  key={filter}
                                  onClick={() => setDiscussionFilter(filter)}
                                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
                                    discussionFilter === filter
                                      ? 'bg-[#60351B] text-white'
                                      : 'bg-[#210C00]/5 text-[#210C00]/70 hover:bg-[#210C00]/10'
                                  }`}
                                >
                                  {content.discussion[`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}` as keyof typeof content.discussion]}
                                </button>
                              ))}
                            </div>
                            <span className="text-xs sm:text-sm text-[#210C00]/50">
                              {discussions.length} {content.discussion.discussionsLabel}
                            </span>
                          </div>

                          {/* Discussion Threads */}
                          <div className="space-y-4">
                            {filteredDiscussions.length === 0 && (
                              <div className="text-center py-12 text-[#210C00]/40">
                                <svg className="w-10 h-10 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <p className="text-sm">No discussions yet. {displayClub.isMember ? 'Start the conversation above!' : 'Join the club to post discussions.'}</p>
                              </div>
                            )}
                            {filteredDiscussions.map((discussion: any) => (
                              <div key={discussion._id} className="border border-[#210C00]/10 rounded-xl overflow-hidden">
                                {/* Main Discussion */}
                                <div className="p-4 sm:p-5">
                                  <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {discussion.author.avatar ? (
                                        <img src={getImageUrl(discussion.author.avatar)} alt={discussion.author.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Image src={user2} alt={discussion.author.name} className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-sm font-medium text-[#210C00]">{discussion.author.name}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium ${
                                          discussion.author.role === 'owner' ? 'bg-amber-100 text-amber-700' :
                                          discussion.author.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                                          'bg-gray-100 text-gray-600'
                                        }`}>
                                          {discussion.author.role === 'owner' ? content.discussion.ownerBadge :
                                           discussion.author.role === 'moderator' ? content.discussion.moderatorBadge :
                                           content.discussion.memberBadge}
                                        </span>
                                        {discussion.isPinned && (
                                          <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16 3H8c-.55 0-1 .45-1 1v1.59c.76.17 1.48.48 2.14.89L13.58 3H16l-4 4 6.5 6.5L14 18v2.01l4.5-4.5-5.5-5.5L16 3z"/>
                                          </svg>
                                        )}
                                        <span className="text-[10px] sm:text-xs text-[#210C00]/40 ml-auto">{discussion.createdAt}</span>
                                        <button className="text-[#210C00]/40 hover:text-[#210C00]/60 transition-colors">
                                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="1.5"/>
                                            <circle cx="6" cy="12" r="1.5"/>
                                            <circle cx="18" cy="12" r="1.5"/>
                                          </svg>
                                        </button>
                                      </div>
                                      <p className="text-xs sm:text-sm text-[#210C00]/80 leading-relaxed mb-3">
                                        {discussion.content}
                                      </p>
                                      {/* Tags */}
                                      {discussion.tags && discussion.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                          {discussion.tags.map((tag: string, idx: number) => (
                                            <span key={idx} className="px-2 py-0.5 rounded-full bg-[#210C00]/5 text-[9px] sm:text-[10px] text-[#210C00]/60">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {/* Actions */}
                                      <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#210C00]/60 hover:text-[#60351B] transition-colors">
                                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                          {discussion.likes}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#210C00]/60 hover:text-[#60351B] transition-colors">
                                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                          {discussion.replyCount} {content.discussion.repliesLabel}
                                        </button>
                                        <button className="text-[#210C00]/40 hover:text-[#60351B] transition-colors">
                                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </button>
                                        <button className="text-[#210C00]/40 hover:text-[#60351B] transition-colors">
                                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Replies */}
                                {discussion.replies && discussion.replies.length > 0 && (
                                  <div className="bg-[#210C00]/[0.02] border-t border-[#210C00]/10">
                                    {discussion.replies.map((reply: any) => (
                                      <div key={reply._id} className="p-4 sm:p-5 pl-12 sm:pl-16 border-t border-[#210C00]/5 first:border-t-0">
                                        <div className="flex items-start gap-3">
                                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {reply.author.avatar ? (
                                              <img src={getImageUrl(reply.author.avatar)} alt={reply.author.name} className="w-full h-full object-cover" />
                                            ) : (
                                              <Image src={user2} alt={reply.author.name} className="w-full h-full object-cover" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                              <span className="text-xs sm:text-sm font-medium text-[#210C00]">{reply.author.name}</span>
                                              <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium ${
                                                reply.author.role === 'owner' ? 'bg-amber-100 text-amber-700' :
                                                reply.author.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-600'
                                              }`}>
                                                {reply.author.role === 'owner' ? content.discussion.ownerBadge :
                                                 reply.author.role === 'moderator' ? content.discussion.moderatorBadge :
                                                 content.discussion.memberBadge}
                                              </span>
                                              <span className="text-[9px] sm:text-[10px] text-[#210C00]/40">{reply.createdAt}</span>
                                            </div>
                                            <p className="text-[11px] sm:text-xs text-[#210C00]/70 leading-relaxed mb-2">
                                              {reply.content}
                                            </p>
                                            <div className="flex items-center gap-3">
                                              <button className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#210C00]/60 hover:text-[#60351B] transition-colors">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                {reply.likes}
                                              </button>
                                              <button
                                                onClick={() => { setReplyTo(replyTo === discussion._id ? null : discussion._id); setReplyText(''); }}
                                                className="text-[9px] sm:text-[10px] text-[#210C00]/60 hover:text-[#60351B] transition-colors"
                                              >
                                                {content.discussion.replyButtonText}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* Inline Reply Input */}
                                {replyTo === discussion._id && (
                                  <div className="border-t border-[#210C00]/10 p-3 sm:p-4 bg-[#210C00]/[0.02]">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply(discussion._id)}
                                        placeholder="Write a reply..."
                                        autoFocus
                                        className="flex-1 bg-white/60 rounded-lg px-3 py-2 text-xs sm:text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none border border-[#210C00]/10 focus:border-[#60351B]/40"
                                      />
                                      <button
                                        onClick={() => handleSendReply(discussion._id)}
                                        disabled={sendingReply || !replyText.trim()}
                                        className="px-3 py-2 bg-[#60351B] text-white rounded-lg text-xs font-medium hover:bg-[#4A2518] transition-colors disabled:opacity-50"
                                      >
                                        {sendingReply ? '...' : 'Reply'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Members Tab */}
                      {activeTab === 'members' && (
                        <div className="space-y-3">
                          {(displayClub.members || []).map((member, idx) => (
                            <div key={member.user._id || idx} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-[#C4B5A8]/40 hover:bg-[#C4B5A8]/60 transition-colors">
                              {/* Avatar */}
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white/50">
                                {member.user?.avatar ? (
                                  <img src={getImageUrl(member.user.avatar)} alt={member.user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-white text-sm font-semibold">
                                    {member.user?.name ? member.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'M'}
                                  </span>
                                )}
                              </div>
                              
                              {/* Name, Badge & Joined Date */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm sm:text-base font-semibold text-[#210C00]">
                                    {member.user?.name || 'Member'}
                                  </p>
                                  {member.role === 'owner' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-orange-500 text-white">
                                      {content.memberTab?.ownerBadge || 'Owner'}
                                    </span>
                                  )}
                                  {member.role === 'moderator' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-[#8B7355] text-white">
                                      {content.memberTab?.modBadge || 'Mod'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-[#210C00]/60 mt-0.5">
                                  {content.memberTab?.joinedLabel || 'Joined'} {member.joinedAt || 'Recently'}
                                </p>
                              </div>
                              
                              {/* Progress */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-lg sm:text-xl font-bold text-[#210C00]">
                                  {member.progress || 0}%
                                </p>
                                <p className="text-[10px] sm:text-xs text-[#210C00]/50">
                                  {content.memberTab?.progressLabel || 'progress'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* About Tab */}
                      {activeTab === 'about' && (
                        <div className="space-y-4">
                          {/* Recent Posts / Discussions */}
                          {(displayClub.recentPosts || []).map((post) => (
                            <div key={post._id} className="bg-[#C4B5A8]/30 rounded-xl p-4 sm:p-5">
                              {/* Header: Avatar, Name, Pin, Time, Menu */}
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {post.author.avatar ? (
                                    <img src={getImageUrl(post.author.avatar)} alt={post.author.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Image src={user2} alt={post.author.name} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm sm:text-base font-semibold text-[#210C00]">
                                      {post.author.name}
                                    </span>
                                    {post.isPinned && (
                                      <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 4v4l2 2v2h-5v8h-2v-8H6v-2l2-2V4h8zM14 4H10v4.828l-1 1V10h6v-.172l-1-1V4z"/>
                                      </svg>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm text-[#210C00]/50">
                                    {post.createdAt}
                                  </p>
                                </div>
                                <button className="text-[#210C00]/40 hover:text-[#210C00]/70 transition-colors p-1">
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="5" r="2"/>
                                    <circle cx="12" cy="12" r="2"/>
                                    <circle cx="12" cy="19" r="2"/>
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Post Content */}
                              <p className="text-sm sm:text-base text-[#210C00]/80 leading-relaxed mb-4">
                                {post.content}
                              </p>
                              
                              {/* Footer: Likes & Replies */}
                              <div className="flex items-center gap-4 text-[#210C00]/60">
                                <button className="flex items-center gap-1.5 text-xs sm:text-sm hover:text-[#60351B] transition-colors">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {post.likes}
                                </button>
                                <button className="flex items-center gap-1.5 text-xs sm:text-sm hover:text-[#60351B] transition-colors">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 10h10a8 8 0 018 8v4M3 10l6 6m-6-6l6-6" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {post.replyCount} {content.aboutTab?.repliesLabel || 'replies'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Related Clubs Section */}
                <div className="mt-6 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00]">
                      {content.relatedClubs.title}
                    </h2>
                    <button className="text-xs sm:text-sm text-[#60351B] hover:underline">
                      {content.relatedClubs.seeMore}
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    {(displayClub.relatedClubs || []).map((c) => (
                      <Link key={c._id} href={`/clubs/${c._id}`} className="flex-shrink-0 w-32 sm:w-36 md:w-40">
                        <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#210C00]/5">
                          {c.coverImage ? (
                            <img src={getImageUrl(c.coverImage)} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">Club</span>
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs sm:text-sm font-medium text-[#210C00] truncate">
                          {c.name}
                        </p>
                      </Link>
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
