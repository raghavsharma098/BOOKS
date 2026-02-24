"use client";

import React from "react";
import Image from 'next/image';
import review1 from './images/review1.png';
import review2 from './images/review2.png';
import NewsletterSubscribe from './NewsletterSubscribe';
import EllipseShadow from '../components/EllipseShadow';

export default function ReviewBook(): JSX.Element {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Decorative Ellipse Shadows */}
      <EllipseShadow size="lg" opacity={0.3} className="top-1/3 -left-32" />
      <EllipseShadow size="md" opacity={0.25} className="bottom-1/3 right-1/4" />
      <EllipseShadow size="xl" opacity={0.3} className="top-0 right-0" />
      
      <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-[#210C00]">
          
          {/* Left Side - Readers Section */}
          <div className="relative bg-[#60351B]/8 border-r-0 lg:border-r border-[#210C00] flex flex-col">
            {/* Content */}
            <div className="p-6 sm:p-8 lg:p-10 xl:p-12 flex-grow flex flex-col justify-start z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[47px] font-medium text-[#210C00] mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Review book, Published by Authors.
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg text-[#210C00]/80 mb-6 sm:mb-8 leading-relaxed max-w-md" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Reader can review the different books, share their books, and engage with a community that values thoughtful reading — not noise.
              </p>
              
              <button 
                aria-label="Continue as reader"
                className="w-fit px-6 py-2.5 bg-[#60351B] text-white rounded-full shadow-lg hover:bg-[#60351B]/90 transition-all font-semibold text-sm sm:text-base"
                style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                Continue as reader
              </button>
            </div>

            {/* Review Image at Bottom */}
            <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-[233px] overflow-hidden z-20">
              <Image 
                src={review1} 
                alt="Reader reviews showcase" 
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Side - Authors Section */}
          <div className="relative bg-[#60351B]/75 flex flex-col min-h-[500px] sm:min-h-[550px] md:min-h-[600px]">
            {/* Content */}
            <div className="p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-start z-20 relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[47px] font-medium text-[#F7F6F1] mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Built for writers. Trusted by readers.
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg text-[#EDE7DE] mb-6 sm:mb-8 leading-relaxed max-w-md" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Authors can claim their profiles, share their books, and engage with a community that values thoughtful reading — not noise.
              </p>
              
              <button 
                aria-label="Claim your profile"
                className="w-fit px-6 py-2.5 bg-[#F7F5F0] text-[#210C00] rounded-full shadow-lg hover:bg-[#F7F5F0]/90 transition-all font-medium text-sm sm:text-base"
                style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                Claim your profile now!
              </button>
            </div>

            {/* Review Image at Bottom Right - Overlapping */}
            <div className="absolute bottom-0 right-0 w-full sm:w-4/5 md:w-3/4 lg:w-2/3 h-48 sm:h-56 md:h-64 lg:h-[280px] overflow-hidden border-t border-l border-[#210C00]/10 rounded-tl-2xl z-10">
              <Image 
                src={review2} 
                alt="Author profiles showcase" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Newsletter Subscribe - Positioned Below */}
        <div className="mt-8 sm:mt-12 md:mt-16">
          <NewsletterSubscribe />
        </div>
      </div>
    </section>
  );
}
