'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import sideBarLogo from '../../images/side bar logo.png';
import homeIcon from '../../images/home.png';
import bookIcon from '../../images/book-icon.png';
import collectionIcon from '../../images/collection.png';
import communityIcon from '../../images/community.png';
import collection1Icon from '../../images/collection1.png';
import settingIcon from '../../images/setting.png';

type Props = {
  activeIcon?: string | null;
  setActiveIcon?: (id: string | null) => void;
};

export default function Sidebar({ activeIcon, setActiveIcon }: Props) {
  const pathname = usePathname();
  const [localActive, setLocalActive] = useState<string | null>(activeIcon ?? null);

  const currentActive = activeIcon ?? localActive;
  const toggleActive = (id: string) => {
    if (setActiveIcon) setActiveIcon(currentActive === id ? null : id);
    else setLocalActive((prev) => (prev === id ? null : id));
  };

  // treat certain routes (dashboard, add-book) as the "home" active state
  const effectiveActive = pathname?.includes('/dashboard') || pathname?.includes('/add-book')
    ? 'home'
    : pathname?.includes('/settings')
    ? 'settings'
    : pathname?.includes('/my-clubs')
    ? 'community'
    : pathname?.includes('/giveaways')
    ? 'collection'
    : currentActive;

  return (
    <aside
      role="navigation"
      aria-label="Left sidebar"
      className="hidden lg:flex flex-shrink-0 flex-col items-center fixed left-0 top-0 h-screen"
      style={{ width: 96, opacity: 1, zIndex: 70, borderRight: '0.3px solid rgba(0,0,0,1)', background: '#F2F0E4' }}
    >
      <Link href="/" aria-label="Homepage">
        <div style={{ position: 'absolute', left: '16.25px', top: '16px', width: 63.4921875, height: 56 }}>
          <Image src={sideBarLogo} alt="Sidebar logo" width={63.4921875} height={56} style={{ objectFit: 'contain' }} />
        </div>
      </Link>

      <div className="w-full flex flex-col items-center py-6 gap-4" style={{ marginTop: 100 }}>
        <Link href="/dashboard" aria-pressed={effectiveActive === 'home'} onClick={() => toggleActive('home')} className="group w-12 h-12 flex items-center justify-center relative">
          {effectiveActive === 'home' && (
            <span aria-hidden className="absolute inset-0 rounded-full bg-[#D0744C]" style={{ width: 40, height: 40, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
          )}
          <Image
            src={homeIcon}
            alt="Home"
            width={20}
            height={20}
            style={{
              objectFit: 'contain',
              // show a white icon when active so it contrasts on the orange background
              filter: effectiveActive === 'home' ? 'brightness(0) invert(1)' : 'brightness(0)',
              position: 'relative',
              zIndex: 1,
            }}
          />
        </Link>

        <Link href="/my-books" aria-pressed={effectiveActive === 'library'} onClick={() => toggleActive('library')} aria-label="Library" className="group w-12 h-12 flex items-center justify-center relative">
          {effectiveActive === 'library' && (
            <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 56, height: 56, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />
          )}
          <Image
            src={bookIcon}
            alt="Library"
            width={18}
            height={18}
            style={{ objectFit: 'contain', filter: effectiveActive === 'library' ? 'brightness(0) invert(1)' : undefined }}
          />
        </Link>

        <Link href="/giveaways" aria-pressed={effectiveActive === 'collection'} onClick={() => toggleActive('collection')} aria-label="Collection" className="group w-12 h-12 flex items-center justify-center relative">
          {effectiveActive === 'collection' && (
            <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 56, height: 56, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />
          )}
          <Image
            src={collectionIcon}
            alt="Collection"
            width={18}
            height={18}
            style={{ objectFit: 'contain', filter: effectiveActive === 'collection' ? 'brightness(0) invert(1)' : undefined }}
          />
        </Link>

        <Link href="/community" aria-pressed={effectiveActive === 'community'} onClick={() => toggleActive('community')} aria-label="Community" className="group w-12 h-12 flex items-center justify-center relative">
          {effectiveActive === 'community' && (
            <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 56, height: 56, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />
          )}
          <Image
            src={communityIcon}
            alt="Community"
            width={18}
            height={18}
            style={{ objectFit: 'contain', filter: effectiveActive === 'community' ? 'brightness(0) invert(1)' : undefined }}
          />
        </Link>

        <button aria-pressed={effectiveActive === 'collection-alt'} onClick={() => toggleActive('collection-alt')} aria-label="About" className="group w-12 h-12 flex items-center justify-center relative">
          {effectiveActive === 'collection-alt' && (
            <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 56, height: 56, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />
          )}
          <Image
            src={collection1Icon}
            alt="About"
            width={18}
            height={18}
            style={{ objectFit: 'contain', filter: effectiveActive === 'collection-alt' ? 'brightness(0) invert(1)' : undefined }}
          />
        </button>
      </div>

      <Link href="/settings" aria-pressed={effectiveActive === 'settings'} onClick={() => toggleActive('settings')} aria-label="Settings" className="group w-12 h-12 flex items-center justify-center text-white relative mt-auto mb-6" style={{ zIndex: 60 }}>
        {effectiveActive === 'settings' && (
          <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 56, height: 56, borderRadius: 9999, background: 'rgba(208,116,76,1)', zIndex: 0 }} />
        )}
        <Image
          src={settingIcon}
          alt="Settings"
          width={18}
          height={18}
          style={{ objectFit: 'contain', filter: effectiveActive === 'settings' ? 'brightness(0) invert(1)' : undefined }}
        />
      </Link>
    </aside>
  );
}
