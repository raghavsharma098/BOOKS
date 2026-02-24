'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userApi, eventsApi, getImageUrl } from '../../../lib/api';
import Sidebar from '../../components/Sidebar';
import SearchBar from '../../components/SearchBar';
import MobileTopBar from '../../components/MobileTopBar';
import MobileDrawer from '../../components/MobileDrawer';
import UserNavbar from '../../components/UserNavbar';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

// Placeholder images
import bellIcon from '../../../images/bell.png';
import circleIcon from '../../../images/circle.png';
import mapIcon from '../../../icons/map.png';
// icon for featured book label
import readBookIcon from '../../../images/readbook.png';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    backText: string;
    backHref: string;
  };
  actions: {
    interestedButton: string;
    bookmarkLabel: string;
    shareLabel: string;
  };
  eventInfo: {
    title: string;
    dateLabel: string;
    timeLabel: string;
    durationLabel: string;
    venueLabel: string;
    formatLabel: string;
    categoryLabel: string;
    viewOnMapButton: string;
  };
  attendees: {
    title: string;
    seeWhoText: string;
  };
  about: {
    title: string;
    featuredBookLabel: string;
  };
  tabs: {
    eventDetails: string;
    agenda: string;
    organizer: string;
  };
  eventDetails: {
    purposeTitle: string;
    requirementsTitle: string;
    whatToBringTitle: string;
    topicsTitle: string;
  };
  agenda: {
    scheduleTitle: string;
  };
  organizer: {
    emailLabel: string;
    phoneLabel: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    backText: '←Back to events',
    backHref: '/events',
  },
  actions: {
    interestedButton: "I'm Interested",
    bookmarkLabel: 'Bookmark',
    shareLabel: 'Share',
  },
  eventInfo: {
    title: 'Event Information',
    dateLabel: 'Date',
    timeLabel: 'Time',
    durationLabel: 'Duration:',
    venueLabel: 'Venue',
    formatLabel: 'Format',
    categoryLabel: 'Category',
    viewOnMapButton: 'View on Map',
  },
  attendees: {
    title: 'Attendees',
    seeWhoText: 'See who else is attending this event',
  },
  about: {
    title: 'About This Event',
    featuredBookLabel: 'Featured Book',
  },
  tabs: {
    eventDetails: 'Event Details',
    agenda: 'Agenda',
    organizer: 'Organizer',
  },
  eventDetails: {
    purposeTitle: 'Purpose',
    requirementsTitle: 'Requirements',
    whatToBringTitle: 'What to Bring',
    topicsTitle: 'Topics',
  },
  agenda: {
    scheduleTitle: 'Event Schedule',
  },
  organizer: {
    emailLabel: 'Email',
    phoneLabel: 'Phone',
  },
};

// Event data interface
interface EventData {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  badges: string[];
  date: string;
  time: string;
  duration: string;
  venue: {
    name: string;
    address: string;
    city: string;
  };
  format: string;
  category: string;
  bookingLink?: string;
  attendees: {
    id: string;
    name: string;
    avatar: string;
  }[];
  totalAttendees: number;
  featuredBook: {
    title: string;
    author: string;
    coverImage: string;
    pages: number;
    binding: string;
    published: string;
  } | null;
  purpose: string;
  requirements: string[];
  whatToBring: string[];
  topics: string[];
  schedule: {
    time: string;
    activity: string;
  }[];
  organizer: {
    name: string;
    initials: string;
    title: string;
    bio: string;
    email: string;
    phone: string;
    avatar: string;
  };
}

