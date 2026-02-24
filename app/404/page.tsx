import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import booksImg from './images/Books.png';
import side404 from './images/side element404.png';

export default function Custom404(): JSX.Element {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-12 text-center bg-[#F6F3EE] overflow-hidden">
      {/* top decorative books (desktop only) */}
      <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 w-2/5 max-w-[590.83px] max-h-[228px] overflow-hidden pointer-events-none">
        <Image
          src={booksImg}
          alt="Hanging books"
          className="w-full h-full object-cover object-top"
          priority
        />
      </div>

      {/* top decorative books (mobile only) */}
      <div className="sm:hidden absolute top-0 left-1/2 transform -translate-x-1/2 w-4/5 max-w-[400px] overflow-hidden pointer-events-none">
        <Image
          src={booksImg}
          alt="Hanging books"
          className="w-full h-auto object-top"
          priority
        />
      </div>

      {/* central content */}
      <div className="w-full px-4 sm:px-6 max-w-[760px] pt-24 pb-30">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#d9775a] m-0">404</h1>
        <h2 className="text-xl sm:text-2xl md:text-[28px] mt-5 mb-2 font-extrabold text-[#212121]">
          Looks like you’ve got lost...
        </h2>
        <p className="text-sm sm:text-base text-[#212121]/60">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-7">
          <Link href="/" className="inline-block px-4 py-2 bg-[#5C2F1E] text-white rounded-lg font-semibold hover:bg-[#4A2518] transition-colors">
            Go Home
          </Link>
        </div>
      </div>

      {/* bottom side decorative element */}
      <div className="absolute left-0 bottom-0 w-full pointer-events-none">
        <Image
          src={side404}
          alt="Decorative footer"
          className="w-full h-auto"
          priority
        />
      </div>
    </main>
  );
}