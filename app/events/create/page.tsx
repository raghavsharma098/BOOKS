'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, getImageUrl } from '../../../lib/api';
import Sidebar from '../../components/Sidebar';
import SearchBar from '../../components/SearchBar';
import MobileTopBar from '../../components/MobileTopBar';
import MobileDrawer from '../../components/MobileDrawer';
import UserNavbar from '../../components/UserNavbar';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

// Placeholder images
import bellIcon from '../../../images/bell.png';


const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for dynamic page content from admin panel
interface PageContent {
  header: {
    backText: string;
    backHref: string;
    title: string;
    subtitle: string;
  };
  banner: {
    title: string;
    uploadText: string;
    recommendedSize: string;
    helperText: string;
  };
  eventType: {
    title: string;
    bookReading: { label: string; description: string };
    bookLaunch: { label: string; description: string };
    literaryFestival: { label: string; description: string };
    authorMeetup: { label: string; description: string };
    bookSigning: { label: string; description: string };
  };
  form: {
    eventTitleLabel: string;
    eventTitlePlaceholder: string;
    eventTitleHelper: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    descriptionHelper: string;
    dateLabel: string;
    timeLabel: string;
    cityLabel: string;
    cityPlaceholder: string;
    venueLabel: string;
    venuePlaceholder: string;
    venueHelper: string;
  };
  guidelines: {
    title: string;
    rules: string[];
  };
  navigation: {
    backButton: string;
    continueButton: string;
  };
  successModal: {
    title: string;
    description: string;
    dateLabel: string;
    locationLabel: string;
    timeLabel: string;
    redirectingText: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    backText: 'Back to Book Clubs',
    backHref: '/events',
    title: 'Create a Event',
    subtitle: 'Start a focused reading community around the books you love. Guide discussions, set the pace, and connect with thoughtful readers.',
  },
  banner: {
    title: 'Club Banner',
    uploadText: 'Upload Club Banner',
    recommendedSize: 'Recommended: 1200x400px, JPG or PNG',
    helperText: 'A banner image helps your club stand out and attract members',
  },
  eventType: {
    title: 'Event Type',
    bookReading: { label: 'Book Reading', description: 'Public reading and Q&A session' },
    bookLaunch: { label: 'Book Launch', description: 'Celebrate a new book release' },
    literaryFestival: { label: 'Literary Festival', description: 'Multi-author festival or conference' },
    authorMeetup: { label: 'Author Meetup', description: 'Intimate gathering with readers' },
    bookSigning: { label: 'Book Signing', description: 'Meet and greet with book signing' },
  },
  form: {
    eventTitleLabel: 'Event Title',
    eventTitlePlaceholder: 'e.g., An Evening with Ocean Vuong',
    eventTitleHelper: 'Choose a clear, descriptive title',
    descriptionLabel: 'Event Description',
    descriptionPlaceholder: 'Describe what attendees can expect, special highlights, and any important details...',
    descriptionHelper: 'Provide context and key details',
    dateLabel: 'Event Date',
    timeLabel: 'Event Time',
    cityLabel: 'City',
    cityPlaceholder: 'e.g., New York, San Francisco, Chicago',
    venueLabel: 'Venue & Address',
    venuePlaceholder: 'e.g., The Grand Bookstore, 523 Broadway',
    venueHelper: 'Include venue name and full address',
  },
  guidelines: {
    title: 'Event Guidelines',
    rules: [
      'Events must be book-related and relevant to the literary community',
      'Provide accurate and complete information for all fields',
      'Events on International listings - no promotional content or sales',
    ],
  },
  navigation: {
    backButton: 'Back',
    continueButton: 'Continue',
  },
  successModal: {
    title: 'Event Created Successfully!',
    description: 'Your event "{eventName}" has been published and is now live on the Events page.',
    dateLabel: 'Date',
    locationLabel: 'Location',
    timeLabel: 'Time',
    redirectingText: 'Redirecting to Events page...',
  },
};

