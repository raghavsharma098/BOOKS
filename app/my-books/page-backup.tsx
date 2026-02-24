'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import MobileDrawer from '../components/MobileDrawer';
import bellIcon from '../../images/bell.png';
import user2 from '../../images/human.png';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import bookCoverMain from '../../images/Book cover (7).png';
import pencilIcon from '../../images/pencil.png';
import engagingIcon from '../../images/engaging.png';
import steadyIcon from '../../images/steady.png';
import emotionalIcon from '../../images/emotional.png';

export default function MyBooksPage(): JSX.Element {
  const [query, setQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<string[]>(['Fiction', 'To read']);

  // Sidebar / mobile menu state comes from MobileMenuContext
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();

  // determine active tab from the current pathname so the correct tab
  // (e.g. "Currently reading") appears brown when its route is open
  const pathname = usePathname();
  const activeTabIndex = pathname?.includes('/my-books/currently-reading') ? 1 : pathname?.includes('/my-books/completed') ? 2 : 0;

  const topBarRef = useRef<HTMLDivElement | null>(null);

  // Log Session modal state + refs
  const [logSessionOpen, setLogSessionOpen] = useState(false);
  const logSessionRef = useRef<HTMLDivElement | null>(null);

  function removeFilter(filter: string) { setFilters((prev) => prev.filter((f) => f !== filter)); }

  function pickRandomBook() {
    const POOL = ['The Cambers of Secrets', 'The Remains of the Day', 'Little Women', 'The Merge'];
    const rnd = POOL[Math.floor(Math.random() * POOL.length)];
    setQuery(rnd);
  }

  // lock page scroll while Log Session modal is open (compensate scrollbar)
  useEffect(() => {
    if (!logSessionOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarCompensation = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarCompensation > 0) document.body.style.paddingRight = `${scrollBarCompensation}px`;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || '';
      document.body.style.paddingRight = prevPaddingRight || '';
    };
  }, [logSessionOpen]);

  // focus-trap + Escape-to-close for Log Session modal
  useEffect(() => {
    if (!logSessionOpen) return;
    const modal = logSessionRef.current;
    if (!modal) return;

    const focusable = Array.from(modal.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLogSessionOpen(false); return; }
      if (e.key === 'Tab') {
        if (focusable.length === 0) { e.preventDefault(); return; }
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); (last as HTMLElement).focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); (first as HTMLElement).focus(); }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    first?.focus?.();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [logSessionOpen]);

  return (
    <>
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />

      <div className="w-full lg:ml-[96px]">
        {/* Decorative stacked panels (exact size/position requested) */}
        <div aria-hidden style={{
          position: 'absolute',
          width: 1219.892578125,
          height: 175,
          top: 185.42,
          left: 158,
          opacity: 1,
          borderRadius: 16,
          background: 'rgba(96, 53, 27, 0.1)',
          boxShadow: '0px 0px 4.1px 0px rgba(33, 12, 0, 0.25)',
          boxSizing: 'border-box',
          zIndex: 2
        }}>
          {/* Book cover inside panel (positioned per your coordinates) */}
          <div style={{
            position: 'absolute',
            left: 41.14,
            top: 24.5,
            width: 85.9626235961914,
            height: 126,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 2,
            borderBottomRightRadius: 2,
            borderBottomLeftRadius: 6,
            overflow: 'hidden',
          }}>
            <Image src={bookCoverMain} alt="Book cover" width={86} height={126} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>

          {/* Title */}
          <div style={{
            position: 'absolute',
            left: 141,
            top: 30,
            width: 195,
            height: 58,
            fontFamily: 'Times New Roman, Times, serif',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 25,
            lineHeight: '100%',
            letterSpacing: '0%',
            color: 'rgba(33, 12, 0, 1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}>
            The Cambers of Secrets
          </div>

          <div style={{
            position: 'absolute',
            left: 460.96,
            top: 59.3,
            width: 50,
            height: 17,
            fontFamily: 'SF Pro, -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 14,
            lineHeight: '17px',
            letterSpacing: '0%',
            verticalAlign: 'middle',
            color: 'rgba(58, 27, 8, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            Ratings
          </div>

          {activeTabIndex === 1 && (
            <>
              <div style={{
                position: 'absolute',
                left: 842.87,
                top: 51.74,
                width: 61,
                height: 17,
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontWeight: 400,
                fontStyle: 'normal',
                fontSize: 14,
                lineHeight: '17px',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: 'rgba(58, 27, 8, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                Page 152
              </div>

              {/* Progress track (343×6) — centered under Page 152, filled to 59% */}
              <div style={{
                position: 'absolute',
                left: 841.87,
                top: 76.74,
                width: 343,
                height: 6,
                borderRadius: 64,
                background: 'rgba(96, 53, 27, 0.2)',
                overflow: 'hidden'
              }}>
                <div style={{ width: '59%', height: '100%', background: 'rgba(96, 53, 27, 1)', borderRadius: 64 }} />
              </div>

              <div style={{
                position: 'absolute',
                left: 1142,
                top: 47.74,
                width: 43,
                height: 17,
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontWeight: 510,
                fontStyle: 'normal',
                fontSize: 19,
                lineHeight: '17px',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: 'rgba(58, 27, 8, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                59%
              </div>
            </>
          )}

          <div style={{
            position: 'absolute',
            left: 141,
            top: 94.6,
            width: 78,
            height: 13,
            fontFamily: 'SF Pro, -apple-system, Arial',
            fontWeight: 700,
            fontStyle: 'normal',
            fontSize: 11,
            lineHeight: '100%',
            letterSpacing: '0%',
            color: 'rgba(33, 12, 0, 0.7)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}>
            ~ JK Rowlings
          </div>
          <div style={{
            position: 'absolute',
            left: 141,
            top: 115,
            width: 202,
            height: 17,
            fontFamily: 'SF Pro, -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 11,
            lineHeight: '17px',
            letterSpacing: '0%',
            verticalAlign: 'middle',
            color: 'rgba(58, 27, 8, 1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}>
            341 pages • hardcover • first pub 1998
          </div>

          
          <div style={{
            position: 'absolute',
            left: 460.96,          // panel-relative (158 + 460.96 = 618.96 page-left)
            top: 82.47,           // panel-relative (185.42 + 82.47 = 267.89 page-top)
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: 100,
            height: 14.983394622802734,
            transform: 'rotate(0deg)'
          }}>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
          </div>



          {/* Ratings & reviews text */}
          <div style={{
            position: 'absolute',
            left: 460.96,
            top: 104.1,
            width: 165,
            height: 17,
            fontFamily: 'SF Pro, -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 10,
            lineHeight: '17px',
            letterSpacing: '0%',
            verticalAlign: 'middle',
            color: 'rgba(58, 27, 8, 0.8)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            4,113,458 ratings • 99,449 reviews
          </div>

          {activeTabIndex === 1 && (
            /* Log Session button (panel-relative left: 841.93, top:101.47) */
            <button
              type="button"
              aria-label="Log Session"
              onClick={() => setLogSessionOpen(true)}
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                left: 841.93,
                top: 101.47,
                width: 157,
                height: 35,
                borderRadius: 40,
                background: 'rgba(96, 53, 27, 1)',
                boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,1)',
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span>Log Session</span>
            </button>
          )} 

          {activeTabIndex === 0 && (
            <>
              <button
                type="button"
                aria-label="Want to read"
                className="flex items-center justify-center"
                style={{
                  position: 'absolute',
                  left: 1028,
                  top: 38.47,
                  width: 157,
                  height: 35,
                  padding: '8px 15px',
                  gap: 10,
                  borderRadius: 40,
                  border: '1px solid rgba(33, 12, 0, 1)',
                  background: 'transparent',
                  boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  cursor: 'pointer',
                  color: 'rgba(33,12,0,1)',
                  fontFamily: 'SF Pro, -apple-system, Arial',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span>Want to read</span>
              </button>

              <button
                type="button"
                aria-label="Write a review"
                className="flex items-center justify-center"
                style={{
                  position: 'absolute',
                  left: 1028,
                  top: 101.47,
                  width: 157,
                  height: 35,
                  padding: '8px 15px',
                  gap: 10,
                  borderRadius: 40,
                  background: 'rgba(96, 53, 27, 1)',
                  boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,1)',
                  fontFamily: 'SF Pro, -apple-system, Arial',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Image src={pencilIcon} alt="pencil" width={14} height={14} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                <span>Write a review</span>
              </button>
            </>
          )}

          {activeTabIndex === 1 && (
            <button
              type="button"
              aria-label="Write a review"
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                left: 1028,
                top: 101.47,
                width: 157,
                height: 35,
                padding: '8px 15px',
                gap: 10,
                borderRadius: 40,
                background: 'rgba(96, 53, 27, 1)',
                boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,1)',
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image src={pencilIcon} alt="pencil" width={14} height={14} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span>Write a review</span>
            </button>
          )}

          {activeTabIndex === 2 && (
            <button
              type="button"
              aria-label="Write a review"
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                left: 1028,
                top: 101.47,
                width: 157,
                height: 35,
                padding: '8px 15px',
                gap: 10,
                borderRadius: 40,
                background: 'rgba(96, 53, 27, 1)',
                boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,1)',
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image src={pencilIcon} alt="pencil" width={14} height={14} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span>Write a review</span>
            </button>
          )}

          {activeTabIndex === 2 && (
            <button
              type="button"
              aria-label="Read"
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                left: 1028,
                top: 38.47,
                width: 157,
                height: 35,
                padding: '8px 15px',
                gap: 10,
                borderRadius: 40,
                background: 'rgba(33, 12, 0, 0.1)',
                border: '1px solid rgba(33, 12, 0, 1)',
                cursor: 'pointer',
                color: 'rgba(33,12,0,1)',
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span>Read</span>
            </button>
          )}

          {/* small engaging icon placed at exact coordinates */}
          <Image src={engagingIcon} alt="engaging" width={24} height={24} style={{ position: 'absolute', left: 45.26, top: 94.08, width: 24, height: 24, zIndex: 16 }} />
        </div>

        <div aria-hidden style={{
          position: 'absolute',
          width: 1219.892578125,
          height: 175,
          top: 380.42,
          left: 158,
          opacity: 1,
          borderRadius: 16,
          background: 'rgba(96, 53, 27, 0.1)',
          boxShadow: '0px 0px 4.1px 0px rgba(33, 12, 0, 0.25)',
          boxSizing: 'border-box',
          zIndex: 2
        }}>
          {/* Book cover inside panel (same offsets relative to panel) */}
          <div style={{
            position: 'absolute',
            left: 41.14,
            top: 24.5,
            width: 85.9626235961914,
            height: 126,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 2,
            borderBottomRightRadius: 2,
            borderBottomLeftRadius: 6,
            overflow: 'hidden',
          }}>
            <Image src={bookCoverMain} alt="Book cover" width={86} height={126} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>

          {/* Title */}
          <div style={{
            position: 'absolute',
            left: 141,
            top: 30,
            width: 195,
            height: 58,
            fontFamily: 'Times New Roman, Times, serif',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 25,
            lineHeight: '100%',
            letterSpacing: '0%',
            color: 'rgba(33, 12, 0, 1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}>
            The Cambers of Secrets
          </div>

          <div style={{
            position: 'absolute',
            left: 460.96,
            top: 59.3,
            width: 50,
            height: 17,
            fontFamily: 'SF Pro, -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 14,
            lineHeight: '17px',
            letterSpacing: '0%',
            verticalAlign: 'middle',
            color: 'rgba(58, 27, 8, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            Ratings
          </div>

          {activeTabIndex === 1 && (
            <>
              <div style={{
                position: 'absolute',
                left: 842.87,
                top: 51.74,
                width: 61,
                height: 17,
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontWeight: 400,
                fontStyle: 'normal',
                fontSize: 14,
                lineHeight: '17px',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: 'rgba(58, 27, 8, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                Page 152
              </div>

              {/* Progress track (343×6) — centered under Page 152, filled to 59% */}
              <div style={{
                position: 'absolute',
                left: 841.87,
                top: 76.74,
                width: 343,
                height: 6,
                borderRadius: 64,
                background: 'rgba(96, 53, 27, 0.2)',
                overflow: 'hidden'
              }}>
                <div style={{ width: '59%', height: '100%', background: 'rgba(96, 53, 27, 1)', borderRadius: 64 }} />
              </div>

              <div style={{
                position: 'absolute',
                left: 1142,
                top: 47.74,
                width: 43,
                height: 17,
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontWeight: 510,
                fontStyle: 'normal',
                fontSize: 19,
                lineHeight: '17px',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: 'rgba(58, 27, 8, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                59%
              </div>
            </>
          )}

          <div style={{
            position: 'absolute',
            left: 141,
            top: 94.6,
            width: 78,
            height: 13,
            fontFamily: 'SF Pro, -apple-system, Arial',
            fontWeight: 700,
            fontStyle: 'normal',
            fontSize: 11,
            lineHeight: '100%',
            letterSpacing: '0%',
            color: 'rgba(33, 12, 0, 0.7)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}>
            ~ JK Rowlings
          </div>

          <div style={{
            position: 'absolute',
            left: 141,
            top: 112,
            width: 202,
            height: 17,
            fontFamily: 'SF Pro, -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 11,
            lineHeight: '17px',
            letterSpacing: '0%',
            verticalAlign: 'middle',
            color: 'rgba(58, 27, 8, 1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}>
            341 pages • hardcover • first pub 1998
          </div>


          {/* Five orange stars for second panel */}
          <div style={{
            position: 'absolute',
            left: 460.96,
            top: 82.47,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: 100,
            height: 14.983394622802734,
            transform: 'rotate(0deg)'
          }}>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <svg width={14.983399391174316} height={14.983394622802734} viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.336 23 12 19.897 4.664 23l1.636-7.69L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
          </div>


          {/* Ratings & reviews text for second panel */}
          <div style={{
            position: 'absolute',
            left: 460.96,
            top: 104.1,
            width: 165,
            height: 17,
            fontFamily: 'SF Pro, -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 10,
            lineHeight: '17px',
            letterSpacing: '0%',
            verticalAlign: 'middle',
            color: 'rgba(58, 27, 8, 0.8)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            4,113,458 ratings • 99,449 reviews
          </div>

          {activeTabIndex === 1 && (
            /* Log Session button (panel-relative left: 841.93, top:101.47) */
            <button
              type="button"
              aria-label="Log Session"
              onClick={() => setLogSessionOpen(true)}
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                left: 841.93,
                top: 101.47,
                width: 157,
                height: 35,
                borderRadius: 40,
                background: 'rgba(96, 53, 27, 1)',
                boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,1)',
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span>Log Session</span>
            </button>
          )}

          {activeTabIndex === 0 && (
            <>
              <button
                type="button"
                aria-label="Want to read"
                className="flex items-center justify-center"
                style={{
                  position: 'absolute',
                  left: 1028,
                  top: 38.47,
                  width: 157,
                  height: 35,
                  padding: '8px 15px',
                  gap: 10,
                  borderRadius: 40,
                  border: '1px solid rgba(33, 12, 0, 1)',
                  background: 'transparent',
                  boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  cursor: 'pointer',
                  color: 'rgba(33,12,0,1)',
                  fontFamily: 'SF Pro, -apple-system, Arial',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span>Want to read</span>
              </button>

              <button
                type="button"
                aria-label="Write a review"
                className="flex items-center justify-center"
                style={{
                  position: 'absolute',
                  left: 1028,
                  top: 101.47,
                  width: 157,
                  height: 35,
                  padding: '8px 15px',
                  gap: 10,
                  borderRadius: 40,
                  background: 'rgba(96, 53, 27, 1)',
                  boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,1)',
                  fontFamily: 'SF Pro, -apple-system, Arial',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Image src={pencilIcon} alt="pencil" width={14} height={14} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                <span>Write a review</span>
              </button>
            </>
          )}

          {activeTabIndex === 1 && (
            <button
              type="button"
              aria-label="Write a review"
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                left: 1028,
                top: 101.47,
                width: 157,
                height: 35,
                padding: '8px 15px',
                gap: 10,
                borderRadius: 40,
                background: 'rgba(96, 53, 27, 1)',
                boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,1)',
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image src={pencilIcon} alt="pencil" width={14} height={14} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span>Write a review</span>
            </button>
          )}

          {activeTabIndex === 2 && (
            <button
              type="button"
              aria-label="Write a review"
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                left: 1028,
                top: 101.47,
                width: 157,
                height: 35,
                padding: '8px 15px',
                gap: 10,
                borderRadius: 40,
                background: 'rgba(96, 53, 27, 1)',
                boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,1)',
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image src={pencilIcon} alt="pencil" width={14} height={14} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span>Write a review</span>
            </button>
          )}

          {activeTabIndex === 2 && (
            <button
              type="button"
              aria-label="Read"
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                left: 1028,
                top: 38.47,
                width: 157,
                height: 35,
                padding: '8px 15px',
                gap: 10,
                borderRadius: 40,
                background: 'rgba(33, 12, 0, 0.1)',
                border: '1px solid rgba(33, 12, 0, 1)',
                cursor: 'pointer',
                color: 'rgba(33,12,0,1)',
                fontFamily: 'SF Pro, -apple-system, Arial',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span>Read</span>
            </button>
          )}
        </div>

        <div ref={topBarRef} className="relative z-[70] flex items-center justify-center lg:justify-between gap-4 mb-6 px-4 pt-4 lg:px-8">
          {/* Search bar (desktop only here — mobile header provided by MobileTopBar) */}
          <div className="hidden lg:block">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search your books"
              initialFilters={filters}
              onApplyFilters={setFilters}
              onPickRandom={pickRandomBook}
              onFilterOpenChange={setIsFilterOpen}
            />
          </div>

          {/* User profile + bell (mobile header moved to MobileTopBar) */}

          <div className="hidden lg:flex items-center gap-4 lg:absolute" style={{ top: '50%', left: 1060, transform: 'translateY(-50%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden">
                <span className="text-white text-sm font-semibold">AR</span>
              </div>
              <span className="text-sm font-medium text-[#0C1421]">Alexender Raghav</span>
            </div>
            <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center -ml-5" style={{ transform: 'translateX(50px)' }}>
              <Image src={bellIcon} alt="Notifications" width={22} height={22} style={{ objectFit: 'contain' }} />
            </button>
          </div>
        </div>



        {/* Page content — tabs + book list */}

          {/* Tabs */}
          <div style={{ marginBottom: 24 ,marginLeft:60}}>
            <div style={{ display: 'inline-flex', gap: 26 , padding: 4, borderRadius: 9999,width:446,height:36 }}>
              {['To read', 'Currently reading', 'Completed'].map((t, i) => {
                const active = i === activeTabIndex; // use pathname-derived active tab
                const tabStyle = {
                  padding: '6px 18px',
                  borderRadius: 9999,
                  border: active ? 'none' : '1px solid rgba(33,12,0,0.12)',
                  background: active ? '#60351B' : 'transparent',
                  marginTop: -10,
                  color: active ? '#fff' : '#210C00',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: active ? 'inset 0 -2px 0 rgba(0,0,0,0.06)' : 'none',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center'
                };

                if (t === 'To read') {
                  return (
                    <Link key={t} href="/my-books" aria-pressed={active} style={tabStyle}>
                      {t}
                    </Link>
                  );
                }

                if (t === 'Currently reading') {
                  return (
                    <Link key={t} href="/my-books/currently-reading" aria-pressed={active} style={tabStyle}>
                      {t}
                    </Link>
                  );
                }

                if (t === 'Completed') {
                  return (
                    <Link key={t} href="/my-books/completed" aria-pressed={active} style={tabStyle}>
                      {t}
                    </Link>
                  );
                }

                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={active}
                    style={tabStyle}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
       
        </div>

        {logSessionOpen && (
          <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.25)', zIndex: 999, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setLogSessionOpen(false)}>
      
            <div
              ref={logSessionRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 367,
                height:418,
                maxWidth: 'calc(100% - 48px)',
                background: 'rgba(246, 241, 234, 0.75)',
                border: '1.5px solid rgba(32, 12, 0, 1)',
                boxShadow: '0px 6px 20px rgba(33,12,0,0.12)',
                borderRadius: 22,
                zIndex: 1000,
                padding: 18,
                boxSizing: 'border-box',
              }}
            >
               <div style={{
              position: 'absolute',
              left: 20.88,
              top: 50.25,
              width: 142,
              height: 16,
              opacity: 1,
              fontFamily: 'SF Pro, -apple-system, Arial',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: 13,
              lineHeight: '100%',
              letterSpacing: '0%',
              color: 'rgba(33, 12, 0, 0.6)',
              transform: 'rotate(0deg)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center'
            }}>
              The Remains of the Day
            </div>

            <div style={{
              position: 'absolute',
              left: 22.49,
              top: 99.25,
              width: 70,
              height: 16,
              opacity: 1,
              fontFamily: 'SF Pro, -apple-system, Arial',
              fontWeight: 510,
              fontStyle: 'normal',
              fontSize: 13,
              lineHeight: '100%',
              letterSpacing: '0%',
              color: 'rgba(33, 12, 0, 0.8)',
              transform: 'rotate(0deg)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center'
            }}>
              Pages read
            </div>

            <input
              aria-label="pages-read-input"
              type="number"
              min={0}
              defaultValue={0}
              style={{
                position: 'absolute',
                left: 22.49,
                top: 135.91,
                width: 304.60546875,
                height: 44,
                borderRadius: 100,
                border: '0.5px solid rgba(33, 12, 0, 1)',
                background: 'rgba(236, 231, 223, 1)',
                padding: '8px 12px',
                boxSizing: 'border-box',
                outline: 'none',
                zIndex: 1000
              }}
            />

            <div style={{
              position: 'absolute',
              left: 25.88,
              top: 186.02,
              width: 152,
              height: 13,
              opacity: 1,
              fontFamily: 'SF Pro, -apple-system, Arial',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: 11,
              lineHeight: '100%',
              letterSpacing: '0%',
              color: 'rgba(33, 12, 0, 0.6)',
              transform: 'rotate(0deg)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center'
            }}>
              Currently on page 152 of 258
            </div>

            <div style={{
              position: 'absolute',
              left: 25.88,
              top: 219.02,
              width: 227,
              height: 16,
              opacity: 1,
              fontFamily: 'SF Pro, -apple-system, Arial',
              fontWeight: 510,
              fontStyle: 'normal',
              fontSize: 13,
              lineHeight: '100%',
              letterSpacing: '0%',
              color: 'rgba(33, 12, 0, 0.8)',
              transform: 'rotate(0deg)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center'
            }}>
              How did the reading feel? (Optional)
            </div>

            {/* Three option cards (side-by-side) — centered row inside modal */}
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 245.25, display: 'flex', gap: 12, zIndex: 1000 }}>
              <div style={{
                width: 90.767578125,
                height: 75.63671875,
                borderRadius: 22,
                border: '0.5px solid rgba(33, 12, 0, 1)',
                background: 'rgba(236, 231, 223, 1)',
                boxSizing: 'border-box',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingTop: 6,
                paddingBottom: 6
              }}>
                <Image src={engagingIcon} alt="engaging" width={24} height={24} style={{ objectFit: 'contain' }} />
                <div style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 11, color: 'rgba(33,12,0,0.8)' }}>Engaging</div>
              </div>
              <div style={{
                width: 90.767578125,
                height: 75.63671875,
                borderRadius: 22,
                border: '0.5px solid rgba(33, 12, 0, 1)',
                background: 'rgba(236, 231, 223, 1)',
                boxSizing: 'border-box',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingTop: 6,
                paddingBottom: 6
              }}>
                <Image src={steadyIcon} alt="steady" width={24} height={24} style={{ objectFit: 'contain' }} />
                <div style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 11, color: 'rgba(33,12,0,0.8)' }}>steady</div>
              </div>

              <div style={{
                width: 90.767578125,
                height: 75.63671875,
                borderRadius: 22,
                border: '0.5px solid rgba(33, 12, 0, 1)',
                boxSizing: 'border-box',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingTop: 6,
                paddingBottom: 6
              }}>
                <Image src={emotionalIcon} alt="emotional" width={24} height={24} style={{ objectFit: 'contain', filter: 'invert(23%) sepia(69%) saturate(386%) hue-rotate(5deg) brightness(95%) contrast(87%)' }} />
                <div style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontWeight: 400, fontSize: 11, color: 'rgba(33,12,0,0.8)' }}>emotional</div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Reset reading session"
              onClick={() => { const el = document.querySelector('[aria-label="pages-read-input"]') as HTMLInputElement | null; if (el) el.value = '0'; }}
              style={{
                position: 'absolute',
                left: '28%',
                transform: 'translateX(-50%)',
                top: 336.25,
                width: 145,
                height: 41.721923828125,
                borderRadius: 18,
                border: '1px solid rgba(33, 12, 0, 1)',
                background: 'transparent',
                cursor: 'pointer',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Reset
            </button>

              <button
                type="button"
                aria-label="Submit reading session"
                onClick={() => {
                  const el = document.querySelector('[aria-label="pages-read-input"]') as HTMLInputElement | null;
                  const pages = el ? Number(el.value || 0) : 0;
                  console.log('Log session submitted', { pages });
                  setLogSessionOpen(false);
                }}
                style={{
                  position: 'absolute',
                  left: '70%',
                  transform: 'translateX(-50%)',
                  top: 336.25,
                  width: 145,
                  height: 41.721923828125,
                  borderRadius: 18,
                  border: 'none',
                  background: '#60351B',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)'
                }}
              >
                Submit
              </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 510, color: 'rgba(33,12,0,1)' }}>Log reading session</div>
                <button aria-label="Close log session" onClick={() => setLogSessionOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#210C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              


              
            </div>
          </div>
        )}

    </>
  );
}
