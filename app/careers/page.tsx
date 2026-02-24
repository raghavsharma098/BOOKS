import Navbar from '../homepage/Navbar';
import NewsletterSubscribe from '../homepage/NewsletterSubscribe';
import Footer from '../homepage/Footer';
import Image from 'next/image';
import moodImg from './images/mood.jpg';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchCareersContent() {
  try {
    const res = await fetch(`${API_BASE}/pages/careers`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json || null;
  } catch (err) {
    return null;
  }
}

export default async function CareersPage() {
  const data = await fetchCareersContent();

  // Hero
  const heroBadge = data?.heroBadge ?? 'Join Our Team';
  const heroTitle = data?.heroTitle ?? 'Help us build a better reading community';
  const heroText = data?.heroText ?? "We're creating a platform where readers discover books through understanding, not algorithms. Where thoughtful reviews matter more than star ratings. Join us in building something meaningful.";
  const heroImage = data?.heroImage ?? moodImg;

  // Why Work With Us
  const whyTitle = data?.whyTitle ?? 'Why Work With Us';
  const whySubtitle = data?.whySubtitle ?? "We're a small team building a platform that respects both readers and the craft of writing. Here's what that means for you:";

  const benefits = data?.benefits ?? [
    {
      icon: 'heart',
      title: 'Calm Work Environment',
      body: 'No hustle culture. We believe in sustainable pace, deep work, and respecting your time outside of work.',
      image: '/images/mood.jpg',
    },
    {
      icon: 'star',
      title: 'Meaningful Product',
      body: "Build features that genuinely help readers discover great books. No dark patterns, no engagement tricks—just thoughtful tools.",
      image: '/images/fblogs2.jpg',
    },
    {
      icon: 'community',
      title: 'Community Impact',
      body: "Your work directly affects how people discover and discuss books. See the impact of what you build every day.",
      image: '/images/fblogs1.jpg',
    },
  ];

  // Open Positions
  const positionsTitle = data?.positionsTitle ?? 'Open Positions';
  const positionsSubtitle = data?.positionsSubtitle ?? "We're looking for people who care about books, thoughtful design, and building meaningful tools.";
  const positions = data?.positions ?? [
    {
      title: 'Senior Product Designer',
      department: 'Design',
      departmentColor: '#60351B',
      location: 'Remote',
      description: 'Shape the future of reading discovery with calm, intentional design.',
      applyUrl: '#',
    },
    {
      title: 'Full-Stack Engineer',
      department: 'Engineering',
      departmentColor: '#60351B',
      location: 'Remote',
      description: 'Build infrastructure that respects reader privacy and creates delightful experiences.',
      applyUrl: '#',
    },
    {
      title: 'Community Lead',
      department: 'Community',
      departmentColor: '#8B7355',
      location: 'Remote',
      description: 'Foster authentic connections between readers and nurture thoughtful discussions.',
      applyUrl: '#',
    },
    {
      title: 'Content Strategist',
      department: 'Editorial',
      departmentColor: '#8B7355',
      location: 'Remote / SF',
      description: 'Curate and create content that helps readers discover their next great book.',
      applyUrl: '#',
    },
    {
      title: 'Backend Engineer',
      department: 'Engineering',
      departmentColor: '#60351B',
      location: 'Remote',
      description: 'Build scalable systems that power book discovery for thousands of readers.',
      applyUrl: '#',
    },
  ];

  // Hiring Process
  const hiringProcessTitle = data?.hiringProcessTitle ?? 'Our Hiring Process';
  const hiringProcessSubtitle = data?.hiringProcessSubtitle ?? 'We keep it simple and respectful of your time.';
  const hiringSteps = data?.hiringSteps ?? [
    {
      step: '01',
      title: 'Application',
      body: 'Share your work and tell us why you are interested in building with us.',
    },
    {
      step: '02',
      title: 'Conversation',
      body: 'A relaxed chat about your experience, our mission, and whether we are a good fit.',
    },
    {
      step: '03',
      title: 'Task',
      body: 'A practical exercise relevant to the role. We respect your time—usually 2-3 hours max.',
    },
    {
      step: '04',
      title: 'Offer',
      body: 'If everything aligns, we will make an offer and welcome you to the team.',
    },
  ];

  // What We Offer
  const offerTitle = data?.offerTitle ?? 'What We Offer';
  const offerSubtitle = data?.offerSubtitle ?? 'Benefits that support your work and life.';
  const offerBenefits = data?.offerBenefits ?? [
    {
      icon: 'clock',
      title: 'Flexible Work',
      body: 'Work remotely or from our SF office. Choose what works for you.',
    },
    {
      icon: 'book',
      title: 'Learning Support',
      body: '$2,000 annual budget for books, courses, conferences, and growth.',
    },
    {
      icon: 'palette',
      title: 'Creative Environment',
      body: 'Time for deep work, experimentation, and thoughtful iteration.',
    },
    {
      icon: 'heart',
      title: 'Reader-Focused Product',
      body: 'Build features that genuinely help people, not engagement metrics.',
    },
  ];
  const plusBenefits = data?.plusBenefits ?? [
    'Comprehensive health coverage',
    '401(k) matching',
    'Team retreats',
    'Unlimited PTO',
    'Home office budget',
    'Mental health support',
  ];

  // CTA
  const ctaTitle = data?.ctaTitle ?? 'Love books? Join us.';
  const ctaText = data?.ctaText ?? "We're looking for people who care about books, communities, or thoughtful technology. Maybe you're a reader who wants to help other readers discover great books.\n\nMaybe you're a designer who believes in calm interfaces. Or an engineer who wants to build products that respect user privacy and attention.\n\nIf any of that resonates, we'd love to hear from you.";

  // Icon components
  const IconHeart = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#FDF9F6"/>
    </svg>
  );

  const IconStar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#FDF9F6"/>
    </svg>
  );

  const IconChart = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const IconBulb = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18h6v1a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-1z" fill="#8B6F47" opacity="0.9"/>
      <path d="M12 2a6 6 0 0 0-4 10.9V15a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.1A6 6 0 0 0 12 2z" stroke="#60351B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="#FDF9F6"/>
      <path d="M9.5 20h5" stroke="#60351B" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );

  const IconCommunity = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="#60351B" strokeWidth="1.5" fill="#FDF9F6"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const getIcon = (iconKey: string) => {
    switch (iconKey) {
      case 'heart': return <IconHeart />;
      case 'star': return <IconStar />;
      case 'chart': return <IconChart />;
      case 'bulb': return <IconBulb />;
      case 'community': return <IconCommunity />;
      default: return <IconHeart />;
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
              <div className="inline-block bg-[#60351B] text-white text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                {heroBadge}
              </div>

              <h1 
                className="font-bold text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] leading-tight text-[#210C00] mb-6"
                style={{ fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
              >
                {heroTitle}
              </h1>

              <p className="text-[15px] sm:text-[16px] md:text-[17px] text-[#6B6560] max-w-xl leading-relaxed">
                {heroText}
              </p>
            </div>

            <div className="w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-[400px] lg:max-w-[460px] rounded-2xl overflow-hidden shadow-lg">
                {typeof heroImage === 'string' ? (
                  <Image src={heroImage} alt="Careers" width={720} height={480} className="w-full h-full object-cover" />
                ) : (
                  <Image src={heroImage} alt="Careers" width={720} height={480} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <h2 className="font-bold text-[26px] sm:text-[30px] md:text-[34px] text-[#210C00] mb-3">{whyTitle}</h2>
            <p className="text-[15px] sm:text-[16px] text-[#6B6560]">{whySubtitle}</p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {benefits.map((b: any, idx: number) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Image */}
                <div className={`${idx % 2 === 0 ? '' : 'md:order-2'} flex justify-center`}>
                  <div className="w-full max-w-[320px] sm:max-w-[380px] rounded-2xl overflow-hidden shadow-lg">
                    <Image 
                      src={b.image || b.imageUrl || '/images/mood.jpg'} 
                      alt={b.title} 
                      width={600} 
                      height={440} 
                      className="w-full h-[240px] sm:h-[280px] object-cover" 
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`${idx % 2 === 0 ? '' : 'md:order-1'}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#F6F3EE] flex items-center justify-center ring-1 ring-[#F0E6E0] mb-4">
                    {b.iconUrl ? (
                      <Image src={b.iconUrl} alt={b.title} width={24} height={24} className="object-contain" />
                    ) : (
                      getIcon(b.icon)
                    )}
                  </div>

                  <h3 className="font-semibold text-[#210C00] text-[18px] sm:text-[20px] mb-3">{b.title}</h3>
                  <p className="text-[14px] sm:text-[15px] text-[#6B6560] leading-relaxed max-w-md">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <h2 className="font-bold text-[26px] sm:text-[30px] md:text-[34px] text-[#210C00] mb-3">{positionsTitle}</h2>
            <p className="text-[15px] sm:text-[16px] text-[#6B6560]">{positionsSubtitle}</p>
          </div>

          <div className="space-y-4">
            {positions.map((p: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 border border-[#F0EAE4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-[#210C00] text-[16px] sm:text-[17px]">{p.title}</h3>
                    {p.department && (
                      <span 
                        className="text-xs text-white px-2.5 py-1 rounded-full font-medium"
                        style={{ backgroundColor: p.departmentColor || '#60351B' }}
                      >
                        {p.department}
                      </span>
                    )}
                  </div>
                  
                  {p.location && (
                    <div className="flex items-center gap-1.5 mt-2 text-[13px] text-[#6B6560]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {p.location}
                    </div>
                  )}

                  {p.description && (
                    <p className="text-[14px] text-[#6B6560] mt-3 leading-relaxed">{p.description}</p>
                  )}
                </div>

                <a 
                  href={p.applyUrl || '#'} 
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#60351B] text-white text-sm font-medium rounded-full hover:bg-[#4a2914] transition-colors flex-shrink-0 self-start sm:self-center"
                >
                  Apply
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            ))}
          </div>

          {/* Don't see the right role? */}
          <div className="mt-10 bg-[#F6F3EE] rounded-2xl p-8 text-center border border-[#E8E4D9]">
            <h3 className="font-semibold text-[#210C00] text-[18px] mb-2">Don't see the right role?</h3>
            <p className="text-[14px] text-[#6B6560] mb-5">We're always interested in meeting talented people who share our values.</p>
            <a 
              href="mailto:careers@compass.com" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-[#210C00] text-sm font-medium rounded-full border border-[#E8E4D9] hover:bg-[#FBF8F5] transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* Our Hiring Process */}
      <section className="py-12 sm:py-16 bg-[#F6F3EE]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-bold text-[26px] sm:text-[30px] md:text-[34px] text-[#210C00] mb-3">{hiringProcessTitle}</h2>
            <p className="text-[15px] text-[#6B6560]">{hiringProcessSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hiringSteps.map((step: any, idx: number) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-[#F0EAE4]">
                <div className="text-[40px] sm:text-[48px] font-bold text-[#E8E4D9] leading-none mb-3">{step.step}</div>
                <h3 className="font-semibold text-[#210C00] text-[16px] sm:text-[17px] mb-2">{step.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-[#6B6560] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <h2 className="font-bold text-[26px] sm:text-[30px] md:text-[34px] text-[#210C00] mb-3">{offerTitle}</h2>
            <p className="text-[15px] text-[#6B6560]">{offerSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {offerBenefits.map((b: any, idx: number) => (
              <div key={idx} className="bg-[#F6F3EE] rounded-2xl p-6 border border-[#E8E4D9]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#E8E4D9] flex-shrink-0">
                    {b.icon === 'clock' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#60351B" strokeWidth="1.5"/>
                        <path d="M12 6v6l4 2" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    {b.icon === 'book' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {b.icon === 'palette' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10a2 2 0 0 0 2-2v-.09c0-.47-.19-.92-.53-1.25a1.75 1.75 0 0 1 1.25-3h1.78a6 6 0 0 0 6-6 10 10 0 0 0-10.5-9.66z" stroke="#60351B" strokeWidth="1.5" fill="none"/>
                        <circle cx="6.5" cy="11.5" r="1.5" fill="#60351B"/>
                        <circle cx="9.5" cy="7.5" r="1.5" fill="#60351B"/>
                        <circle cx="14.5" cy="7.5" r="1.5" fill="#60351B"/>
                        <circle cx="17.5" cy="11.5" r="1.5" fill="#60351B"/>
                      </svg>
                    )}
                    {b.icon === 'heart' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#210C00] text-[15px] sm:text-[16px] mb-1">{b.title}</h3>
                    <p className="text-[13px] sm:text-[14px] text-[#6B6560] leading-relaxed">{b.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plus benefits */}
          <div className="bg-white rounded-2xl p-6 border border-[#F0EAE4]">
            <div className="font-semibold text-[#210C00] text-[15px] mb-4">Plus:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plusBenefits.map((benefit: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#60351B" opacity="0.1"/>
                    <path d="M8 12l3 3 5-6" stroke="#60351B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[13px] sm:text-[14px] text-[#6B6560]">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Love books? Join us. CTA */}
      <section className="py-12 sm:py-16 bg-[#F6F3EE]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-[#E8E4D9] mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 className="font-bold text-[24px] sm:text-[28px] md:text-[32px] text-[#210C00] mb-4">{ctaTitle}</h2>
            
            <div className="text-[14px] sm:text-[15px] text-[#6B6560] leading-relaxed space-y-4 mb-8">
              {ctaText.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <a 
              href="mailto:careers@compass.com" 
              className="inline-flex items-center justify-center px-8 py-3 bg-[#60351B] text-white text-sm font-medium rounded-full hover:bg-[#4a2914] transition-colors"
            >
              Contact us
            </a>
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
