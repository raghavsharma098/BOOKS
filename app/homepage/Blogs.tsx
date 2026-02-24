"use client";

import React from "react";
import Image from "next/image";
import featureImg from './images/card1.png';
import cardImg1 from './images/card2.png';
import cardImg2 from './images/card3.png';
import cardImg3 from './images/card4.png';
import EllipseShadow from '../components/EllipseShadow';

export default function Blogs(): JSX.Element {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Decorative Ellipse Shadows */}
      <EllipseShadow size="lg" opacity={0.3} className="-top-32 left-1/4" />
      <EllipseShadow size="md" opacity={0.25} className="bottom-1/4 right-10" />
      <EllipseShadow size="xl" opacity={0.35} className="top-1/2 -right-40" />
      
      <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 sm:mb-12 md:mb-16 text-center">
          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#210C00] mb-3 sm:mb-4" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>Our Blogs</h3>
          <p className="text-sm sm:text-base md:text-lg text-[#6B6560] max-w-2xl mx-auto" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>Reflections, guides, and editor-led writing designed to help you choose and understand books with clarity.</p>
        </div>

        {/* Featured Blog Card */}
        <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-14 bg-white/60 border border-[#E8E4D9] rounded-2xl overflow-hidden hover:shadow-lg transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 order-2 md:order-1" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              <div>
                <div className="text-[10px] sm:text-xs font-bold text-[#210C00] uppercase mb-4 tracking-wider">FEATURED</div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#210C00] mb-4 leading-tight">Why some books stay with us?</h2>
                <p className="text-sm sm:text-base text-[#210C00]/60 mb-6 leading-relaxed">Not every book is remembered for its plot. Some stay because of how they made us feel — long after the last page.</p>
              </div>
              <button className="w-fit text-[#210C00] text-sm sm:text-base font-medium hover:underline transition flex items-center gap-2">
                Read More <span className="text-base">→</span>
              </button>
            </div>
            <div className="relative h-64 sm:h-72 md:h-full min-h-[320px] order-1 md:order-2">
              <Image
                src={featureImg}
                alt="featured blog"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {[
            { title: 'Choosing books beyond popularity?', img: cardImg1 },
            { title: 'What makes a review trustworthy?', img: cardImg2 },
            { title: 'How communities shape reading choices', img: cardImg3 },
          ].map((item, idx) => (
            <article key={idx} className="bg-white/60 border border-[#E8E4D9] rounded-2xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
              <div className="p-6 sm:p-7 lg:p-8 flex flex-col gap-4" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                <div className="text-[10px] sm:text-xs font-bold text-[#210C00] uppercase tracking-wider">FEATURED</div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#210C00] leading-tight">{item.title}</h3>
                <button className="w-fit text-[#210C00] text-sm font-medium hover:underline transition flex items-center gap-2 mt-2">
                  Read More <span className="text-base">→</span>
                </button>
              </div>
              <div className="relative h-48 sm:h-56 md:h-64 w-full mt-auto">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center">
          <button className="px-8 sm:px-10 py-3 sm:py-3.5 bg-[#60351B] text-white rounded-full hover:bg-[#60351B]/90 transition font-medium text-sm sm:text-base shadow-sm" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Show more
          </button>
        </div>
      </div>
    </section>
  );
}
