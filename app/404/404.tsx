import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import booksImg from '../images/Books.png';
import side404 from '../../images/side element404.png';

export default function Custom404(): JSX.Element {
  return (
    <main style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      boxSizing: 'border-box',
      textAlign: 'center',
      background: '#F6F3EE',
      overflow: 'hidden'
    }}>
      {/* top decorative books (desktop only) */}
      <div className="hidden sm:block" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '41%', maxWidth: '590.83px', maxHeight: '228px', overflow: 'hidden', pointerEvents: 'none', opacity: 1 }}>
        <Image src={booksImg} alt="Hanging books" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', opacity: 1 }} priority />
      </div>

      {/* top decorative books (mobile only) */}
      <div className="sm:hidden" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: '400px', overflow: 'hidden', pointerEvents: 'none' }}>
        <Image src={booksImg} alt="Hanging books" style={{ width: '100%', height: 'auto', objectPosition: 'top' }} priority />
      </div>

      {/* central content */}
      <div className="w-full px-4 sm:px-6" style={{ maxWidth: 760, paddingTop: 100, paddingBottom: 120, boxSizing: 'border-box' }}>

        <h1 className="text-4xl sm:text-5xl md:text-[48px]" style={{ margin: 0, color: '#d9775a', fontWeight: 700 }}>404</h1>
        <h2 className="text-xl sm:text-2xl md:text-[28px]" style={{ margin: '20px 0 8px', color: 'rgba(0,0,0,0.9)', fontWeight: 800 }}>Looks like you’ve got lost...</h2>
        <p className="text-sm sm:text-base" style={{ margin: 0, color: 'rgba(33,33,33,0.45)' }}>The page you’re looking for doesn’t exist or has been moved.</p>

        <div style={{ marginTop: 28 }}>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: '#5C2F1E',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Go Home
          </Link>
        </div>
      </div>

      {/* bottom side decorative element */}
      <div style={{ position: 'absolute', left: 0, bottom: -10, width: '100%', pointerEvents: 'none' }}>
        <Image src={side404} alt="Decorative footer" style={{ width: '100%', height: 'auto' }} priority />
      </div>
    </main>
  );
}
