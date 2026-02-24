import Navbar from '../../homepage/Navbar';
import NewsletterSubscribe from '../../homepage/NewsletterSubscribe';
import Footer from '../../homepage/Footer';
import Link from 'next/link';
import Image from 'next/image';
import user2 from '../../../images/user2.png';
import clockIcon from '../../../images/clock.png';
import calendarIcon from '../../../images/calendar.png';
import bookmarkIcon from '../../../images/bookmark.png';
import shareIcon from '../../../images/share.png';
import featuredBadge from '../../../images/featured.png';
import bookIcon from '../../../images/bookread.png';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Props = {
  params: { slug: string };
};

async function fetchPostBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/blogs/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    // backend may return { data: post } or post object directly
    return json.data || json || null;
  } catch (err) {
    return null;
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = params;
  const post: any = await fetchPostBySlug(slug);

  // placeholders when backend is not available yet
  const title = post?.title ?? 'The Science of Reading: How Your Brain Processes Stories';
  const excerpt = post?.excerpt ?? 'Discover the fascinating neuroscience behind reading and how our brains create entire worlds from simple text on a page.';
  const image = post?.image ?? '/images/card1.png';
  const author = post?.author?.name ?? 'Dr. Sarah Mitchell';
  const readTime = post?.readTime ?? '8 min read';
  const likes = post?.likes ?? 342;
  const comments = post?.comments ?? 28;
  const views = post?.views ?? '12.5K';
  const publishedAt = post?.publishedAt ? new Date(post.publishedAt) : new Date('2026-02-05');
  const formattedDate = publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const category = (post as any)?.category ?? 'READING TIPS';

  // attempt to load "Continue Reading" items from admin; fall back to static placeholders
  const _continueFromAdmin = await (async () => {
    try {
      const res = await fetch(`${API_BASE}/pages/continue-reading?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || json.posts || json || null;
    } catch (e) {
      return null;
    }
  })();

  const continuePosts = (_continueFromAdmin && _continueFromAdmin.length)
    ? _continueFromAdmin.slice(0, 3).map((p: any) => ({ title: p.title, category: p.category ?? 'READING TIPS', author: p.author?.name ?? p.author ?? 'Author', readTime: p.readTime ?? '5 min read', likes: p.likes ?? 0, slug: p.slug ?? p._id }))
    : [
      { title: '10 Books That Will Change Your Perspective on Life', category: 'BOOK REVIEWS', author: 'Emma Wilson', readTime: '6 min read', likes: 8200, slug: '10-books-change-perspective' },
      { title: 'Building a Sustainable Reading Habit: A 30-Day Challenge', category: 'READING TIPS', author: 'Lisa Rodriguez', readTime: '5 min read', likes: 15300, slug: 'building-a-sustainable-reading-habit' },
      { title: 'The Art of Annotating: Transform Your Reading', category: 'READING TIPS', author: 'Thomas Anderson', readTime: '5 min read', likes: 7800, slug: 'the-art-of-annotating' },
    ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Top hero section - matches provided design and is fully responsive */}
      <section className="py-10 sm:py-12 lg:py-16">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">

            <div className="w-full pb-6 sm:pb-8 border-b border-[#E8E4D9]">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-[112.9375px] h-[24px] text-[10px] font-bold text-[#60351B] uppercase tracking-wider bg-[#60351B1A] inline-flex items-center justify-center rounded-[4px] px-3 py-1">{category}</div>

                  <div className="flex items-center gap-3 text-sm text-[#6B6560]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#6B6560" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" fill="#6B6560"/>
                    </svg>
                    <span className="text-xs font-medium">{views} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[45.2px] h-[45.2px] rounded-[16px] bg-white/70 border border-[#60351B33] border-t-[1.6px] flex items-center justify-center" style={{ paddingTop: '13.6px', paddingRight: '13.6px', paddingBottom: '1.6px', paddingLeft: '13.6px' }}>
                    <Image src={bookmarkIcon} alt="bookmark" width={18} height={18} />
                  </div>

                  <div className="w-[45.2px] h-[45.2px] rounded-[16px] bg-white/70 border border-[#60351B33] border-t-[1.6px] flex items-center justify-center" style={{ paddingTop: '13.6px', paddingRight: '13.6px', paddingBottom: '1.6px', paddingLeft: '13.6px' }}>
                    <Image src={shareIcon} alt="share" width={18} height={18} />
                  </div>
                </div>
              </div>

              <h1 className="font-[700] text-[28px] sm:text-[36px] md:text-[48px] lg:text-[72px] leading-[1.02] lg:leading-[79.2px] tracking-[0px] text-[#210C00] mb-4" style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>{title}</h1>

              <p className="max-w-3xl mb-6" style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontStyle: 'normal', fontSize: '30px', lineHeight: '48.75px', letterSpacing: '0px', color: '#210C00B2' }}>{excerpt}</p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image src={user2} alt={author} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 700, fontSize: '20px', lineHeight: '28px', letterSpacing: '0px', color: '#210C00' }}>{author}</div>
                    <div style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 400, fontStyle: 'normal', fontSize: '16px', lineHeight: '24px', letterSpacing: '0px', color: '#210C0099' }} className="mt-1">{post?.author?.designation ?? 'Neuroscience Writer & Researcher'}</div>
                    <div className="flex items-center gap-4 text-xs text-[#6B6560] mt-2">
                      <div className="flex items-center gap-2">
                        <Image src={calendarIcon} alt="date" width={14} height={14} className="object-contain" />
                        <span>{formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Image src={clockIcon} alt="read time" width={14} height={14} className="object-contain" />
                        <span>{readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#FFF] border border-[#E8E4D9] px-3 py-1.5 rounded-full text-xs shadow-sm text-[#60351B]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M20.8 4.6c-1.6-1.4-4-1.2-5.5.4L12 8l-3.3-2.9c-1.5-1.6-3.9-1.8-5.5-.4-1.9 1.7-2 4.9-.1 6.8L12 21.4l8.9-9.9c1.9-1.9 1.8-5.1-.1-6.9z" fill="#60351B"/>
                    </svg>
                    <span>{likes}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#FFF] border border-[#E8E4D9] px-3 py-1.5 rounded-full text-xs shadow-sm text-[#60351B]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#60351B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* hero image / placeholder */}
          <div className="mt-8 w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#E6DDD6] to-[#D6C8BF] h-[280px] sm:h-[360px] md:h-[420px] flex items-center justify-center">
            {/* show backend image when available; use <img> to allow external URLs without next/image config */}
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={title} className="w-full h-full object-cover object-center" />
            ) : (
              <div className="text-6xl text-[#C9B7A9]">📚</div>
            )}
          </div>
        </div>
      </section>

      {/* rest of the article (placeholder) - content will be fetched from backend when available */}
      <section className="py-8 sm:py-12">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-sm sm:prose lg:prose-lg max-w-none text-[#222]">
            {/* Main body paragraphs (from backend or placeholders) */}
            <p style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontStyle: 'normal', fontSize: '24px', lineHeight: '39px', letterSpacing: '0px', color: '#210C00CC' }}>
              {post?.body ?? 'This is a placeholder for the article body — the full article content will be fetched from the backend and displayed here. The layout is responsive and will adapt to smaller screens while preserving the desktop design.'}
            </p>

            <p style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontStyle: 'normal', fontSize: '24px', lineHeight: '39px', letterSpacing: '0px', color: '#210C00CC' }}>
              {post?.body2 ?? 'Images, quotes, lists and other rich content from the backend will render inside this container.'}
            </p>

            {/* Highlighted quote (uses backend if available) */}
            <div className="mt-8 mb-8 p-6 sm:p-8 rounded-2xl bg-[#FBF6F2] border border-[#E9E0D9] text-[#210C00CC]">
              <blockquote className="italic text-[18px] sm:text-[20px] md:text-[22px] leading-[1.5]">{post?.quote ?? '"Reading is to the mind what exercise is to the body. Every page turned strengthens the neural pathways that make us uniquely human."'}</blockquote>
              <div className="mt-4 text-sm text-[#6B6560]">— {post?.quoteAuthor ?? post?.author?.name ?? 'Dr. Sarah Mitchell'}</div>
            </div>

            {/* Section: The Reading Network */}
            <h3 className="font-bold text-[26px] sm:text-[28px] md:text-[30px] text-[#210C00] mt-6 mb-4">{post?.sections?.[0]?.title ?? 'The Reading Network'}</h3>
            <p style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontSize: '24px', lineHeight: '39px', color: '#210C00CC', marginBottom: '1rem' }}>
              {post?.sections?.[0]?.body ?? "The brain's reading network involves several key areas working in harmony. The visual cortex processes the shapes of letters, while the temporal lobe handles word recognition and meaning. Meanwhile, the frontal lobe manages comprehension and working memory, helping you follow complex narratives and arguments."}
            </p>

            {/* Section: Story Simulation Hypothesis */}
            <h3 className="font-bold text-[26px] sm:text-[28px] md:text-[30px] text-[#210C00] mt-6 mb-4">{post?.sections?.[1]?.title ?? 'The Story Simulation Hypothesis'}</h3>
            <p style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontSize: '24px', lineHeight: '39px', color: '#210C00CC', marginBottom: '1rem' }}>
              {post?.sections?.[1]?.body ?? 'One of the most compelling findings in reading research is the "story simulation hypothesis." When you read about a character performing an action, motor and sensory regions activate as if you were experiencing the action yourself. This neural simulation extends to emotions and sensory experiences, making reading a form of mental time travel.'}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
              <div className="rounded-2xl border border-[#E9E0D9] bg-white p-6 shadow-sm flex flex-col gap-3">
                <div className="text-[28px] font-[700] text-[#60351B]">{post?.stats?.[0]?.value ?? '95%'}</div>
                <div className="text-sm text-[#6B6560]">{post?.stats?.[0]?.label ?? 'of brain regions activate during deep reading sessions'}</div>
              </div>

              <div className="rounded-2xl border border-[#E9E0D9] bg-white p-6 shadow-sm flex flex-col gap-3">
                <div className="text-[28px] font-[700] text-[#60351B]">{post?.stats?.[1]?.value ?? '300ms'}</div>
                <div className="text-sm text-[#6B6560]">{post?.stats?.[1]?.label ?? 'average time to recognize a familiar word'}</div>
              </div>

              <div className="rounded-2xl border border-[#E9E0D9] bg-white p-6 shadow-sm flex flex-col gap-3">
                <div className="text-[28px] font-[700] text-[#60351B]">{post?.stats?.[2]?.value ?? '6x'}</div>
                <div className="text-sm text-[#6B6560]">{post?.stats?.[2]?.label ?? 'increase in neural connectivity in regular readers'}</div>
              </div>
            </div>

            {/* Deep Reading section */}
            <h3 className="font-bold text-[26px] sm:text-[28px] md:text-[30px] text-[#210C00] mt-6 mb-4">{post?.sections?.[2]?.title ?? 'Deep Reading and Neuroplasticity'}</h3>
            <p style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontSize: '24px', lineHeight: '39px', color: '#210C00CC', marginBottom: '1rem' }}>
              {post?.sections?.[2]?.body ?? 'Deep reading—the kind of sustained, focused engagement with complex texts—has been shown to enhance neuroplasticity, or the brain\'s ability to form new connections. Regular readers show increased connectivity between brain regions, improved vocabulary processing, and enhanced theory of mind (the ability to understand others\' perspectives).'}
            </p>

            <p style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontSize: '24px', lineHeight: '39px', color: '#210C00CC', marginBottom: '1rem' }}>
              {post?.sections?.[3]?.body ?? 'However, research suggests that the shift toward digital reading and constant multitasking may be affecting our capacity for deep reading. The brain adapts to whatever we practice most, and the fragmented attention patterns of digital media consumption can make sustained focus more challenging.'}
            </p>

            {/* Practical Implications */}
            <h3 className="font-bold text-[26px] sm:text-[28px] md:text-[30px] text-[#210C00] mt-6 mb-4">{post?.practicalTitle ?? 'Practical Implications for Readers'}</h3>

            <div className="space-y-4">
              {(post?.implications ?? [
                { title: 'Read Regularly', body: 'Consistent reading strengthens neural pathways and improves cognitive function across multiple domains.' },
                { title: 'Practice Deep Reading', body: 'Deep, focused reading sessions are more beneficial than fragmented, distracted reading for brain development.' },
                { title: 'Read Fiction', body: 'Fiction reading, in particular, enhances empathy and social cognition through story simulation.' },
                { title: 'Vary Your Material', body: 'Diverse reading material exposes your brain to varied vocabulary and concepts, promoting cognitive flexibility.' },
              ]).map((item: any, i: number) => (
                <div key={i} className="rounded-2xl border border-[#E9E0D9] p-5 flex gap-4 items-start bg-white">
                  <div className="w-9 h-9 rounded-full bg-[#F3ECE7] text-[#60351B] flex items-center justify-center font-semibold">{i + 1}</div>
                  <div>
                    <div className="font-semibold text-[#210C00]">{item.title}</div>
                    <div className="text-sm text-[#6B6560] mt-2">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Thoughts */}
            <div className="mt-8">
              <h3 className="font-bold text-[26px] sm:text-[28px] md:text-[30px] text-[#210C00] mt-6 mb-4">{post?.finalTitle ?? 'Final Thoughts'}</h3>
              <p style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontSize: '24px', lineHeight: '39px', color: '#210C00CC', marginBottom: '1rem' }}>
                {post?.final?.p1 ?? 'The science of reading reveals that this seemingly simple act is actually one of the most complex and enriching activities the human brain can perform. Every time you read, you\'re not just absorbing information—you\'re actively reshaping your neural architecture and enhancing your cognitive capabilities.'}
              </p>

              <p style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontWeight: 274, fontSize: '24px', lineHeight: '39px', color: '#210C00CC', marginBottom: '1rem' }}>
                {post?.final?.p2 ?? 'So the next time you settle in with a good book, take a moment to appreciate the extraordinary neural symphony playing out in your mind. You\'re not just reading words on a page—you\'re engaging in one of humanity\'s most remarkable cognitive achievements.'}
              </p>

              {/* Tags */}
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <div className="text-sm text-[#6B6560] flex items-center gap-2 mr-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70"><path d="M3 7v10a2 2 0 0 0 2 2h10l6-6V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4z" stroke="#6B6560" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Tags:</div>
                {(post?.tags ?? ['Neuroscience','Reading','Brain Science','Cognition','Psychology']).map((t: string, i: number) => (
                  <span key={i} className="text-[13px] bg-[#F6F3EE] text-[#60351B] rounded-full px-3 py-1">{t}</span>
                ))}
              </div>

              <hr className="mt-6 border-t border-[#E8E4D9]" />
            </div>
          </article>

          {/* About the author card */}
          <div className="mt-8">
            <div className="rounded-2xl border border-[#E9E0D9] bg-white p-6 sm:p-8 shadow-sm">
              <div className="text-lg font-semibold mb-4">About the Author</div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-[#F6F3EE] flex items-center justify-center">
                  <Image src={user2} alt={author} width={64} height={64} className="w-12 h-12 rounded-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-[#210C00]">{author}</div>
                      <div className="text-sm text-[#6B6560] mt-1">{post?.author?.designation ?? 'Neuroscience Writer & Researcher'}</div>
                    </div>

                    <div className="ml-4">
                      <button className="bg-[#60351B] text-white px-4 py-2 rounded-full text-sm shadow">+ Follow</button>
                    </div>
                  </div>

                  <p className="text-sm text-[#6B6560] mt-4">{post?.author?.bio ?? 'Dr. Sarah Mitchell is a cognitive neuroscientist and bestselling author specializing in the intersection of brain science and literature. She holds a PhD from Stanford University and has published over 50 research papers on reading comprehension and neural plasticity.'}</p>

                  <a href={post?.author?.profileUrl ?? '#'} className="inline-block mt-4 text-sm text-[#60351B] font-medium">View all articles by {author} →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Reading */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="mb-6 sm:mb-8 md:mb-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[12px] sm:rounded-[16px] bg-[#F6F3EE] flex items-center justify-center p-2 sm:p-3">
              <Image src={bookIcon} alt="icon" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00]">Continue Reading</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 sm:mb-12">
          {continuePosts.map((p: any, i: number) => (
            <article key={i} className="rounded-2xl overflow-hidden transition-all h-full flex flex-col bg-white shadow-sm">
              <div className="relative w-full h-44 sm:h-48 md:h-56 overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#E6DDD6] to-[#D6C8BF]">
                {/* center decorative icon */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20 text-4xl sm:text-5xl md:text-6xl text-[#C9B7A9]">📚</div>

                {/* bottom-left views */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#3b2b21] text-white px-3 py-1.5 rounded-full text-xs shadow-md">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" fill="currentColor"/>
                    </svg>
                    <span className="font-medium">{p.likes && p.likes >= 1000 ? `${(p.likes/1000).toFixed(1)}K` : p.likes}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                <div className="w-fit h-[22px] sm:h-[24px] text-[9px] sm:text-[10px] md:text-xs font-bold text-[#60351B] uppercase tracking-wider bg-[#F2F0E4] inline-block rounded-[4px] py-1 px-2 sm:px-3 mb-2 sm:mb-3">{p.category}</div>
                <h4 className="font-bold text-[14px] sm:text-[16px] md:text-[18px] leading-[1.35] tracking-[0px] text-[#210C00] mb-2">{p.title}</h4>
                <div className="mt-auto flex items-center gap-2 sm:gap-3 text-xs text-[#6B6560]">
                  <Image src={user2} alt={p.author} width={16} height={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover" />
                  <span className="text-[11px] sm:text-[12px] md:text-[13px] leading-[20px] font-[590] text-[#210C0099]">{p.author}</span>
                  <span className="mx-1 sm:mx-2 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-[11px] sm:text-[12px] md:text-[13px] leading-[20px] font-normal text-[#210C0099]"><Image src={clockIcon} alt="read time" width={14} height={14} className="object-contain w-3 h-3 sm:w-[14px] sm:h-[14px]" />{p.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <NewsletterSubscribe />
      </div>

      <Footer />
    </main>
  );
}
