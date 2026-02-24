'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tokenManager } from '../../lib/api';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '⬛' },
  { href: '/admin/books', label: 'Books', icon: '📚' },
  { href: '/admin/author-claims', label: 'Author Claims', icon: '✍️' },
  { href: '/admin/polls', label: 'Polls', icon: '🗳️' },
  { href: '/admin/events', label: 'Events', icon: '📅' },
  { href: '/admin/clubs', label: 'Clubs', icon: '📚' },
  { href: '/admin/giveaways', label: 'Giveaways', icon: '🎁' },
  { href: '/admin/moderation', label: 'Moderation', icon: '🛡️' },
  { href: '/admin/blogs', label: 'Blogs / Editorial', icon: '✍️' },
  { href: '/admin/users', label: 'Users', icon: '👤' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = tokenManager.getAccessToken();
    const user = tokenManager.getUser();
    if (!token) {
      router.replace('/login');
      return;
    }
    if (user && user.role !== 'admin' && user.role !== 'editorial_admin') {
      router.replace('/dashboard');
      return;
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <span className="text-[#60351B] text-sm">Verifying access…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF6F0] font-sans">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 bg-[#60351B] flex flex-col min-h-screen">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Admin Panel</p>
          <h1 className="text-white font-semibold text-base leading-tight">BookNest</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <Link href="/dashboard" className="text-white/50 text-xs hover:text-white transition-colors">
            ← Back to app
          </Link>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#210C00]/10 flex items-center px-6 gap-4 sticky top-0 z-10">
          <h2 className="text-sm font-medium text-[#210C00] flex-1 capitalize">
            {pathname.split('/').slice(1).join(' › ')}
          </h2>
          <Link href="/admin" className="text-xs text-[#60351B] hover:underline">Admin Home</Link>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
