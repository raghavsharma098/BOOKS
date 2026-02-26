'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import booksImg from './images/book.png';
import gradientBg from '../../images/background/gradient.png';
import FeaturesSection from './FeaturesSection';
import EllipseShadow from '../components/EllipseShadow';

export default function Hero() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-8 md:pt-12 lg:pt-16 px-4 sm:px-6 lg:px-8">
        {/* Background Gradient Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={gradientBg}
            alt="Background Gradient"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Left Side Shadow Overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#210C00]/8 via-transparent to-transparent pointer-events-none z-10"></div>
        
        {/* Right Side Shadow Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#210C00]/8 via-transparent to-transparent pointer-events-none z-10"></div>

        {/* Decorative Ellipse Shadows */}
        <EllipseShadow size="xl" opacity={0.5} className="top-20 right-10 md:right-20" />
        <EllipseShadow size="lg" opacity={0.4} className="top-32 left-5 md:left-20" />
        <EllipseShadow size="md" opacity={0.3} className="top-1/3 left-1/3" />
        <EllipseShadow size="lg" opacity={0.35} className="top-2/3 right-1/4" />

        <div className="w-full max-w-[1320px] mx-auto relative z-20">
          {/* Headline - Times New Roman Typography */}
          <div className="text-center mb-6 md:mb-8 lg:mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-[#210C00]" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <span className="italic font-semibold">Discover</span>
              <span className="mx-1 md:mx-3">all the</span>
              <span className="italic font-semibold">Books</span>
              <span className="mx-1 md:mx-3">you</span>
              <br className="hidden sm:block" />
              <span className="opacity-90">were looking for</span>
            </h1>
          </div>

          {/* Subtext - SF Pro Typography */}
          <div className="text-center mb-8 md:mb-10 lg:mb-12">
            <p className="text-base sm:text-lg md:text-xl text-[#210C00] leading-relaxed max-w-2xl mx-auto font-light" style={{ fontFamily: '"SF Pro Text", "SF Pro Display", system-ui, sans-serif' }}>
              Our bookstore has something for everyone. <br/>Shop with us today and discover the joy of reading!
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-8 md:mb-12 lg:mb-16">
            <Link
              href="/signup"
              className="px-8 md:px-10 py-3 md:py-3.5 bg-[#60351B] text-white rounded-lg hover:bg-[#4a2715] transition-all duration-300 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
          {/* Books Image - Responsive Full Width with Shadow */}
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-0">
            {/* Top Shadow Effect */}
            <div className="absolute -top-8 md:-top-12 left-0 right-0 h-12 md:h-16 bg-gradient-to-b from-[#210C00]/8 to-transparent pointer-events-none"></div>
            
            <div className="relative w-full h-auto">
              <Image
                src={booksImg}
                alt="Featured Books Collection"
                width={1400}
                height={600}
                className="w-full h-auto object-contain"
                priority
              />
            </div>

            {/* Bottom Shadow Effect */}
            <div className="absolute -bottom-8 md:-bottom-12 left-0 right-0 h-12 md:h-16 bg-gradient-to-t from-[#210C00]/10 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Bottom Shadow Gradient for section transition */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-b from-transparent via-[#210C00]/3 to-[#210C00]/6 pointer-events-none"></div>
      </section>

      {/* Animated Scrolling Quote Banner - Full Bleed */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-5 md:py-6 border-b-orange-800/40 bg-gradient-to-r from-yellow-800/40 via-[#d4cfc4] to-yellow-800/40 backdrop-blur-sm overflow-hidden border-t border-b border-[#210C00]">
            <div className="marquee-container relative">
              <div className="marquee-content">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className={`marquee-item text-center text-sm sm:text-base md:text-lg lg:text-xl text-[#210C00] font-light ${index === 1 ? 'hidden sm:block' : ''}`} style={{ fontFamily: '"SF Pro Text", "SF Pro Display", system-ui, sans-serif' }}>
                    <span className="sm:hidden inline-block whitespace-nowrap">“We&apos;ll help you track your reading and choose your next book.”</span>
                    <span className="hidden sm:inline">
                      “We&apos;ll help you <span className="font-semibold">track</span> your reading and <span className="font-semibold">choose your</span>
                      <br />
                      <span className="font-semibold">next book</span> based on your mood and your favorite
                      <br />
                      topics and themes.”
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

      {/* Features section */}
      <FeaturesSection />
    </>
  );
}
