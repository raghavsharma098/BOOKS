"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import MobileTopBar from './MobileTopBar';

export default function TopBarWrapper({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  // hide on homepage, settings, or any public profile routes; those screens
  // either render their own header/back button or shouldn't have the bar.
  if (!pathname) return null;
  if (pathname === '/' || pathname.startsWith('/settings') || pathname.startsWith('/profile')) return null;
  return <MobileTopBar>{children}</MobileTopBar>;
}
