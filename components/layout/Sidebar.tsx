'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Lightbulb, Calendar, CheckCircle, ChevronRight, Briefcase } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const [ideaCount, setIdeaCount] = useState(0);
  const [planCount, setPlanCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [workVacCount, setWorkVacCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/ideas').then(r => r.json()),
      fetch('/api/plans').then(r => r.json()),
      fetch('/api/work-vacations').then(r => r.json()),
    ]).then(([ideas, plans, wvs]) => {
      setIdeaCount(Array.isArray(ideas) ? ideas.length : 0);
      const active = Array.isArray(plans) ? plans.filter((p: { status: string }) => p.status !== 'completed').length : 0;
      const completed = Array.isArray(plans) ? plans.filter((p: { status: string }) => p.status === 'completed').length : 0;
      setPlanCount(active);
      setCompletedCount(completed);
      setWorkVacCount(Array.isArray(wvs) ? wvs.length : 0);
    }).catch(() => {});
  }, []);

  const menuItems = [
    {
      href: '/ideas',
      icon: Lightbulb,
      label: 'Ideas',
      count: ideaCount,
      color: 'var(--idea-color)'
    },
    {
      href: '/plans',
      icon: Calendar,
      label: 'Plans',
      count: planCount,
      color: 'var(--plan-color)'
    },
    {
      href: '/completed',
      icon: CheckCircle,
      label: 'Completed',
      count: completedCount,
      color: 'var(--completed-color)'
    },
    {
      href: '/time-off',
      icon: Briefcase,
      label: 'Time Off',
      count: workVacCount,
      color: 'var(--person1-color)'
    },
  ];

  return (
    <>
      {/* Mobile: dark overlay when drawer is open */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={toggle}
        />
      )}

      {/*
        Desktop (lg): always visible, static relative sidebar — toggle btn is hidden.
        Mobile: fixed off-canvas drawer, controlled by `collapsed`.
        suppressHydrationWarning avoids server/client mismatch on mobile-sized screens.
      */}
      <aside
        suppressHydrationWarning
        className={`
          bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col
          transition-transform duration-300 ease-in-out
          /* Mobile: anchored left, below header (z-40 < header z-50) */
          fixed inset-y-0 left-0 z-40 w-64
          ${collapsed ? 'translate-x-[-100%]' : 'translate-x-0'}
          /* Desktop: fixed below header, 2px gap */
          lg:fixed lg:top-[58px] lg:left-0 lg:bottom-auto lg:z-40 lg:w-64 lg:h-[calc(100dvh-58px)] lg:translate-x-0 lg:overflow-auto
        `}
      >
        <div className="mb-6 px-4 pt-4">
          <h2
            className="text-lg font-semibold text-[var(--text-primary)] overflow-hidden whitespace-nowrap"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Navigation
          </h2>
        </div>

        <nav className="flex-1 space-y-2 px-2">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={toggle}
                className={`
                  flex items-center justify-between p-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-white shadow-[inset_3px_0_0_var(--accent),0_2px_8px_rgba(44,62,80,0.08)]'
                    : 'hover:bg-white/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    style={{ color: item.color }}
                    className={isActive ? 'opacity-100' : 'opacity-70'}
                  />
                  <span
                    className={`font-medium ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color
                    }}
                  >
                    {item.count}
                  </span>
                  <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-[var(--border)] px-3 pb-4">
          <p className="text-xs text-[var(--text-secondary)] text-center">
            Home Vacation Tracker v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