// Placeholder event data
const placeholderEvent: EventData = {
  id: '1',
  title: 'An Evening with Kazuo Ishiguro: Memory, Dignity, and the Art of Storytelling',
  description: 'Join us for an intimate conversation with Nobel Prize-winning author Kazuo Ishiguro as he discusses his literary journey, the themes of memory and dignity in his work, his approach to crafting unforgettable narratives. This exclusive event will feature a reading from his latest work, followed by an in-depth discussion and audience Q&A session.',
  coverImage: '',
  badges: ['Author Talk', 'Hybrid'],
  date: 'February 16, 2026',
  time: '7:00 PM - 9:30 PM EST',
  duration: '2.5 hours',
  venue: {
    name: 'The Literary Arts Center',
    address: '245 Park Avenue South',
    city: 'New York, NY 10003',
  },
  format: 'Hybrid',
  category: 'Author Talk',
  attendees: [
    { id: '1', name: 'John', avatar: '' },
    { id: '2', name: 'Sarah', avatar: '' },
    { id: '3', name: 'Mike', avatar: '' },
    { id: '4', name: 'Emma', avatar: '' },
  ],
  totalAttendees: 156,
  featuredBook: {
    title: 'The Cambers of Secrets',
    author: 'JK Rowlings',
    coverImage: '',
    pages: 375,
    binding: 'Hardcover',
    published: 'First ed 1996',
  },
  purpose: 'This event aims to provide readers and writers with deep insights into Ishiguro\'s creative process, explore the philosophical themes that permeate his novels, and foster meaningful dialogue about literature\'s role in understanding human experience. Attendees will gain a deeper appreciation for literary craft and the power of storytelling.',
  requirements: [
    'Must register in advance',
    'Limited to 200 in-person attendees',
    'Virtual attendance available for unlimited participants',
    'Book signing tickets available separately',
  ],
  whatToBring: [
    'Your copy of any Ishiguro novel for signing (optional)',
    'Questions for the Q&A session',
    'Notebook for insights and inspiration',
  ],
  topics: ['Literary Fiction', 'Author Talk', 'Nobel Prize', 'Contemporary Literature', 'Book Discussion'],
  schedule: [
    { time: '7:00 PM', activity: 'Doors open & registration' },
    { time: '7:15 PM', activity: 'Welcome remarks and introduction' },
    { time: '7:30 PM', activity: 'Reading from "Klara and the Sun"' },
    { time: '7:50 PM', activity: 'Conversation with Kazuo Ishiguro' },
    { time: '8:40 PM', activity: 'Audience Q&A session' },
    { time: '9:10 PM', activity: 'Closing remarks' },
    { time: '9:15 PM', activity: 'Book signing (limited tickets)' },
  ],
  organizer: {
    name: 'Sarah Mitchell',
    initials: 'SM',
    title: 'Director of Literary Programs',
    bio: 'Sarah Mitchell has curated literary events for over 15 years, bringing celebrated authors to engaged audiences. She holds an MFA in Creative Writing and is passionate about fostering literary communities.',
    email: 'sarah.mitchell@literaryarts.org',
    phone: '+1 (212) 555-0147',
    avatar: '',
  },
};

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/event-detail`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

export default function EventDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();

  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [event, setEvent] = useState<EventData>(placeholderEvent);
  const [activeTab, setActiveTab] = useState<'details' | 'agenda' | 'organizer'>('details');
  const [isInterested, setIsInterested] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

        // Fetch event data by ID
        try {
          const eventRes: any = await eventsApi.getById(params.id as string);
          const e = eventRes?.data || eventRes;
          if (e && e._id) {
            const startDate = e.startDate ? new Date(e.startDate) : null;
            const endDate = e.endDate ? new Date(e.endDate) : null;
            const formatDate = (d: Date | null) =>
              d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
            const formatTime = (d: Date | null) =>
              d ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
            let duration = '';
            if (startDate && endDate) {
              const diffMs = endDate.getTime() - startDate.getTime();
              const diffHrs = diffMs / (1000 * 60 * 60);
              duration = diffHrs >= 1 ? `${diffHrs.toFixed(1).replace('.0', '')} hour${diffHrs !== 1 ? 's' : ''}` : `${Math.round(diffMs / 60000)} min`;
            }
            const organizer = e.organizer && typeof e.organizer === 'object' ? e.organizer : {};
            const orgName = organizer.name || 'Organizer';
            const rsvps: any[] = Array.isArray(e.rsvps) ? e.rsvps : [];
            setEvent({
              id: e._id,
              title: e.title || '',
              description: e.description || '',
              coverImage: e.coverImage || '',
              badges: [e.type].filter(Boolean),
              date: formatDate(startDate),
              time: startDate && endDate ? `${formatTime(startDate)} – ${formatTime(endDate)}` : formatTime(startDate),
              duration,
              venue: { name: e.venue || '', address: e.address || '', city: e.city || '' },
              format: e.type || '',
              category: e.type || '',
              bookingLink: e.bookingLink || '',
              attendees: rsvps.slice(0, 5).map((r: any) => ({
                id: r.user?._id || r._id || String(Math.random()),
                name: r.user?.name || 'Attendee',
                avatar: r.user?.profilePhoto || '',
              })),
              totalAttendees: rsvps.length,
              featuredBook: null,
              purpose: e.description || '',
              requirements: [],
              whatToBring: [],
              topics: [e.type].filter(Boolean),
              schedule: [],
              organizer: {
                name: orgName,
                initials: orgName.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
                title: organizer.title || '',
                bio: organizer.bio || '',
                email: organizer.email || '',
                phone: organizer.phone || '',
                avatar: organizer.profilePhoto || '',
              },
            });
          }
        } catch (evtErr) {
          console.warn('Could not load event, using placeholder:', evtErr);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const tabs = [
    { key: 'details' as const, label: content.tabs.eventDetails },
    { key: 'agenda' as const, label: content.tabs.agenda },
    { key: 'organizer' as const, label: content.tabs.organizer },
  ];

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      {/* Mobile Top Bar */}
      <MobileTopBar>
        <SearchBar
          asHeader
          placeholder="Search book by name, author..."
          onFilterOpenChange={() => {}}
          onApplyFilters={() => {}}
          onPickRandom={() => {}}
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
                  href={content.header.backHref}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#210C00]/70 hover:text-[#210C00] transition-colors mb-4 sm:mb-6"
                >
                  {content.header.backText}
                </Link>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Hero Banner */}
                    <div className="relative rounded-xl overflow-hidden h-48 sm:h-56 md:h-64 lg:h-72">
                      {/* Background Image or placeholder */}
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        {event.coverImage ? (
                          <img src={getImageUrl(event.coverImage)} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#60351B]/40">
                            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z"/>
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                      </div>

                      {/* Badges */}
                      <div className="absolute left-4 bottom-32 flex items-center gap-2">
                        {event.badges.map((badge, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-full ${
                              idx === 0
                                ? `bg-[#60351B] ${badge === 'Author Talk' ? 'text-[#F2F0E4] font-[590] font-sf text-[14px] leading-[20px]' : 'text-white'}`
                                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                            } ${badge === 'Hybrid' ? 'w-[79px] h-[30px] opacity-100 bg-[#FFFFFF33] gap-[10px] pt-[5px] pr-[16px] pb-[5px] pl-[16px]' : ''}`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      {/* Event Info */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2 line-clamp-2">
                          {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-white/80 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                            {event.date}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v6l4 2"/>
                            </svg>
                            {event.time}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* About This Event */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm shadow-[0px_8px_10px_-6px_#0000001A,0px_20px_25px_-5px_#0000001A] border border-[#210C00]/5">
                      <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-3">
                        {content.about.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#210C00]/70 leading-relaxed mb-5">
                        {event.description}
                      </p>

                      {/* Featured Book */}
                      {event.featuredBook && (
                        // make the featured book card a bit wider so it doesn't feel cramped
                        <div className="bg-[#60351B26] rounded-lg p-3 sm:p-4 flex gap-3 sm:gap-4 w-[280px] sm:w-[360px]">
                          {/* Book Cover */}
                          <div className="w-16 sm:w-20 flex-shrink-0">
                            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                              {event.featuredBook.coverImage ? (
                                <img
                                  src={event.featuredBook.coverImage}
                                  alt={event.featuredBook.title}
                                  className="w-full h-full object-cover shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A,7px_0px_4px_0px_#00000073_inset,0px_8px_10px_-6px_#0000001A,0px_20px_25px_-5px_#0000001A,-8px_11px_9px_0px_#00000078,0px_5px_5.3px_0px_#FFFFFF40,-24px_27px_22.4px_11px_#60351B2B]"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Book Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                            <Image src={readBookIcon} alt="" width={16} height={16} className="w-4 h-4" />
                            <p className="text-[14px] leading-[20px] text-[#210C00CC] font-normal tracking-normal font-sf">
                              {content.about.featuredBookLabel}
                            </p>
                          </div>
                            <h3 className="mb-0.5 text-[#210C00] text-[25px] leading-[100%] tracking-normal font-serif">
                              {event.featuredBook.title}
                            </h3>
                            <p className="text-xs text-[#210C00]/60 mb-2">- {event.featuredBook.author}</p>
                            <p className="mb-0 text-[11px] leading-[17px] tracking-normal align-middle text-[#3A1B08] font-normal font-sf">
                              {event.featuredBook.pages} pages • {event.featuredBook.binding} • {event.featuredBook.published}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tabs Section */}
                    <div className="bg-white rounded-xl shadow-sm shadow-[0px_8px_10px_-6px_#0000001A,0px_20px_25px_-5px_#0000001A] border border-[#210C00]/5 overflow-hidden">
                      {/* Tab Headers */}
                      <div className="flex border-b border-[#210C00]/10">
                        {tabs.map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 px-4 py-3 text-xs sm:text-sm font-medium transition-colors ${
                              activeTab === tab.key
                                ? 'bg-[#60351B] text-white'
                                : 'text-[#210C00]/60 hover:bg-[#210C00]/5'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div className="p-4 sm:p-6">
                        {/* Event Details Tab */}
                        {activeTab === 'details' && (
                          <div className="space-y-6">
                            {/* Purpose */}
                            <div>
                              <h3 className="flex items-center text-sm sm:text-base font-semibold text-[#210C00] mb-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0">
                                  <Image src={circleIcon} alt="" width={20} height={20} className="object-contain" />
                                </div>
                                {content.eventDetails.purposeTitle}
                              </h3>
                              <p className="text-xs sm:text-sm text-[#210C00]/70 leading-relaxed">
                                {event.purpose}
                              </p>
                            </div>

                            {/* Requirements */}
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-[#210C00] mb-3">
                                {content.eventDetails.requirementsTitle}
                              </h3>
                              <ul className="space-y-2">
                                {event.requirements.map((req, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#210C00]/70">
                                    <svg className="w-4 h-4 text-[#60351B] mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10"/>
                                      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* What to Bring */}
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-[#210C00] mb-3">
                                {content.eventDetails.whatToBringTitle}
                              </h3>
                              <ul className="space-y-2">
                                {event.whatToBring.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#210C00]/70">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#60351B] mt-1.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Topics */}
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-[#210C00] mb-3">
                                {content.eventDetails.topicsTitle}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {event.topics.map((topic, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 rounded-full bg-[#60351B26] text-xs text-[#210C00]/70 border-[0.8px] border-[#60351B1A]"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Agenda Tab */}
                        {activeTab === 'agenda' && (
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-[#210C00] mb-4">
                              {content.agenda.scheduleTitle}
                            </h3>
                            <div className="space-y-3">
                              {event.schedule.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                  <span className="w-20 flex-shrink-0 text-[16px] leading-[24px] tracking-normal font-[590] font-sf text-[#60351B]">
                                    {item.time}
                                  </span>
                                  <div className="flex-1 bg-[#60351B26] rounded-lg px-4 py-2.5 border-t-[0.8px] border-t-[#60351B1A]">
                                    <p className="text-xs sm:text-sm text-[#210C00]">{item.activity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Organizer Tab */}
                        {activeTab === 'organizer' && (
                          <div>
                            {/* Organizer Profile */}
                            <div className="flex items-start gap-4 mb-5">
                              {/* Avatar */}
                              <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center flex-shrink-0 bg-[linear-gradient(135deg,rgba(96,53,27,0.2)_0%,rgba(96,53,27,0.1)_100%)] shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A] opacity-100">
                                {event.organizer.avatar ? (
                                  <img src={event.organizer.avatar} alt={event.organizer.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-lg sm:text-xl font-semibold text-[#60351B]">
                                    {event.organizer.initials}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold text-[#210C00]">
                                  {event.organizer.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-[#D0744C] mb-2">
                                  {event.organizer.title}
                                </p>
                                <p className="text-xs sm:text-sm text-[#210C00]/70 leading-relaxed">
                                  {event.organizer.bio}
                                </p>
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 pt-4 border-t border-[#210C00]/10">
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#210C00]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                  <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <a href={`mailto:${event.organizer.email}`} className="text-xs sm:text-sm text-[#210C00]/70 hover:text-[#60351B]">
                                  {event.organizer.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#210C00]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                                </svg>
                                <a href={`tel:${event.organizer.phone}`} className="text-xs sm:text-sm text-[#210C00]/70 hover:text-[#60351B]">
                                  {event.organizer.phone}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Sidebar */}
                  <div className="space-y-4">
                    {/* Book Now Button – shown when bookingLink is set */}
                    {event.bookingLink && (
                      <a
                        href={event.bookingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 rounded-xl text-sm font-semibold text-center bg-[#D0744C] text-white hover:bg-[#B85F38] transition-colors shadow-sm"
                      >
                        🎫 Book Now / Get Tickets
                      </a>
                    )}

                    {/* Action Buttons */}
                    <div className="bg-white rounded-xl p-4 shadow-sm shadow-[0px_8px_10px_-6px_#0000001A,0px_20px_25px_-5px_#0000001A] border border-[#210C00]/5">
                      <button
                        onClick={() => setIsInterested(!isInterested)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors mb-3 ${
                          isInterested
                            ? 'bg-[#60351B] text-white'
                            : 'bg-[#60351B] text-white hover:bg-[#4A2518]'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={isInterested ? 'white' : 'currentColor'}>
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {content.actions.interestedButton}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-colors ${
                            isBookmarked
                              ? 'border-[#60351B] bg-[#60351B]/5 text-[#60351B]'
                              : 'border-[#210C00]/20 text-[#210C00]/70 hover:bg-[#210C00]/5'
                          }`}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                          </svg>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#210C00]/20 text-sm text-[#210C00]/70 hover:bg-[#210C00]/5 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Event Information */}
                    <div className="bg-white rounded-xl p-4 shadow-sm shadow-[0px_8px_10px_-6px_#0000001A,0px_20px_25px_-5px_#0000001A] border border-[#210C00]/5">
                      <h3 className="text-sm font-semibold text-[#210C00] mb-4">
                        {content.eventInfo.title}
                      </h3>

                      <div className="space-y-4">
                        {/* Date */}
                        <div className="flex items-start gap-3">
                          <svg className="w-4 h-4 text-[#60351B] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <path d="M16 2v4M8 2v4M3 10h18"/>
                          </svg>
                          <div>
                            <p className="text-[10px] text-[#210C00]/40">{content.eventInfo.dateLabel}</p>
                            <p className="text-[16px] leading-[24px] tracking-normal font-[590] font-sf text-[#210C00]">{event.date}</p>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-start gap-3">
                          <svg className="w-4 h-4 text-[#60351B] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          <div>
                            <p className="text-[10px] text-[#210C00]/40">{content.eventInfo.timeLabel}</p>
                            <p className="text-[16px] leading-[24px] tracking-normal font-[590] font-sf text-[#210C00]">{event.time}</p>
                            <p className="text-[10px] text-[#210C00]/50">{content.eventInfo.durationLabel} {event.duration}</p>
                          </div>
                        </div>

                        {/* Venue */}
                        <div className="flex items-start gap-3">
                          <svg className="w-4 h-4 text-[#60351B] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <div>
                            <p className="text-[10px] text-[#210C00]/40">{content.eventInfo.venueLabel}</p>
                            <p className="text-[16px] leading-[24px] tracking-normal font-[590] font-sf text-[#210C00]">{event.venue.name}</p>
                            <p className="text-[10px] text-[#210C00]/50">{event.venue.address}</p>
                            <p className="text-[10px] text-[#210C00]/50">{event.venue.city}</p>
                          </div>
                        </div>

                        {/* Format */}
                        <div className="flex items-start gap-3">
                          <svg className="w-4 h-4 text-[#60351B] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                          </svg>
                          <div>
                            <p className="text-[10px] text-[#210C00]/40">{content.eventInfo.formatLabel}</p>
                            <p className="text-[16px] leading-[24px] tracking-normal font-[590] font-sf text-[#210C00]">{event.format}</p>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="flex items-start gap-3">
                          <svg className="w-4 h-4 text-[#60351B] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                          </svg>
                          <div>
                            <p className="text-[10px] text-[#210C00]/40">{content.eventInfo.categoryLabel}</p>
                            <p className={`text-[16px] leading-[24px] tracking-normal font-[590] font-sf ${event.category === 'Author Talk' ? 'text-black' : 'text-[#D0744C]'}`}>{event.category}</p>
                          </div>
                        </div>
                      </div>

                      {/* View on Map */}
                      <button className="w-full mt-4 py-2.5 rounded-lg bg-[#60351B1A] hover:bg-[#60351B2A] transition-colors flex items-center justify-center gap-2">
                        <Image src={mapIcon} alt="map" width={16} height={16} className="w-4 h-4" />
                        <span className="font-sf font-[590] text-[16px] leading-[24px] tracking-normal text-center text-[#60351B]">
                          {content.eventInfo.viewOnMapButton}
                        </span>
                      </button>
                    </div>

                    {/* Attendees */}
                    <div className="bg-white rounded-xl p-4 shadow-sm shadow-[0px_8px_10px_-6px_#0000001A,0px_20px_25px_-5px_#0000001A] border border-[#210C00]/5">
                      <h3 className="text-sm font-semibold text-[#210C00] mb-3">
                        {content.attendees.title}
                      </h3>

                      {/* Attendee Avatars */}
                      <div className="flex items-center mb-3">
                        <div className="flex -space-x-2">
                          {event.attendees.slice(0, 4).map((attendee, idx) => (
                            <div
                              key={attendee.id}
                              className="w-8 h-8 rounded-full bg-[#D0C4B0] flex items-center justify-center border-2 border-white text-[10px] font-medium text-[#60351B]"
                            >
                              {attendee.avatar ? (
                                <img src={attendee.avatar} alt={attendee.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                attendee.name[0]
                              )}
                            </div>
                          ))}
                          {event.totalAttendees > 4 && (
                            <div className="w-8 h-8 rounded-full bg-[#60351B] flex items-center justify-center border-2 border-white text-[10px] font-medium text-white">
                              +{event.totalAttendees - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#210C00]/50">
                        {content.attendees.seeWhoText}
                      </p>
                    </div>
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
