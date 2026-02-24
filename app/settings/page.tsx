'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import MobileDrawer from '../components/MobileDrawer';
import SearchBar from '../components/SearchBar';
import MobileTopBar from '../components/MobileTopBar';
import UserNavbar from '../components/UserNavbar';
import Image from 'next/image';
import navarrow from '../../images/navarrow.png';
import bellIcon from '../../images/bell.png';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import { userApi, getImageUrl } from '../../lib/api';

export default function SettingsLanding(): JSX.Element {
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    userApi.getProfile().then((res: any) => setUserData(res?.data || null)).catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#F2F0E4]">
      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* mobile top bar with search */}
      <MobileTopBar>
        <div className="flex-1">
          <SearchBar asHeader value={searchQuery} onChange={setSearchQuery} placeholder="Search settings and help..." showFilters={true} />
        </div>
      </MobileTopBar>

      {/* Main Content */}
      <div className="w-full lg:ml-24">
        {/* Top Bar - Desktop/Tablet */}
        <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                <SearchBar asHeader value={searchQuery} onChange={setSearchQuery} placeholder="Search settings and help..." showFilters={true} />
              </div>
              <UserNavbar />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="w-full max-w-[300px] sm:max-w-none text-[24px] sm:text-[30px] leading-[32px] sm:leading-[36px] font-semibold tracking-normal text-[rgba(33,12,0,1)] font-sf">Manage Your Settings</h1>
              <p className="w-full max-w-[687px] text-[14px] sm:text-[18px] leading-6 sm:leading-7 font-normal tracking-normal text-[rgba(33,12,0,0.7)] font-sans mt-1">Customize your Compass experience to match your preferences</p>
            </div>

            <div className="grid gap-4 sm:gap-6">
              <Link href="/settings/account" className="block bg-[rgba(255,255,255,0.7)] rounded-xl sm:rounded-2xl min-h-[100px] sm:min-h-[129.6px] h-auto w-full max-w-[1220px] mx-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 shadow-sm border-[0.8px] border-[#F0ECE6] border-t-[rgba(96,53,27,0.2)] hover:shadow-lg transition">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#F6EDE6] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6B4A33] sm:w-5 sm:h-5">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="#6B4A33" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#6B4A33" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-[#210C00]">Account & Privacy</div>
              <div className="text-xs sm:text-sm text-[#6B6B6B] line-clamp-2">Manage your account details, privacy settings, and author verification</div>
            </div>
            <div className="text-[#A09080]"><Image src={navarrow} alt="navigate" width={10} height={10} className="inline-block" /></div>
          </Link>

          <Link href="/settings/subscription" className="block bg-[rgba(255,255,255,0.7)] rounded-xl sm:rounded-2xl min-h-[100px] sm:min-h-[129.6px] h-auto w-full max-w-[1220px] mx-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 shadow-sm border-[0.8px] border-[#F0ECE6] border-t-[rgba(96,53,27,0.2)] hover:shadow-lg transition">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#F6EDE6] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6B4A33] sm:w-5 sm:h-5">
                <rect x="3" y="7" width="18" height="12" rx="2" stroke="#6B4A33" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3v4" stroke="#6B4A33" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-[#210C00]">Plans & Subscription</div>
              <div className="text-xs sm:text-sm text-[#6B6B6B] line-clamp-2">View your current plan and manage billing information</div>
            </div>
            <div className="text-[#A09080]"><Image src={navarrow} alt="navigate" width={10} height={10} className="inline-block" /></div>
          </Link>

          <Link href="/settings/notifications" className="block bg-[rgba(255,255,255,0.7)] rounded-xl sm:rounded-2xl min-h-[100px] sm:min-h-[129.6px] h-auto w-full max-w-[1220px] mx-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 shadow-sm border-[0.8px] border-[#F0ECE6] border-t-[rgba(96,53,27,0.2)] hover:shadow-lg transition">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#F6EDE6] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6B4A33] sm:w-5 sm:h-5">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" stroke="#6B4A33" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#6B4A33" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-[#210C00]">Notifications</div>
              <div className="text-xs sm:text-sm text-[#6B6B6B] line-clamp-2">Control reading reminders and club updates</div>
            </div>
            <div className="text-[#A09080]"><Image src={navarrow} alt="navigate" width={10} height={10} className="inline-block" /></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
