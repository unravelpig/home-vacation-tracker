'use client';

import Link from 'next/link';
import { Map, Menu } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export default function Header() {
  const { collapsed, toggle } = useSidebar();

  return (
    <header className="bg-[var(--bg-dark)] text-white py-3 px-4 fixed top-0 left-0 right-0 z-50 h-14 shadow-[0_2px_12px_rgba(44,62,80,0.18)]">
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title={collapsed ? 'Open menu' : 'Close menu'}
          aria-label={collapsed ? 'Open menu' : 'Close menu'}
        >
          <Menu size={22} className="text-white" />
        </button>

        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-1 min-w-0">
          <Map size={24} className="text-[var(--accent)]" />
          <span className="text-lg font-semibold truncate" style={{ fontFamily: 'var(--font-heading)' }}>
            Home Vacation Tracker
          </span>
        </Link>
      </div>
    </header>
  );
}
