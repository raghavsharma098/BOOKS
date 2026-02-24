'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PagerDots from './PagerDots';

// Admin panel content interface
interface PaceOption {
  id: 'slow' | 'medium' | 'fast';
  label: string;
  description: string;
}

interface PageContent {
  title: string;
  subtitle: string;
  backText: string;
  continueText: string;
  options: PaceOption[];
  backgroundImage: string;
}

const defaultContent: PageContent = {
  title: 'How fast do you usually read?',
  subtitle: "Select the genres that interest you. We'll use this to recommend books that match your taste.",
  backText: 'Back',
  continueText: 'Continue',
  options: [
    { id: 'slow', label: 'Slow', description: 'I savor each page carefully' },
    { id: 'medium', label: 'Medium', description: 'I read at a steady pace' },
    { id: 'fast', label: 'Fast', description: 'I finish books quickly' },
  ],
  backgroundImage: '/quiz-background.jpg',
};

export default function Quiz2(): JSX.Element {
  const [content] = useState<PageContent>(defaultContent);
  const [selected, setSelected] = useState<'slow' | 'medium' | 'fast' | null>(null);
  const router = useRouter();

  function onContinue() {
    if (!selected) return;

    // Store selection in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizReadingPace', selected);
    }

    // Navigate to next quiz page
    router.push('/quiz/quiz3');
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
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[42px] font-normal tracking-wide text-[#0C1421] mb-2 sm:mb-3 leading-tight">
            {content.title}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-6 sm:mb-8 max-w-[503px] text-sm sm:text-base md:text-lg text-[#0C1421] leading-[126%] tracking-wide">
            {content.subtitle}
          </p>

          {/* Options Row */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 md:gap-5 mt-6 sm:mt-10 md:mt-16 w-full px-2 sm:px-4">
            {content.options.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <div
                  key={opt.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setSelected(opt.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(opt.id);
                    }
                  }}
                  aria-label={`quiz option ${opt.id}`}
                  className={`
                    w-full sm:w-[220px] md:w-[260px] lg:w-[286px]
                    h-[120px] sm:h-[150px] md:h-[170px] lg:h-[182px]
                    rounded-xl py-3 sm:py-4 px-4 sm:px-6
                    flex flex-col items-center justify-center gap-1 sm:gap-2
                    shadow-[0_0_1px_rgba(0,0,0,0.25)]
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5C2F1E]
                    cursor-pointer transition-all duration-200
                    ${isSelected
                      ? 'bg-[rgba(96,53,27,0.9)] border-transparent'
                      : 'bg-[rgba(255,252,250,0.51)] border border-[rgba(255,252,250,0.51)]'
                    }
                  `}
                >
                  <strong
                    className={`
                      text-lg sm:text-xl md:text-2xl lg:text-[28px]
                      leading-[126%] tracking-wide text-center font-normal
                      ${isSelected ? 'text-white' : 'text-black'}
                    `}
                  >
                    {opt.label}
                  </strong>
                  <span
                    className={`
                      text-xs sm:text-sm md:text-base
                      leading-[126%] tracking-wide text-center
                      ${isSelected ? 'text-white/90' : 'text-black/70'}
                    `}
                  >
                    {opt.description}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="mt-6 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-2 sm:px-4">
            {/* Back link */}
            <button
              onClick={() => router.push('/quiz')}
              className="text-xs sm:text-sm text-gray-700 underline order-3 sm:order-1 hover:text-gray-900 transition-colors"
            >
              {content.backText}
            </button>

            {/* Centered pager dots */}
            <div className="order-2 flex-1 flex justify-center">
              <PagerDots />
            </div>

            {/* Continue button */}
            <button
              onClick={onContinue}
              disabled={!selected}
              className={`
                order-1 sm:order-3 w-full sm:w-auto max-w-[205px]
                h-[48px] sm:h-[52px] rounded-xl
                px-5 sm:px-6 py-3 sm:py-4
                bg-[#5C2F1E] text-white text-sm sm:text-base font-medium
                flex items-center justify-center
                transition-colors
                ${selected
                  ? 'hover:bg-[#4A2518] cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {content.continueText}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
