'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { statsApi, userApi, readingApi } from '../../lib/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileDrawer from '../components/MobileDrawer';
import UserNavbar from '../components/UserNavbar';
import { useMobileMenu } from '../contexts/MobileMenuContext';

// Types
interface StatsOverview {
  booksRead: number;
  pagesRead: number;
  hoursReading: number;
  reviewsWritten: number;
}

interface ReadingActivityData {
  labels: string[];
  values: number[];
}

interface GenreData {
  name: string;
  value: number;
  color: string;
}

interface MoodData {
  name: string;
  value: number;
  color: string;
}

interface WeeklySummary {
  daysRead: number;
  totalDays: number;
  completionRate: number;
}

interface ChallengeProgress {
  current: number;
  goal: number;
  monthlyData: { month: string; value: number }[];
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

interface YearSummary {
  year: number;
  booksCompleted: number;
  topGenre: string;
  longestStreak: number;
  favoriteAuthor: string;
}

// Default/placeholder data
const defaultStats: StatsOverview = {
  booksRead: 47,
  pagesRead: 14800,
  hoursReading: 17,
  reviewsWritten: 23,
};

const defaultReadingActivity: ReadingActivityData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  values: [3, 5, 4, 6, 8, 5, 4, 7, 6, 5, 4, 3],
};

const defaultGenreData: GenreData[] = [
  { name: 'Literary Fiction', color: '#A855F7', value: 35 },
  { name: 'Mystery', color: '#3B82F6', value: 25 },
  { name: 'Romance', color: '#F472B6', value: 20 },
  { name: 'Sci-Fi', color: '#22C55E', value: 12 },
  { name: 'Non-Fiction', color: '#F59E0B', value: 8 },
];

const defaultMoodData: MoodData[] = [
  { name: 'Hopeful', color: '#F59E0B', value: 40 },
  { name: 'Reflective', color: '#3B82F6', value: 25 },
  { name: 'Adventurous', color: '#22C55E', value: 20 },
  { name: 'Mysterious', color: '#A855F7', value: 15 },
];

const defaultWeeklySummary: WeeklySummary = {
  daysRead: 6,
  totalDays: 7,
  completionRate: 86,
};

const defaultChallengeProgress: ChallengeProgress = {
  current: 47,
  goal: 52,
  monthlyData: [
    { month: 'Jan', value: 4 }, { month: 'Feb', value: 5 }, { month: 'Mar', value: 4 },
    { month: 'Apr', value: 6 }, { month: 'May', value: 5 }, { month: 'Jun', value: 4 },
    { month: 'Jul', value: 3 }, { month: 'Aug', value: 5 }, { month: 'Sep', value: 4 },
    { month: 'Oct', value: 4 }, { month: 'Nov', value: 3 }, { month: 'Dec', value: 0 },
  ],
};

const defaultAchievements: Achievement[] = [
  { id: '1', name: 'Bookworm', icon: '📚', unlocked: true, description: 'Read 10 books' },
  { id: '2', name: 'Speed Reader', icon: '⚡', unlocked: true, description: 'Finish a book in one day' },
  { id: '3', name: 'Reviewer', icon: '✍️', unlocked: true, description: 'Write 10 reviews' },
  { id: '4', name: 'Genre Explorer', icon: '🌍', unlocked: false, description: 'Read from 5 different genres' },
];

const defaultYearSummary: YearSummary = {
  year: 2026,
  booksCompleted: 47,
  topGenre: 'Literary Fiction',
  longestStreak: 14,
  favoriteAuthor: 'Retra Ema',
};

