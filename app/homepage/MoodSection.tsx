"use client";

import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import moodBg from './images/mood.jpg';
import bookCover from './images/Book cover.png';
import frameImg from './images/Book cover.png';
import newstatesman from './images/Book cover.png';
import sideElement from './images/sideelement.png';

type MoodId = 'adventurous' | 'romantic' | 'dark' | 'reflection' | 'calm' | 'happiness';

type Mood = {
  id: MoodId;
  label: string;
  icon: React.ReactNode;
};

export default function MoodSection(): JSX.Element {
  const [selectedMood, setSelectedMood] = useState<MoodId>('adventurous');

  const moods: Mood[] = [
    {
      id: 'adventurous',
      label: 'Adventurous',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'romantic',
      label: 'Romantic',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    },
    {
      id: 'reflection',
      label: 'Reflection',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'calm',
      label: 'Calm',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'happiness',
      label: 'Happiness',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const selectedIndex = moods.findIndex((m) => m.id === selectedMood);

  type ContentBlock = {
    title: string;
    description: string;
    benefits: string[];
    books: { image: StaticImageData | string; alt: string }[];
    backgroundImage: StaticImageData | string;
  };

  const moodContent: Record<MoodId, ContentBlock> = {
    adventurous: {
      title: 'Adventure collections',
      description:
        'Stories filled with daring journey, unknown lands, and bold characters. Perfect for curious minds and readers who love fast-paced, thrilling escapes.',
      benefits: [
        'Boost imagination and Creativity',
        'Sparks curiosity and a sense of exploration',
        'Encourage bravery and resilience'
      ],
      books: [
        { image: bookCover, alt: 'Adventure Book 1' },
        { image: bookCover, alt: 'Adventure Book 2' },
        { image: bookCover, alt: 'Adventure Book 3' }
      ],
      backgroundImage: moodBg
    },
    romantic: {
      title: 'Romantic collections',
      description:
        'Heartwarming tales of love, connection, and emotional depth. Perfect for those seeking stories of passion, relationships, and tender moments.',
      benefits: [
        'Explore emotional depth and empathy',
        'Experience different perspectives on love',
        'Connect with characters on a deeper level'
      ],
      books: [
        { image: frameImg, alt: 'Romance Book 1' },
        { image: bookCover, alt: 'Romance Book 2' },
        { image: newstatesman, alt: 'Romance Book 3' }
      ],
      backgroundImage: moodBg
    },
    dark: {
      title: 'Dark collections',
      description:
        'Mysterious and intense stories that explore the shadows. Perfect for readers who enjoy suspense, psychological depth, and gripping narratives.',
      benefits: ['Challenge your perspective', 'Explore complex themes and emotions', 'Experience intense storytelling'],
      books: [
        { image: newstatesman, alt: 'Dark Book 1' },
        { image: frameImg, alt: 'Dark Book 2' },
        { image: bookCover, alt: 'Dark Book 3' }
      ],
      backgroundImage: moodBg
    },
    reflection: {
      title: 'Reflection collections',
      description:
        'Thought-provoking stories that inspire introspection and personal growth. Perfect for readers seeking meaningful narratives and life lessons.',
      benefits: ['Gain new perspectives on life', 'Encourage self-reflection', 'Find wisdom and inspiration'],
      books: [
        { image: bookCover, alt: 'Reflection Book 1' },
        { image: newstatesman, alt: 'Reflection Book 2' },
        { image: frameImg, alt: 'Reflection Book 3' }
      ],
      backgroundImage: moodBg
    },
    calm: {
      title: 'Calm collections',
      description:
        'Peaceful and soothing stories that provide comfort and tranquility. Perfect for unwinding and finding moments of serenity through reading.',
      benefits: ['Reduce stress and anxiety', 'Create peaceful reading moments', 'Find comfort in gentle narratives'],
      books: [
        { image: bookCover, alt: 'Calm Book 1' },
        { image: frameImg, alt: 'Calm Book 2' },
        { image: newstatesman, alt: 'Calm Book 3' }
      ],
      backgroundImage: moodBg
    },
    happiness: {
      title: 'Happiness collections',
      description:
        'Uplifting and joyful stories that bring smiles and warmth. Perfect for readers seeking feel-good narratives and positive vibes.',
      benefits: ['Boost your mood and energy', 'Experience joy and laughter', 'Spread positivity through stories'],
      books: [
        { image: frameImg, alt: 'Happy Book 1' },
        { image: bookCover, alt: 'Happy Book 2' },
        { image: newstatesman, alt: 'Happy Book 3' }
      ],
      backgroundImage: moodBg
    }
  };

  const currentContent = moodContent[selectedMood];

  return (
    <section className="relative pt-10 sm:pt-12 md:pt-16 bg-transparent font-sfpro">
      <div className="w-full max-w-[1320px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-[28px] sm:text-[36px] lg:text-[46px] font-bold text-[#210C00] mb-4">
            Find your next read by mood
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#210C00]/80 max-w-2xl mx-auto">
            Choose your vibe, and we'll show you books that match it.
            <br className="hidden sm:block" />
            we want to make sure you read what you really want to read.
          </p>
        </div>

        {/* Mood Selector */}
        <div className="mb-8 lg:mb-12 w-full max-w-[1142px] h-auto lg:h-[105px] mx-auto flex flex-col items-center justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-0 lg:justify-between w-full px-2 sm:px-4 md:px-0">
            {moods.map((mood, idx) => {
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className="flex flex-col items-center focus:outline-none"
                >
                  <div className={`rounded-xl transition-all ${isSelected ? 'bg-[#60351B]/80 shadow-lg' : 'bg-[#EFEAE4]'} `}>
                    <div className={`rounded-lg w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] lg:w-[64.03px] lg:h-[64.03px] flex items-center justify-center ${isSelected ? 'bg-[#60351B]/80 text-white' : 'bg-[#E4DDD1] text-[#210C00]'}`}>
                      {mood.icon}
                    </div>
                  </div>
                  <span className={`mt-[12px] lg:mt-[20px] text-[14px] sm:text-[16px] lg:text-[18px] font-sfpro ${isSelected ? 'text-[#210C00]' : 'text-gray-700'}`}>{mood.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Progress bar (below nav) */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[1280px] h-[4px] mt-2 lg:mt-[-20px] bg-[#000000]/50 mx-auto rounded-full shadow-sm">
            <div
              className="absolute top-0 h-[4px] bg-[#60351B]/80 rounded-full transition-all"
              style={{
                left: `${selectedIndex * (100 / moods.length)}%`,
                width: `${100 / moods.length}%`
              }}
            />
          </div>
        </div>

        {/* Content Display */}
        <div className="relative w-full max-w-[1320px] mt-[28px] mx-auto">
          {/* Main Card */}
          <div className="bg-[#E8E3DB] rounded-[16px] lg:rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 h-auto md:h-[440px] lg:h-[520px]">
              {/* Left side - Image */}
              <div className="relative h-[200px] sm:h-[280px] md:h-full overflow-hidden rounded-t-[16px] md:rounded-t-none md:rounded-l-[16px] lg:rounded-l-[20px]">
                <Image
                  src={currentContent.backgroundImage as StaticImageData}
                  alt="Mood illustration"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Right side - Content */}
              <div className="relative h-full">
                <div className="pt-2 sm:pt-3 lg:pt-4 px-6 sm:px-8 lg:px-10 pb-6 lg:pb-8 flex flex-col justify-start">
                  <h3 className="text-[24px] sm:text-[28px] lg:text-[34px] font-medium text-[#1A1A1A] font-sfpro mb-1 lg:mb-1 tracking-[-0.01em]">
                    {currentContent.title}
                  </h3>
                  <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-[#6B6560] mb-2 lg:mb-3 leading-[1.4] font-sfpro max-w-[420px]">
                    {currentContent.description}
                  </p>

                  <div className="mb-4 lg:mb-5">
                    <p className="font-semibold text-[#1A1A1A] mb-3 lg:mb-4 text-[13px] sm:text-[14px] lg:text-[15px] font-sfpro">
                      The benefits to read this:
                    </p>
                    <ul className="space-y-1 lg:space-y-1.5">
                      {currentContent.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center">
                          <svg 
                            className="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] text-[#60351B] mr-3 flex-shrink-0" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          <span className="text-[13px] sm:text-[14px] lg:text-[15px] text-[#5C5650] font-sfpro">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Book previews */}
                  <div className="flex gap-4 lg:gap-5 mb-4 lg:mb-5">
                    {currentContent.books.slice(0, 3).map((book, index) => (
                      <div 
                        key={index}
                        className="w-[100px] h-[130px] sm:w-[110px] sm:h-[145px] lg:w-[125px] lg:h-[165px] bg-[#60351B]/10 rounded-[8px] lg:rounded-[10px] shadow-[0_1px_6px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden p-4 sm:p-5 lg:p-6"
                      >
                        <Image
                          src={book.image as StaticImageData}
                          alt={book.alt}
                          width={120}
                          height={160}
                          style={{ objectFit: 'contain' }}
                          className="drop-shadow-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <button className="text-[#1A1A1A] font-normal text-[13px] sm:text-[14px] lg:text-[15px] underline underline-offset-[4px] decoration-[1px] font-sfpro w-fit hover:text-[#4A4A4A] transition-colors">
                    View collection
                  </button>
                </div>

                {/* Decorative corner element */}
                <div className="absolute bottom-0 -right-8 sm:-right-12 lg:-right-16 w-[260px] h-[250px] sm:w-[340px] sm:h-[320px] lg:w-[420px] lg:h-[400px] pointer-events-none">
                  <Image
                    src={sideElement}
                    alt=""
                    fill
                    style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Outside the card */}
          <div className="flex justify-end gap-4 mt-10 lg:mt-12">
            <button 
              onClick={() => {
                const currentIdx = moods.findIndex(m => m.id === selectedMood)
                const prevIdx = currentIdx > 0 ? currentIdx - 1 : moods.length - 1
                setSelectedMood(moods[prevIdx].id)
              }}
              className="w-14 h-14 lg:w-16 lg:h-16 bg-white border border-[#E0DCD7] rounded-[12px] lg:rounded-[14px] flex items-center justify-center hover:bg-[#FAFAFA] hover:border-[#D0CCC7] transition-all"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#3A3A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => {
                const currentIdx = moods.findIndex(m => m.id === selectedMood)
                const nextIdx = currentIdx < moods.length - 1 ? currentIdx + 1 : 0
                setSelectedMood(moods[nextIdx].id)
              }}
              className="w-14 h-14 lg:w-16 lg:h-16 bg-white border border-[#E0DCD7] rounded-[12px] lg:rounded-[14px] flex items-center justify-center hover:bg-[#FAFAFA] hover:border-[#D0CCC7] transition-all"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#3A3A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>



    </section>
  )
}
