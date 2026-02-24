import './globals.css';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata = {
  title: 'Book Website',
  description: 'Responsive Next.js site scaffolded with Tailwind CSS',
};

import MobileTopBar from './components/MobileTopBar';
import { MobileMenuProvider } from './contexts/MobileMenuContext';
import TopBarWrapper from './components/TopBarWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F2F0E4]">
        <AuthProvider>
          <MobileMenuProvider>
            <TopBarWrapper />
            <main className="w-full">{children}</main>
          </MobileMenuProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
