'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logoImg from './images/logo story book 3 2.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Handle scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onClick(e: MouseEvent) {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onClick);
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [mobileMenuOpen]);

  // Auto-focus first menu item when opened
  useEffect(() => {
    if (mobileMenuOpen) {
      const first = menuRef.current?.querySelector<HTMLElement>('a,button');
      first?.focus();
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'nav-home', label: 'Home', href: '/' },
    { id: 'nav-discover', label: 'Discover', href: '/login' },
    { id: 'nav-collections', label: 'Collections', href: '/login' },
    { id: 'nav-reviews', label: 'Reviews', href: '/reviews' },
    { id: 'nav-about', label: 'About', href: '/about' },
  ];

  const handleNavClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Main Navbar */}
      <header 
        ref={navRef}
        className="w-full border-b border-[#60351B]/10 sticky top-0 z-40 transition-all duration-300"
      >
        <div className="w-full px-6 sm:px-4 md:px-12 lg:px-16">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            {/* Logo - Larger with reduced spacing */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center transition-opacity hover:opacity-80 ">
                <Image 
                  src={logoImg} 
                  alt="StoryBook Logo" 
                  width={120}
                  height={56}
                  className="h-20 sm:h-24 w-auto py-6"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center flex-1 justify-center gap-6 lg:gap-8 xl:gap-10 ml-8">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="text-sm lg:text-base text-[#210C00]/75 hover:text-[#60351B] font-medium transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#60351B] group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
              <Link
                href="/login"
                className="px-4 py-2.5 text-sm md:text-base font-medium border-2 border-[#60351B] text-[#60351B] rounded-lg hover:bg-[#60351B]/5 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2.5 text-sm md:text-base font-medium bg-[#60351B] text-white rounded-lg hover:bg-[#4a2715] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button - Optimized Hamburger */}
            <button
              ref={buttonRef}
              id="mobile-menu-button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg hover:bg-[#210C00]/10 transition-colors duration-200 flex items-center justify-center"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`text-[#210C00] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}
              >
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Optimized */}
        <div 
          id="mobile-menu" 
          ref={menuRef}
          className={`md:hidden overflow-hidden border-t border-[#60351B]/10 bg-white transition-all duration-300 ease-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="px-3 sm:px-4 pt-12 pb-2 space-y-1" style={{marginTop:"4px"}}>
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={handleNavClick}
                className="block px-4 py-3 text-base text-[#210C00]/75 hover:bg-[#60351B]/10 hover:text-[#60351B] rounded-lg transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#60351B]/10 space-y-3 px-2">
              <Link
                href="/login"
                onClick={handleNavClick}
                className="block w-full px-4 py-3 text-center text-base font-medium border-2 border-[#60351B] text-[#60351B] rounded-lg hover:bg-[#60351B]/5 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={handleNavClick}
                className="block w-full px-4 py-3 text-center text-base font-medium bg-[#60351B] text-white rounded-lg hover:bg-[#4a2715] transition-all duration-200 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Sticky Compact Navbar (appears on scroll) */}
      {scrolled && (
        <div className="fixed top-0 left-0 right-0 z-30 animate-slideDown">
          <div className="w-full bg-[#60351B] backdrop-blur-md border-b border-[#60351B]/15 shadow-lg">
            <div className="w-full px-6 sm:px-4 md:px-12 lg:px-16">
              <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
                {/* Logo - Larger with reduced spacing */}
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                    <Image 
                      src={logoImg} 
                      alt="StoryBook Logo" 
                      width={120}
                      height={56}
                      className="h-20 sm:h-24 w-auto py-6"
                      priority
                    />
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center flex-1 justify-center gap-6 lg:gap-8 xl:gap-10 ml-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      className="text-sm lg:text-base text-[#FFFFFF]/75 hover:text-[#FFFFFF] font-medium transition-colors duration-200 relative group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#60351B] group-hover:w-full transition-all duration-300" />
                    </Link>
                  ))}
                </nav>

                {/* Desktop CTA Buttons */}
                <div className="hidden sm:flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                  <Link
                    href="/login"
                    className="px-4 py-2.5 text-sm md:text-base font-medium border-2 border-[#FFFFFF] text-[#60351B] rounded-lg bg-[#FFFFFF] hover:bg-[#FFFFFF]/80 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2.5 text-sm md:text-base font-medium bg-[#000000] text-white rounded-lg hover:bg-[#000000]/80 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Get Started
                  </Link>
                </div>

                {/* Mobile Menu Button - Optimized Hamburger */}
                <button
                  ref={buttonRef}
                  id="mobile-menu-button"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-lg hover:bg-[#210C00]/10 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`text-[#210C00] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}
                  >
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
