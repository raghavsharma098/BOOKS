"use client";

import React from "react";
import Image from 'next/image';
import footerLogo from './images/logo story book 3 2.png';
import EllipseShadow from '../components/EllipseShadow';

export default function Footer(): JSX.Element {
  // Backend-ready: These can be fetched from API
  // Example: const footerData = await fetch('/api/footer-links').then(r => r.json())
  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'Books', href: '/books' },
        { label: 'Colleges', href: '/colleges' },
        { label: 'Communities', href: '/communities' },
        { label: 'How it works', href: '/how-it-works' }
      ]
    },
    {
      title: 'Community',
      links: [
        { label: 'Contribute', href: '/contribute' },
        { label: 'Guidelines', href: '/guidelines' },
        { label: 'Blog', href: '/blog' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Terms of Use', href: '/terms' },
        { label: 'How to Order', href: '/order' },
        { label: 'Privacy policy', href: '/privacy' },
        { label: 'Return Policy', href: '/return-policy' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { name: 'Twitter', href: 'https://twitter.com', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { name: 'Facebook', href: 'https://facebook.com', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'YouTube', href: 'https://youtube.com', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' }
  ];

  return (
    <footer 
      id="site-footer" 
      className="relative bg-gradient-to-b from-[#C66D38]/10 to-[#673B20]/10 rounded-3xl m-4 overflow-hidden"
      style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* Decorative Ellipse Shadows */}
      <EllipseShadow size="lg" opacity={0.25} className="top-1/4 -left-40" />
      <EllipseShadow size="md" opacity={0.2} className="bottom-1/3 right-10" />
      <EllipseShadow size="xl" opacity={0.2} className="-bottom-32 left-1/3" />
      
      <div className="relative z-10 w-full px-6 sm:px-8 md:px-10 lg:px-12 py-10 sm:py-12 md:py-14 lg:py-16">
        {/* Top Section: Logo/Tagline on Left + 3-Column Links on Right */}
        <div className="flex flex-col lg:flex-row gap-36 lg:gap-42 xl:gap-56 mb-10 sm:mb-12 md:mb-14 pd-20">
          
          {/* Left Side: Logo and Tagline */}
          <div className="flex flex-col gap-3 lg:gap-4 lg:max-w-xs xl:max-w-sm pl-8 pr-16 pd-8">
            <div className="w-44 sm:w-48 md:w-52">
              <Image 
                src={footerLogo} 
                alt="Review & Ratings logo" 
                width={160} 
                height={66} 
                className="w-full h-auto object-contain pr-8"
              />
            </div>
            <p className="text-sm sm:text-base md:text-[18px] text-[#000000]/80 leading-relaxed">
              Trusted reviews and discovery across books, education, and communities.
            </p>
          </div>

          {/* Right Side: 3-Column Grid for Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16 flex-1">
            {footerLinks.map((column, idx) => (
              <div key={idx} className="flex flex-col">
                <h4 className="text-base sm:text-lg md:text-xl font-semibold text-[#210C00] mb-4 sm:mb-5 md:mb-6">
                  {column.title}
                </h4>
                <ul className="space-y-2.5 sm:space-y-3 md:space-y-3.5">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href}
                        className="text-sm sm:text-base md:text-[17px] text-[#000000]/80 hover:text-[#60351B] transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright and Social Icons */}
        <div className="border-t border-[#210C00]/8 pt-6 sm:pt-7 md:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <p className="text-sm sm:text-base md:text-[17px] text-[#000000]/80">
              2026 @ Copyright right reserved
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-[#210C00]/60 hover:text-[#60351B] transition-colors"
                >
                  <svg 
                    className="w-5 h-5 sm:w-6 sm:h-6" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
