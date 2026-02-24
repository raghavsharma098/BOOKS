'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { reviewsApi } from '../../../lib/api';
import MobileDrawer from '../../components/MobileDrawer';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

// icons
import likeIcon from '../../../images/heart.png';
import reviewIcon from '../../../images/comments.png';
import heartIcon from '../../../icons/heart.png';
import bookIcon from '../../../images/bookread.png';
import calendarIcon from '../../../images/calendar.png';
import pencilIcon from '../../../images/pencil.png';
import { getImageUrl } from '../../../lib/api';
import verifiedIcon from '../../../images/verified.png';
import recentIcon from '../../../icons/recent.png';

// Public profile page (fetches from backend /api/users/:id, falls back to mock data)
export default function PublicProfilePage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = (params as any)?.id || 'mock-user';

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(MOCK_PROFILE);

  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [heartFilled, setHeartFilled] = useState(false);

  const handleLike = async (reviewId: string) => {
    try {
      setLikedReviews((prev) => {
        const next = new Set(prev);
        if (next.has(reviewId)) next.delete(reviewId);
        else next.add(reviewId);
        return next;
      });
      await reviewsApi.toggleLike(reviewId);
    } catch (err) {
      console.error('like failed', err);
    }
  };

  const handleViewDiscussion = (reviewId: string) => {
    router.push(`/reviews/${reviewId}`);
  };

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
        setProfile({
          id: user._id || user.id || id,
          name: user.name || 'Unknown',
          username: user.username || 'username',
          bio: user.bio || MOCK_PROFILE.bio,
          profilePicture: user.profilePicture || MOCK_PROFILE.profilePicture,
          followers: user.followers?.length ?? MOCK_PROFILE.followers,
          booksRead: user.stats?.yearly?.totalBooks ?? MOCK_PROFILE.booksRead,
          reviewsCount: user.reviews?.length ?? MOCK_PROFILE.reviewsCount,
          pagesReadThisYear: user.stats?.yearly?.totalPages ?? MOCK_PROFILE.pagesReadThisYear,
          averageRating: user.stats?.averageRating ?? MOCK_PROFILE.averageRating,
          readingStreak: user.stats?.streak ?? MOCK_PROFILE.readingStreak,
          favoriteGenres: user.preferredGenres || MOCK_PROFILE.favoriteGenres,
          currentlyReading: MOCK_PROFILE.currentlyReading,
          recentlyCompleted: MOCK_PROFILE.recentlyCompleted,
          reviews: MOCK_PROFILE.reviews,
        });
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

  // placeholder data for Published Books (admin will provide real data later)
  const PUBLISHED_PLACEHOLDERS = [
    { title: 'Echoes of Belonging', date: 'March 2024', cover: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=300&q=60', rating: '4.6', reviews: '12.4K' },
    { title: 'Harry Potter', date: 'March 2024', cover: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=300&q=60', rating: '4.6', reviews: '12.4K' },
    { title: 'The Chronicles', date: 'March 2024', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=60', rating: '4.6', reviews: '12.4K' },
    { title: 'The East Wind', date: 'March 2024', cover: 'https://images.unsplash.com/photo-1476958526483-36efcaa80f58?auto=format&fit=crop&w=300&q=60', rating: '4.6', reviews: '12.4K' },
    { title: 'Fear No Evil', date: 'March 2024', cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=300&q=60', rating: '4.6', reviews: '12.4K' },
  ];

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
          <div className="relative bg-[#FFFFFFB2] rounded-[16px] p-5 sm:p-6 shadow-md flex flex-col sm:flex-row gap-4 sm:items-center lg:col-span-2" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
<div className="flex-shrink-0 w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[128px] md:h-[128px] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] overflow-hidden bg-gray-100 mt-4 sm:-mt-16 md:-mt-[88px]" style={{ paddingLeft: 0, borderTop: '0.8px solid #60351B33', borderWidth: '0.8px', borderStyle: 'solid', boxShadow: '0px 25px 50px -12px #00000040', opacity: 1, transform: 'rotate(0deg)' }}>
              <img src={getImageUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-sf font-[590] text-[22px] sm:text-[28px] md:text-[35px] leading-[28px] sm:leading-[34px] md:leading-[40px] tracking-[-0.5px] sm:tracking-[-0.7px] md:tracking-[-0.9px] align-middle text-[#210C00] truncate">{profile.name}</h1>
                    <span className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto flex items-center justify-center text-[12px] font-sf font-[500] text-white" style={{ width: '161px', height: '32px', paddingLeft: profile.isVerified ? '16px' : '8px', gap: profile.isVerified ? '8px' : '0', borderRadius: '26843500px', background: 'linear-gradient(180deg, #60351B 0%, #4A2816 100%)', boxShadow: '0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A', opacity: 1 }}>
                      {profile.isVerified && <Image src={verifiedIcon} alt="verified" width={16} height={16} className="object-contain" />}
                      {profile.isVerified ? 'Verified Author' : 'Active Reader'}
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs md:text-sm text-[#8B5A3C] mt-0.5 sm:mt-1 truncate">@{profile.username}</div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <button className="px-2 sm:px-3 py-1 rounded-full bg-[#60351B] text-white text-[12px] sm:text-sm font-medium whitespace-nowrap">+ Follow</button>
                </div>
              </div>

              <p className="mt-3 font-sf font-[400] text-[14px] sm:text-[16px] md:text-[18px] leading-[22px] sm:leading-[26px] md:leading-[29.25px] tracking-[0px] text-[#210C00B2] overflow-hidden line-clamp-3 sm:line-clamp-4" style={{ maxWidth: '100%', opacity: 1 }}>{profile.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                <div onClick={() => setHeartFilled((f) => !f)} className="rounded-[16px] sm:rounded-[20px] flex items-center justify-center gap-1.5 sm:gap-2 w-auto cursor-pointer" style={{ height: '36px', background: '#60351B0D', borderTop: '0.8px solid #60351B0D', borderWidth: '0.8px', padding: '6px 10px', borderRadius: '20px', opacity: 1 }}>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">
                    <Image src={heartIcon} alt="followers" width={16} height={16} className="object-contain" style={{ filter: heartFilled ? 'invert(27%) sepia(85%) saturate(7476%) hue-rotate(331deg) brightness(99%) contrast(106%)' : undefined }} />
                  </div>
                  <div className="text-[12px] sm:text-sm font-semibold text-[#8B5A3C] flex items-center gap-1">
                    <span className="font-sf font-[590] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[28px] text-[#210C00]">{(profile.followers + (heartFilled ? 1 : 0)).toLocaleString()}</span>
                    <span className="text-[10px] sm:text-xs text-[rgba(33,12,0,0.6)]">followers</span>
                  </div>
                </div>

                <div className="rounded-[16px] sm:rounded-[20px] flex items-center justify-center gap-1.5 sm:gap-2 w-auto" style={{ height: '36px', background: '#60351B0D', borderTop: '0.8px solid #60351B1A', borderWidth: '0.8px', padding: '6px 10px', borderRadius: '20px', opacity: 1 }}>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">
                    <Image src={bookIcon} alt="books read" width={16} height={16} className="object-contain" />
                  </div>
                  <div className="text-[12px] sm:text-sm font-semibold text-[#8B5A3C] flex items-center gap-1">
                    <span className="font-sf font-[590] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[28px] text-[#210C00]">{profile.booksRead.toLocaleString()}</span>
                    <span className="text-[10px] sm:text-xs text-[rgba(33,12,0,0.6)]">books</span>
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
          {/* Published books (placeholder) — matches profile header width */}
          <div className="bg-[#FFFFFFB2] rounded-[12px] p-4 sm:p-5 shadow-sm lg:col-span-2" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-sf font-[590] text-[18px] leading-[24px] text-[#210C00]">Published Books</div>
                <div className="text-sm text-[rgba(33,12,0,0.45)] mt-1">{PUBLISHED_PLACEHOLDERS.length} published books</div>
              </div>
              <a className="text-sm text-[#8B5A3C] hover:underline ml-4">View all works →</a>
            </div>

            <div className="mt-4">
              {/* responsive grid: min column 188px, expand to fill available space */}
              <div className="overflow-x-auto sm:overflow-visible -mx-1 px-1">
                <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(188px, 1fr))', alignItems: 'start' }}>
                  {PUBLISHED_PLACEHOLDERS.map((b, i) => (
                    <div key={i} className="w-full">
                      <div
                        className="w-full h-[282px] overflow-hidden"
                        style={{
                          borderRadius: '12px 2px 2px 12px',
                          boxShadow: '7px 0px 4px 0px #00000073 inset, 0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, -8px 11px 9px 0px #00000078, 0px 5px 5.3px 0px #FFFFFF40'
                        }}
                      >
                        <img
                          src={b.cover}
                          alt={b.title}
                          className="w-full h-full object-cover"
                          style={{ transform: 'rotate(0deg)', opacity: 1, position: 'relative', top: '0.21px', left: '0.2px' }}
                        />
                      </div>

                      <div className="mt-3 text-sm font-[600] text-[#210C00] truncate">{b.title}</div>
                      <div className="text-xs text-[rgba(33,12,0,0.6)] mt-1">{b.date}</div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-[rgba(33,12,0,0.6)]">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="#FE9A00" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09L5.49 11.454 1 7.91l6.068-.88L10 1l2.932 6.03L19 7.91l-4.49 3.545 1.368 6.636z"/></svg>
                        <div className="font-semibold text-[#210C00]">{b.rating}</div>
                        <div className="text-xs text-[rgba(33,12,0,0.6)]">({b.reviews})</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <section>
            {/* Reviews list */}
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[24px] sm:leading-[28px] tracking-[0px] align-middle text-[#210C00]">Reviews</h2>
                <div className="text-[12px] sm:text-sm text-[rgba(33,12,0,0.45)]">{profile.reviews.length} reviews</div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {profile.reviews.map((r: any, idx: number) => (
                  <article key={idx} className="bg-[#FFFFFFB2] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 md:p-5 shadow-sm flex gap-2.5 sm:gap-3 md:gap-4 h-auto min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:h-[200px] overflow-hidden" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
                    <div className="w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-22 lg:w-20 lg:h-28 rounded overflow-hidden flex-shrink-0 bg-gray-100" style={{ boxShadow: '7px 0px 4px 0px #00000073 inset, 0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, -8px 11px 9px 0px #00000078, 0px 5px 5.3px 0px #FFFFFF40, -24px 27px 22.4px 11px #60351B2B' }}>
                      <img src={r.cover} alt={r.bookTitle} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="min-w-0">
                          <h3 className="font-sf font-[590] text-[15px] sm:text-[17px] md:text-[20px] leading-[20px] sm:leading-[24px] md:leading-[27.5px] text-[#210C00] truncate">{r.bookTitle}</h3>
                          <div className="text-[10px] sm:text-[11px] md:text-xs text-[rgba(33,12,0,0.6)] mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-1 sm:gap-x-2">
                            <span className="truncate">by {r.bookAuthor}</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="inline-flex items-center gap-0.5 sm:gap-1" aria-hidden="true">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 20 20" fill={i < r.rating ? '#FE9A00' : 'rgba(33,12,0,0.12)'} xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 15l-5.878 3.09L5.49 11.454 1 7.91l6.068-.88L10 1l2.932 6.03L19 7.91l-4.49 3.545 1.368 6.636z" />
                                </svg>
                              ))}
                            </span>
                            <span className="hidden sm:inline text-[rgba(33,12,0,0.6)]">{r.date}</span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-1.5 sm:mt-2 md:mt-3 font-sf font-[400] text-[12px] sm:text-[13px] md:text-[15px] leading-[18px] sm:leading-[20px] md:leading-[24.38px] text-[#210C00CC] line-clamp-2 sm:line-clamp-2 md:line-clamp-3">{r.excerpt}</p>

                      <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-[11px] md:text-xs text-[rgba(33,12,0,0.6)]">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleLike(r.id)}
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative"
                            aria-label="Like review"
                          >
                            <Image
                              src={likeIcon}
                              alt="likes"
                              width={16}
                              height={16}
                              className="object-contain"
                              style={{ filter: likedReviews.has(r.id) ? 'invert(27%) sepia(85%) saturate(7476%) hue-rotate(331deg) brightness(99%) contrast(106%)' : undefined }}
                            />
                          </button>
                          <div>{r.likes + (likedReviews.has(r.id) ? 1 : 0)}</div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleViewDiscussion(r.id)}
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative"
                            aria-label="View discussion"
                          >
                            <Image
                              src={reviewIcon}
                              alt="comments"
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                          </button>
                          <div>{r.comments}</div>
                        </div>

                        <a className="text-[#8B5A3C] hidden sm:inline">View discussion →</a>
                      </div>
                    </div>
                  </article>
                ))}
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
            </div>

            <div className="bg-[#FFFFFFB2] rounded-[12px] p-3 sm:p-4 shadow-sm" style={{ borderTop: '0.8px solid rgba(96, 53, 27, 0.2)' }}>
              <div className="font-sf font-[590] text-[14px] sm:text-[16px] leading-[24px] sm:leading-[28px] tracking-[0px] align-middle text-[#210C00]">Currently Reading</div>
              <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                {profile.currentlyReading.map((b: any, idx: number) => (
                  <div key={`${b.title}-${idx}`} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-14 sm:w-12 sm:h-16 overflow-hidden rounded-sm bg-gray-100 flex-shrink-0" style={{ boxShadow: '7px 0px 4px 0px #00000073 inset, 0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, -8px 11px 9px 0px #00000078, 0px 5px 5.3px 0px #FFFFFF40, -24px 27px 22.4px 11px #60351B2B' }}><img src={b.cover} alt={b.title} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] sm:text-sm font-medium truncate">{b.title}</div>
                      <div className="text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)]">{b.author}</div>
                      <div className="mt-1.5 sm:mt-2 w-full max-w-full h-[5px] sm:h-[6px] bg-[rgba(96,53,27,0.08)] overflow-hidden" style={{ borderRadius: '26843500px', opacity: 1 }}>
                        <div className="h-full bg-[#60351B]" style={{ width: `${b.progress}%`, borderRadius: '26843500px', opacity: 1 }} />
                      </div>
                    </div>
                    <div className="text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)]">{b.progress}%</div>
                  </div>
                ))}
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
                {profile.recentlyCompleted.map((c: any, idx: number) => (
                  <React.Fragment key={`${c.title}-${idx}`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-10 sm:w-10 sm:h-12 overflow-hidden rounded-sm bg-gray-100 flex-shrink-0" style={{ boxShadow: '7px 0px 4px 0px #00000073 inset, 0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, -8px 11px 9px 0px #00000078, 0px 5px 5.3px 0px #FFFFFF40, -24px 27px 22.4px 11px #60351B2B' }}>
                        <img src={c.cover} alt={c.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-sf font-[590] text-[14px] sm:text-[16px] text-[#210C00] truncate">{c.title}</div>
                        <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)] truncate">{c.author || 'Unknown author'}</div>
                        <div className="mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[rgba(33,12,0,0.6)]">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 relative flex-shrink-0">
                            <Image src={calendarIcon} alt="date" width={16} height={16} className="object-contain" />
                          </div>
                          <div className="truncate">{c.date}</div>
                        </div>
                      </div>
                    </div>

                    {idx < profile.recentlyCompleted.length - 1 && <div className="my-2 sm:my-3 border-t border-[rgba(96,53,27,0.08)]" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ---------------------- Mock data ----------------------
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
  favoriteGenres: [
    { name: 'Literary Fiction', percent: 42 },
    { name: 'Science Fiction', percent: 28 },
    { name: 'Poetry', percent: 18 },
    { name: 'Non‑Fiction', percent: 12 },
  ],
  currentlyReading: [
    { title: 'The Overstory', author: 'Richard Powers', cover: 'https://images.unsplash.com/photo-1526318472351-c75fcf070f85?auto=format&fit=crop&w=300&q=60', progress: 67 },
    { title: 'The Overstory', author: 'Richard Powers', cover: 'https://images.unsplash.com/photo-1526318472351-c75fcf070f85?auto=format&fit=crop&w=300&q=60', progress: 78 },
  ],
  recentlyCompleted: [
    { title: 'The Remains of the Day', author: 'Kazuo Ishiguro', date: 'Jan 15, 2026', cover: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=300&q=60' },
    { title: 'Pachinko', author: 'Min Jin Lee', date: 'Dec 20, 2025', cover: 'https://images.unsplash.com/photo-1476958526483-36efcaa80f58?auto=format&fit=crop&w=300&q=60' },
    { title: 'Harry Potter', author: 'J. K. Rowlings', date: 'Dec 10, 2025', cover: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=300&q=60' },
  ],
  reviews: [
    {
      id: 'r1',
      bookTitle: 'The Remains of the Day',
      bookAuthor: 'Kazuo Ishiguro',
      rating: 5,
      date: 'Jan 15, 2026',
      excerpt: "Ishiguro's masterful exploration of memory, dignity, and regret. The unreliable narrator slowly reveals layers of self-deception, making this a profound meditation on what we choose to remember and what we choose to forget.",
      cover: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=300&q=60',
      likes: 23,
      comments: 7,
    },
    {
      id: 'r2',
      bookTitle: 'Lincoln in the Bardo',
      bookAuthor: 'George Saunders',
      rating: 4,
      date: 'Nov 22, 2025',
      excerpt: "A moving, experimental novel — funny, strange, and heartbreakingly human. Saunders uses a chorus of voices to interrogate grief and the afterlife.",
      cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=300&q=60',
      likes: 12,
      comments: 3,
    },
    {
      id: 'r3',
      bookTitle: 'The Overstory',
      bookAuthor: 'Richard Powers',
      rating: 5,
      date: 'Oct 03, 2025',
      excerpt: "A novel of ideas and action — a thrilling defense of interdependence and the natural world.",
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=60',
      likes: 34,
      comments: 11,
    },
  ],
};