'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import MobileDrawer from '../../components/MobileDrawer';
import SearchBar from '../../components/SearchBar';
import MobileTopBar from '../../components/MobileTopBar';
import UserNavbar from '../../components/UserNavbar';
import Image from 'next/image';
import readBookIcon from '../../../images/readbook.png';
import reviewIcon from '../../../icons/review.png';
import featuredIcon from '../../../icons/featured.png';
import bellIcon from '../../../images/bell.png';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import { userApi, getImageUrl } from '../../../lib/api';

// Toggle Switch Component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#60351B]' : 'bg-[#D4CFC4]'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

// Notification Item Component
function NotificationItem({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="relative w-full max-w-[1198.914px] mx-auto flex items-center justify-between h-[100.8px] px-[20px] py-0 border-b-[0.8px] border-b-[rgba(96,53,27,0.1)] last:border-b-0 opacity-100 -top-[0.2px] left-[0.8px] rotate-0">
      <div className="flex-1 min-w-0 pr-4 flex flex-col justify-center">
        <div className="text-sm sm:text-base font-medium text-[#210C00]">{title}</div>
        <div className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">{description}</div>
      </div>
      <div className="flex items-center">
        <Toggle checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-2 mt-6 first:mt-0">
      <div className="w-[36px] h-[36px] rounded-[16px] bg-[#60351B1A] flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-base sm:text-lg font-semibold text-[#60351B]">{title}</h2>
    </div>
  );
}

export default function NotificationsSettings(): JSX.Element {
  const router = useRouter();
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);

  // Notification settings state
  const [settings, setSettings] = useState({
    dailyReading: false,
    readingStreak: false,
    goalProgress: false,
    newDiscussions: false,
    repliesToComments: false,
    clubAnnouncements: false,
    readingSchedule: false,
    helpfulVotes: false,
    commentsOnReviews: false,
    authorResponses: false,
    personalizedPicks: true,
    newReleases: true,
    curatedCollections: false,
  });

  function updateSetting(key: keyof typeof settings, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    userApi.getProfile().then((res: any) => setUserData(res?.data || null)).catch(() => {});
  }, []);

  function handleDone() {
    // Save settings (placeholder)
    console.log('Saving notification settings:', settings);
    router.push('/settings');
  }

  return (
    <main className="min-h-screen bg-[#F2F0E4]">
      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* mobile top bar with search */}
      <MobileTopBar>
        <div className="flex-1">
          <SearchBar asHeader value={searchQuery} onChange={setSearchQuery} placeholder="Search books, author..." showFilters={true} />
        </div>
      </MobileTopBar>

      {/* Main Content */}
      <div className="w-full lg:ml-24">
        {/* Top Bar - Desktop/Tablet */}
        <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                <SearchBar asHeader value={searchQuery} onChange={setSearchQuery} placeholder="Search books, author..." showFilters={true} />
              </div>
              <UserNavbar />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-sf font-[590] text-[30px] leading-[36px] tracking-normal text-[rgba(33,12,0,1)] mb-1">Notifications</h1>
            <p className="font-sf font-normal text-[16px] leading-[26px] tracking-normal text-[rgba(33,12,0,0.7)] mb-6">Choose which notifications you'd like to receive. You can adjust these settings at any time.</p>

          {/* Reading Reminders */}
          <div className="flex items-center gap-3 mb-2 mt-6 first:mt-0">
            <div className="w-[36px] h-[36px] rounded-[16px] bg-[#60351B1A] flex items-center justify-center">
              <Image src={readBookIcon} alt="" width={20} height={20} className="rotate-0 opacity-100" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-[#60351B]">Reading Reminders</h2>
          </div>
          <div className="bg-white/70 rounded-xl border border-[#F0ECE6] px-4 sm:px-6 w-full max-w-[1400px] mx-auto">
            <NotificationItem title="Daily reading reminder" description="A gentle reminder to read at your preferred times" checked={settings.dailyReading} onChange={(v) => updateSetting('dailyReading', v)} />
            <NotificationItem title="Reading streak milestones" description="When you reach a new streak milestone" checked={settings.readingStreak} onChange={(v) => updateSetting('readingStreak', v)} />
            <NotificationItem title="Goal progress updates" description="Monthly updates on your reading goals" checked={settings.goalProgress} onChange={(v) => updateSetting('goalProgress', v)} />
          </div>

          {/* Book Club Updates */}
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            title="Book Club Updates"
          />
          <div className="bg-white/70 rounded-xl border border-[#F0ECE6] px-4 sm:px-6 w-full max-w-[1400px] mx-auto">
            <NotificationItem title="New discussions" description="When someone starts a new discussion in your clubs" checked={settings.newDiscussions} onChange={(v) => updateSetting('newDiscussions', v)} />
            <NotificationItem title="Replies to your comments" description="When someone replies to your discussion posts" checked={settings.repliesToComments} onChange={(v) => updateSetting('repliesToComments', v)} />
            <NotificationItem title="Club announcements" description="Important updates from club moderators" checked={settings.clubAnnouncements} onChange={(v) => updateSetting('clubAnnouncements', v)} />
            <NotificationItem title="Reading schedule reminders" description="Reminders for upcoming book club reading deadlines" checked={settings.readingSchedule} onChange={(v) => updateSetting('readingSchedule', v)} />
          </div>

          {/* Review Interactions */}
          <SectionHeader
            icon={<Image src={reviewIcon} alt="" width={20} height={20} />}
            title="Review Interactions"
          />
          <div className="bg-white/70 rounded-xl border border-[#F0ECE6] px-4 sm:px-6 w-full max-w-[1400px] mx-auto">
            <NotificationItem title="Helpful votes on your reviews" description="When readers find your reviews helpful" checked={settings.helpfulVotes} onChange={(v) => updateSetting('helpfulVotes', v)} />
            <NotificationItem title="Comments on your reviews" description="When someone comments on your book reviews" checked={settings.commentsOnReviews} onChange={(v) => updateSetting('commentsOnReviews', v)} />
            <NotificationItem title="Author responses" description="When an author responds to your review" checked={settings.authorResponses} onChange={(v) => updateSetting('authorResponses', v)} />
          </div>

          {/* Editorial Recommendations */}
          <SectionHeader
            icon={<Image src={featuredIcon} alt="" width={20} height={20} />}
            title="Editorial Recommendations"
          />
          <div className="bg-white/70 rounded-xl border border-[#F0ECE6] px-4 sm:px-6 w-full max-w-[1400px] mx-auto">
            <NotificationItem title="Personalized book picks" description="Weekly recommendations based on your reading" checked={settings.personalizedPicks} onChange={(v) => updateSetting('personalizedPicks', v)} />
            <NotificationItem title="New releases in your genres" description="When new books are published in genres you follow" checked={settings.newReleases} onChange={(v) => updateSetting('newReleases', v)} />
            <NotificationItem title="Curated collections" description="New editorial collections and reading lists" checked={settings.curatedCollections} onChange={(v) => updateSetting('curatedCollections', v)} />
          </div>

          {/* Footer note + Done button */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-[#6B6B6B]">Changes are saved automatically.</p>
            <button
              type="button"
              onClick={handleDone}
              className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-[#60351B] text-white font-medium hover:bg-[#4a2914] transition"
            >
              Done
            </button>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
