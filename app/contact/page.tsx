import Navbar from '../homepage/Navbar';
import NewsletterSubscribe from '../homepage/NewsletterSubscribe';
import Footer from '../homepage/Footer';
import Image from 'next/image';
import libraryImg from './images/fblogs1.jpg';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchContactContent() {
  try {
    const res = await fetch(`${API_BASE}/pages/contact`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json || null;
  } catch (err) {
    return null;
  }
}

export default async function ContactPage() {
  const data = await fetchContactContent();

  // Hero
  const heroTitle = data?.heroTitle ?? "We're here to help";
  const heroText = data?.heroText ?? "Have a question, suggestion, or just want to say hello? We'd love to hear from you. Whether you're a reader, author, or just curious about Compass, drop us a message.";
  const heroImage = data?.heroImage ?? libraryImg;

  // Categories
  const categoriesTitle = data?.categoriesTitle ?? 'What can we help with?';
  const categoriesSubtitle = data?.categoriesSubtitle ?? 'Choose the category that best matches your inquiry';
  const categories = data?.categories ?? [
    {
      icon: 'message',
      iconGradient: 'linear-gradient(135deg, rgba(43, 127, 255, 0.2) 0%, rgba(0, 184, 219, 0.2) 100%)',
      iconColor: '#2B7FFF',
      title: 'General Questions',
      body: 'Questions about the platform, features, or how things work',
      href: '#general',
    },
    {
      icon: 'document',
      iconGradient: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(233, 30, 99, 0.2) 100%)',
      iconColor: '#9C27B0',
      title: 'Author Support',
      body: 'Help with author profiles, book submissions, or connecting with readers',
      href: '#author',
    },
    {
      icon: 'alert',
      iconGradient: 'linear-gradient(135deg, rgba(0, 150, 136, 0.2) 0%, rgba(0, 188, 212, 0.2) 100%)',
      iconColor: '#00897B',
      title: 'Report Issue',
      body: 'Found a bug, spam, or something that needs our attention',
      href: '#report',
    },
    {
      icon: 'heart',
      iconGradient: 'linear-gradient(135deg, rgba(233, 30, 99, 0.2) 0%, rgba(255, 87, 34, 0.2) 100%)',
      iconColor: '#E91E63',
      title: 'Partnership Inquiries',
      body: 'Interested in collaborating or partnering with Compass',
      href: '#partnership',
    },
  ];

  // Form Section
  const formTitle = data?.formTitle ?? 'Send us a message';
  const formSubtitle = data?.formSubtitle ?? "Fill out the form below and we'll get back to you soon.";
  const inquiryTypes = data?.inquiryTypes ?? [
    'General Questions',
    'Author Support',
    'Report Issue',
    'Partnership Inquiries',
    'Other',
  ];

  // We're Listening card
  const listeningTitle = data?.listeningTitle ?? "We're listening";
  const listeningText = data?.listeningText ?? "Every message matters to us. We read each one carefully and respond thoughtfully. No automated replies, no ticket numbers—just real conversations with real people.";
  const listeningNote = data?.listeningNote ?? 'We typically respond within 24 hours';

  // Other ways to reach us
  const otherWaysTitle = data?.otherWaysTitle ?? 'Other ways to reach us';
  const contactEmail = data?.contactEmail ?? 'hello@example.com';
  const responseTime = data?.responseTime ?? 'Usually within 24 hours';
  const responseHours = data?.responseHours ?? 'Weekdays 9am - 6pm PST';

  // Pro tip
  const proTipText = data?.proTipText ?? 'The more context you give us, the better we can help. Screenshots, links, or specific examples are always appreciated!';

  // Quick answers
  const quickAnswersTitle = data?.quickAnswersTitle ?? 'Quick answers';
  const quickAnswersSubtitle = data?.quickAnswersSubtitle ?? 'Looking for something specific? These might help.';
  const quickAnswers = data?.quickAnswers ?? [
    {
      icon: 'help',
      title: 'Account Help',
      body: 'Login issues, password reset, account settings',
      href: '#account',
    },
    {
      icon: 'book',
      title: 'Book Submission',
      body: 'How to add books and write reviews',
      href: '#submission',
    },
    {
      icon: 'profile',
      title: 'Author Profile',
      body: 'Claim your author profile and showcase your work',
      href: '#author-profile',
    },
    {
      icon: 'community',
      title: 'Community Guidelines',
      body: 'Rules for respectful discussion and engagement',
      href: '#guidelines',
    },
  ];

  // Still have questions
  const stillQuestionsTitle = data?.stillQuestionsTitle ?? 'Still have questions?';
  const stillQuestionsText = data?.stillQuestionsText ?? "We're always happy to chat. Whether it's about the platform, books, or just to say hi — we'd love to hear from you.";
  const ctaButtons = data?.ctaButtons ?? [
    { label: 'Read Our Blog', href: '/blog', variant: 'outline' },
    { label: 'Learn About Us', href: '/about', variant: 'outline' },
  ];

  // Icon components
  const IconQuestion = ({ color }: { color: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="17" r="1" fill={color}/>
    </svg>
  );

  const IconAuthor = ({ color }: { color: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M7 7h10M7 12h10M7 17h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const IconReport = ({ color }: { color: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/>
      <path d="M12 8v4M12 16h.01" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const IconPartnership = ({ color }: { color: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const getIcon = (iconKey: string, color: string) => {
    switch (iconKey) {
      case 'question': return <IconQuestion color={color} />;
      case 'author': return <IconAuthor color={color} />;
      case 'report': return <IconReport color={color} />;
      case 'partnership': return <IconPartnership color={color} />;
      default: return <IconQuestion color={color} />;
    }
  };

  return (
    <main className="min-h-screen bg-[#FBF8F5]">
      <Navbar />

      {/* Hero */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 
                className="mb-6"
                style={{
                  fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                  fontWeight: 700,
                  fontSize: '72px',
                  lineHeight: '79.2px',
                  letterSpacing: '0px',
                  color: '#210C00',
                }}
              >
                {heroTitle}
              </h1>

              <p 
                className="max-w-xl"
                style={{
                  fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                  fontWeight: 400,
                  fontSize: '24px',
                  lineHeight: '39px',
                  letterSpacing: '0px',
                  color: '#210C00B2',
                }}
              >
                {heroText}
              </p>
            </div>

            <div className="w-full flex justify-center lg:justify-end">
              <div 
                className="w-[364px] h-[362px] rounded-[24px] overflow-hidden shadow-[0_0_66.3px_rgba(33,12,0,0.27)]"
              >
                {typeof heroImage === 'string' ? (
                  <Image src={heroImage} alt="Contact" width={720} height={540} className="w-full h-full object-cover" />
                ) : (
                  <Image src={heroImage} alt="Contact" width={720} height={540} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What can we help with? */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <h2 className="font-bold text-[26px] sm:text-[30px] md:text-[34px] text-[#210C00] mb-3">{categoriesTitle}</h2>
            <p className="text-[15px] sm:text-[16px] text-[#6B6560]">{categoriesSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categories.map((cat: any, idx: number) => (
              <a 
                key={idx} 
                href={cat.href || '#'}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EAE4] shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow block"
              >
                <div 
                  className="flex items-center justify-center mb-5"
                  style={{ 
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background: cat.iconGradient || cat.iconBg || '#E8E0F8',
                  }}
                >
                  {cat.icon === 'message' && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={cat.iconColor || '#2B7FFF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {cat.icon === 'document' && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="2" width="16" height="20" rx="2" stroke={cat.iconColor || '#9C27B0'} strokeWidth="2"/>
                      <path d="M8 6h8M8 10h8M8 14h5" stroke={cat.iconColor || '#9C27B0'} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {cat.icon === 'alert' && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke={cat.iconColor || '#00897B'} strokeWidth="2"/>
                      <path d="M12 8v4M12 16h.01" stroke={cat.iconColor || '#00897B'} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {cat.icon === 'heart' && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={cat.iconColor || '#E91E63'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {cat.iconUrl && (
                    <Image src={cat.iconUrl} alt={cat.title} width={28} height={28} className="object-contain" />
                  )}
                </div>

                <h3 
                  className="mb-2"
                  style={{
                    fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                    fontWeight: 700,
                    fontSize: '24px',
                    lineHeight: '32px',
                    letterSpacing: '0px',
                    color: '#210C00',
                  }}
                >{cat.title}</h3>
                <p className="text-[14px] sm:text-[15px] text-[#6B6560] leading-relaxed">{cat.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Send us a message */}
      <section className="py-12 sm:py-16 bg-[#F6F3EE]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left - Form */}
            <div>
              <h2 className="font-bold text-[24px] sm:text-[28px] md:text-[32px] text-[#210C00] mb-2">{formTitle}</h2>
              <p className="text-[15px] text-[#6B6560] mb-8">{formSubtitle}</p>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#210C00] mb-2">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8E4D9] text-[#210C00] placeholder-[#A89F97] focus:outline-none focus:ring-2 focus:ring-[#60351B] focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#210C00] mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8E4D9] text-[#210C00] placeholder-[#A89F97] focus:outline-none focus:ring-2 focus:ring-[#60351B] focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#210C00] mb-2">Inquiry Type</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8E4D9] text-[#210C00] focus:outline-none focus:ring-2 focus:ring-[#60351B] focus:border-transparent transition-shadow appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6560' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                  >
                    <option value="">Select a category</option>
                    {inquiryTypes.map((type: string, idx: number) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#210C00] mb-2">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Brief subject line"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8E4D9] text-[#210C00] placeholder-[#A89F97] focus:outline-none focus:ring-2 focus:ring-[#60351B] focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#210C00] mb-2">Message</label>
                  <textarea 
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8E4D9] text-[#210C00] placeholder-[#A89F97] focus:outline-none focus:ring-2 focus:ring-[#60351B] focus:border-transparent transition-shadow resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#60351B] text-white font-medium rounded-xl hover:bg-[#4a2914] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Send Message
                </button>
              </form>
            </div>

            {/* Right - Info cards */}
            <div className="space-y-6">
              {/* We're listening */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EAE4]">
                <div className="w-12 h-12 rounded-xl bg-[#F6F3EE] flex items-center justify-center mb-5 border border-[#E8E4D9]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#60351B" strokeWidth="1.5"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="17" r="1" fill="#60351B"/>
                  </svg>
                </div>

                <h3 className="font-bold text-[20px] sm:text-[22px] text-[#210C00] mb-3">{listeningTitle}</h3>
                <p className="text-[14px] sm:text-[15px] text-[#6B6560] leading-relaxed mb-4">{listeningText}</p>
                
                <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-[#00897B]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {listeningNote}
                </div>
              </div>

              {/* Other ways to reach us */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EAE4]">
                <h3 className="font-semibold text-[18px] sm:text-[20px] text-[#210C00] mb-5">{otherWaysTitle}</h3>
                
                <div className="space-y-5">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F6F3EE] flex items-center justify-center border border-[#E8E4D9] flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#60351B" strokeWidth="1.5"/>
                        <path d="M22 6l-10 7L2 6" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-[13px] text-[#6B6560] mb-1">Email</div>
                      <a href={`mailto:${contactEmail}`} className="text-[15px] font-medium text-[#60351B] hover:underline">{contactEmail}</a>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F6F3EE] flex items-center justify-center border border-[#E8E4D9] flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#60351B" strokeWidth="1.5"/>
                        <path d="M12 6v6l4 2" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-[13px] text-[#6B6560] mb-1">Response Time</div>
                      <div className="text-[15px] font-medium text-[#210C00]">{responseTime}</div>
                      <div className="text-[13px] text-[#6B6560]">{responseHours}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro tip */}
              <div className="bg-[#FFF8E1] rounded-2xl p-5 border border-[#FFE082]">
                <p className="text-[13px] sm:text-[14px] text-[#6B6560] leading-relaxed">
                  <span className="font-semibold text-[#210C00]">Pro tip:</span> {proTipText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick answers */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <h2 className="font-bold text-[26px] sm:text-[30px] md:text-[34px] text-[#210C00] mb-3">{quickAnswersTitle}</h2>
            <p className="text-[15px] sm:text-[16px] text-[#6B6560]">{quickAnswersSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickAnswers.map((item: any, idx: number) => (
              <a 
                key={idx}
                href={item.href || '#'}
                className="bg-white rounded-2xl p-6 border border-[#F0EAE4] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow block"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F6F3EE] flex items-center justify-center mb-5 border border-[#E8E4D9]">
                  {item.icon === 'help' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#60351B" strokeWidth="1.5"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="17" r="1" fill="#60351B"/>
                    </svg>
                  )}
                  {item.icon === 'book' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#60351B" strokeWidth="1.5"/>
                      <path d="M7 7h10M7 12h10M7 17h6" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {item.icon === 'profile' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#60351B" strokeWidth="1.5"/>
                      <path d="M7 7h10" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {item.icon === 'community' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#60351B" strokeWidth="1.5"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="17" r="1" fill="#60351B"/>
                    </svg>
                  )}
                </div>

                <h3 className="font-semibold text-[#210C00] text-[15px] sm:text-[16px] mb-2">{item.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-[#6B6560] leading-relaxed">{item.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-t border-[#E8E4D9]" />
      </div>

      {/* Still have questions? */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-bold text-[22px] sm:text-[26px] md:text-[30px] text-[#210C00] mb-4">{stillQuestionsTitle}</h2>
            <p className="text-[14px] sm:text-[15px] text-[#6B6560] leading-relaxed mb-8">{stillQuestionsText}</p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {ctaButtons.map((btn: any, idx: number) => (
                <a 
                  key={idx}
                  href={btn.href || '#'}
                  className={`inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-full transition-colors ${
                    btn.variant === 'filled' 
                      ? 'bg-[#60351B] text-white hover:bg-[#4a2914]' 
                      : 'bg-white text-[#210C00] border border-[#E8E4D9] hover:bg-[#F6F3EE]'
                  }`}
                >
                  {btn.label}
                </a>
              ))}
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
