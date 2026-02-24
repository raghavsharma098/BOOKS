'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import MobileDrawer from '../../components/MobileDrawer';
import SearchBar from '../../components/SearchBar';
import MobileTopBar from '../../components/MobileTopBar';
import Image from 'next/image';
import bellIcon from '../../../images/bell.png';
import TopBar from '../../components/TopBar';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import { userApi } from '../../../lib/api';

// Placeholder data - would be fetched from admin panel API
const PLANS_PLACEHOLDER = {
  currentPlan: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    interval: 'forever',
    description: 'Upgrade to unlock premium features and enhance your reading experience',
  },
  availablePlans: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'forever',
      features: [
        'Track unlimited books',
        'Basic reading statistics',
        'Join up to 3 book clubs',
        'Access to book reviews',
        'Community discussions',
      ],
      isCurrent: true,
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      interval: 'month',
      features: [
        'Everything in Premium',
        'Author verification',
        'Create unlimited book clubs',
        'Host giveaways',
        'Advanced club analytics',
        'Custom reading challenges',
        'Early access to new features',
        'Dedicated support',
      ],
      isCurrent: false,
      recommended: true,
    },
  ],
};

export default function SubscriptionSettings(): JSX.Element {
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [plansData, setPlansData] = useState(PLANS_PLACEHOLDER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userApi.getProfile().then((res: any) => setUserData(res?.data || null)).catch(() => {});
    
    // TODO: Fetch plans from admin panel API
    // subscriptionApi.getPlans().then((res) => setPlansData(res?.data)).catch(() => {});
  }, []);

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      // TODO: Integrate with payment/subscription API
      console.log('Upgrading to plan:', planId);
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F0E4]">
      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* mobile top bar with search */}
      <TopBarWrapper>
        <div className="flex-1">
          <SearchBar asHeader value={searchQuery} onChange={setSearchQuery} placeholder="Search settings and help..." showFilters={true} />
        </div>
      </TopBarWrapper>

      <div className="lg:pl-[96px] px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 mt-14 sm:mt-0 pb-4 sm:py-6 md:py-8 lg:py-10 w-full max-w-[1220px] mx-auto">
        {/* Top bar with search + bell */}
        <TopBar
          query={searchQuery}
          setQuery={setSearchQuery}
          placeholder="Search settings and help..."
          filters={{}}
          setFilters={() => {}}
          pickRandomBook={() => {}}
          setSearchBarFilterOpen={() => {}}
        />


        {/* Page Title */}
        <div className="mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4 lg:px-0 text-center lg:text-left lg:-ml-16">
          <h1 className="text-[20px] xs:text-[22px] sm:text-[26px] md:text-[30px] font-sf font-[590] leading-[28px] sm:leading-[32px] md:leading-[36px] text-[rgba(33,12,0,1)] mb-1 sm:mb-2">Plans & Subscriptions</h1>
          <p className="text-[13px] sm:text-[14px] md:text-[16px] font-sf font-[400] leading-[20px] sm:leading-[24px] md:leading-[26px] tracking-[0px] text-[rgba(33,12,0,0.7)]">View your current plan and manage billing information</p>
        </div>

        {/* Current Plan Card */}
        <div className="w-full max-w-full sm:max-w-none lg:w-[1200px] mx-auto lg:mx-0 lg:-ml-16 bg-white rounded-lg sm:rounded-xl md:rounded-2xl border border-[#E8E4D9] p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs md:text-sm text-[#6B6B6B] mb-0.5 sm:mb-1">Current Plan</p>
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#210C00] mb-0.5 sm:mb-1 md:mb-2 truncate">
                {plansData.currentPlan.name}
              </h2>
              <p className="text-[11px] sm:text-xs md:text-sm text-[#6B6B6B] line-clamp-2">
                {plansData.currentPlan.description}
              </p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0 mt-2 sm:mt-0">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#210C00]">
                ${plansData.currentPlan.price}
              </div>
              <div className="text-[11px] sm:text-xs md:text-sm text-[#6B6B6B]">
                {plansData.currentPlan.interval}
              </div>
            </div>
          </div>
        </div>

        {/* Choose Your Plan Section */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#210C00] mb-0.5 sm:mb-1 md:mb-2">Choose Your Plan</h2>
          <p className="text-[11px] sm:text-xs md:text-sm text-[#6B6B6B]">Select the plan that best fits your reading journey</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 justify-center max-w-full sm:max-w-[900px] md:max-w-[1100px] mx-auto px-1 sm:px-2 lg:pl-32">
          {plansData.availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg sm:rounded-xl md:rounded-2xl border border-[0.8px] ${
                plan.isCurrent ? 'border-[#60351B]' : 'border-[#E8E4D9]'
              } p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col max-w-[360px] lg:max-w-[400px]`}
              style={{
                background: `linear-gradient(0deg, rgba(255,255,255,0.7), rgba(255,255,255,0.7)), linear-gradient(135deg, rgba(96,53,27,0.05) 0%, rgba(0,0,0,0) 100%)`,
              }}
            >
              {/* Current Badge */}
              {plan.isCurrent && (
                <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
                  <span className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full bg-[#60351B] text-white text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide">
                    Current
                  </span>
                </div>
              )}

              {/* Plan Icon */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-[rgba(96,53,27,0.08)] flex items-center justify-center mb-3 sm:mb-4 md:mb-5">
                {plan.id === 'free' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 md:w-6 md:h-6">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 md:w-6 md:h-6">
                    <path d="M2 4L5 7L8 3" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 4L19 7L22 3" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2V6" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5 12H19L17 22H7L5 12Z" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Plan Name */}
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[#210C00] mb-1 sm:mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="mb-3 sm:mb-4 md:mb-6">
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#210C00]">${plan.price}</span>
                <span className="text-[10px] sm:text-xs md:text-sm text-[#6B6B6B] ml-0.5 sm:ml-1">/{plan.interval}</span>
              </div>

              {/* Features List */}
              <ul className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-4 sm:mb-6 md:mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5 text-[#60351B] sm:w-4 sm:h-4 md:w-[16px] md:h-[16px]">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm text-[#6B6B6B]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                onClick={() => !plan.isCurrent && handleUpgrade(plan.id)}
                disabled={plan.isCurrent || loading}
                className={`w-full py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm lg:text-base font-medium transition-all ${
                  plan.isCurrent
                    ? 'bg-[#F0ECE6] text-[#60351B] cursor-default font-sf font-[590] text-[16px] leading-[24px] text-center'
                    : 'bg-gradient-to-b from-[#60351B] to-[#4A2816] text-white hover:opacity-90'
                }`}
              >
                {plan.isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 text-center px-2">
          <p className="text-[10px] sm:text-xs md:text-sm text-[#6B6B6B]">
            Need help choosing? <button className="text-[#60351B] font-medium hover:underline">Contact support</button>
          </p>
        </div>
      </div>
    </main>
  );
}
