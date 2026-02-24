"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import side9 from './images/side element 9.png';

export default function NewsletterSubscribe(): JSX.Element {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Backend integration - POST to /api/newsletter/subscribe
    console.log('Subscribe email:', email);
    // Example: await fetch('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
  };

  return (
    <div className="relative w-full rounded-2xl border border-[#210C00] overflow-hidden bg-gradient-to-r from-[#60351B]/65 to-[#F6E1CE]/87">
      {/* Decorative Background Image */}
      <div className="absolute top-0 right-0 h-full w-1/2 lg:w-1/3 pointer-events-none opacity-80 hidden sm:block">
        <Image 
          src={side9} 
          alt="decorative background" 
          fill
          className="object-cover object-right"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 xl:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Text Content */}
          <div className="flex-1 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl text-white font-normal mb-2" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Subscribe to our newsletter
            </h3>
            <p className="text-sm sm:text-base text-white/90" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Subscribe our newsletter to get updates regularly.
            </p>
          </div>

          {/* Right: Email Input + Subscribe Button */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              aria-label="Email address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-2.5 rounded-lg border border-[#210C00] bg-transparent text-[#210C00] placeholder:text-[#210C00]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#60351B] w-full sm:w-64"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            />
            <button
              type="submit"
              aria-label="Subscribe to newsletter"
              className="px-6 py-2.5 bg-[#60351B] text-white rounded-full border-b-2 border-[#210C00] hover:bg-[#60351B]/90 transition-all font-medium text-sm whitespace-nowrap"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
