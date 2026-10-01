'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Default to open — matches what CSS shows on desktop (lg: breakpoint).
  // On mobile (<1024px) the CSS starts the sidebar hidden, so we also start collapsed.
  const [collapsed, setCollapsed] = useState(true);

  // Listen for viewport changes
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      // On desktop: sidebar is always visible (CSS handles it)
      // On mobile: if we were on desktop and resize to mobile, collapse
      if (!isMobile) setCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = () => setCollapsed(prev => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
