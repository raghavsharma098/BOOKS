'use client';

import React from 'react';

type MobileMenuState = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  toggleMobileMenu: () => void;
  activeIcon: string | null;
  setActiveIcon: (id: string | null) => void;
};

const MobileMenuContext = React.createContext<MobileMenuState | undefined>(undefined);

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeIcon, setActiveIcon] = React.useState<string | null>('home');

  const toggleMobileMenu = React.useCallback(() => setMobileMenuOpen((s) => !s), []);

  return (
    <MobileMenuContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const ctx = React.useContext(MobileMenuContext);
  if (!ctx) throw new Error('useMobileMenu must be used within MobileMenuProvider');
  return ctx;
}
