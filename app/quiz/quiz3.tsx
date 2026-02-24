'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PagerDots from './PagerDots';
import reflectivePng from './images/reflective.png';
import romanticPng from './images/romantic.png';
import adventurePng from './images/adventure.png';
import happinessPng from './images/happiness.png';
import darkPng from './images/dark.png';
import travelPng from './images/travel.png';
import fastPng from './images/fast paced.png';
import sadPng from './images/emotional.png';

// Admin panel content interface
interface MoodOption {
  id: string;
  label: string;
  icon: string;
}

interface PageContent {
  title: string;
  subtitle: string;
  backText: string;
  continueText: string;
  options: MoodOption[];
  backgroundImage: string;
}

const defaultContent: PageContent = {
  title: 'What do you like to read?',
  subtitle: "Select the genres that interest you. We'll use this to recommend books that match your taste.",
  backText: 'Back',
  continueText: 'Continue',
  options: [
    { id: 'reflective', label: 'Reflective', icon: 'reflective' },
    { id: 'romantic', label: 'Romantic', icon: 'romantic' },
    { id: 'adventurous', label: 'Adventurous', icon: 'adventurous' },
    { id: 'happiness', label: 'Happiness', icon: 'happiness' },
    { id: 'dark', label: 'Dark', icon: 'dark' },
    { id: 'travel', label: 'Travel', icon: 'travel' },
    { id: 'fast', label: 'Fast-paced', icon: 'fast' },
    { id: 'emotional', label: 'Emotional', icon: 'emotional' },
  ],
  backgroundImage: '/quiz-background.jpg',
};

// Icon mapping
const ICON_PNGS: Record<string, any> = {
  reflective: reflectivePng,
  romantic: romanticPng,
  adventurous: adventurePng,
  happiness: happinessPng,
  dark: darkPng,
  travel: travelPng,
  fast: fastPng,
  emotional: sadPng,
};

export default function Quiz3(): JSX.Element {
  const [content] = useState<PageContent>(defaultContent);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function onContinue() {
    // Store selections in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizMoods', JSON.stringify(Array.from(selected)));
    }

    // Submit all quiz answers to backend
    submitQuizAnswers();

    // Navigate to enjoy/completion page
    router.push('/quiz/enjoy');
  }

  async function submitQuizAnswers() {
    try {
      // Get all quiz answers from localStorage
      const genres = localStorage.getItem('quizGenres');
      const readingPace = localStorage.getItem('quizReadingPace');
      const moods = localStorage.getItem('quizMoods');

      const quizData = {
        genres: genres ? JSON.parse(genres) : [],
        readingPace: readingPace || 'moderate',
        moods: moods ? JSON.parse(moods) : [],
      };

      // Update user preferences via API
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await fetch('http://localhost:5000/api/users/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            preferredGenres: quizData.genres,
            readingPace: quizData.readingPace,
            moodPreferences: quizData.moods,
          }),
        });

        if (response.ok) {
          localStorage.setItem('quizCompleted', 'true');
          console.log('Quiz preferences saved successfully!');
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-wide text-[#0C1421] mb-2 sm:mb-3">
            {content.title}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-6 sm:mb-8 md:mb-10 max-w-[680px] text-sm sm:text-base md:text-lg text-[#0C1421] opacity-90 leading-[126%] tracking-wide">
            {content.subtitle}
          </p>

          {/* Options Grid */}
          <div className="flex justify-center w-full px-2 sm:px-0">
            <div
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 justify-items-center w-full max-w-[1040px]"
              aria-label="quiz-options"
            >
              {content.options.map((opt) => {
                const isSelected = selected.has(opt.id);
                const iconSrc = ICON_PNGS[opt.icon];

                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggle(opt.id)}
                    className={`
                      w-full max-w-[180px] sm:max-w-[220px] lg:max-w-[244px]
                      min-h-[100px] sm:min-h-[110px]
                      rounded-xl px-3 sm:px-4 lg:px-5 py-3 sm:py-4
                      flex flex-col items-start justify-center gap-2 sm:gap-3
                      shadow-[0_0_1px_rgba(0,0,0,0.25)]
                      cursor-pointer transition-all duration-200
                      ${isSelected
                        ? 'bg-[#5C2F1E] border border-[#5C2F1E]'
                        : 'bg-[rgba(255,252,250,0.51)] border border-[rgba(255,252,250,0.51)]'
                      }
                    `}
                  >
                    {/* Icon Circle */}
                    <div
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 lg:w-[42px] lg:h-[42px]
                        rounded-full flex items-center justify-center
                        ${isSelected ? 'bg-white' : 'bg-[#5C2F1E]'}
                      `}
                    >
                      {iconSrc && (
                        <Image
                          src={iconSrc}
                          alt={opt.label}
                          width={20}
                          height={20}
                          className={`
                            w-4 h-4 sm:w-5 sm:h-5
                            ${isSelected
                              ? 'brightness-0 sepia saturate-[10] hue-rotate-[330deg]'
                              : 'brightness-0 invert'
                            }
                          `}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div
                      className={`
                        text-base sm:text-lg lg:text-[22px]
                        font-normal text-left leading-[126%] tracking-wide mt-1 sm:mt-2
                        ${isSelected ? 'text-white' : 'text-black'}
                      `}
                    >
                      {opt.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 gap-3 sm:gap-4 px-2 sm:px-4">
            {/* Back link */}
            <button
              onClick={() => router.push('/quiz/quiz2')}
              className="text-xs sm:text-sm text-[#0C1421] underline order-3 sm:order-1 hover:text-gray-900 transition-colors"
            >
              {content.backText}
            </button>

            {/* Centered pager dots */}
            <div className="flex-1 flex justify-center order-2">
              <PagerDots />
            </div>

            {/* Continue button */}
            <button
              onClick={onContinue}
              className="
                order-1 sm:order-3 w-full sm:w-auto max-w-[205px]
                h-[48px] sm:h-[52px] rounded-xl
                px-4 sm:px-5 py-3 sm:py-4
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
