'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PagerDots from './PagerDots';

// Admin panel content interface
interface PageContent {
  title: string;
  subtitle: string;
  skipText: string;
  continueText: string;
  genres: string[];
  backgroundImage: string;
}

const defaultContent: PageContent = {
  title: 'What do you like to read?',
  subtitle: "Select the genres that interest you. We'll use this to recommend books that match your taste.",
  skipText: 'Skip for now',
  continueText: 'Continue',
  genres: [
    'Art', 'Biography', 'Literature', 'Thriller', 'Religion',
    'Business', 'History', 'Economics', 'Psychology', 'Music',
    'Facts', 'Science', 'Fantasy', 'Philosophy', 'Romance',
    'Knowledge', 'Manga', 'Crime', 'Essay', 'Mystery',
    'Fiction', 'Comics', 'Travel', 'Poetry', 'Horror'
  ],
  backgroundImage: '/quiz-background.jpg',
};

export default function Quiz1(): JSX.Element {
  const [content] = useState<PageContent>(defaultContent);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // If quiz already done, skip straight to dashboard
  useEffect(() => {
    if (localStorage.getItem('quizCompleted') === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  function toggle(genre: string) {
    setSelected((s) => ({ ...s, [genre]: !s[genre] }));
  }

  function onContinue() {
    const picked = Object.keys(selected).filter((g) => selected[g]);
    console.log('Selected genres:', picked);
    
    // Store selections in localStorage for later submission
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizGenres', JSON.stringify(picked));
    }
    
    // Navigate to next quiz page
    router.push('/quiz/quiz2');
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F2F0E4]">
      {/* Background pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-center bg-repeat opacity-[0.13]"
        style={{
          backgroundImage: `url('${content.backgroundImage}')`,
          backgroundBlendMode: 'multiply',
        }}
      />

      <section className="w-full max-w-6xl px-4 sm:px-6 md:px-12 py-8 sm:py-12 relative z-10">
        <div className="mx-auto max-w-[980px] text-center">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#0C1421]">
            {content.title}
          </h1>
          
          {/* Subtitle */}
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            {content.subtitle}
          </p>

          {/* Genre Grid */}
          <div className="mt-6 sm:mt-8 md:mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full">
            {content.genres.map((g) => {
              const active = !!selected[g];
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggle(g)}
                  aria-pressed={active}
                  className={`
                    h-[44px] sm:h-[48px] md:h-[51px] w-full max-w-[192px] mx-auto
                    rounded-xl px-3 sm:px-4 py-2 sm:py-2.5
                    text-xs sm:text-sm font-medium whitespace-nowrap
                    flex items-center justify-center
                    transition-all duration-150
                    ${active
                      ? 'bg-[#5C2F1E] text-white border border-black/[0.08] shadow-[0_2px_0_rgba(0,0,0,0.08)]'
                      : 'bg-[rgba(255,252,250,0.51)] text-black border border-[rgba(255,252,250,0.51)] shadow-[0_0_1px_rgba(0,0,0,0.25)]'
                    }
                  `}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-2">
            {/* Skip link */}
            <button
              onClick={() => router.push('/')}
              className="text-xs sm:text-sm text-gray-600 underline order-3 sm:order-1 hover:text-gray-900 transition-colors"
            >
              {content.skipText}
            </button>

            {/* Centered pager dots */}
            <div className="order-2 flex-1 flex justify-center">
              <PagerDots />
            </div>

            {/* Continue button */}
            <button
              onClick={onContinue}
              aria-label="Continue"
              className="
                order-1 sm:order-3 w-full sm:w-auto max-w-[205px]
                h-[48px] sm:h-[52px] rounded-xl
                px-5 sm:px-6 py-3 sm:py-4
                bg-[#5C2F1E] text-white text-sm sm:text-base font-medium
                flex items-center justify-center
                hover:bg-[#4A2518] transition-colors cursor-pointer
              "
            >
              {content.continueText}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
