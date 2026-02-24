'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import homeIcon from '../../images/home.png';
import bookIcon from '../../images/book-icon.png';
import collectionIcon from '../../images/collection.png';
import communityIcon from '../../images/community.png';
import collection1Icon from '../../images/collection1.png';
import settingIcon from '../../images/setting.png';
import sideBarLogo from '../../images/side bar logo.png';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import bellIcon from '../../images/bell.png';
import user2 from '../../images/human.png';
import bookCoverMain from '../../images/Book cover (7).png';
import bookCover1 from '../../images/Book cover (8).png';
import bookCover2 from '../../images/Book cover (8).png';
import bookCover3 from '../../images/Book cover (8).png';
import bookCover4 from '../../images/Book cover (8).png';
import bookCover5 from '../../images/Book cover (8).png';
import bookCover6 from '../../images/Book cover (8).png';
import newsImg from '../../images/news.png';
import news1Img from '../../images/news1.png';
import news2Img from '../../images/news2.png';
import news3Img from '../../images/news3.png';
import news4Img from '../../images/news4.png';
import paceIcon from '../../images/pace.png';
import plotIcon from '../../images/plot.png';
import charactersIcon from '../../images/characters.png';
import diverseIcon from '../../images/diverse.png';
import flawsIcon from '../../images/flaws.png';
import likeImg from '../../images/like.png';
import pencilIcon from '../../images/pencil.png';
import downArrowIcon from '../../images/down arrow.png';
import shareImg from '../../images/share.png';
import bookmarkImg from '../../images/bookmark.png';
import unlikeImg from '../../images/unlike.png';
export default function ViewDetailPage(): JSX.Element {
  // Sidebar / header state (copied behaviour from dashboard)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string | null>('home');

  // Search + filter panel state (small copy of dashboard behaviour)
  const MOODS = ['Adventurous', 'Hopeful', 'Funny', 'Reflective', 'Challenging', 'Informative', 'Relaxing', 'Dark', 'Inspiring', 'Lighthearted'];
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [matchAllMoods, setMatchAllMoods] = useState(false);
  const [selectedPace, setSelectedPace] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState<string>('');
  const [authorExpanded, setAuthorExpanded] = useState(false);

  const filterBtnRef = useRef<HTMLButtonElement | null>(null);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const [panelCoords, setPanelCoords] = useState<{ top: number; left: number; arrowLeft: number } | null>(null);

  function toggleMood(m: string) { setSelectedMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])); }
  function togglePageRange(r: string) { setSelectedPages((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])); }
  function pickRandomBook() { setSearchFilterOpen(false); }
  function handleApplyFilters() { setSearchFilterOpen(false); }

  useEffect(() => {
    if (!searchFilterOpen) { setPanelCoords(null); return; }
    const compute = () => {
      const btn = filterBtnRef.current;
      const panel = filterPanelRef.current;
      const header = topBarRef.current;
      if (!btn || !panel) return;
      const btnRect = btn.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;

      const headerBottom = header ? (header.getBoundingClientRect().bottom + scrollY) : 0;
      const sidebarWidth = window.innerWidth >= 1024 ? 96 : 0;
      const minLeft = sidebarWidth + 12; // ensure panel doesn't cover left navbar on large screens

      let top = btnRect.bottom + scrollY + 12;
      if (top + panelRect.height > scrollY + window.innerHeight - 8) {
        const aboveTop = btnRect.top + scrollY - panelRect.height - 12;
        if (aboveTop >= headerBottom + 8) top = aboveTop;
        else top = Math.max(headerBottom + 8, scrollY + window.innerHeight - panelRect.height - 8);
      }

      let left = btnRect.left + btnRect.width / 2 - panelRect.width / 2;
      left = Math.max(minLeft, Math.min(left, window.innerWidth - panelRect.width - 8));

      const arrowLeft = btnRect.left + btnRect.width / 2 - left;
      setPanelCoords({ top, left, arrowLeft });
    };

    requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [searchFilterOpen, selectedMoods, selectedPace, selectedType, selectedPages]);

  return (
    <main className="min-h-screen bg-[#F2F0E4] overflow-x-hidden">
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* Top area: keep search + user */}
      <div className="px-4 lg:px-8 pb-12 mt-2 lg:mt-6">
        <div style={{ position: 'relative' }} ref={topBarRef}>
          <div className="lg:hidden fixed top-2 right-4 z-[100] flex items-center gap-3">
            <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center">
              <Image src={bellIcon} alt="Notifications" width={22} height={22} style={{ objectFit: 'contain' }} />
            </button>
          </div>

          <div className="relative flex items-center gap-3 w-[calc(100%-80px)] max-w-[320px] lg:max-w-[280px] lg:flex-none lg:ml-24" style={{ border: '1px solid rgba(33,12,0.15)', borderRadius: 10, padding: '8px 12px', background: 'transparent', minWidth: 120 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-4.35-4.35" stroke="#6B4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="6" stroke="#6B4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <SearchBar placeholder="Search Book by name,author" initialFilters={['Adventures','Fiction']} onApplyFilters={() => { /* legacy file — sync handled here if needed */ }} showFilters={false} />

            <button ref={filterBtnRef} id="filter-button" type="button" aria-expanded={searchFilterOpen} aria-controls="filter-panel" aria-label="Filters" onClick={() => setSearchFilterOpen(prev => !prev)} className={`ml-2 w-8 h-8 flex items-center justify-center rounded-md ${searchFilterOpen ? 'bg-[#60351B] text-white' : 'bg-transparent text-[#6B4A33]'}`} style={{ border: 'none', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M3 5h18M6 12h12M10 19h4" stroke={searchFilterOpen ? '#fff' : '#6B4A33'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Desktop user block */}
          <div className="hidden lg:flex" style={{ position: 'absolute', top: 8, left: 1086, width: 199, height: 45, alignItems: 'center', display: 'flex', gap: 12, boxSizing: 'border-box', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="w-10 h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden" style={{ flex: '0 0 auto' }}>
                <span className="text-white text-sm font-semibold">AR</span>
              </div>
              <span style={{ display: 'inline', maxWidth: 110, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 14, color: '#0C1421', fontWeight: 500 }}>Alexender Raghav</span>
            </div>
            <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <Image src={bellIcon} alt="Notifications" width={22} height={22} style={{ objectFit: 'contain' }} />
            </button>
          </div>

          <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 1124.34,
            top: 629.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>

          </div>

        {/* Decorative large panel (requested exact size/position) */}
        <div aria-hidden style={{
          position: 'absolute',
          width: 1100.3935546875,
          height: 3010.3759765625,
          top: 430,
          left: 216.5,
          opacity: 1,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderLeft: '0.5px solid rgba(33, 12, 0, 0.15)',
          borderRight: '0.5px solid rgba(33, 12, 0, 0.15)',
          background: 'rgba(96, 53, 27, 0.1)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <Image src={bookCoverMain} alt="book-cover" width={263.0050048828125} height={385.50030517578125} style={{
          position: 'absolute',
          left: 404,
          top: 160.05,
          width: 263.0050048828125,
          height: 425.50030517578125,
          borderTopLeftRadius: 6,
          objectFit: 'cover',
          zIndex: 15
        }} />

  

        {/* Absolute title (exact coordinates & typography) */}
        <div style={{
          position: 'absolute',
          left: 768.77,
          top: 154.49,
          width: 428.0732421875,
          height: 147,
          fontFamily: 'Times New Roman, Times, serif',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '43px',
          lineHeight: '100%',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          zIndex: 16
        }}>Harry Potter AND THE CHAMBER OF SECRETS</div>

        <div style={{
          position: 'absolute',
          left: 768.94,
          top: 313.49,
          width: 106,
          height: 18,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 700,
          fontStyle: 'normal',
          fontSize: 15,
          lineHeight: '100%',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.7)',
          boxSizing: 'border-box',
          zIndex: 16,
          display: 'flex',
          alignItems: 'center'
        }}>~ JK Rowlings</div>

        {/* Five stars (exact size/color/position) */}
        <div aria-hidden style={{
          position: 'absolute',
          left: 768.94,
          top: 357.59,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="16.179967880249023" height="16.179962158203125" viewBox="0 0 24 24" fill="rgba(255,77,0,0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          left: 893.05,
          top: 357.59,
          width: 198,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 12,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 0.8)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>4,113,458 ratings • 99,449 reviews</div>

        <div role="button" aria-label="want-to-read" style={{
          position: 'absolute',
          left: 769,
          top: 466,
          width: 157,
          height: 35,
          paddingTop: 8,
          paddingRight: 15,
          paddingBottom: 8,
          paddingLeft: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderRadius: 40,
          border: '1px solid rgba(33, 12, 0, 1)',
          boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
          background: 'transparent',
          cursor: 'pointer',
          zIndex: 18
        }}>
          <Image src={pencilIcon} alt="pencil" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 14, color: 'rgba(33,12,0,1)' }}>want to read</span>
        </div>

        <div role="button" aria-label="buy" style={{
          position: 'absolute',
          left: 937,
          top: 466,
          width: 88,
          height: 35,
          paddingTop: 8,
          paddingRight: 15,
          paddingBottom: 8,
          paddingLeft: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 40,
          background: 'rgba(96, 53, 27, 1)',
          boxShadow: '-0.5px -0.5px 0px 0px rgba(96, 53, 27, 0.05), 10px 10px 21.21px -3.75px rgba(96, 53, 27, 0.05), 5.9px 5.9px 8.35px -3px rgba(96, 53, 27, 0.19), 2.66px 2.66px 3.76px -2.25px rgba(96, 53, 27, 0.23), 1.21px 1.21px 1.71px -1.5px rgba(96, 53, 27, 0.25), 0.44px 0.44px 0.63px -1px rgba(96, 53, 27, 0.26)',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 18
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8,marginLeft:10 }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: '#fff' }}>Buy</span>
            <Image src={downArrowIcon} alt="down" width={12} height={12} style={{ width: 12, height: 12, objectFit: 'contain', filter: 'brightness(10)' }} />
          </span>
        </div>

        <div role="button" aria-label="bookmark" style={{
          position: 'absolute',
          left: 1090.05,
          top: 466,
          width: 35,
          height: 35,
          borderRadius: 9999,
          background: 'rgba(96, 53, 27, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 18
        }}>
          <Image src={shareImg} alt="bookmark" width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
        </div>
                <div role="button" aria-label="bookmark" style={{
          position: 'absolute',
          left: 1140.05,
          top: 466,
          width: 35,
          height: 35,
          borderRadius: 9999,
          background: 'rgba(96, 53, 27, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 18
        }}>
          <Image src={bookmarkImg} alt="bookmark" width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
        </div>
        <div style={{
          position: 'absolute',
          left: 768.94,
          top: 383.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 1)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>341 pages • hardcover • first pub 1998</div>
        <div aria-hidden style={{
          position: 'absolute',
          left: 768.77,
          top: 544.62,
          width: 428.0794372558594,
          height: 0,
          opacity: 1,
          borderTop: '1px solid rgba(96, 53, 27, 0.2)',
          boxSizing: 'border-box',
          zIndex: 16
        }} />
                <div style={{
          position: 'absolute',
          left: 815.33,
          top: 645.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
                <div style={{
          position: 'absolute',
          left: 805.94,
          top: 603.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'mediun',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 1)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>About the Author</div>

        <div style={{
          position: 'absolute',
          left: 805.94,
          top: 1050.82,
          width: 359,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Editors</div>

        <div style={{
          position: 'absolute',
          left: 805.94,
          top: 1076.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>J.K. Rowling (author), Christopher Reath, Alena Cestabon. Steve Korg</div>

          <div style={{
          position: 'absolute',
          left: 885.94,
          top: 653.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'mediun',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 1)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>J. K. Rowlings </div>
        <div style={{
          position: 'absolute',
          left: 885.94,
          top: 673.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'mediu,',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.8)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>679 books • 234k followers </div>
                <div style={{
          position: 'absolute',
          left: 805.94,
          top: 685.82,
          width: 352.6,
          height: 114,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16,
          justifyContent:'center',
          alignContent:'center'
        }}>Although she writes under the pen name J.K. Rowling, pronounced like rolling, 
        her name when her first Harry Potter book was published was simply Joanne Rowling. 
        Anticipating that the target audience of young boys might not want... </div>
        <div role="button" aria-label="show-more-author" onClick={() => setAuthorExpanded(prev => !prev)} style={{
          position: 'absolute',
          left: 805.94,
          top: 800.64,
          width: 100.734375,
          height: 17,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 0.8)',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textDecorationThickness: '7%',
          textDecorationSkipInk: 'auto',
          cursor: 'pointer',
          opacity: 1,
          boxSizing: 'border-box',
          zIndex: 16,
          display: 'flex',
          alignItems: 'center',
        }}>{authorExpanded ? 'Show less' : 'Show more'}</div>

        
                  {/* Genre & Tags (replicated under Follow) */}
          <div style={{
            position: 'absolute',
            left: 800.34,
            top: 828.4,
            width: 360,
            boxSizing: 'border-box',
            zIndex: 78
          }}>
            <div style={{
              fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
              fontWeight: 510,
              fontSize: 16,
              lineHeight: '22px',
              color: 'rgba(33,12,0,0.9)',
              marginBottom: 10
            }}>Genre & Tags</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Adventures</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Young Adult</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Fiction</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Children's</div>

              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Medium-paced</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Mysterious</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Thriller</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Mystery</div>

              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Fantasy</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Classic</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Young Adult</div>
              <div style={{ padding: '6px 16px', borderRadius: 14, border: '0.3px solid rgba(33, 12, 0, 1)', background: 'rgba(96, 53, 27, 0.2)', fontSize: 13, color: 'rgba(33,12,0,0.9)' }}>Medium-paced</div>
            </div>
            
        <div style={{
          position: 'absolute',
          left: 5.94,
          top: 300.82,
          width: 359,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Languages</div>
                <div style={{
          position: 'absolute',
          left: 5.94,
          top: 325.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Standard English (USA & IJK)</div>
        <div style={{
          position: 'absolute',
          left: 5.94,
          top: 360.82,
          width: 359,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Paperback</div>
        <div style={{
          position: 'absolute',
          left: 5.94,
          top: 385.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>paper textured, full colour, 345 pages
ISBN: 987 3 32564 455 B</div>
<div style={{
          position: 'absolute',
          left: 5.94,
          top: 438.82,
          width: 359,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Reviewed By</div>
        <div style={{
          position: 'absolute',
          left: 5.33,
          top: 470.94,
          width: 36,
          height: 36,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          left: 55.94,
          top: 470.82,
          width: 256,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'regular',
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(58, 27, 8, 1)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>J. K. Rowlings </div>
                <div style={{
          position: 'absolute',
          left: 5.94,
          top: 385.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>        <div style={{
          position: 'absolute',
          left: 48.94,
          top: 105.82,
          width: 409.17529296875,
          height: 38,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 10,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>679 books • 234k followers</div></div>
        <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 384.34,
            top: 449.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>

          </div>
        <div style={{
          position: 'absolute',
          left: 337,
          top: 614.05,
          width: 453,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Description</div>

        <div style={{
          position: 'absolute',
          left: 337,
          top: 640.05,
          width: 409.17529296875,
          height: 342,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16,
          overflow: 'hidden'
        }}>
          <p style={{ margin: 0 }}>
            Ever since Harry Potter had come home for the summer, the Dursleys had been so mean and hideous that all Harry wanted was to get back to the Hogwarts School for Witchcraft and Wizardry. But just as he’s packing his bags, Harry receives a warning from a strange impish creature who says that if Harry returns to Hogwarts, disaster will strike.
            <br /><br />And strike it does. For in Harry’s second year at Hogwarts, fresh torments and horrors arise, including an outrageously stuck-up new professor and a spirit who haunts the girls’ bathroom. But then the real trouble begins – someone is turning Hogwarts students to stone. Could it be Draco Malfoy, a more poisonous rival than ever? Could it possibly be Hagrid, whose mysterious past is finally told? Or could it be the one everyone at Hogwarts most suspects… Harry Potter himself!
          </p>
        </div>

        <div className="mt-8 lg:mt-20 px-4 lg:px-0 max-w-5xl mx-auto">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ width: 200, borderRadius: 8, overflow: 'hidden' }}>
            </div>    
          </div>
        </div>

        <div style={{
          position: 'absolute',
          left: 337.33,
          top: 995.57,
          width: 408.638671875,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Images</div>

        <Image src={news1Img} alt="news1" width={256.607421875} height={150.18008422851562} style={{
          position: 'absolute',
          left: 337.33,
          top: 1028.5,
          width: 256.607421875,
          height: 150.18008422851562,
          borderRadius: 4,
          border: '0.8px solid rgba(33, 12, 0, 1)',
          opacity: 1,
          objectFit: 'cover',
          zIndex: 16,
          transform: 'rotate(0deg)'
        }} />
        <Image src={news2Img} alt="news2" width={144.62109375} height={150.18008422851562} style={{
          position: 'absolute',
          left: 601.35,
          top: 1028.5,
          width: 144.62109375,
          height: 150.18008422851562,
          borderRadius: 4,
          border: '0.8px solid rgba(33, 12, 0, 1)',
          opacity: 1,
          objectFit: 'cover',
          zIndex: 16,
          transform: 'rotate(0deg)'
        }} />
        <Image src={news3Img} alt="news3" width={134.658203125} height={164.29957580566406} style={{
          position: 'absolute',
          left: 337.35,
          top: 1191.03,
          width: 134.658203125,
          height: 164.29957580566406,
          borderRadius: 4,
          border: '0.8px solid rgba(33, 12, 0, 1)',
          opacity: 1,
          objectFit: 'cover',
          zIndex: 16,
          transform: 'rotate(0deg)'
        }} />

        <Image src={news4Img} alt="news4" width={264} height={164.29957580566406} style={{
          position: 'absolute',
          left: 482.3,
          top: 1191.03,
          width: 264,
          height: 164.29957580566406,
          borderRadius: 4,
          border: '0.8px solid rgba(33, 12, 0, 1)',
          opacity: 1,
          objectFit: 'cover',
          zIndex: 16,
          transform: 'rotate(0deg)'
        }} />

        <div aria-hidden style={{
          position: 'absolute',
          width: 775,
          height: 0,
          top: 1392.6,
          left: 379.2,
          opacity: 1,
          borderTop: '1.5px solid rgba(96, 53, 27, 0.2)',
          boxSizing: 'border-box',
          zIndex: 16
        }} />

        <div style={{
          position: 'absolute',
          left: 337.33,
          top: 1429.61,
          width: 453,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Ratings & Reviews</div>

        <div style={{
          position: 'absolute',
          left: 345.33,
          top: 1460.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>

        <div role="button" aria-label="action-button" style={{
          position: 'absolute',
          left: 530.85,
          top: 1463.95,
          width: 52,
          height: 52,
          background: 'rgba(96, 53, 27, 0.05)',
          border: '0.5px solid rgba(33, 12, 0, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16,
          borderRadius: 50,
          display: 'block'
        }}>
          <div aria-hidden style={{
            position: 'absolute',
            left: 15.26,
            top: 16,
            width: 21.17654800415039,
            height: 20,
            boxSizing: 'border-box',
            opacity: 1,
            transform: 'rotate(0deg)',
            zIndex: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image src={likeImg} alt="like" width={14} height={14} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                    <div role="button" aria-label="action-button" style={{
          position: 'absolute',
          left: 52.85,
          top: -15,
          width: 52,
          height: 52,
          
          border: '0.5px solid rgba(33, 12, 0, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16,
          borderRadius: 50,
          display: 'block'
        }}></div>
            <div aria-hidden style={{
            position: 'absolute',
            left: 70,
            top: 3,
            width: 21.17654800415039,
            height: 20,
            boxSizing: 'border-box',
            opacity: 1,
            transform: 'rotate(0deg)',
            zIndex: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image src={unlikeImg} alt="like" width={14} height={14} style={{ width: 20, height: 20, objectFit: 'contain' }} />
          </div>
          </div>
          
          
        </div>

        <input
          aria-label="add-review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder=""
          style={{
            position: 'absolute',
            left: 685.67,
            top: 1463.95,
            width: 498.52734375,
            height: 52,
            borderRadius: 42,
            border: '0.5px solid rgba(33, 12, 0, 0.8)',
            boxSizing: 'border-box',
            paddingLeft: 24,
            fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
            fontSize: 13,
            lineHeight: '17px',
            color: 'rgba(33, 12, 0, 1)',
            background: 'transparent',
            outline: 'none',
            zIndex: 15
          }}
        />

        {reviewText === '' && (
          <div style={{
            position: 'absolute',
            left: 698.69,
            top: 1478.9,
            width: 77.48516082763672,
            height: 22.100000381469727,
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 13,
            lineHeight: '17px',
            letterSpacing: '0%',
            color: 'rgba(33, 12, 0, 0.4)',
            boxSizing: 'border-box',
            verticalAlign: 'middle',
            pointerEvents: 'none',
            zIndex: 16
          }}>Add review</div>
        )}

        <div style={{
          position: 'absolute',
          left: 415.33,
          top: 1474.44,
          width: 92,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>J. K. Rowlings</div>

        <div style={{
          position: 'absolute',
          left: 417.33,
          top: 1488.95,
          width: 45,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          verticalAlign: 'middle',
          zIndex: 16
        }}>0 reviews</div>

        <div style={{
          position: 'absolute',
          left: 897.59,
          top: 1483.11,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
          <svg width="13.682225227355957" height="13.68198299407959" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 1 }} aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z" stroke="rgba(96, 53, 27, 1)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          </svg>
        </div>

        <div role="button" aria-label="submit-review" style={{
          position: 'absolute',
          left: 1000.08,
          top: 1471.28,
          width: 178.732421875,
          height: 37.3251953125,
          paddingTop: 8,
          paddingRight: 12,
          paddingBottom: 8,
          paddingLeft: 12,
          gap: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 42,
          background: 'rgba(96, 53, 27, 1)',
          color: '#ffffff',
          boxSizing: 'border-box',
          cursor: 'pointer',
          zIndex: 16
        }}>
          <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 14, lineHeight: '17px', color: 'rgba(228, 221, 209, 1)' }}>Write a review</span>
        </div>

        <div aria-hidden style={{
          position: 'absolute',
          width: 775,
          height: 0,
          top: 1556,
          left: 378.86,
          opacity: 1,
          borderTop: '1.5px solid rgba(96, 53, 27, 0.2)',
          boxSizing: 'border-box',
          zIndex: 16
        }} />

        <div style={{
          position: 'absolute',
          left: 336.99,
          top: 1596,
          width: 453,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '20px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.9)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Community Ratings</div>

        <div style={{
          position: 'absolute',
          left: 339.28,
          top: 1626,
          width: 814.5732421875,
          height: 38,
          display: 'flex',
          alignItems: 'flex-start',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: 16,
          lineHeight: '19px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>Rating & review give by the community of different writer and reader of books and some reviews given by them.</div>

        <div style={{
          position: 'absolute',
          left: 339.28,
          top: 1668,
          width: 111.16796875,
          height: 77,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 590,
          fontStyle: 'normal',
          fontSize: 64,
          lineHeight: '20px',
          letterSpacing: '0%',
          verticalAlign: 'middle',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>4.5

        </div>

        <div aria-hidden style={{
          position: 'absolute',
          left: 500,
          top: 1698,
          width: 420,
          height: 64,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          boxSizing: 'border-box',
          zIndex: 16
        }}>
          {[{label: '5', pct: '75%'}, {label: '4', pct: '12%'}, {label: '3', pct: '6%'}, {label: '2', pct: '2%'}, {label: '1', pct: '5%'}].map((r, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 18, textAlign: 'right', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontSize: 16, color: 'rgba(33,12,0,1)' }}>{r.label}</div>
              <div style={{ width: 303, height: 10, borderRadius: 9999, background: 'rgba(33,12,0,0.12)', boxSizing: 'border-box', overflow: 'hidden' }}>
                <div style={{ width: r.pct, height: '100%', background: 'rgba(96,53,27,1)', borderRadius: 9999 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute',
          left: 354.28,
          top: 1747,
          width: 300,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          paddingLeft: 2.29,
          paddingTop: 2.38,
          gap: 12,
          zIndex: 16
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
            <svg width="11.409276008605957" height="10.903876304626465" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
            </svg>
          </div>

          <div style={{
            width: 97,
            height: 20,
            marginLeft:-103,
            marginTop:40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: 20,
            lineHeight: '20px',
            letterSpacing: '0%',
            color: 'rgba(33, 12, 0, 0.6)'
          }}>2,256,896</div>
        </div>

        <div role="region" aria-label="community-reviews-card" style={{
          position: 'absolute',
          left: 336.99,
          top: 1849.52,
          width: 521.462890625,
          height: 583.822265625,
          paddingTop: 35,
          paddingRight: 34,
          paddingBottom: 35,
          paddingLeft: 34,
          gap: 10,
          borderRadius: 12,
          background: 'rgba(96, 53, 27, 0.08)',
          boxShadow: '0px 0px 4px 0px rgba(96, 53, 27, 1) inset',
          opacity: 1,
          boxSizing: 'border-box',
          zIndex: 16,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* survey blocks */}

          {[
            { title: 'Pace', icon: paceIcon, color: '255,77,0' },
            { title: 'Plot or character driven?', icon: plotIcon, color: '140,86,255' },
            { title: 'Loveable characters?', icon: charactersIcon, color: '0,150,255' },
            { title: 'Diverse cast of characters?', icon: diverseIcon, color: '34,197,94' },
            { title: 'Flaws of characters a main focus?', icon: flawsIcon, color: '255,77,100' }
          ].map((m, mi) => (
            <div key={mi} style={{ display: 'flex', flexDirection: 'column', gap:6, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Image src={m.icon} alt={`${m.title} icon`} width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
                <div style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'normal', fontSize: 16, lineHeight: '20px', letterSpacing: '0%', color: 'rgba(33,12,0,0.9)' }}>{m.title}</div>
              </div>

              <div style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {Array.from({ length: 22 }).map((_, i) => (
                  <div key={i} style={{
                    width: 20,
                    height: 20,
                    borderRadius: 9999,
                    background: `rgba(${m.color}, ${0.95 - i * 0.03})`
                  }} />
                ))}
              </div>

              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 9999, background: `rgba(${m.color},1)` }} />
                  <div style={{ fontSize: 12, color: 'rgba(33,12,0,0.6)' }}>Yes (45%)</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 9999, background: `rgba(${m.color},0.75)` }} />
                  <div style={{ fontSize: 12, color: 'rgba(33,12,0,0.6)' }}>Complicated (30%)</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 9999, background: `rgba(${m.color},0.5)` }} />
                  <div style={{ fontSize: 12, color: 'rgba(33,12,0,0.6)' }}>No (15%)</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 9999, background: `rgba(${m.color},0.25)` }} />
                  <div style={{ fontSize: 12, color: 'rgba(33,12,0,0.6)' }}>N/A (10%)</div>
                </div>
              </div>
            </div>
          ))}

        </div>

        <div style={{
          position: 'absolute',
          left: 336.99,
          top: 2495.67,
          width: 117,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>Reader Friends
        </div>
        <div style={{
          position: 'absolute',
          left: 345.33,
          top: 2530.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
          
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 2538.89,
          width: 91,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>Kun Jong unn</div>
          <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 624.34,
            top: 2541.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 2555.4,
          width: 134,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>234k followers • 54 Reviews</div>

        <div style={{
          position: 'absolute',
          left: 407.17,
          top: 2590.88,
          width: 744.685546875,
          height: 153,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 12,
          lineHeight: '17px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.7)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>
          “It is our choices, Harry, that show what we truly are, far more than our abilities.” CHILLS.<br /><br />(REREAD)<br /><br />Okay DUH 5/5 stars. I actually liked this book more than I remembered! This used to be my least favorite of the Harry Potter books and, while that still might be true, I was more entertained than I expected! I always forget how different Book Ginny is from Movie Ginny (way better all around) and how she has such a bigger role in the books than the films.<br /><br />NOW ONTO HP AND THE PRISONER OF AZKABAN!
        </div>

        <div aria-hidden style={{
          position: 'absolute',
          left: 409.17,
          top: 2764.37,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          left: 521.32,
          top: 2764.19,
          width: 95,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '17px',
          color: 'rgba(96, 53, 27, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>24 September 2025</div>
          <div style={{
          position: 'absolute',
          left: 345.33,
          top: 2835.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 2838.89,
          width: 91,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>Kun Jong unn</div>
          <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 624.34,
            top: 2841.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 2855.4,
          width: 134,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>234k followers • 54 Reviews</div>

        <div style={{
          position: 'absolute',
          left: 407.17,
          top: 2890.88,
          width: 744.685546875,
          height: 153,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 12,
          lineHeight: '17px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.7)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>
          “It is our choices, Harry, that show what we truly are, far more than our abilities.” CHILLS.<br /><br />(REREAD)<br /><br />Okay DUH 5/5 stars. I actually liked this book more than I remembered! This used to be my least favorite of the Harry Potter books and, while that still might be true, I was more entertained than I expected! I always forget how different Book Ginny is from Movie Ginny (way better all around) and how she has such a bigger role in the books than the films.<br /><br />NOW ONTO HP AND THE PRISONER OF AZKABAN!
        </div>

        <div aria-hidden style={{
          position: 'absolute',
          left: 409.17,
          top: 3064.37,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          left: 521.32,
          top: 3064.19,
          width: 95,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '17px',
          color: 'rgba(96, 53, 27, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>24 September 2025</div>

        <div style={{
          position: 'absolute',
          left: 336.99,
          top: 3107.67,
          width: 127,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 16,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>Other Reviewers</div>
        <div style={{
          position: 'absolute',
          left: 345.33,
          top: 3155.94,
          width: 46,
          height: 46,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 16,
          boxSizing: 'border-box',
          border: '1px solid rgba(96, 53, 27, 0.06)',
          background: 'rgba(255,255,255,0)'
        }}>
          <Image src={user2} alt="author-avatar" width={28} height={28} style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            objectFit: 'cover',
            overflow: 'hidden'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 3158.89,
          width: 91,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 14,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>Kun Jong unn</div>
          <div role="button" aria-label="follow" style={{
            position: 'absolute',
            left: 624.34,
            top: 3158.4,
            width: 68.50548553466797,
            height: 24.27289581298828,
            paddingTop: 4,
            paddingRight: 21,
            paddingBottom: 4,
            paddingLeft: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 14,
            background: 'rgba(96, 53, 27, 0.2)',
            opacity: 1,
            cursor: 'pointer',
            zIndex: 80
          }}>
            <span style={{ fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 500, fontSize: 12, color: 'rgba(33,12,0,1)' }}>Follow</span>
          </div>
        <div style={{
          position: 'absolute',
          left: 409.17,
          top: 3175.4,
          width: 134,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: 10,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 0.6)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>234k followers • 54 Reviews</div>

        <div style={{
          position: 'absolute',
          left: 407.17,
          top: 3200.88,
          width: 744.685546875,
          height: 153,
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 12,
          lineHeight: '17px',
          letterSpacing: '0%',
          textAlign: 'justify',
          color: 'rgba(33, 12, 0, 0.7)',
          boxSizing: 'border-box',
          zIndex: 16
        }}>
          “It is our choices, Harry, that show what we truly are, far more than our abilities.” CHILLS.<br /><br />(REREAD)<br /><br />Okay DUH 5/5 stars. I actually liked this book more than I remembered! This used to be my least favorite of the Harry Potter books and, while that still might be true, I was more entertained than I expected! I always forget how different Book Ginny is from Movie Ginny (way better all around) and how she has such a bigger role in the books than the films.<br /><br />NOW ONTO HP AND THE PRISONER OF AZKABAN!
        </div>

        <div aria-hidden style={{
          position: 'absolute',
          left: 409.17,
          top: 3364.37,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 16
        }}>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
          <svg width="12.999938011169434" height="12.999995231628418" viewBox="0 0 24 24" fill="rgba(255, 77, 0, 0.59)" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.8 23 12 19.77 5.2 23l1.1-7.69L.6 9.75l7.732-1.732L12 .587z"/>
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          left: 521.32,
          top: 3364.19,
          width: 95,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '17px',
          color: 'rgba(96, 53, 27, 0.8)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>24 September 2025</div>

        {/* Bottom decorative panel (requested size/position) */}
        <div aria-hidden style={{
          position: 'absolute',
          width: 1344,
          height: 403,
          top: 3476,
          left: 174,
          opacity: 1,
          background: 'rgba(96, 53, 27, 0.2)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 0
        }} />
          <div style={{
          position: 'absolute',
          left: 226.99,
          top: 3507.67,
          width: 453,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
          fontWeight: 510,
          fontStyle: 'Medium',
          fontSize: 24,
          lineHeight: '17px',
          letterSpacing: '0%',
          color: 'rgba(33, 12, 0, 1)',
          boxSizing: 'border-box',
          opacity: 1,
          zIndex: 16
        }}>More Editions</div>
        <div style={{
          position: 'absolute',
          left: 226,
          top: 3558.5,
          display: 'flex',
          gap: 80,
          alignItems: 'flex-start',
          zIndex: 16
        }}>
          {[bookCover1, bookCover2, bookCover3, bookCover4, bookCover5, bookCover6].map((src, i) => (
            <div key={i} style={{
              width: 135,
              height: 197,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 2,
              borderBottomRightRadius: 2,
              borderBottomLeftRadius: 6,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Image src={src} alt={`edition-${i+1}`} width={135} height={197} style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
        {/* Book titles under top More Editions (centered) */}
         {/* Book titles under top More Editions (centered) */}
        <div style={{ position: 'absolute', left: 228, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>Book name</div>
        <div style={{ position: 'absolute', left: 447, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>Book name</div>
        <div style={{ position: 'absolute', left: 662, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>Book name</div>
        <div style={{ position: 'absolute', left: 875, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>Book name</div>
        <div style={{ position: 'absolute', left: 1090, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>Book name</div>
        <div style={{ position: 'absolute', left: 1303, top: 3753.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 15, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(0,0,0,1)', boxSizing: 'border-box', zIndex: 16 }}>Book name</div>

        <div style={{ position: 'absolute', left: 228, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>Author name</div>
        <div style={{ position: 'absolute', left: 447, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>Author name</div>
        <div style={{ position: 'absolute', left: 662, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>Author name</div>
        <div style={{ position: 'absolute', left: 875, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>Author name</div>
        <div style={{ position: 'absolute', left: 1090, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>Author name</div>
        <div style={{ position: 'absolute', left: 1303, top: 3770.5, width: 135, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 510, fontStyle: 'Medium', fontSize: 12, lineHeight: '17px', letterSpacing: '0%', textAlign: 'center', color: 'rgba(204, 62, 0, 1)', boxSizing: 'border-box', zIndex: 16 }}>Author name</div>
      </div>
                <Link href="/search-book" aria-label="View all Books" style={{
            position: 'absolute',
            left: 1312,
            top: 3507.5,
            width: 122,
            height: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial',
            fontWeight: 400,
            fontStyle: 'Regular',
            fontSize: 18,
            lineHeight: '17px',
            verticalAlign: 'middle',
            color: 'rgba(204, 62, 0, 0.8)',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textDecorationThickness: '7%',
            textDecorationSkipInk: 'auto',
            textDecorationColor: 'rgba(204, 62, 0, 0.8)',
            boxSizing: 'border-box',
            zIndex: 90
          }}>View all Books</Link>
                {/* Secondary strip (placeholder) */}
          <div role="region" aria-label="Secondary strip" style={{
            position: 'absolute',
            width: 1234,
            height: 75,
            top: 3910,
            left: 176,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            boxSizing: 'border-box',
            background: 'transparent',
            borderTop: '1px solid rgba(33, 12, 0, 0.52)',
            zIndex: 20
          }}>
            {/* left: copyright */}
            <div style={{ width: 226, height: 20, display: 'flex', alignItems: 'center', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontStyle: 'normal', fontSize: '13px', lineHeight: '20px', letterSpacing: '-0.24px', color: 'rgba(33, 12, 0, 0.74)' }}>
              © 2026 Copyright All Rights Reserved
            </div>

            {/* center: small nav links */}
            <nav aria-label="Footer quick links" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="#" style={{ color: 'rgba(33,12,0,0.6)', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 13, textDecoration: 'none' }}>Home</a>
              <div style={{ width: 4, height: 4, borderRadius: 9999, background: 'rgba(33,12,0,0.3)' }} />
              <a href="#" style={{ color: 'rgba(33,12,0,0.6)', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 13, textDecoration: 'none' }}>About us</a>
              <div style={{ width: 4, height: 4, borderRadius: 9999, background: 'rgba(33,12,0,0.3)' }} />
              <a href="#" style={{ color: 'rgba(33,12,0,0.6)', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 13, textDecoration: 'none' }}>Careers</a>
              <div style={{ width: 4, height: 4, borderRadius: 9999, background: 'rgba(33,12,0,0.3)' }} />
              <a href="#" style={{ color: 'rgba(33,12,0,0.6)', fontFamily: 'SF Pro, "SF Pro Text", -apple-system, Arial', fontWeight: 400, fontSize: 13, textDecoration: 'none' }}>Blog</a>
            </nav>

            <div style={{ flex: 1 }} />

            {/* right: social / small icons */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* small X */}
              <button aria-label="Close" style={{ width: 28, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', padding: 0, color: 'rgba(33,12,0,0.6)', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M1 1L11 11M11 1L1 11" stroke="rgba(33,12,0,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* instagram */}
              <a href="#" aria-label="Instagram" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(33,12,0,0.6)', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="rgba(33,12,0,0.6)" strokeWidth="1.2" fill="none" />
                  <circle cx="12" cy="11" r="3" stroke="rgba(33,12,0,0.6)" strokeWidth="1.2" fill="none" />
                  <circle cx="17.5" cy="6.5" r="0.9" fill="rgba(33,12,0,0.6)" />
                </svg>
              </a>

              {/* facebook */}
              <a href="#" aria-label="Facebook" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(33,12,0,0.6)', textDecoration: 'none' }}>
                <svg width="12" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M8.6 0H6.9C5.3 0 4.5.9 4.5 2.2V3.8H3v2.6h1.5V14h2.6V6.4H9.8L10 3.8H7.9V2.6c0-.6.2-.9.7-.9h.9V0z" fill="rgba(33,12,0,0.6)" />
                </svg>
              </a>

              {/* linkedin */}
              <a href="#" aria-label="LinkedIn" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(33,12,0,0.6)', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect x="2" y="6" width="4" height="12" rx="1" fill="rgba(33,12,0,0.6)" />
                  <path d="M9 10.5v7h4v-3.7c0-1.98 3-2.14 3 0V17.5h4v-4.58c0-4.36-4.66-4.2-6.18-2.05V10.5H9z" fill="rgba(33,12,0,0.6)" />
                  <circle cx="4" cy="4" r="1.3" fill="rgba(33,12,0,0.6)" />
                </svg>
              </a>
            </div>
          </div>
    </main>
  );
}
