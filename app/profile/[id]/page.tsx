'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import MobileDrawer from '../../components/MobileDrawer';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

// icons
import likeIcon from '../../../images/heart.png';
import reviewIcon from '../../../images/comments.png';
import heartIcon from '../../../images/heart.png';
import bookIcon from '../../../images/bookread.png';
import calendarIcon from '../../../images/calendar.png';
import pencilIcon from '../../../images/pencil.png';
import recentIcon from '../../../icons/recent.png';
import { getImageUrl, tokenManager, userApi } from '../../../lib/api';
import verifiedIcon from '../../../images/verified.png';

// Public profile page (fetches from backend /api/users/:id, falls back to mock data)
export default function PublicProfilePage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = (params as any)?.id || 'mock-user';

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(MOCK_PROFILE);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(MOCK_PROFILE.followers);
  const [followLoading, setFollowLoading] = useState(false);

  // Real dynamic data
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState<any[]>([]);
  const [recentlyCompletedBooks, setRecentlyCompletedBooks] = useState<any[]>([]);
  const [publishedBooks, setPublishedBooks] = useState<any[]>([]);

  // Read from localStorage only on the client (avoids SSR hydration mismatch)
  useEffect(() => {
    setCurrentUserId((tokenManager.getUser() as any)?._id as string | undefined);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || '';
        if (!API) throw new Error('No API base URL');

        const res = await fetch(`${API}/users/${id}`);
        if (!res.ok) throw new Error('Profile not available');
        const json = await res.json();
        const user = json?.data || json;

        if (!mounted) return;

        // normalize shape (backend user -> UI-friendly profile)
        const isVerified = user.role === 'verified_author' || !!user.isVerified;
        const normalizedProfile = {
          id: user._id || user.id || id,
          name: user.name || 'Unknown',
          username: user.username || 'username',
          bio: user.bio || '',
          profilePicture: user.profilePicture || '',
          role: user.role || 'user',
          isVerified,
          followers: user.followers?.length ?? 0,
          booksRead: user.stats?.totalBooksRead ?? 0,
          reviewsCount: user.stats?.totalReviews ?? 0,
          pagesReadThisYear: 0,
          averageRating: user.stats?.averageRating ?? 0,
          readingStreak: 0,
          favoriteGenres: Array.isArray(user.preferredGenres) && user.preferredGenres.length > 0
            ? user.preferredGenres.map((g: any) => typeof g === 'string' ? { name: g, percent: 0 } : g)
            : [],
          readingGoals: user.readingGoals,
        };

        // If own profile has no genres saved, try to recover from localStorage quiz data and save to backend
        const ownId = (tokenManager.getUser() as any)?._id?.toString();
        const profileId = (user._id || user.id || id)?.toString();
        if (normalizedProfile.favoriteGenres.length === 0 && ownId && ownId === profileId) {
          const storedGenres = localStorage.getItem('quizGenres');
          if (storedGenres) {
            try {
              const genres: string[] = JSON.parse(storedGenres);
              if (Array.isArray(genres) && genres.length > 0) {
                normalizedProfile.favoriteGenres = genres.map((g) => ({ name: g, percent: 0 }));
                // Save to backend so it persists
                const token = localStorage.getItem('accessToken');
                if (token) {
                  fetch(`${API}/users/preferences`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ preferredGenres: genres }),
                  }).catch(() => {/* non-critical */});
                }
              }
            } catch { /* ignore parse errors */ }
          }
        }

        setProfile(normalizedProfile);
        const followersList: any[] = Array.isArray(user.followers) ? user.followers : [];
        setFollowersCount(followersList.length);
        setIsFollowing(!!currentUserId && followersList.some((f: any) => (f?._id || f)?.toString() === currentUserId?.toString()));

        // Fetch user reviews, reading list, stats, and (for authors) published books in parallel
        const [reviewsRes, readingRes, booksRes, statsRes]: any[] = await Promise.all([
          userApi.getUserReviews(user._id || id).catch(() => ({ data: [] })),
          userApi.getUserReadingList(user._id || id).catch(() => ({ data: { currentlyReading: [], recentlyFinished: [] } })),
          isVerified ? userApi.getUserPublishedBooks(user._id || id).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          userApi.getUserStats(user._id || id).catch(() => ({ data: null })),
        ]);

        if (!mounted) return;

        // Update stats with real aggregated values if available
        const realStats = statsRes?.data;
        if (realStats) {
          setProfile((prev: any) => ({
            ...prev,
            pagesReadThisYear: realStats.yearly?.totalPages ?? prev.pagesReadThisYear,
            averageRating: realStats.averageRating ?? prev.averageRating,
            readingStreak: realStats.streak ?? prev.readingStreak,
            booksRead: prev.isVerified ? prev.booksRead : (realStats.yearly?.totalBooks ?? prev.booksRead),
          }));
        }

        const reviews = Array.isArray(reviewsRes?.data) ? reviewsRes.data : [];
        setUserReviews(reviews);
        // sync the header badge count with real review count
        setProfile((prev: any) => ({ ...prev, reviewsCount: reviews.length }));
        const readingData = readingRes?.data || {};
        const currentlyReadingList = Array.isArray(readingData.currentlyReading) ? readingData.currentlyReading : [];
        const recentlyFinishedList = Array.isArray(readingData.recentlyFinished) ? readingData.recentlyFinished : [];
        setCurrentlyReadingBooks(currentlyReadingList);
        setRecentlyCompletedBooks(recentlyFinishedList);

        // Calculate genre percentages from reading history
        const allReadingEntries = [...currentlyReadingList, ...recentlyFinishedList];
        const genreCounts: Record<string, number> = {};
        let totalGenreOccurrences = 0;
        allReadingEntries.forEach((entry: any) => {
          const bookGenres: string[] = Array.isArray(entry.book?.genres) ? entry.book.genres : [];
          bookGenres.forEach((genre: string) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            totalGenreOccurrences++;
          });
        });
        setProfile((prev: any) => ({
          ...prev,
          favoriteGenres: prev.favoriteGenres.map((g: any) => {
            const count = genreCounts[g.name] || 0;
            const percent = totalGenreOccurrences > 0 ? Math.round((count / totalGenreOccurrences) * 100) : 0;
            return { ...g, percent };
          }),
        }));

        const pubBooks = Array.isArray(booksRes?.data) ? booksRes.data : [];
        setPublishedBooks(pubBooks);
        // For verified authors, always use published books count in the stats badge
        if (isVerified) {
          setProfile((prev: any) => ({ ...prev, booksRead: pubBooks.length }));
        }
      } catch (err) {
        // keep mock on error
        console.warn('Could not load public profile — using mock:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [id]);

  const annualGoal = profile?.readingGoals?.annual || profile?.readingGoal || 17500;
  const pagesReadPercent = Math.round(((profile?.pagesReadThisYear || 0) / (annualGoal || 1)) * 100);

  const isOwnProfile = !!currentUserId && currentUserId?.toString() === profile?.id?.toString();

  async function handleFollow() {
    if (!currentUserId) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userApi.unfollowUser(profile.id);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        await userApi.followUser(profile.id);
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } catch {
      // silently ignore
    } finally {
      setFollowLoading(false);
    }
  }

  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();

  return (
    <main className="min-h-screen bg-[#F2F0E4]">
<MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      <div className="lg:pl-[96px] px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 w-full max-w-[1280px] mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[rgba(33,12,0,0.6)] hover:text-[#210C00]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6B4A33]"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-sm">Back to homepage</span>
          </button>
        </div>

        {/* Profile header + two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* header card (full width) */}
          <div className="bg-[#FFFFFFB2] rounded-[16px] p-5 sm:p-6 shadow-md flex flex-col sm:flex-row gap-4 sm:items-start lg:col-span-2 overflow-visible">
            <div className="flex-shrink-0 w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[128px] md:h-[128px] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] overflow-hidden bg-gray-100 mt-1 sm:mt-1" style={{ borderTop: '0.8px solid #60351B33', borderWidth: '0.8px', borderStyle: 'solid', boxShadow: '0px 25px 50px -12px #00000040' }}>
              <img src={getImageUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-sf font-[590] text-[22px] sm:text-[28px] md:text-[35px] leading-[28px] sm:leading-[34px] md:leading-[40px] tracking-[-0.5px] sm:tracking-[-0.7px] md:tracking-[-0.9px] align-middle text-[#210C00] truncate">{profile.name}</h1>
                    {profile.isVerified && (
                      <span className="flex items-center justify-center gap-1.5 px-3 h-[28px] text-[11px] font-sf font-[500] text-white" style={{ borderRadius: '26843500px', background: 'linear-gradient(180deg, #60351B 0%, #4A2816 100%)', boxShadow: '0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A', flexShrink: 0 }}>
                        <Image src={verifiedIcon} alt="verified" width={14} height={14} className="object-contain" />
                        Verified Author
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] sm:text-xs md:text-sm text-[#8B5A3C] mt-0.5 sm:mt-1 truncate">@{profile.username}</div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {isOwnProfile ? (
                    <button onClick={() => window.location.href = '/settings/account'} className="px-2 sm:px-3 py-1 rounded-full border border-[rgba(96,53,27,0.12)] font-sf font-[590] text-[14px] leading-[20px] text-[#60351B] text-center whitespace-nowrap flex items-center gap-1.5">
                      <Image src={pencilIcon} alt="edit" width={16} height={16} className="object-contain" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button onClick={handleFollow} disabled={followLoading} className={`px-3 sm:px-4 py-1 rounded-full font-sf font-[590] text-[13px] sm:text-[14px] leading-[20px] whitespace-nowrap transition-colors ${isFollowing ? 'bg-[#60351B]/10 text-[#60351B] border border-[rgba(96,53,27,0.2)]' : 'bg-[#60351B] text-white'}`}>
                      {followLoading ? '…' : isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-3 font-sf font-[400] text-[14px] sm:text-[16px] md:text-[18px] leading-[22px] sm:leading-[26px] md:leading-[29.25px] tracking-[0px] text-[#210C00B2] overflow-hidden line-clamp-3 sm:line-clamp-4" style={{ maxWidth: '100%', opacity: 1 }}>{profile.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                <div className="rounded-[16px] sm:rounded-[20px] flex items-center justify-center gap-1.5 sm:gap-2 w-auto" style={{ height: '36px', background: '#60351B0D', borderTop: '0.8px solid #60351B0D', borderWidth: '0.8px', padding: '6px 10px', borderRadius: '20px', opacity: 1 }}>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">
                    <Image src={heartIcon} alt="followers" width={16} height={16} className="object-contain" />
                  </div>
                  <div className="text-[12px] sm:text-sm font-semibold text-[#8B5A3C] flex items-center gap-1">
                    <span className="font-sf font-[590] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[28px] text-[#210C00]">{followersCount.toLocaleString()}</span>
                    <span className="text-[10px] sm:text-xs text-[rgba(33,12,0,0.6)]">followers</span>
                  </div>
                </div>

                <div className="rounded-[16px] sm:rounded-[20px] flex items-center justify-center gap-1.5 sm:gap-2 w-auto" style={{ height: '36px', background: '#60351B0D', borderTop: '0.8px solid #60351B1A', borderWidth: '0.8px', padding: '6px 10px', borderRadius: '20px', opacity: 1 }}>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">
                    <Image src={bookIcon} alt="books read" width={16} height={16} className="object-contain" />
                  </div>
                  <div className="text-[12px] sm:text-sm font-semibold text-[#8B5A3C] flex items-center gap-1">
                    <span className="font-sf font-[590] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[28px] text-[#210C00]">{profile.booksRead.toLocaleString()}</span>
                    <span className="text-[10px] sm:text-xs text-[rgba(33,12,0,0.6)]">{profile.isVerified ? 'published' : 'books'}</span>
                  </div>
                </div>

                <div className="rounded-[16px] sm:rounded-[20px] flex items-center justify-center gap-1.5 sm:gap-2 w-auto" style={{ height: '36px', background: '#60351B0D', borderTop: '0.8px solid #60351B1A', borderWidth: '0.8px', padding: '6px 10px', borderRadius: '20px', opacity: 1 }}>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">
                    <Image src={reviewIcon} alt="reviews" width={16} height={16} className="object-contain" />
                  </div>
                  <div className="text-[12px] sm:text-sm font-semibold text-[#8B5A3C] flex items-center gap-1">
                    <span className="font-sf font-[590] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[28px] text-[#210C00]">{profile.reviewsCount.toLocaleString()}</span>
                    <span className="text-[10px] sm:text-xs text-[rgba(33,12,0,0.6)]">reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Published Books — shown only for verified authors */}
          {profile.isVerified && (
            <div className="bg-[#FFFFFFB2] rounded-[12px] p-4 sm:p-5 shadow-sm lg:col-span-2" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-sf font-[590] text-[16px] sm:text-[18px] leading-[24px] text-[#210C00]">Published Books</div>
                  <div className="text-xs sm:text-sm text-[rgba(33,12,0,0.45)] mt-1">by {profile.name}</div>
                </div>
                <a className="text-sm text-[#8B5A3C] hover:underline ml-4">View all →</a>
              </div>
              <div className="grid gap-4 sm:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {publishedBooks.length === 0 ? (
                  <p className="text-sm text-[rgba(33,12,0,0.45)] col-span-full">No published books yet.</p>
                ) : publishedBooks.map((b: any, i: number) => (
                  <div key={b._id || i} className="w-full">
                    <div className="w-full h-[200px] sm:h-[240px] overflow-hidden" style={{ borderRadius: '12px 2px 2px 12px', boxShadow: '7px 0px 4px 0px #00000073 inset, 0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, -8px 11px 9px 0px #00000078' }}>
                      <img src={getImageUrl(b.coverImage)} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-2 text-sm font-[600] text-[#210C00] truncate">{b.title}</div>
                    <div className="text-xs text-[rgba(33,12,0,0.6)] mt-0.5">{b.publishedDate ? new Date(b.publishedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}</div>
                    {b.averageRating > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[rgba(33,12,0,0.6)]">
                        <svg width="11" height="11" viewBox="0 0 20 20" fill="#FE9A00"><path d="M10 15l-5.878 3.09L5.49 11.454 1 7.91l6.068-.88L10 1l2.932 6.03L19 7.91l-4.49 3.545 1.368 6.636z"/></svg>
                        <span className="font-semibold text-[#210C00]">{b.averageRating?.toFixed(1)}</span>
                        {b.ratingsCount > 0 && <span>({b.ratingsCount >= 1000 ? `${(b.ratingsCount / 1000).toFixed(1)}K` : b.ratingsCount})</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <section>
            {/* Reviews list */}
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[24px] sm:leading-[28px] tracking-[0px] align-middle text-[#210C00]">Reviews</h2>
                <div className="text-[12px] sm:text-sm text-[rgba(33,12,0,0.45)]">{userReviews.length} reviews</div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {userReviews.length === 0 ? (
                  <p className="text-sm text-[rgba(33,12,0,0.45)] py-4">No reviews written yet.</p>
                ) : userReviews.map((r: any, idx: number) => {
                  const bookTitle = r.book?.title || 'Unknown Book';
                  const bookAuthor = typeof r.book?.author === 'string' ? r.book.author : (r.book?.author?.name || '');
                  const cover = getImageUrl(r.book?.coverImage);
                  const reviewDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  return (
                  <article key={r._id || idx} className="bg-[#FFFFFFB2] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 md:p-5 shadow-sm flex gap-2.5 sm:gap-3 md:gap-4 h-auto min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:h-[200px] overflow-hidden" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
                    <div className="w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-22 lg:w-20 lg:h-28 rounded overflow-hidden flex-shrink-0 bg-gray-100" style={{ boxShadow: '7px 0px 4px 0px #00000073 inset, 0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, -8px 11px 9px 0px #00000078, 0px 5px 5.3px 0px #FFFFFF40, -24px 27px 22.4px 11px #60351B2B' }}>
                      <img src={cover} alt={bookTitle} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="min-w-0">
                          <h3 className="font-sf font-[590] text-[15px] sm:text-[17px] md:text-[20px] leading-[20px] sm:leading-[24px] md:leading-[27.5px] text-[#210C00] truncate">{bookTitle}</h3>
                          <div className="text-[10px] sm:text-[11px] md:text-xs text-[rgba(33,12,0,0.6)] mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-1 sm:gap-x-2">
                            {bookAuthor && <span className="truncate">by {bookAuthor}</span>}
                            <span className="hidden sm:inline">·</span>
                            <span className="inline-flex items-center gap-0.5 sm:gap-1" aria-hidden="true">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 20 20" fill={i < r.rating ? '#FE9A00' : 'rgba(33,12,0,0.12)'} xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 15l-5.878 3.09L5.49 11.454 1 7.91l6.068-.88L10 1l2.932 6.03L19 7.91l-4.49 3.545 1.368 6.636z" />
                                </svg>
                              ))}
                            </span>
                            <span className="hidden sm:inline text-[rgba(33,12,0,0.6)]">{reviewDate}</span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-1.5 sm:mt-2 md:mt-3 font-sf font-[400] text-[12px] sm:text-[13px] md:text-[15px] leading-[18px] sm:leading-[20px] md:leading-[24.38px] text-[#210C00CC] line-clamp-2 sm:line-clamp-2 md:line-clamp-3">{r.reviewText}</p>

                      <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-[11px] md:text-xs text-[rgba(33,12,0,0.6)]">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative">
                            <Image src={likeIcon} alt="likes" width={16} height={16} className="object-contain" />
                          </div>
                          <div>{r.likeCount ?? r.likes ?? 0}</div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative">
                            <Image src={reviewIcon} alt="comments" width={16} height={16} className="object-contain" />
                          </div>
                          <div>{r.commentCount ?? r.comments ?? 0}</div>
                        </div>

                        <a className="text-[#8B5A3C] hidden sm:inline">View →</a>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right column (sidebar) */}
          <aside className="space-y-4 lg:mt-6">
            <div className="bg-[#FFFFFFB2] rounded-[12px] p-3 sm:p-4 shadow-sm" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[24px] sm:leading-[28px] tracking-[0px] align-middle text-[#210C00]">This Year</div>
                <div className="text-[13px] sm:text-sm text-[rgba(33,12,0,0.45)]">{new Date().getFullYear()}</div>
              </div>

              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="text-[13px] sm:text-sm text-[rgba(33,12,0,0.6)]">Pages Read</div>
                <div className="text-xl sm:text-2xl font-semibold text-[#210C00]">{profile.pagesReadThisYear.toLocaleString()}</div>
              </div>

              <div className="mb-2">
                <div className="w-full max-w-full h-[5px] sm:h-[6px] bg-[rgba(96,53,27,0.08)] rounded-full overflow-hidden" style={{ borderRadius: '26843500px' }}>
                  <div className="h-full bg-[#60351B]" style={{ width: `${Math.min(pagesReadPercent, 100)}%`, borderRadius: '26843500px' }} />
                </div>
                <div className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm text-[rgba(33,12,0,0.6)]">{Math.min(pagesReadPercent, 100)}% of annual goal</div>
              </div>

              <div className="my-2 sm:my-3 border-t border-[rgba(96,53,27,0.08)]" />

              <div className="mt-2 sm:mt-3 grid grid-cols-1 gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)]">
                <div className="flex items-center justify-between"><div>Average Rating</div><div className="font-semibold text-[#210C00]">{profile.averageRating} / 5</div></div>
                <div className="flex items-center justify-between"><div>Reading Streak</div><div className="font-semibold text-[#210C00]">{profile.readingStreak} days</div></div>
              </div>
            </div>

            <div className="bg-[#FFFFFFB2] rounded-[12px] p-3 sm:p-4 shadow-sm" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
              <div className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[24px] sm:leading-[28px] tracking-[0px] align-middle text-[#210C00]">Favorite Genres</div>
              {profile.favoriteGenres.length === 0 ? (
                <p className="mt-2 text-sm text-[rgba(33,12,0,0.45)]">No favorite genres set.</p>
              ) : profile.favoriteGenres.every((g: any) => g.percent === 0) ? (
                // No reading history yet — show as pill chips
                <div className="mt-2 sm:mt-3 flex flex-wrap gap-2">
                  {profile.favoriteGenres.map((g: any) => (
                    <span
                      key={g.name}
                      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] sm:text-[13px] font-medium bg-[rgba(96,53,27,0.09)] text-[#60351B] border border-[rgba(96,53,27,0.18)]"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              ) : (
                // Has reading history — show bars with real percentages
                <div className="mt-2 sm:mt-3 space-y-3 sm:space-y-4">
                  {profile.favoriteGenres.map((g: any) => (
                    <div key={g.name} className="w-full">
                      <div className="flex items-center justify-between">
                        <div className="text-[13px] sm:text-sm text-[rgba(33,12,0,0.7)]">{g.name}</div>
                        <div className="text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)]">{g.percent}%</div>
                      </div>
                      <div className="mt-1.5 sm:mt-2 w-full max-w-full h-[5px] sm:h-[6px] bg-[rgba(96,53,27,0.08)] overflow-hidden" style={{ borderRadius: '26843500px', opacity: 1 }}>
                        <div className="h-full bg-[#60351B]" style={{ width: `${g.percent}%`, borderRadius: '26843500px', opacity: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#FFFFFFB2] rounded-[12px] p-3 sm:p-4 shadow-sm" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
              <div className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[24px] sm:leading-[28px] tracking-[0px] align-middle text-[#210C00]">Currently Reading</div>
              <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                {currentlyReadingBooks.length === 0 ? (
                  <p className="text-sm text-[rgba(33,12,0,0.45)]">Not reading anything right now.</p>
                ) : currentlyReadingBooks.map((entry: any, idx: number) => {
                  const b = entry.book || {};
                  const title = b.title || 'Unknown';
                  const author = typeof b.author === 'string' ? b.author : (b.author?.name || '');
                  const cover = getImageUrl(b.coverImage);
                  const progress = entry.percentage ?? 0;
                  return (
                  <div key={entry._id || idx} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-14 sm:w-12 sm:h-16 overflow-hidden rounded-sm bg-gray-100 flex-shrink-0" style={{ boxShadow: '7px 0px 4px 0px #00000073 inset, 0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, -8px 11px 9px 0px #00000078, 0px 5px 5.3px 0px #FFFFFF40, -24px 27px 22.4px 11px #60351B2B' }}><img src={cover} alt={title} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] sm:text-sm font-medium truncate">{title}</div>
                      <div className="text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)]">{author}</div>
                      <div className="mt-1.5 sm:mt-2 w-full max-w-full h-[5px] sm:h-[6px] bg-[rgba(96,53,27,0.08)] overflow-hidden" style={{ borderRadius: '26843500px', opacity: 1 }}>
                        <div className="h-full bg-[#60351B]" style={{ width: `${progress}%`, borderRadius: '26843500px', opacity: 1 }} />
                      </div>
                    </div>
                    <div className="text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)]">{progress}%</div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#FFFFFFB2] rounded-[12px] p-3 sm:p-4 shadow-sm" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
              <div className="flex items-center gap-2">
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '16px',
                  paddingTop: '8px',
                  paddingRight: '8px',
                  paddingLeft: '8px',
                  transform: 'rotate(0deg)',
                  opacity: 1,
                  background: 'linear-gradient(135deg, rgba(96, 53, 27, 0.2) 0%, rgba(96, 53, 27, 0.1) 100%)'
                }}>
                  <Image src={recentIcon} alt="Recent" width={20} height={20} className="object-contain" />
                </div>
                <div className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[24px] sm:leading-[28px] tracking-[0px] align-middle text-[#210C00]">Recently Completed</div>
              </div>
              <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                {recentlyCompletedBooks.length === 0 ? (
                  <p className="text-sm text-[rgba(33,12,0,0.45)]">No completed books yet.</p>
                ) : recentlyCompletedBooks.map((entry: any, idx: number) => {
                  const c = entry.book || {};
                  const title = c.title || 'Unknown';
                  const author = typeof c.author === 'string' ? c.author : (c.author?.name || '');
                  const cover = getImageUrl(c.coverImage);
                  const finishedDate = entry.finishDate ? new Date(entry.finishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  return (
                  <React.Fragment key={entry._id || idx}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-10 sm:w-10 sm:h-12 overflow-hidden rounded-sm bg-gray-100 flex-shrink-0" style={{ boxShadow: '7px 0px 4px 0px #00000073 inset, 0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, -8px 11px 9px 0px #00000078, 0px 5px 5.3px 0px #FFFFFF40, -24px 27px 22.4px 11px #60351B2B' }}>
                        <img src={cover} alt={title} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-sf font-[590] text-[14px] sm:text-[16px] text-[#210C00] truncate">{title}</div>
                        <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)] truncate">{author || 'Unknown author'}</div>
                        {finishedDate && (
                          <div className="mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)]">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 relative flex-shrink-0">
                              <Image src={calendarIcon} alt="date" width={16} height={16} className="object-contain" />
                            </div>
                            <div className="truncate">{finishedDate}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {idx < recentlyCompletedBooks.length - 1 && <div className="my-2 sm:my-3 border-t border-[rgba(96,53,27,0.08)]" />}
                  </React.Fragment>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ---------------------- Mock data (fallback skeleton) ----------------------
const MOCK_PROFILE = {
  id: 'mock-user',
  name: 'Sarah Chen',
  bio: 'Literary fiction enthusiast exploring contemporary Asian-American narratives and the intersection of memory, identity, and belonging. Always searching for stories that challenge perspective and deepen understanding.',
  profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  followers: 284,
  booksRead: 127,
  reviewsCount: 43,
  pagesReadThisYear: 12847,
  averageRating: 4.2,
  readingStreak: 23,
  favoriteGenres: [] as { name: string; percent: number }[],
};