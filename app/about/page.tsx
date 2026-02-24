import Navbar from '../homepage/Navbar';
import NewsletterSubscribe from '../homepage/NewsletterSubscribe';
import Footer from '../homepage/Footer';
import Image from 'next/image';
import moodImg from './images/mood.jpg';
import libraryImg from './images/fblogs1.jpg';
import editorialIcon from './images/editorial.png';
import tagsIcon from './images/tags.png';
import emotionIcon from './images/emotion.png';
import communityIcon from './images/community.png';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAboutContent() {
  try {
    const res = await fetch(`${API_BASE}/pages/about`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json || null;
  } catch (err) {
    return null;
  }
}

export default async function AboutPage() {
  const data = await fetchAboutContent();

  const heroTitle = data?.heroTitle ?? 'Understanding books and communities through meaningful reviews';
  const heroText = data?.heroText ?? "We're building a reading intelligence platform that values depth over popularity, trust over algorithms, and discussion over distraction.";
  const heroImage = data?.heroImage ?? moodImg;

  const leftImage = data?.leftImage ?? libraryImg;
  const yearBadge = data?.yearBadge ?? '2026';
  const yearBadgeText = data?.yearBadgeText ?? 'Founded with a simple idea';
  const sectionTitle = data?.sectionTitle ?? 'We started with a question';
  const paragraphs = data?.paragraphs ?? [
    "Why do most book platforms feel like shopping sites or social networks? Where's the space for readers who want to understand a book deeply before committing to it?",
    "We noticed something missing in the world of book discovery: platforms that respected both the reader's intelligence and the author's craft. Everything was either algorithm-driven recommendations or popularity contests.",
    "So we built Compass—a place where understanding comes first. We combine editorial expertise with structured community reviews. We focus on why a book resonates, not just whether it's popular. We create space for thoughtful discussion, not viral content.",
  ];

  // Features + Philosophy (admin-overridable)
  const featuresIntro = data?.featuresIntro ?? "We're not another review site. We're a reading intelligence platform.";
  const features = data?.features ?? [
    { icon: editorialIcon, title: 'Editorial Reviews', body: 'Thoughtfully curated insights from literary editors who care about context and craft.' },
    { icon: tagsIcon, title: 'Structured Reader Reviews', body: 'Reviews organized by themes, emotions, and reading experience—not just star ratings.' },
    { icon: emotionIcon, title: 'Mood-Based Understanding', body: 'Discover books through emotional resonance and reading mood, not algorithms.' },
    { icon: communityIcon, title: 'Thoughtful Discussions', body: 'Community conversations without the noise of likes, shares, and viral content.' },
  ];

  const philosophySubtitle = data?.philosophySubtitle ?? "We're not another review site. We're a reading intelligence platform.";
  const philosophyItems = data?.philosophyItems ?? [
    { title: 'Quality over Popularity', body: "A book's value isn't measured by how many people have read it, but by how deeply it resonates with those who do. We spotlight books that deserve attention, not just books that already have it." },
    { title: 'Trust over Algorithms', body: "We believe in human curation and editorial judgment. While algorithms can surface patterns, they can't understand the nuances of why a particular book might speak to you. That's where thoughtful reviews and community wisdom come in." },
    { title: 'Discussion over Distraction', body: "We've removed the noise—no likes, no follower counts, no viral content. Just meaningful conversations about books between people who care about reading. This isn't social media; it's a space for genuine literary discussion." },
  ];

  const philosophyQuote = data?.philosophyQuote ?? "We're not trying to predict what you'll like. We're trying to help you understand what makes a book worth your time.";

  // Who It's For — admin-driven (fallbacks provided)
  const whoTitle = data?.whoTitle ?? "Who It's For";
  const whoSubtitle = data?.whoSubtitle ?? 'Compass is built for anyone who takes reading seriously.';
  const whoItems = data?.whoItsFor ?? data?.audience ?? [
    {
      title: 'Readers',
      subtitle: 'For those seeking meaningful book recommendations beyond bestseller lists.',
      body: 'Find books through deep understanding of themes, moods, and literary quality. Track your reading journey without gamification.',
      image: '/images/who-readers.svg',
      icon: '/images/book-icon.png',
    },
    {
      title: 'Authors',
      subtitle: 'For writers who want authentic connections with their readers.',
      body: 'Share your work in a space that values substance over virality. Connect with readers who appreciate your craft.',
      image: '/images/who-authors.svg',
      icon: '/images/pencil.png',
    },
    {
      title: 'Clubs & Communities',
      subtitle: 'For those exploring books as part of learning and growth.',
      body: 'Access structured reviews and discussions. Build understanding through community wisdom and editorial guidance.',
      image: '/images/who-clubs.svg',
      icon: '/images/community.png',
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-[700] text-[34px] sm:text-[40px] md:text-[48px] lg:text-[56px] leading-tight text-[#210C00] mb-6" style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
                {heroTitle}
              </h1>

              <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[#6B6560] max-w-xl">
                {heroText}
              </p>
            </div>

            <div className="w-full flex justify-center lg:justify-end">
              <div className="w-[320px] sm:w-[360px] md:w-[420px] rounded-2xl overflow-hidden shadow-lg bg-white">
                <Image src={heroImage} alt="About" width={720} height={720} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content block: image left / text right */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <Image src={leftImage} alt="Library" width={900} height={640} className="w-full h-full object-cover" />
              </div>

              <div className="absolute left-6 bottom-6">
                <div className="rounded-xl bg-white px-4 py-3 shadow-md text-center w-[140px]">
                  <div className="text-sm text-[#6B6560]">{yearBadge}</div>
                  <div className="text-[12px] font-medium text-[#210C00] mt-1">{yearBadgeText}</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-[26px] sm:text-[30px] md:text-[34px] text-[#210C00] mb-4">{sectionTitle}</h2>

              {paragraphs.map((p: string, i: number) => (
                <p key={i} className="text-[15px] sm:text-[16px] md:text-[18px] text-[#6B6560] mb-4">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-12 sm:py-16" style={{ background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(96, 53, 27, 0.05) 100%)' }}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 sm:p-12">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h3 className="text-[26px] sm:text-[30px] font-bold text-[#210C00]">What Makes Us Different</h3>
              <p className="text-sm text-[#6B6560] mt-2">{featuresIntro}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((f: any, idx: number) => (
                <div key={idx} className="bg-white border border-[#F0EAE4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(14,14,14,0.06)] flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-[#F6F3EE] flex items-center justify-center ring-1 ring-[#F0E6E0]">
                    <Image src={f.icon || f.iconUrl} alt={f.title} width={28} height={28} className="object-contain" />
                  </div>

                  <div>
                    <div className="font-semibold text-[#210C00] text-[15px] sm:text-[16px]">{f.title}</div>
                    <div className="text-sm text-[#6B6560] mt-2 max-w-[36rem]">{f.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[920px] mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-9 h-9 rounded-full bg-[#F6F3EE] flex items-center justify-center">
                  {/* inline SVG bulb (fallback-ready for /images/bulb.png if you add it later) */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M9 18h6v1a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-1z" fill="#8B6F47" opacity="0.9"/>
                    <path d="M12 2a6 6 0 0 0-4 10.9V15a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.1A6 6 0 0 0 12 2z" stroke="#60351B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="#FDF9F6"/>
                    <path d="M9.5 20h5" stroke="#60351B" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-[26px] sm:text-[30px] font-bold text-[#210C00]">Our Philosophy</h3>
                  <div className="w-12 h-1 bg-[#60351B] rounded" />
                </div>

                <p className="text-sm text-[#6B6560] mt-2">{philosophySubtitle}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {philosophyItems.map((item: any, i: number) => (
                <div key={i} className="bg-[#F6F3EE] rounded-2xl p-6 border border-[#E8E4D9]">
                  <div className="font-semibold text-[#210C00]">{item.title}</div>
                  <div className="text-sm text-[#6B6560] mt-2">{item.body}</div>
                </div>
              ))}
            </div>

            <blockquote className="mt-6 pl-4 border-l-2 border-[#E8E4D9] italic text-sm text-[#6B6560]">{philosophyQuote}</blockquote>
          </div>
        </div>
      </section>

      {/* Who It's For (admin-driven) */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-8 text-left">
            <h3 className="text-[26px] sm:text-[30px] font-bold text-[#210C00]">{whoTitle}</h3>
            <p className="text-sm text-[#6B6560] mt-2">{whoSubtitle}</p>
          </div>

          <div className="space-y-10">
            {whoItems.map((w: any, i: number) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className={`${i % 2 === 0 ? '' : 'md:order-2'}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4D9]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#F6F3EE] flex items-center justify-center">
                        <Image src={w.icon || w.iconUrl || '/images/book-icon.png'} alt={w.title} width={28} height={28} className="object-contain" />
                      </div>

                      <div>
                        <div className="font-semibold text-[#210C00] text-[18px]">{w.title}</div>
                        {w.subtitle && <div className="text-sm text-[#6B6560] mt-2">{w.subtitle}</div>}
                        <div className="text-sm text-[#6B6560] mt-4">{w.body}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${i % 2 === 0 ? '' : 'md:order-1'} flex justify-center`}> 
                  <div className="w-full max-w-[420px] rounded-2xl overflow-hidden shadow-lg">
                    <Image src={w.image || w.imageUrl || '/images/fblogs1.jpg'} alt={w.title} width={900} height={640} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission (admin-driven) */}
      <section className="py-12 sm:py-16 bg-[#FBF8F5]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="w-9 h-9 rounded-full bg-[#F6F3EE] flex items-center justify-center mx-auto mb-4">
              <Image src={'/images/direction.png'} alt="Mission" width={20} height={20} className="object-contain" />
            </div>

            <h3 className="text-[26px] sm:text-[30px] font-bold text-[#210C00]">{data?.mission?.title ?? 'Our Mission'}</h3>
            <p className="text-sm text-[#6B6560] mt-2">{data?.mission?.subtitle ?? ''}</p>
          </div>

          <div className="max-w-[1000px] mx-auto">
            <div
              className="rounded-2xl w-full lg:w-[1000px] lg:h-[449.4px] p-6 sm:p-10 lg:px-[64.8px] lg:pt-[64.8px] lg:pb-[0.8px] flex flex-col gap-6 lg:gap-[36px]"
              style={{
                borderRadius: '24px',
                border: '0.8px solid #F0EAE4',
                borderTop: '0.8px solid #60351B33',
                background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), linear-gradient(135deg, rgba(96, 53, 27, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
              }}
            >
              <p 
                className="text-lg sm:text-xl lg:text-[30px] lg:leading-[48.75px] text-center max-w-full lg:w-[833px] lg:h-[195px] mx-auto"
                style={{
                  fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                  fontWeight: 276,
                  fontStyle: 'italic',
                  letterSpacing: '0px',
                  color: '#210C00',
                }}
              >{data?.mission?.quote ?? "To create a space where readers can discover books through deep understanding, where authors can connect authentically with their audience, and where communities can discuss literature without the noise of social media."}</p>

              <hr className="my-4 lg:my-6 border-t border-[#EFE6DF]" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center pb-6 lg:pb-0">
                {(data?.mission?.stats ?? [
                  { value: '50K+', label: 'Readers' },
                  { value: '200K+', label: 'Books' },
                  { value: '15K+', label: 'Reviews' },
                ]).map((s: any, idx: number) => (
                  <div key={idx}>
                    <div 
                      className="text-2xl sm:text-[26px] lg:text-[30px] lg:leading-[36px] lg:translate-y-[-8px]"
                      style={{
                        fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                        fontWeight: 700,
                        color: '#210C00',
                      }}
                    >{s.value}</div>
                    <div className="text-xs text-[#6B6560] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <NewsletterSubscribe />
      </div>

      <Footer />
    </main>
  );
}