// Chart components
function BarChart({ data, maxHeight = 120 }: { data: ReadingActivityData; maxHeight?: number }) {
  const maxValue = Math.max(...data.values, 1);
  return (
    <div className="flex items-end justify-between gap-1 sm:gap-2 h-[120px]">
      {data.values.map((value, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full bg-gradient-to-t from-[#8B7355] to-[#A08060] rounded-t-sm transition-all duration-300"
            style={{ height: `${(value / maxValue) * maxHeight}px`, minHeight: value > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-[#6B6B6B]">{data.labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size = 140, strokeWidth = 24 }: { data: { name: string; value: number; color: string }[]; size?: number; strokeWidth?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((segment, i) => {
        const segmentLength = (segment.value / total) * circumference;
        const dashArray = `${segmentLength} ${circumference - segmentLength}`;
        const rotation = (offset / total) * 360 - 90;
        offset += segment.value;
        
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}

function PieChart({ data, size = 160 }: { data: GenreData[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  const slices = data.map((segment, i) => {
    const angle = (segment.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 2;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
        fill={segment.color}
        className="transition-all duration-300 hover:opacity-80"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
    </svg>
  );
}

function LineChart({ data, height = 100 }: { data: ChallengeProgress['monthlyData']; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 100;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (d.value / maxValue) * height,
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[100px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B7355" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B7355" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lineGradient)" />
      <path d={pathD} fill="none" stroke="#8B7355" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8B7355" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

function MonthlyBarChart({ data }: { data: ChallengeProgress['monthlyData'] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const colors = ['#A855F7', '#3B82F6', '#22C55E', '#F59E0B'];
  
  return (
    <div className="flex items-end justify-between gap-1 h-[100px]">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-sm transition-all duration-300"
            style={{ 
              height: `${(d.value / maxValue) * 80}px`, 
              minHeight: d.value > 0 ? '4px' : '0',
              backgroundColor: colors[i % colors.length],
            }}
          />
          <span className="text-[9px] text-[#6B6B6B]">{d.month.substring(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

// Share Report Modal Component
interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StatsOverview;
  year: number;
}

function ShareReportModal({ isOpen, onClose, stats, year }: ShareReportModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareData, setShareData] = useState({
    booksRead: stats.booksRead,
    pagesRead: stats.pagesRead,
    avgSpeed: Math.round(stats.pagesRead / Math.max(stats.booksRead, 1) / 7),
    totalReviews: stats.reviewsWritten,
  });

  // Fetch share data from backend
  useEffect(() => {
    if (isOpen) {
      statsApi.getReadingInsights(year)
        .then((res: any) => {
          if (res?.data) {
            setShareData({
              booksRead: res.data.booksRead ?? stats.booksRead,
              pagesRead: res.data.pagesRead ?? stats.pagesRead,
              avgSpeed: res.data.avgSpeed ?? Math.round(stats.pagesRead / Math.max(stats.booksRead, 1) / 7),
              totalReviews: res.data.reviewsWritten ?? stats.reviewsWritten,
            });
          }
        })
        .catch(() => {
          // Keep default values
        });
    }
  }, [isOpen, year, stats]);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `reading-report-${year}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    setCopying(true);
    try {
      const shareUrl = `${window.location.origin}/reading-insights?share=${year}`;
      await navigator.clipboard.writeText(shareUrl);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      setCopying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30" 
        style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-[1001]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#210C00]">Share Your Reading Report</h2>
            <p className="text-sm text-[#6B6B6B] mt-1">Generate a shareable summary of your year in reading</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <svg className="w-5 h-5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shareable Card Preview */}
        <div 
          ref={cardRef}
          className="bg-gradient-to-br from-[#60351B] to-[#4a2914] rounded-xl p-6 text-white mb-6"
        >
          <div className="text-center">
            <p className="text-white/70 text-sm mb-1">My Reading in</p>
            <p className="text-white/90 text-lg font-medium mb-4">{year}</p>
            
            <div className="text-5xl font-bold mb-6">{shareData.booksRead} Books</div>
            
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-white/60 text-xs mb-1">Pages Read</p>
                <p className="text-lg font-semibold">{shareData.pagesRead.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Avg Speed</p>
                <p className="text-lg font-semibold">{shareData.avgSpeed} pages/day</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/20">
              <p className="text-white/70 text-sm">Total Reviews given : {shareData.totalReviews}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="w-full py-3 bg-[#60351B] text-white rounded-full font-medium hover:bg-[#4a2914] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              'Download as Image'
            )}
          </button>
          
          <button
            onClick={handleCopyLink}
            disabled={copying}
            className="w-full py-3 bg-white border border-[#E8E4D9] text-[#210C00] rounded-full font-medium hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2"
          >
            {copying ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link Copied!
              </>
            ) : (
              'Copy Link to Report'
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 text-[#6B6B6B] font-medium hover:text-[#210C00] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReadingInsightsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();
  
  // State for all stats data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsOverview>(defaultStats);
  const [readingActivity, setReadingActivity] = useState<ReadingActivityData>(defaultReadingActivity);
  const [genreData, setGenreData] = useState<GenreData[]>(defaultGenreData);
  const [moodData, setMoodData] = useState<MoodData[]>(defaultMoodData);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>(defaultWeeklySummary);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress>(defaultChallengeProgress);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [yearSummary, setYearSummary] = useState<YearSummary>(defaultYearSummary);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activityPeriod, setActivityPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    async function fetchAllStats() {
      setLoading(true);
      try {
        // Fetch all stats in parallel
        const [
          insightsRes,
          activityRes,
          genreRes,
          moodRes,
          weeklyRes,
          challengeRes,
          achievementsRes,
        ] = await Promise.allSettled([
          statsApi.getReadingInsights(selectedYear),
          statsApi.getReadingActivity(activityPeriod, selectedYear),
          statsApi.getGenreBreakdown(),
          statsApi.getMoodsBreakdown(),
          statsApi.getWeeklySummary(),
          statsApi.getChallengeProgress(selectedYear),
          statsApi.getAchievements(),
        ]);

        // Update state with fetched data or keep defaults
        if (insightsRes.status === 'fulfilled') {
          const data = (insightsRes.value as any)?.data;
          if (data) {
            setStats({
              booksRead: data.booksRead ?? defaultStats.booksRead,
              pagesRead: data.pagesRead ?? defaultStats.pagesRead,
              hoursReading: data.hoursReading ?? defaultStats.hoursReading,
              reviewsWritten: data.reviewsWritten ?? defaultStats.reviewsWritten,
            });
            if (data.yearSummary) {
              setYearSummary(data.yearSummary);
            }
          }
        }

        if (activityRes.status === 'fulfilled') {
          const data = (activityRes.value as any)?.data;
          if (data) setReadingActivity(data);
        }

        if (genreRes.status === 'fulfilled') {
          const data = (genreRes.value as any)?.data;
          if (data) setGenreData(data);
        }

        if (moodRes.status === 'fulfilled') {
          const data = (moodRes.value as any)?.data;
          if (data) setMoodData(data);
        }

        if (weeklyRes.status === 'fulfilled') {
          const data = (weeklyRes.value as any)?.data;
          if (data) setWeeklySummary(data);
        }

        if (challengeRes.status === 'fulfilled') {
          const data = (challengeRes.value as any)?.data;
          if (data) setChallengeProgress(data);
        }

        if (achievementsRes.status === 'fulfilled') {
          const data = (achievementsRes.value as any)?.data;
          if (data) setAchievements(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    }

    fetchAllStats();
  }, [selectedYear, activityPeriod]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <main className="min-h-screen bg-[#F2F0E4]">
      {/* Mobile top bar */}
      <MobileTopBar>
        <div className="flex-1">
          <SearchBar
            asHeader
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
            showFilters={false}
          />
        </div>
      </MobileTopBar>

      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* Main Content */}
      <div className="w-full lg:ml-24">
        {/* Top Bar - Desktop/Tablet */}
        <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search..." showFilters={false} />
              </div>
              <UserNavbar />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00]">Reading Insights</h1>
                <p className="text-sm text-[#6B6B6B] mt-1">Understand your reading patterns and progress</p>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#60351B] text-white rounded-full text-sm font-medium hover:bg-[#4a2914] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Report
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#60351B]" />
              </div>
            ) : (
              <>
                {/* Stats Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {/* Books Read */}
                  <div className="bg-white rounded-xl p-4 border border-[#E8E4D9]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#210C00]">{stats.booksRead}</div>
                    <div className="text-xs text-[#6B6B6B]">Books Read</div>
                  </div>

                  {/* Pages Read */}
                  <div className="bg-white rounded-xl p-4 border border-[#E8E4D9]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#22C55E]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#210C00]">{formatNumber(stats.pagesRead)}</div>
                    <div className="text-xs text-[#6B6B6B]">Pages Read</div>
                  </div>

                  {/* Hours Reading */}
                  <div className="bg-white rounded-xl p-4 border border-[#E8E4D9]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#EDE7F6] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#A855F7]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#210C00]">{stats.hoursReading}</div>
                    <div className="text-xs text-[#6B6B6B]">Hours Reading</div>
                  </div>

                  {/* Reviews Written */}
                  <div className="bg-white rounded-xl p-4 border border-[#E8E4D9]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#E3F2FD] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#3B82F6]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#210C00]">{stats.reviewsWritten}</div>
                    <div className="text-xs text-[#6B6B6B]">Reviews</div>
                  </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Reading Activity Chart */}
                  <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 border border-[#E8E4D9]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base sm:text-lg font-semibold text-[#210C00]">Reading Activity</h2>
                      <select
                        value={activityPeriod}
                        onChange={(e) => setActivityPeriod(e.target.value as 'week' | 'month' | 'year')}
                        className="text-sm border border-[#E8E4D9] rounded-lg px-3 py-1.5 bg-white text-[#210C00]"
                      >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>
                    <BarChart data={readingActivity} />
                  </div>

                  {/* Year Summary Card */}
                  <div className="bg-[#60351B] rounded-xl p-4 sm:p-6 text-white">
                    <div className="text-4xl sm:text-5xl font-bold mb-4">{yearSummary.year}</div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Books Completed</span>
                        <span className="font-semibold">{yearSummary.booksCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Top Genre</span>
                        <span className="font-semibold text-sm">{yearSummary.topGenre}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Longest Streak</span>
                        <span className="font-semibold">{yearSummary.longestStreak} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Favorite Author</span>
                        <span className="font-semibold text-sm">{yearSummary.favoriteAuthor}</span>
                      </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                      Share Your Year
                    </button>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                  {/* Genre Breakdown */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#E8E4D9]">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">Genre Breakdown</h2>
                    <div className="flex items-center gap-4">
                      <PieChart data={genreData} size={120} />
                      <div className="flex-1 space-y-2">
                        {genreData.map((genre, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: genre.color }} />
                            <span className="text-xs text-[#210C00] flex-1 truncate">{genre.name}</span>
                            <span className="text-xs text-[#6B6B6B]">{genre.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* This Week Summary */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#E8E4D9]">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">This Week</h2>
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-[#6B6B6B] mb-1">Days Read</div>
                        <div className="text-2xl font-bold text-[#210C00]">
                          {weeklySummary.daysRead} / {weeklySummary.totalDays} <span className="text-sm font-normal text-[#6B6B6B]">Days</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-[#6B6B6B] mb-1">Completion</div>
                        <div className="w-full bg-[#E8E4D9] rounded-full h-3">
                          <div
                            className="bg-[#22C55E] h-3 rounded-full transition-all duration-500"
                            style={{ width: `${weeklySummary.completionRate}%` }}
                          />
                        </div>
                        <div className="text-right text-xs text-[#6B6B6B] mt-1">{weeklySummary.completionRate}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Reading Moods */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#E8E4D9]">
                    <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">Reading Moods</h2>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <DonutChart data={moodData} size={100} strokeWidth={16} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-[#210C00]">{stats.booksRead}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {moodData.map((mood, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mood.color }} />
                            <span className="text-xs text-[#210C00] flex-1">{mood.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reading Performance Analysis */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#E8E4D9] mt-6">
                  <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">Reading Performance Analysis</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#E8E4D9" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#F59E0B" strokeWidth="6" strokeDasharray={`${(75 / 100) * 176} 176`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#210C00]">75%</span>
                      </div>
                      <div className="text-xs text-[#6B6B6B]">Goal Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#E8E4D9" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#3B82F6" strokeWidth="6" strokeDasharray={`${(90 / 100) * 176} 176`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#210C00]">90%</span>
                      </div>
                      <div className="text-xs text-[#6B6B6B]">Consistency</div>
                    </div>
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#E8E4D9" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#22C55E" strokeWidth="6" strokeDasharray={`${(60 / 100) * 176} 176`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#210C00]">60%</span>
                      </div>
                      <div className="text-xs text-[#6B6B6B]">Diversity</div>
                    </div>
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#E8E4D9" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#A855F7" strokeWidth="6" strokeDasharray={`${(85 / 100) * 176} 176`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#210C00]">85%</span>
                      </div>
                      <div className="text-xs text-[#6B6B6B]">Engagement</div>
                    </div>
                  </div>
                </div>

                {/* Reading Challenge Progress */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#E8E4D9] mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-[#210C00]">{selectedYear} Reading Challenge Progress</h2>
                      <p className="text-xs text-[#6B6B6B]">Track your progress toward your annual goal</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-[#210C00]">
                        {challengeProgress.current}/{challengeProgress.goal}
                      </div>
                      <div className="text-xs text-[#6B6B6B]">Books</div>
                    </div>
                  </div>
                  <LineChart data={challengeProgress.monthlyData} />
                  <div className="flex justify-between mt-2">
                    {challengeProgress.monthlyData.map((d, i) => (
                      <span key={i} className="text-[9px] text-[#6B6B6B]">{d.month.substring(0, 3)}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E8E4D9]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#8B7355]" />
                      <span className="text-xs text-[#6B6B6B]">Books</span>
                    </div>
                    <div className="text-xs text-[#6B6B6B]">
                      <span className="font-semibold text-[#210C00]">{Math.round((challengeProgress.current / challengeProgress.goal) * 100)}%</span> complete
                    </div>
                    <div className="text-xs text-[#6B6B6B]">
                      <span className="font-semibold text-[#210C00]">{challengeProgress.goal - challengeProgress.current}</span> books to go
                    </div>
                  </div>
                </div>

                {/* Monthly Challenge Breakdown */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#E8E4D9] mt-6">
                  <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">Monthly Challenge Breakdown</h2>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#A855F7]" />
                      <span className="text-xs text-[#6B6B6B]">Fiction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                      <span className="text-xs text-[#6B6B6B]">Non-Fiction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                      <span className="text-xs text-[#6B6B6B]">Mystery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                      <span className="text-xs text-[#6B6B6B]">Romance</span>
                    </div>
                  </div>
                  <MonthlyBarChart data={challengeProgress.monthlyData} />
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#E8E4D9] mt-6">
                  <h2 className="text-base sm:text-lg font-semibold text-[#210C00] mb-4">Achievements</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`text-center p-4 rounded-xl border transition-all ${
                          achievement.unlocked
                            ? 'bg-[#FFF8E7] border-[#F59E0B]/30'
                            : 'bg-[#F5F5F5] border-[#E8E4D9] opacity-50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <div className="text-sm font-medium text-[#210C00]">{achievement.name}</div>
                        <div className="text-xs text-[#6B6B6B] mt-1">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Share Report Modal */}
      <ShareReportModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stats={stats}
        year={selectedYear}
      />
    </main>
  );
}
