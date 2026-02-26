"use client";

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import redImg from './images/red.png';
import orangeImg from './images/orange.png';
import lightBlueImg from './images/light blue.png';
import darkBlueImg from './images/dark blue.png';
import purpleImg from './images/purple.png';
import greenImg from './images/green.png';
import MoodSection from './MoodSection';

interface Feature {
  id: number;
  title: string;
  description: string;
  color: string;
  image: StaticImageData;
  dark?: boolean;
}

export default function FeaturesSection(): JSX.Element {
  // Backend-ready: This data structure can be replaced with API call
  // Example: const features = await fetch('/api/features').then(r => r.json())
  const features: Feature[] = [
    {
      id: 1,
      title: 'Book Clubs',
      description: 'Vote on books, organize meetings, and host compelling discussions.',
      color: 'rgba(136,0,2,1)',
      image: redImg,
    },
    {
      id: 2,
      title: 'Mood Tags & Lists',
      description: 'Organize, search, and filter books by your tags and themes.',
      color: 'rgba(250,76,23,1)',
      image: orangeImg,
    },
    {
      id: 3,
      title: 'Reading Challenges',
      description: 'Set personal goals or join others in fun reading challenges worldwide.',
      color: 'rgba(184,212,223,1)',
      image: lightBlueImg,
      dark: true,
    },
    {
      id: 4,
      title: 'Giveaways & Rewards',
      description: 'Participate in giveaways and earn rewards for reading achievements.',
      color: 'rgba(68,96,168,1)',
      image: darkBlueImg,
    },
    {
      id: 5,
      title: 'Events & Author Meetups',
      description: 'Discover author meetups, book launches, and literary events by city and date.',
      color: 'rgba(55,47,131,1)',
      image: purpleImg,
    },
    {
      id: 6,
      title: 'Reader Community',
      description: 'Follow readers, explore reviews, and participate in book-based discussions.',
      color: 'rgba(35,53,59,1)',
      image: greenImg,
    },
  ];

  return (
    <section className="w-full pt-12 md:pt-16 lg:pt-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-[#210C00] mb-3 md:mb-4">
            A fully-featured platform with ultimate features
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#210C00]/70 max-w-2xl mx-auto leading-relaxed">
            Choose your vibe, and we'll show you books that match it. We want to make sure you read what you really want to read.
          </p>
        </div>

        {/* Features Grid - Custom Layout */}
        <div 
          className="gap-4 md:gap-6 lg:gap-8"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            minHeight: '300px'
          }}
        >
          {features.map((feature, index) => {
            const gridAreas = [
              '1 / 1 / 2 / 2', // div1
              '1 / 2 / 2 / 3', // div2
              '2 / 1 / 3 / 3', // div3
              '1 / 3 / 3 / 4', // div4
              '1 / 4 / 2 / 5', // div5
              '2 / 4 / 3 / 5', // div6
            ];
            
            return (
              <div
                key={feature.id}
                className="relative rounded-xl md:rounded-2xl overflow-hidden p-5 md:p-6 lg:p-8 group hover:shadow-lg transition-shadow duration-300"
                style={{ 
                  backgroundColor: feature.color,
                  gridArea: gridAreas[index]
                }}
              >
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <h3
                      className="text-lg md:text-xl lg:text-2xl font-semibold leading-tight mb-2 md:mb-3"
                      style={{
                        color: feature.dark ? 'rgba(33,12,0,1)' : 'rgba(255,255,255,1)',
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-xs sm:text-sm md:text-base leading-relaxed"
                      style={{
                        color: feature.dark ? 'rgba(33,12,0,0.7)' : 'rgba(255,255,255,0.9)',
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>

                  {/* Image */}
                  <div className="mt-4 md:mt-6 relative h-24 md:h-32 -mr-5 md:-mr-6 -mb-5 md:-mb-8">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-contain object-bottom-right"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood Section */}
      <MoodSection />
    </section>
  );
}