// Event type options
type EventType = 'book-reading' | 'book-launch' | 'literary-festival' | 'author-meetup' | 'book-signing';

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/create-event`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

export default function CreateEventPage(): JSX.Element {
  const router = useRouter();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);

  // Form state
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [eventType, setEventType] = useState<EventType>('book-reading');
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // User data
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle banner upload
  function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle form submission
  async function handleSubmit() {
    setSubmitting(true);
    try {
      const formData = {
        title: eventTitle,
        description,
        eventType,
        date: eventDate,
        time: eventTime,
        city,
        venue,
        coverImage: bannerImage,
      };
      
      // await eventsApi.create(formData);
      console.log('Creating event:', formData);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/events');
      }, 3000);
    } catch (err) {
      console.error('Error creating event:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const eventTypes: { key: EventType; icon: React.ReactNode; label: string; description: string }[] = [
    {
      key: 'book-reading',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: content.eventType.bookReading.label,
      description: content.eventType.bookReading.description,
    },
    {
      key: 'book-launch',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: content.eventType.bookLaunch.label,
      description: content.eventType.bookLaunch.description,
    },
    {
      key: 'literary-festival',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      label: content.eventType.literaryFestival.label,
      description: content.eventType.literaryFestival.description,
    },
    {
      key: 'author-meetup',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      label: content.eventType.authorMeetup.label,
      description: content.eventType.authorMeetup.description,
    },
    {
      key: 'book-signing',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
      ),
      label: content.eventType.bookSigning.label,
      description: content.eventType.bookSigning.description,
    },
  ];

  // Format date for display
  function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
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
          <div>
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

              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00] mb-2">
                  {content.header.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#210C00]/60 max-w-xl leading-relaxed">
                  {content.header.subtitle}
                </p>
              </div>

              {/* Form Content */}
              <div className="space-y-6">
                  {/* Club Banner */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">
                      {content.banner.title}
                    </h2>
                    
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className="bg-[#60351B0D] border-2 border-dashed border-[#210C00]/20 rounded-lg p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#60351B]/50 transition-colors"
                    >
                      {bannerImage ? (
                        <img src={bannerImage} alt="Banner preview" className="max-h-40 rounded-lg object-contain" />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-[#210C00]/5 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-[#210C00]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-[#210C00] mb-1">{content.banner.uploadText}</p>
                          <p className="text-xs text-[#210C00]/50">{content.banner.recommendedSize}</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-[#210C00]/50 mt-3">{content.banner.helperText}</p>
                  </div>

                  {/* Event Type */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">
                      {content.eventType.title} <span className="text-red-500">*</span>
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {eventTypes.map((type) => (
                        <button
                          key={type.key}
                          onClick={() => setEventType(type.key)}
                          className={`flex flex-col items-start p-4 rounded-lg text-left transition-colors ${
                            eventType === type.key
                              ? 'bg-[#60351B]/10 border-2 border-[#60351B]'
                              : 'bg-[#210C00]/5 border-2 border-transparent hover:bg-[#210C00]/10'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            eventType === type.key ? 'bg-[#60351B] text-white' : 'bg-[#210C00]/10 text-[#210C00]/60'
                          }`}>
                            {type.icon}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-[#210C00]">{type.label}</p>
                          <p className="text-[9px] sm:text-[10px] text-[#210C00]/50 mt-0.5">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Details Form */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#210C00]/5 space-y-5">
                    {/* Event Title */}
                    <div>
                      <label className="block text-sm font-medium text-[#210C00] mb-2">
                        {content.form.eventTitleLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder={content.form.eventTitlePlaceholder}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#60351B0D] text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20"
                      />
                      <p className="text-[10px] text-[#210C00]/40 mt-1">{content.form.eventTitleHelper}</p>
                    </div>

                    {/* Event Description */}
                    <div>
                      <label className="block text-sm font-medium text-[#210C00] mb-2">
                        {content.form.descriptionLabel} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={content.form.descriptionPlaceholder}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#60351B0D] text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20 resize-none"
                      />
                      <p className="text-[10px] text-[#210C00]/40 mt-1">{content.form.descriptionHelper}</p>
                    </div>

                    {/* Date and Time Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Event Date */}
                      <div>
                        <label className="block text-sm font-medium text-[#210C00] mb-2">
                          {content.form.dateLabel} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#60351B0D] text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20"
                          />
                        </div>
                      </div>

                      {/* Event Time */}
                      <div>
                        <label className="block text-sm font-medium text-[#210C00] mb-2">
                          {content.form.timeLabel} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#60351B0D] text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-[#210C00] mb-2">
                        {content.form.cityLabel} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-[#210C00]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder={content.form.cityPlaceholder}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#60351B0D] text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20"
                        />
                      </div>
                    </div>

                    {/* Venue & Address */}
                    <div>
                      <label className="block text-sm font-medium text-[#210C00] mb-2">
                        {content.form.venueLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder={content.form.venuePlaceholder}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#60351B0D] text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20"
                      />
                      <p className="text-[10px] text-[#210C00]/40 mt-1">{content.form.venueHelper}</p>
                    </div>
                  </div>

                  {/* Event Guidelines */}
                  <div className="bg-[#FFFFFFB2] rounded-xl p-4 sm:p-5 border-[0.8px] border-[#60351B]">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#60351B26] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[#210C00] mb-2">
                          {content.guidelines.title}
                        </h3>
                        <ul className="space-y-1.5">
                          {content.guidelines.rules.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#210C00]/70">
                              <span className="text-[#60351B] mt-0.5">›</span>
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6 sm:mt-8">
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-sm text-[#210C00]/70 hover:text-[#210C00] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {content.navigation.backButton}
                  </Link>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !eventTitle || !description || !eventDate || !eventTime || !city || !venue}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2518] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : content.navigation.continueButton}
                    {!submitting && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          
          {/* Modal */}
          <div className="relative bg-[#D0C4B0] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#60351B] flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-semibold text-[#210C00] text-center mb-2">
              {content.successModal.title}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#210C00]/60 text-center mb-6">
              {content.successModal.description.replace('{eventName}', eventTitle || 'Ek Kitab Samaroh')}
            </p>

            {/* Stats */}
            <div className="bg-[#C4B8A4] rounded-xl p-4 flex items-center justify-center gap-6 sm:gap-8 mb-6">
              {/* Date */}
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full bg-white/50 flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#60351B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </div>
                <p className="text-[9px] sm:text-[10px] text-[#210C00]/50">{content.successModal.dateLabel}</p>
                <p className="text-xs sm:text-sm font-medium text-[#210C00]">{formatDate(eventDate) || 'Jan 1, 2026'}</p>
              </div>
              
              {/* Location */}
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full bg-white/50 flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#60351B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p className="text-[9px] sm:text-[10px] text-[#210C00]/50">{content.successModal.locationLabel}</p>
                <p className="text-xs sm:text-sm font-medium text-[#210C00]">{city || 'fghjkl'}</p>
              </div>
              
              {/* Time */}
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full bg-white/50 flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#60351B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <p className="text-[9px] sm:text-[10px] text-[#210C00]/50">{content.successModal.timeLabel}</p>
                <p className="text-xs sm:text-sm font-medium text-[#210C00]">{eventTime || '17:55'}</p>
              </div>
            </div>

            {/* Redirecting Text */}
            <p className="text-xs text-[#210C00]/40 text-center">
              {content.successModal.redirectingText}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
