'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import bellIcon from '../../images/bell.png';
import { useMobileMenu } from '../contexts/MobileMenuContext';

interface MobileTopBarProps {
  /** optional center content (e.g. search bar) */
  children?: React.ReactNode;
}

export default function MobileTopBar({ children }: MobileTopBarProps) {
  const pathname = usePathname();
  const { toggleMobileMenu } = useMobileMenu();
  const router = useRouter();

  // mobile top bar is rendered on every route; parent may provide children or not
  if (!pathname) return null;
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-[80] bg-[#F2F0E4] px-3 py-2 border-b border-[#210c00]/5">
      <div className="max-w-5xl mx-auto flex items-center gap-2">
        {/* hamburger icon */}
        <button 
          aria-label="Open menu" 
          onClick={toggleMobileMenu} 
          className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/80 shadow-sm"
        >
          <svg className="w-5 h-5 sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* search bar occupies remaining space */}
        {children && <div className="flex-1 min-w-0">{children}</div>}

        {/* bell icon */}
        <button 
          aria-label="Notifications" 
          onClick={() => router.push('/notifications')}
          className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/80 shadow-sm"
        >
          <Image src={bellIcon} alt="Notifications" className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}
