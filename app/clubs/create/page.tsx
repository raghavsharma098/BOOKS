'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { bookClubsApi, userApi, booksApi, getImageUrl } from '../../../lib/api';
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
  steps: {
    basicInfo: string;
    selectBooks: string;
    structure: string;
    guidelines: string;
  };
  banner: {
    title: string;
    uploadText: string;
    recommendedSize: string;
    helperText: string;
  };
  logo: {
    title: string;
    uploadButtonText: string;
    logoTitle: string;
    logoDescription: string;
    recommendedSize: string;
  };
  basicInfo: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    nameHelperText: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    descriptionHelperText: string;
  };
  clubType: {
    title: string;
    emotionalTheme: {
      label: string;
      description: string;
    };
    genreBased: {
      label: string;
      description: string;
    };
    buddyRead: {
      label: string;
      description: string;
    };
    authorLed: {
      label: string;
      description: string;
    };
    editorialPick: {
      label: string;
      description: string;
    };
  };
  privacy: {
    title: string;
    public: {
      label: string;
      description: string;
    };
    private: {
      label: string;
      description: string;
    };
  };
  navigation: {
    backButton: string;
    continueButton: string;
    createButton: string;
  };
  selectBooks: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
  };
  structure: {
    title: string;
    subtitle: string;
    readingPaceLabel: string;
    relaxed: { label: string; description: string };
    moderate: { label: string; description: string };
    intensive: { label: string; description: string };
    discussionStructureLabel: string;
    chapterWise: { label: string; description: string };
  };
  guidelines: {
    title: string;
    subtitle: string;
    reminderTitle: string;
    rules: string[];
  };
  successModal: {
    title: string;
    description: string;
    booksLabel: string;
    publicLabel: string;
    membersLabel: string;
    redirectingText: string;
  };
}

// Default placeholders for admin panel content
const defaultContent: PageContent = {
  header: {
    backText: 'Back to Book Clubs',
    backHref: '/clubs',
    title: 'Create a Book Club',
    subtitle: 'Start a focused reading community around the books you love. Guide discussions, set the pace, and connect with thoughtful readers.',
  },
  steps: {
    basicInfo: 'Basic Info',
    selectBooks: 'Select Books',
    structure: 'Structure',
    guidelines: 'Guidelines',
  },
  banner: {
    title: 'Club Banner',
    uploadText: 'Upload Club Banner',
    recommendedSize: 'Recommended: 1200x400px, JPG or PNG',
    helperText: 'A banner image helps your club stand out and attract members',
  },
  logo: {
    title: 'Club Logo',
    uploadButtonText: 'Upload Logo',
    logoTitle: 'Club Logo or Icon',
    logoDescription: 'Upload a square logo or icon that represents your club. This will appear next to your club name.',
    recommendedSize: 'Recommended: 400x400px, PNG with transparent background',
  },
  basicInfo: {
    title: 'Basic Information',
    subtitle: 'Tell us about your book club and what makes it unique',
    nameLabel: 'Club Name',
    namePlaceholder: 'e.g., Navigating Grief Through Literature',
    nameHelperText: '50+ characters',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe the focus and goals of your book club. What will members explore together?',
    descriptionHelperText: 'Minimum 50 characters',
  },
  clubType: {
    title: 'Club Type',
    emotionalTheme: {
      label: 'Emotional Theme',
      description: 'Explore books through shared emotional experiences',
    },
    genreBased: {
      label: 'Genre-Based',
      description: 'Focus on a specific literary genre or style',
    },
    buddyRead: {
      label: 'Buddy Read',
      description: 'Read together at your own pace with peers',
    },
    authorLed: {
      label: 'Author-Led',
      description: 'Intimate discussions guided by the author',
    },
    editorialPick: {
      label: 'Editorial Pick',
      description: 'Curated by the Compass editorial team',
    },
  },
  privacy: {
    title: 'Privacy',
    public: {
      label: 'Public',
      description: 'Anyone can join and participate in discussions',
    },
    private: {
      label: 'Private',
      description: 'Members must request access to join',
    },
  },
  navigation: {
    backButton: 'Back',
    continueButton: 'Continue',
    createButton: 'Create Club',
  },
  selectBooks: {
    title: 'Select Books',
    subtitle: 'Choose one or more books your club will read together',
    searchPlaceholder: 'Search books by title or author...',
  },
  structure: {
    title: 'Reading Structure',
    subtitle: 'Optional: Set a pace and structure for your club (you can skip this step)',
    readingPaceLabel: 'Reading Pace',
    relaxed: { label: 'Relaxed', description: '1-2 chapters per week' },
    moderate: { label: 'Moderate', description: '3-4 chapters per week' },
    intensive: { label: 'Intensive', description: '5+ chapters per week' },
    discussionStructureLabel: 'Discussion Structure',
    chapterWise: { label: 'Enable Chapter-Wise Discussions', description: 'Create separate discussion threads for each chapter to keep conversations organized and spoiler-free' },
  },
  guidelines: {
    title: 'Club Guidelines',
    subtitle: 'Review and agree to community guidelines',
    reminderTitle: 'Club Guidelines Reminder',
    rules: [
      'All discussions must relate to the selected book(s)',
      'No private messaging between members',
      'Keep conversations focused and book-centered',
      'Respect different perspectives and interpretations',
      'Use spoiler warnings when discussing plot details',
    ],
  },
  successModal: {
    title: 'Book Club Created Successfully!',
    description: 'Your book club "{clubName}" has been created. Members can now join and start discussing the selected books.',
    booksLabel: 'Books',
    publicLabel: 'Public',
    membersLabel: 'Members',
    redirectingText: 'Redirecting to your book clubs...',
  },
};

