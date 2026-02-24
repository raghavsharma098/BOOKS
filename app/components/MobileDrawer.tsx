'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import sideBarLogo from '../../images/side bar logo.png';
import homeIcon from '../../images/home.png';
import bookIcon from '../../images/book-icon.png';
import collectionIcon from '../../images/collection.png';
import communityIcon from '../../images/community.png';
import collection1Icon from '../../images/collection1.png';
import settingIcon from '../../images/setting.png';
import bellIcon from '../../images/bell.png';
import { UserNavbarMobile, UserNavbarHeader } from './UserNavbar';
import { userApi } from '../../lib/api';

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  activeIcon?: string | null;
  setActiveIcon?: (id: string | null) => void;
  /** When true, hides the fixed header bar (useful when page provides its own hamburger button) */
  hideHeader?: boolean;
};

export default function MobileDrawer({ isOpen, onToggle, activeIcon, setActiveIcon, hideHeader = false }: Props) {
  // Client-side viewport check: only mount on mobile (< 1024px).
  // Keeps CSS `lg:hidden` as a visual fallback but unmounts on desktop for
  // better performance and accessibility.
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);
  const [userData, setUserData] = useState<{ name?: string; profileImage?: string } | null>(null);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const res: any = await userApi.getProfile();
        setUserData(res?.data || null);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }
    fetchUser();
  }, []);

  React.useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile('matches' in e ? e.matches : mq.matches);
    update(mq);
    if (mq.addEventListener) mq.addEventListener('change', update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, []);

  // while we don't know the size, or if it's desktop, don't render the drawer
  if (isMobile === null || isMobile === false) return null;

  const navItems = [
    { icon: homeIcon, label: 'Home', id: 'home' },
    { icon: bookIcon, label: 'Discover', id: 'library' },
    { icon: collectionIcon, label: 'Collections', id: 'collection' },
    { icon: communityIcon, label: 'Community', id: 'community' },
    { icon: collection1Icon, label: 'About', id: 'about' },
  ];

  function handleNavClick(id: string) {
    setActiveIcon?.(id);
    onToggle();
    if (id === 'library') router.push('/my-books');
    if (id === 'community') router.push('/my-clubs');
    if (id === 'home') router.push('/dashboard');
    if (id === 'collection') router.push('/giveaways');
  }

  return (
    <div className="lg:hidden">
      {/* Mobile header bar (optional) */}
      {!hideHeader && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#F2F0E4] px-4 py-3 flex items-center justify-between border-b border-[#210c00]/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menu"
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#60351B]/10 transition-colors active:scale-95"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="#60351B" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <Image src={sideBarLogo} alt="Logo" width={40} height={36} className="object-contain" />
          </div>
          <UserNavbarHeader userData={userData} />
        </div>
      )}

      {/* Slide-out drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/30 drawer-backdrop"
          style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          role="dialog"
          aria-modal="true"
          onClick={onToggle}
        >
          <div
            className="relative z-[10000] w-3/4 max-w-[320px] h-full bg-[#F2F0E4] shadow-2xl flex flex-col"
            style={{ borderRight: '0.3px solid rgba(0,0,0,0.15)', animation: 'slideIn 250ms ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <Image src={sideBarLogo} alt="Logo" width={50} height={44} className="object-contain" />
              <button
                aria-label="Close menu"
                onClick={onToggle}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* User profile */}
            <UserNavbarMobile userData={userData} onAvatarClick={() => { router.push('/settings/account'); onToggle(); }} />

            {/* Navigation */}
            <nav className="flex flex-col gap-1 px-2 pt-4 flex-1">
              {navItems.map((item) => {
                const isActive = activeIcon === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-[#60351B]/10 transition-colors text-left"
                  >
                    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-[#D0744C]"
                          style={{ width: 40, height: 40, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                        />
                      )}
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={20}
                        height={20}
                        className="object-contain relative z-10"
                        style={{ filter: isActive ? 'brightness(0) invert(1)' : undefined }}
                      />
                    </div>
                    <span className={isActive ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Settings */}
            <div className="px-2 pb-6 border-t border-black/5 pt-2">
              <button
                onClick={() => handleNavClick('settings')}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-[#60351B]/10 transition-colors text-left w-full"
              >
                <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {activeIcon === 'settings' && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-[#D0744C]"
                      style={{ width: 40, height: 40, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    />
                  )}
                  <Image src={settingIcon} alt="Settings" width={20} height={20} className="object-contain relative z-10" style={{ filter: activeIcon === 'settings' ? 'brightness(0) invert(1)' : undefined }} />
                </div>
                <span className={activeIcon === 'settings' ? 'text-[#0C1421] font-semibold' : 'text-[#6B4A33]'}>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in animation keyframes */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes backdropFade {
          from {
            background-color: rgba(0,0,0,0);
            backdrop-filter: blur(0);
            -webkit-backdrop-filter: blur(0);
          }
          to {
            background-color: rgba(0,0,0,0.25);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
          }
        }

        .drawer-backdrop {
          animation: backdropFade 220ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}
