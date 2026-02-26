"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import whyChooseMain from './images/whychoose2.png';
import whyChooseInset from './images/whychoose1.png';
import cursorPng from '../../images/cursor.png';
import editorialPng from './images/editorial.png';
import choicePng from './images/choice.png';
import groupPng from './images/secondlast.png';
import bookPng from './images/last.png';
import booksTransparentPng from './images/book.png';
import sideElementImg from './images/side element 4.png';
import EllipseShadow from '../components/EllipseShadow';

export default function WhyChooseSection(): JSX.Element {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="relative">
      {/* Decorative Ellipse Shadows */}
      <EllipseShadow size="xl" opacity={0.35} className="top-1/4 -left-20" />
      <EllipseShadow size="lg" opacity={0.3} className="bottom-1/3 right-5" />
      <EllipseShadow size="md" opacity={0.25} className="top-1/2 left-1/2" />
      
      <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto relative flex flex-col items-center justify-center text-center max-w-[951px] px-2 sm:px-6 lg:px-0 py-6">
          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#210C00]">Why you have to choose us?</h3>
          <p className="text-sm sm:text-base md:text-lg leading-[150%] tracking-[-0.3px] max-w-2xl mx-auto mt-3 text-[rgba(33,12,0,0.6)] text-center" style={{ fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", fontWeight: 274, fontStyle: 'normal', lineHeight: '150%', fontVariantNumeric: 'slashed-zero' }}>We don’t just show scores — we help you understand what truly fits you, through thoughtful reviews and real experiences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - text + list */}
          <div className="bg-transparent lg:pr-6">

            <div className="flex flex-col gap-4 w-full">
              {/** Five stacked, interactive items — collapsed by default, expand on hover **/}
              {[
                { title: 'Trust is curated, not crowdsourced', desc: 'Editorial picks, verified authors, and structured reviews add clarity where numbers alone fall short.' },
                { title: 'Editorial trust where it matters.', desc: 'Hand‑vetted reviews and editor insights surface the information you can reliably act on.' },
                { title: 'One system for many choices.', desc: 'A single, consistent framework that lets you compare options quickly and fairly.' },
                { title: 'Community without social pressure.', desc: 'Real user feedback focused on experience — no follower counts or popularity contests.' },
                { title: 'Experience comes before popularity.', desc: 'We highlight in‑depth experiences and expert context rather than raw popularity metrics.' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className={
                    "why-choose-item group w-full max-w-[590px] overflow-x-hidden transition-all duration-300 ease-out border-b border-[#210C00]/20 p-5 sm:p-9 box-border cursor-pointer " +
                    (openIndex === idx ? 'h-[198px]' : 'h-auto') +
                    ' sm:group-hover:h-[198px]'
                  }
                  style={{ boxSizing: 'border-box' }}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 text-[#60351B] flex items-center justify-center">
                      {(() => {
                        switch (idx) {
                          case 0:
                            return (
                              <Image src={cursorPng} alt="cursor icon" width={20} height={20} className="w-5 h-5" />
                            );
                          case 1:
                            return (
                              <Image src={editorialPng} alt="editorial icon" width={20} height={20} className="w-5 h-5" />
                            );
                          case 2:
                            return (
                              <Image src={choicePng} alt="choice icon" width={20} height={20} className="w-5 h-5" />
                            );
                          case 3:
                            return (
                              <Image src={groupPng} alt="community icon" width={20} height={20} className="w-5 h-5" />
                            );
                          case 4:
                            return (
                              <Image src={bookPng} alt="experience icon" width={20} height={20} className="w-5 h-5" />
                            );
                          default:
                            return (
                              <Image src={booksTransparentPng} alt="recommendations icon" width={20} height={20} className="w-5 h-5" />
                            );
                        }
                      })()}
                    </div>

                    <div className="flex-1">
                      <div style={{ fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", fontWeight: 510, fontStyle: 'normal', verticalAlign: 'middle' }} className="text-[#20140F] text-[16px] sm:text-[18px] lg:text-[20px] leading-[24px] sm:leading-[26px] transition-all duration-300">
                        {item.title}
                      </div>
                      {idx === 0 && (
                        <div className="mt-2 h-px w-16 bg-[#210C00]/30"></div>
                      )}

                      <div className={`mt-2 sm:mt-3 transition-all duration-300 ease-out overflow-hidden break-words ${
                        openIndex === idx ? 'max-h-[200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-2'
                      } sm:group-hover:max-h-[200px] sm:group-hover:opacity-100 sm:group-hover:translate-y-0`} style={{ fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", fontWeight: 400, fontStyle: 'normal', fontSize: '16px', lineHeight: '28px', color: 'rgba(33,12,0,0.7)', verticalAlign: 'middle' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>



            <div className="mt-6 relative">
              <Link href="/about" className="bg-[#60351B] text-white px-5 py-2.5 rounded-full text-[14px] shadow-sm hover:brightness-95 transition">Discover now</Link>

<div className="hidden lg:block" style={{ position: 'absolute', top: '-482.19px', left: '-110.53px', width: '497.0708510170522px', height: '80.66990083713914px', transform: 'rotate(-360.66deg)' }}>
                <Image src={sideElementImg} alt="decorative" width={97.0708510170522} height={0} style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Right - images */}
          <div className="relative hidden lg:block w-full overflow-visible lg:-mr-[calc((100vw-1320px)/2)]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E9E0D8] opacity-80 filter blur-[24px] scale-105" />

            <Image
              src={whyChooseMain}
              alt="desk blur"
              width={951}
              height={777}
              style={{ objectFit: 'cover', opacity: 1, transform: 'rotate(0deg)', borderRadius: 0 }}
              className="ml-auto w-full max-w-none h-auto block"
            />

            <div className="overflow-hidden" style={{ position: 'absolute', top: '10%', right: '0%', width: '60%', height: '78%', opacity: 1, transform: 'rotate(0deg)', background: 'transparent' }}>
              <Image src={whyChooseInset} alt="books" fill style={{ objectFit: 'cover', borderRadius: 0, boxShadow: 'none', border: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