// Fetch page content from admin panel
async function fetchPageContent(): Promise<PageContent> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/pages/create-club`, { cache: 'no-store' });
    if (!res.ok) return defaultContent;
    const data = await res.json();
    return { ...defaultContent, ...data };
  } catch {
    return defaultContent;
  }
}

// Club type options
type ClubType = 'emotional' | 'genre' | 'buddy' | 'author-led' | 'editorial';
type Privacy = 'public' | 'private';

// Placeholder books data removed — real books loaded from API

export default function CreateClubPage(): JSX.Element {
  const router = useRouter();
  const { activeIcon, setActiveIcon, toggleMobileMenu, mobileMenuOpen } = useMobileMenu();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Page content state (from admin panel)
  const [content, setContent] = useState<PageContent>(defaultContent);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [clubType, setClubType] = useState<ClubType>('emotional');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [bookSearch, setBookSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [readingPace, setReadingPace] = useState<'relaxed' | 'moderate' | 'intensive'>('intensive');
  const [chapterWiseDiscussions, setChapterWiseDiscussions] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // User data
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch books whenever step 2 is active or search changes
  useEffect(() => {
    if (currentStep !== 2) return;
    let cancelled = false;
    async function loadBooks() {
      setBooksLoading(true);
      try {
        const res: any = await booksApi.getAll({ search: bookSearch || undefined, limit: 48 });
        if (!cancelled) setAvailableBooks(res?.data || res?.books || []);
      } catch {
        if (!cancelled) setAvailableBooks([]);
      } finally {
        if (!cancelled) setBooksLoading(false);
      }
    }
    const t = setTimeout(loadBooks, bookSearch ? 400 : 0);
    return () => { cancelled = true; clearTimeout(t); };
  }, [currentStep, bookSearch]);

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
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle logo upload
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Map UI club type values to backend enum values
  function mapClubType(ct: ClubType): string {
    const map: Record<ClubType, string> = {
      emotional: 'emotional',
      genre: 'genre',
      buddy: 'buddy_read',
      'author-led': 'author_led',
      editorial: 'editorial_pick',
    };
    return map[ct] ?? ct;
  }

  // Handle form submission
  async function handleSubmit() {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (!clubName.trim()) {
      alert('Please enter a club name.');
      setCurrentStep(1);
      return;
    }
    if (!description.trim()) {
      alert('Please enter a club description.');
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', clubName.trim());
      fd.append('description', description.trim());
      fd.append('clubType', mapClubType(clubType));
      fd.append('privacy', privacy);
      fd.append('discussionStructure', chapterWiseDiscussions ? 'chapter_wise' : 'open');
      selectedBooks.forEach((bookId) => fd.append('selectedBooks', bookId));
      if (bannerFile) fd.append('coverImage', bannerFile);
      if (logoFile) fd.append('clubLogo', logoFile);

      await bookClubsApi.create(fd);

      // Show pending-approval success modal
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error creating club:', err);
      alert(err?.message || 'Failed to create club. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { num: 1, label: content.steps.basicInfo },
    { num: 2, label: content.steps.selectBooks },
    { num: 3, label: content.steps.structure },
    { num: 4, label: content.steps.guidelines },
  ];

  const clubTypes: { key: ClubType; icon: React.ReactNode; label: string; description: string; active?: boolean }[] = [
    {
      key: 'emotional',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      label: content.clubType.emotionalTheme.label,
      description: content.clubType.emotionalTheme.description,
      active: true,
    },
    {
      key: 'genre',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: content.clubType.genreBased.label,
      description: content.clubType.genreBased.description,
    },
    {
      key: 'buddy',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: content.clubType.buddyRead.label,
      description: content.clubType.buddyRead.description,
    },
    {
      key: 'author-led',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: content.clubType.authorLed.label,
      description: content.clubType.authorLed.description,
    },
    {
      key: 'editorial',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: content.clubType.editorialPick.label,
      description: content.clubType.editorialPick.description,
    },
  ];

  const privacyOptions: { key: Privacy; icon: React.ReactNode; label: string; description: string }[] = [
    {
      key: 'public',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: content.privacy.public.label,
      description: content.privacy.public.description,
    },
    {
      key: 'private',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: content.privacy.private.label,
      description: content.privacy.private.description,
    },
  ];

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

                {/* Step Indicator */}
                <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-[#210C00]/5 mb-4 sm:mb-6 lg:mb-8 overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[280px]">
                    {steps.map((step, idx) => (
                      <React.Fragment key={step.num}>
                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                          <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-medium flex-shrink-0 ${
                            currentStep >= step.num
                              ? 'bg-[#60351B] text-white'
                              : 'bg-[#210C00]/10 text-[#210C00]/50'
                          }`}>
                            {currentStep > step.num ? (
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              step.num
                            )}
                          </div>
                          <span className={`text-[9px] sm:text-xs md:text-sm font-medium text-center sm:text-left whitespace-nowrap ${
                            currentStep >= step.num ? 'text-[#210C00]' : 'text-[#210C00]/50'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {idx < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 sm:mx-2 md:mx-4 min-w-[12px] sm:min-w-[20px] ${
                            currentStep > step.num ? 'bg-[#60351B]' : 'bg-[#210C00]/10'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Club Banner */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-[#210C00]/5">
                      <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[#210C00] mb-3 sm:mb-4">
                        {content.banner.title}
                      </h2>
                      
                      <div
                        onClick={() => bannerInputRef.current?.click()}
                        className="border-2 border-dashed border-[#210C00]/20 rounded-lg p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#60351B]/50 transition-colors"
                      >
                        {bannerImage ? (
                          <img src={bannerImage} alt="Banner preview" className="max-h-32 sm:max-h-40 rounded-lg object-contain w-full" />
                        ) : (
                          <>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#210C00]/5 flex items-center justify-center mb-2 sm:mb-3">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#210C00]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-[#210C00] mb-1 text-center">{content.banner.uploadText}</p>
                            <p className="text-[10px] sm:text-xs text-[#210C00]/50 text-center">{content.banner.recommendedSize}</p>
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

                    {/* Club Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-[#210C00]/5">
                      <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[#210C00] mb-3 sm:mb-4">
                        {content.logo.title}
                      </h2>
                      
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                        <div
                          onClick={() => logoInputRef.current?.click()}
                          className="w-20 h-20 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg border-2 border-dashed border-[#210C00]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#60351B]/50 transition-colors overflow-hidden flex-shrink-0"
                        >
                          {logoImage ? (
                            <img src={logoImage} alt="Logo preview" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#210C00]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <path d="M21 15l-5-5L5 21"/>
                              </svg>
                              <span className="text-[8px] sm:text-[9px] text-[#210C00]/40 mt-1">{content.logo.uploadButtonText}</span>
                            </>
                          )}
                        </div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-xs sm:text-sm font-medium text-[#210C00] mb-1">{content.logo.logoTitle}</h3>
                          <p className="text-[10px] sm:text-xs text-[#210C00]/60 leading-relaxed mb-1">
                            {content.logo.logoDescription}
                          </p>
                          <p className="text-[9px] sm:text-[10px] text-[#210C00]/40">{content.logo.recommendedSize}</p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-[#210C00]/5">
                      <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[#210C00] mb-1">
                        {content.basicInfo.title}
                      </h2>
                      <p className="text-[10px] sm:text-xs text-[#210C00]/50 mb-4 sm:mb-5">{content.basicInfo.subtitle}</p>

                      <div className="space-y-4 sm:space-y-5">
                        {/* Club Name */}
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-[#210C00] mb-1.5 sm:mb-2">
                            {content.basicInfo.nameLabel}
                          </label>
                          <input
                            type="text"
                            value={clubName}
                            onChange={(e) => setClubName(e.target.value)}
                            placeholder={content.basicInfo.namePlaceholder}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#60351B0D] text-xs sm:text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20"
                          />
                          <p className="text-[9px] sm:text-[10px] text-[#210C00]/40 mt-1">{content.basicInfo.nameHelperText}</p>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-[#210C00] mb-1.5 sm:mb-2">
                            {content.basicInfo.descriptionLabel}
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={content.basicInfo.descriptionPlaceholder}
                            rows={4}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#60351B0D] text-xs sm:text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20 resize-none"
                          />
                          <p className="text-[9px] sm:text-[10px] text-[#210C00]/40 mt-1">{content.basicInfo.descriptionHelperText}</p>
                        </div>
                      </div>

                      {/* Club Type */}
                      <div className="mt-5 sm:mt-6">
                        <h3 className="text-xs sm:text-sm font-medium text-[#210C00] mb-2 sm:mb-3">{content.clubType.title}</h3>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                          {clubTypes.map((type) => (
                            <button
                              key={type.key}
                              onClick={() => setClubType(type.key)}
                              className={`flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-left transition-colors ${
                                clubType === type.key
                                  ? 'bg-[#60351B] text-white'
                                  : 'bg-[#210C00]/5 text-[#210C00] hover:bg-[#210C00]/10'
                              }`}
                            >
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                clubType === type.key ? 'bg-white/20' : 'bg-[#210C00]/10'
                              }`}>
                                {type.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] xs:text-xs sm:text-sm font-medium leading-tight">{type.label}</p>
                                <p className={`text-[9px] xs:text-[10px] sm:text-xs leading-tight mt-0.5 ${
                                  clubType === type.key ? 'text-white/70' : 'text-[#210C00]/50'
                                }`}>
                                  {type.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Privacy */}
                      <div className="mt-5 sm:mt-6">
                        <h3 className="text-xs sm:text-sm font-medium text-[#210C00] mb-2 sm:mb-3">{content.privacy.title}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {privacyOptions.map((option) => (
                            <button
                              key={option.key}
                              onClick={() => setPrivacy(option.key)}
                              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors ${
                                privacy === option.key
                                  ? 'bg-[#60351B]/10 border-2 border-[#60351B]'
                                  : 'bg-[#210C00]/5 border-2 border-transparent'
                              }`}
                            >
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                privacy === option.key ? 'bg-[#60351B] text-white' : 'bg-[#210C00]/10 text-[#210C00]/60'
                              }`}>
                                {option.icon}
                              </div>
                              <div className="text-left">
                                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-[#210C00]">{option.label}</p>
                                <p className="text-[9px] sm:text-[10px] md:text-xs text-[#210C00]/50">{option.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Select Books */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-[#210C00]/5">
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[#210C00] mb-1">
                      {content.selectBooks?.title || 'Select Books'}
                    </h2>
                    <p className="text-[10px] sm:text-xs md:text-sm text-[#210C00]/60 mb-4 sm:mb-5">
                      {content.selectBooks?.subtitle || 'Choose one or more books your club will read together'}
                    </p>

                    {/* Search Input */}
                    <div className="relative mb-4 sm:mb-6">
                      <div className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#210C00]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)}
                        placeholder={content.selectBooks?.searchPlaceholder || 'Search books by title or author...'}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg bg-[#60351B0D] text-xs sm:text-sm text-[#210C00] placeholder-[#210C00]/40 outline-none focus:ring-2 focus:ring-[#60351B]/20"
                      />
                    </div>

                    {/* Books Grid */}
                    {booksLoading ? (
                      <div className="flex items-center justify-center py-10 sm:py-16">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-[#60351B]" />
                      </div>
                    ) : availableBooks.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-[#210C00]/40">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z"/></svg>
                        <p className="text-xs sm:text-sm">{bookSearch ? `No books found for "${bookSearch}"` : 'No books available yet.'}</p>
                      </div>
                    ) : (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                      {availableBooks.map((book) => {
                        const bookId = book._id;
                        const authorName = typeof book.author === 'string' ? book.author : book.author?.name || '';
                        const isSelected = selectedBooks.includes(bookId);
                        return (
                        <button
                          key={bookId}
                          onClick={() => {
                            setSelectedBooks(prev =>
                              prev.includes(bookId)
                                ? prev.filter(id => id !== bookId)
                                : [...prev, bookId]
                            );
                          }}
                          className={`group relative flex flex-col text-left transition-all ${isSelected ? 'scale-[0.98]' : ''}`}
                        >
                          {/* Book Cover */}
                          <div className={`relative aspect-[2/3] rounded-md sm:rounded-lg overflow-hidden mb-1.5 sm:mb-2 border-2 transition-colors ${
                            isSelected
                              ? 'border-[#D0744C] shadow-lg shadow-[#D0744C]/20'
                              : 'border-transparent hover:border-[#D0744C]/50'
                          }`}>
                            {book.coverImage ? (
                              <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#D0744C]/20 to-[#60351B]/30 flex items-center justify-center">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#210C00]/20" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-8-4-8 4z"/>
                                </svg>
                              </div>
                            )}
                            {/* Selected Checkmark */}
                            {isSelected && (
                              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-[#D0744C] flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Book Info */}
                          <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-[#210C00] line-clamp-1">{book.title}</p>
                          <p className="text-[8px] sm:text-[9px] md:text-[10px] text-[#D0744C] line-clamp-1">{authorName}</p>
                        </button>
                        );
                      })}
                    </div>
                    )}

                    {/* Selected Count */}
                    {selectedBooks.length > 0 && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#210C00]/10">
                        <p className="text-[10px] sm:text-xs md:text-sm text-[#210C00]/60">
                          <span className="font-medium text-[#60351B]">{selectedBooks.length}</span> book{selectedBooks.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Structure */}
                {currentStep === 3 && (
                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-[#210C00]/5">
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[#210C00] mb-1">
                      {content.structure?.title || 'Reading Structure'}
                    </h2>
                    <p className="text-[10px] sm:text-xs md:text-sm text-[#210C00]/60 mb-4 sm:mb-6">
                      {content.structure?.subtitle || 'Optional: Set a pace and structure for your club (you can skip this step)'}
                    </p>

                    {/* Reading Pace */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-[#210C00] mb-2 sm:mb-3">
                        {content.structure?.readingPaceLabel || 'Reading Pace'}
                      </h3>
                      <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { key: 'relaxed' as const, label: content.structure?.relaxed?.label || 'Relaxed', description: content.structure?.relaxed?.description || '1-2 chapters per week' },
                          { key: 'moderate' as const, label: content.structure?.moderate?.label || 'Moderate', description: content.structure?.moderate?.description || '3-4 chapters per week' },
                          { key: 'intensive' as const, label: content.structure?.intensive?.label || 'Intensive', description: content.structure?.intensive?.description || '5+ chapters per week' },
                        ].map((pace) => (
                          <button
                            key={pace.key}
                            onClick={() => setReadingPace(pace.key)}
                            className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-center transition-colors ${
                              readingPace === pace.key
                                ? 'bg-[#60351B] text-white'
                                : 'bg-[#210C00]/5 text-[#210C00] hover:bg-[#210C00]/10'
                            }`}
                          >
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium">{pace.label}</p>
                            <p className={`text-[9px] sm:text-[10px] md:text-xs mt-0.5 ${readingPace === pace.key ? 'text-white/70' : 'text-[#210C00]/50'}`}>
                              {pace.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Discussion Structure */}
                    <div>
                      <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-[#210C00] mb-2 sm:mb-3">
                        {content.structure?.discussionStructureLabel || 'Discussion Structure'}
                      </h3>
                      <div className="bg-[#210C00]/5 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          {/* Toggle Switch */}
                          <button
                            onClick={() => setChapterWiseDiscussions(!chapterWiseDiscussions)}
                            className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              chapterWiseDiscussions ? 'bg-[#60351B]' : 'bg-[#210C00]/20'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                chapterWiseDiscussions ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <div className="flex-1">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-[#210C00]">
                              {content.structure?.chapterWise?.label || 'Enable Chapter-Wise Discussions'}
                            </p>
                            <p className="text-[9px] sm:text-[10px] md:text-xs text-[#210C00]/60 mt-0.5 sm:mt-1">
                              {content.structure?.chapterWise?.description || 'Create separate discussion threads for each chapter to keep conversations organized and spoiler-free'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Guidelines */}
                {currentStep === 4 && (
                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-[#210C00]/5">
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[#210C00] mb-1">
                      {content.guidelines?.title || 'Club Guidelines'}
                    </h2>
                    <p className="text-[10px] sm:text-xs md:text-sm text-[#210C00]/60 mb-4 sm:mb-6">
                      {content.guidelines?.subtitle || 'Review and agree to community guidelines'}
                    </p>

                    {/* Guidelines Reminder Card */}
                    <div className="border border-[#210C00]/10 rounded-lg p-3 sm:p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#210C00]/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#210C00]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 className="text-xs sm:text-sm font-medium text-[#210C00]">
                          {content.guidelines?.reminderTitle || 'Club Guidelines Reminder'}
                        </h3>
                      </div>

                      <ul className="space-y-2 sm:space-y-2.5">
                        {(content.guidelines?.rules || [
                          'All discussions must relate to the selected book(s)',
                          'No private messaging between members',
                          'Keep conversations focused and book-centered',
                          'Respect different perspectives and interpretations',
                          'Use spoiler warnings when discussing plot details',
                        ]).map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-[#210C00]/70">
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#210C00]/40 mt-1.5 flex-shrink-0" />
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-5 sm:mt-6 lg:mt-8">
                  <button
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/clubs')}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-[#210C00]/70 hover:text-[#210C00] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {content.navigation.backButton}
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg bg-[#60351B] text-white text-xs sm:text-sm font-medium hover:bg-[#4A2518] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : currentStep === 4 ? content.navigation.createButton : content.navigation.continueButton}
                    {!submitting && currentStep < 4 && (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
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
              Club Submitted for Review!
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#210C00]/60 text-center mb-6">
              Your book club &ldquo;{clubName}&rdquo; has been submitted and is pending approval. It will be visible to other members once our team reviews it.
            </p>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-center">
              <p className="text-xs text-amber-800 font-medium">⏳ Pending Approval</p>
              <p className="text-[11px] text-amber-700 mt-1">
                You can track the status of your club under <strong>My Clubs</strong>.
              </p>
            </div>

            {/* Go to My Clubs button */}
            <button
              onClick={() => router.push('/my-clubs')}
              className="w-full py-2.5 bg-[#60351B] text-white rounded-xl text-sm font-medium hover:bg-[#4a2814] transition-colors"
            >
              View My Clubs
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
