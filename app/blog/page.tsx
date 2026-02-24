import Navbar from '../homepage/Navbar';
import NewsletterSubscribe from '../homepage/NewsletterSubscribe';
import Footer from '../homepage/Footer';
import Link from 'next/link';
import Image from 'next/image';
import featuredBadge from '../../images/featured.png';
import arrowIcon from '../../images/white arrow.png';
import user2 from '../../images/user2.png';
import clockIcon from '../../images/clock.png';
import bigreadbook from '../../images/bigreadbook.png';
import React from 'react';

type BlogPost = {
  _id?: string;
  id?: string;
  title: string;
  excerpt?: string;
  image?: string;
  author?: { name?: string };
  readTime?: string;
  likes?: number;
  comments?: number;
  publishedAt?: string;
  slug?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchPosts(limit = 9): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE}/blogs?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('no-api');
    const json = await res.json();
    // support several backend shapes: { data: posts } | { posts: [...] } | postsArray
    return json.data || json.posts || json || [];
  } catch (err) {
    return [];
  }
}

export default async function BlogPage() {
  const postsFromApi = await fetchPosts(9);

  const samplePosts: BlogPost[] = [
    {
      title: 'The Science of Reading: How Your Brain Processes Stories',
      excerpt: 'Discover the fascinating neuroscience behind reading and how our brains create entire worlds from simple text on a page.',
      image: '/images/card1.png',
      author: { name: 'Dr. Sarah Mitchell' },
      readTime: '8 min read',
      likes: 12500,
      comments: 342,
      slug: 'science-of-reading',
    },
    {
      title: '10 Books That Will Change Your Perspective on Life',
      excerpt: 'A curated list of transformative reads that challenge conventional thinking and expand your worldview.',
      image: '/images/card2.png',
      author: { name: 'Emma Wilson' },
      readTime: '6 min read',
      likes: 8200,
      comments: 256,
      slug: '10-books-change-perspective',
    },
    {
      title: 'Interview: Best-Selling Author James Thompson',
      excerpt: 'An intimate conversation about creativity, discipline, and the art of storytelling.',
      image: '/images/card3.png',
      author: { name: 'James Thompson' },
      readTime: '9 min read',
      likes: 6700,
      comments: 193,
      slug: 'interview-james-thompson',
    },
    // more placeholder items to fill the grid
    {
      title: 'What Makes a Review Trustworthy?',
      excerpt: 'How to read reviews critically and spot useful recommendations.',
      image: '/images/card4.png',
      author: { name: 'Editorial Team' },
      readTime: '5 min read',
      slug: 'what-makes-a-review-trustworthy',
    },
  ];

  const posts = postsFromApi.length ? postsFromApi : samplePosts;
  const featured = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Page hero / search */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="mb-3 font-bold text-[22px] sm:text-[26px] md:text-[30px] leading-[1.25] tracking-[0px] text-[#210C00]">
            Explore the World of Reading
          </h1>
          <p className="text-sm sm:text-base text-[#6B6560] mb-6">Stories, insights, and inspiration for passionate readers</p>

          <div className="max-w-xl">
            <label htmlFor="blog-search" className="sr-only">Search blogs</label>
            <div className="relative">
              <input
                id="blog-search"
                name="q"
                placeholder="Search articles, topics, or authors..."
                className="w-full md:w-[672px] rounded-xl border border-[#E8E4D9] border-t-[1.6px] border-t-[#60351B33] px-4 py-3 text-sm placeholder:text-[#6B6560]/50"
              />
            </div>
          </div>



        </div>
      </section>

      {/* Content area */}
      <section className="py-10 sm:py-14 md:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured */}
          {featured && (
            <article className="mb-8 sm:mb-10 md:mb-12 rounded-2xl overflow-hidden transition-all">
              {/* image hero */}
              <div className="relative w-full h-[240px] sm:h-[320px] md:h-[360px] lg:h-[420px] overflow-hidden flex items-center justify-center">
                {featured.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#E6DDD6] to-[#D6C8BF]" />
                )}

                {/* gradient overlay */}
                <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'linear-gradient(0deg, rgba(33, 12, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)' }} />

                {/* top-left badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#60351B] text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg text-[9px] sm:text-[11px] font-semibold flex items-center gap-1.5 sm:gap-2">
                  <Image src={featuredBadge} alt="featured" width={18} height={18} className="rounded-sm object-contain w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
                  FEATURED STORY
                </div>

                {/* center decorative icon */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20 text-4xl sm:text-5xl md:text-6xl text-[#C9B7A9]">📚</div>

                {/* bottom-right stats */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-[#3b2b21] text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs shadow-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" fill="currentColor"/>
                    </svg>
                    <span className="font-medium">{featured.likes && featured.likes >= 1000 ? `${(featured.likes/1000).toFixed(1)}K` : featured.likes ?? '12.5K'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 bg-[#3b2b21] text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs shadow-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                      <path d="M20.8 4.6c-1.6-1.4-4-1.2-5.5.4L12 8l-3.3-2.9c-1.5-1.6-3.9-1.8-5.5-.4-1.9 1.7-2 4.9-.1 6.8L12 21.4l8.9-9.9c1.9-1.9 1.8-5.1-.1-6.9z" fill="currentColor"/>
                    </svg>
                    <span className="font-medium">{featured.comments && featured.comments >= 1000 ? `${(featured.comments/1000).toFixed(1)}K` : featured.comments ?? '342'}</span>
                  </div>
                </div>
              </div>

              {/* copy below image */}
              <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-6 md:py-8">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-[#6B6560] mb-3 sm:mb-4">
                  <span className="bg-[#F2F0E4] rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-[#60351B] font-semibold">READING TIPS</span>
                  <span className="text-xs hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-[12px] sm:text-[14px] leading-[20px] font-normal text-[#210C0099]">
                    <Image src={clockIcon} alt="read time" width={14} height={14} className="object-contain w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                    {featured.readTime ?? '8 min read'}
                  </span>
                </div>

                    <h2 className="mb-4 font-bold text-[22px] sm:text-[26px] md:text-[30px] leading-[1.25] tracking-[0px] text-[#210C00]">{featured.title}</h2>
                {featured.excerpt && (
                  <p className="text-[15px] sm:text-[16px] md:text-[18px] leading-[1.6] text-[#210C00B2] font-normal max-w-3xl mb-6">
                    {featured.excerpt}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Image src={user2} alt={featured.author?.name ?? 'Author'} width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                    <div>
                      <div className="text-[13px] sm:text-[14px] leading-[20px] font-[590] text-[#210C0099]">{featured.author?.name ?? 'Dr. Sarah Mitchell'}</div>
                      <div className="text-[11px] sm:text-xs text-[#6B6560]">Neuroscience Writer · Feb 5, 2026</div>
                    </div>
                  </div>

                  <Link href={`/blog/${featured.slug ?? featured._id ?? '#'}`} className="text-sm text-[#60351B] font-medium hover:underline">Read Full Article →</Link>
                </div>
              </div>
            </article>
          )}

          {/* Trending / grid */}
          <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[12px] sm:rounded-[16px] bg-[#60351B1A] flex items-center justify-center p-2 sm:p-3">
                <Image src={arrowIcon} alt="arrow" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00]">Trending Now</h3>
            </div>
            <div className="text-sm text-[#6B6560]">Latest from the editorial team</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            {gridPosts.slice(0,2).length ? (
              gridPosts.slice(0,2).map((post, idx) => {
                const category = (post as any).category || (post.title?.toLowerCase().includes('interview') ? 'AUTHOR INTERVIEWS' : 'BOOK REVIEWS');
                return (
                  <article key={post._id ?? post.slug ?? idx} className="rounded-2xl overflow-hidden transition-all h-full flex flex-col">
                    {/* image on top with overlays */}
                    <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden flex items-center justify-center">
                      {post.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-[#E6DDD6] to-[#D6C8BF]" />
                      )}

                      {/* gradient overlay */}
                      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'linear-gradient(0deg, rgba(33, 12, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)' }} />

                      {/* top-left pill */}
                      <div className="absolute top-4 left-4 bg-[#60351B] text-white px-3 py-1.5 rounded-full shadow-md text-[11px] font-semibold flex items-center gap-2">
                        <Image src={arrowIcon} alt="trending" width={14} height={14} className="object-contain" />
                        TRENDING
                      </div>

                      {/* bottom-left stats */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-[#3b2b21] text-white px-3 py-1.5 rounded-full text-xs shadow-md">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" fill="currentColor"/>
                          </svg>
                          <span className="font-medium">{post.likes && post.likes >= 1000 ? `${(post.likes/1000).toFixed(1)}K` : post.likes ?? '8.2K'}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-[#3b2b21] text-white px-3 py-1.5 rounded-full text-xs shadow-md">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M20.8 4.6c-1.6-1.4-4-1.2-5.5.4L12 8l-3.3-2.9c-1.5-1.6-3.9-1.8-5.5-.4-1.9 1.7-2 4.9-.1 6.8L12 21.4l8.9-9.9c1.9-1.9 1.8-5.1-.1-6.9z" fill="currentColor"/>
                          </svg>
                          <span className="font-medium">{post.comments && post.comments >= 1000 ? `${(post.comments/1000).toFixed(1)}K` : post.comments ?? '256'}</span>
                        </div>
                      </div>
                    </div>

                    {/* content below image */}
                    <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-3 sm:gap-4">
                      {category === 'BOOK REVIEWS' ? (
                        <div className="text-[10px] sm:text-[11px] font-bold text-[#60351B] uppercase tracking-wider inline-flex w-fit h-[24px] sm:h-[28px] rounded-[12px] sm:rounded-[16px] py-[4px] sm:py-[6px] px-[10px] sm:px-[12px] bg-[#60351B1A] items-center justify-center whitespace-nowrap">{category}</div>
                      ) : category === 'AUTHOR INTERVIEWS' ? (
                        <div className="text-[10px] sm:text-[11px] font-bold text-[#60351B] uppercase tracking-wider inline-flex w-fit h-[24px] sm:h-[28px] rounded-[12px] sm:rounded-[16px] py-[4px] sm:py-[6px] px-[10px] sm:px-[12px] bg-[#60351B1A] items-center justify-center whitespace-nowrap">{category}</div>
                      ) : (
                        <div className="w-fit h-[22px] sm:h-[24px] text-[10px] sm:text-xs font-bold text-[#60351B] uppercase tracking-wider bg-[#60351B1A] inline-block rounded-[4px] pt-1 pr-3 pb-1 pl-3">{category}</div>
                      )}
                      <h4 className="font-bold text-[20px] sm:text-[24px] md:text-[30px] leading-[1.25] tracking-[0px] text-[#210C00]">{post.title}</h4>
                      {post.excerpt && (
                        <p className="text-[14px] sm:text-[16px] md:text-[18px] leading-[1.6] text-[#210C00B2] font-normal mt-1 sm:mt-2">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Image src={user2} alt={post.author?.name ?? 'Author'} width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <span className="text-[12px] sm:text-[14px] leading-[20px] font-[590] text-[#210C0099]">{post.author?.name ?? 'Emma Wilson'}</span>
                            <span className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-[12px] sm:text-[14px] leading-[20px] font-normal text-[#210C0099]">
                              <Image src={clockIcon} alt="read time" width={14} height={14} className="object-contain w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                              {post.readTime ?? '6 min read'}
                            </span>
                          </div>
                        </div>

                        <Link href={`/blog/${post.slug ?? post._id ?? '#'}`} className="text-xs sm:text-sm text-[#60351B] font-medium hover:underline">Read Full Article →</Link>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-3 text-center text-sm text-[#6B6560]">No posts available yet — check back after the admin publishes articles.</div>
            )}
          </div>

        </div>
      </section>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Latest Articles */}
        <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#F6F3EE] flex items-center justify-center">
              <Image src={bigreadbook} alt="icon" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00]">Latest Articles</h3>
          </div>
          <div className="text-sm text-[#6B6560]">{posts.length} articles</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {gridPosts.length ? (
            gridPosts.map((post, idx) => {
              const category = (post as any).category ?? 'READING TIPS';
              return (
                <article key={post._id ?? post.slug ?? idx} className="rounded-2xl overflow-hidden transition-all h-full flex flex-col bg-white shadow-sm">
                  {/* image */}
                  <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden flex items-center justify-center">
                    {post.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-[#E6DDD6] to-[#D6C8BF]" />
                    )}

                    {/* gradient overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'linear-gradient(0deg, rgba(33, 12, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)' }} />

                    {/* bottom-left stats */}
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-[#3b2b21] text-white px-3 py-1.5 rounded-full text-xs shadow-md">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        </svg>
                        <span className="font-medium">{post.likes && post.likes >= 1000 ? `${(post.likes/1000).toFixed(1)}K` : post.likes ?? '5.9K'}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-[#3b2b21] text-white px-3 py-1.5 rounded-full text-xs shadow-md">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M20.8 4.6c-1.6-1.4-4-1.2-5.5.4L12 8l-3.3-2.9c-1.5-1.6-3.9-1.8-5.5-.4-1.9 1.7-2 4.9-.1 6.8L12 21.4l8.9-9.9c1.9-1.9 1.8-5.1-.1-6.9z" fill="currentColor"/>
                      </svg>
                      <span className="font-medium">{post.comments && post.comments >= 1000 ? `${(post.comments/1000).toFixed(1)}K` : post.comments ?? '167'}</span>
                    </div>
                  </div>
                </div>

                {/* content */}
                <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                  <div className="w-fit h-[22px] sm:h-[24px] text-[9px] sm:text-[10px] md:text-xs font-bold text-[#60351B] uppercase tracking-wider bg-[#60351B1A] inline-block rounded-[4px] py-1 px-2 sm:px-3 mb-2 sm:mb-3">{category}</div>
                  <h4 className="font-bold text-[14px] sm:text-[16px] md:text-[18px] leading-[1.35] tracking-[0px] text-[#210C00] mb-2">{post.title}</h4>
                  <p className="text-[12px] sm:text-[13px] md:text-[14px] leading-[1.5] text-[#6B6560] font-normal mt-0 mb-3 sm:mb-4 line-clamp-2">{post.excerpt ?? ''}</p>

                  <div className="mt-auto flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#6B6560]">
                    <Image src={user2} alt={post.author?.name ?? 'Author'} width={16} height={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover" />
                    <span className="text-[11px] sm:text-[12px] md:text-[13px] leading-[20px] font-[590] text-[#210C0099]">{post.author?.name ?? 'Author'}</span>
                    <span className="mx-1 sm:mx-2 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-[11px] sm:text-[12px] md:text-[13px] leading-[20px] font-normal text-[#210C0099]"><Image src={clockIcon} alt="read time" width={14} height={14} className="object-contain w-3 h-3 sm:w-[14px] sm:h-[14px]" />{post.readTime ?? '5 min read'}</span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-3 text-center text-sm text-[#6B6560]">No posts available yet — check back after the admin publishes articles.</div>
        )}
      </div>
    </div>

      {/* load more button */}
      <div className="flex justify-center my-8">
        <button className="w-[274.925px] h-[71.2px] rounded-[16px] bg-white/70 border border-[#60351B33] border-t-[1.6px] text-[#60351B] font-semibold">
          Load more articles
        </button>
      </div>

      {/* Newsletter + Footer */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <NewsletterSubscribe />
      </div>

      <Footer />
    </main>
  );
}
