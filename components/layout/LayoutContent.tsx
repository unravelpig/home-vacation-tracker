'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Idea, Plan } from '@/lib/types';

interface LayoutContentProps {
  ideas: Idea[];
  plans: Plan[];
}

export default function LayoutContent({ ideas, plans }: LayoutContentProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activePlans = plans.filter(p => p.status !== 'completed');
  const completedPlans = plans.filter(p => p.status === 'completed');

  return (
    <>
      <Header />
      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar />
      </div>
    </>
  );
}
