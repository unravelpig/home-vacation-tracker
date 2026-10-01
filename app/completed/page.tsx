'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Plan } from '@/lib/types';
import PlanCard from '@/components/features/PlanCard';

export default function CompletedPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const completedPlans = plans.filter(p => p.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 
            className="page-title text-3xl font-bold text-[var(--text-primary)]" 
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Completed Trips
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {completedPlans.length} {completedPlans.length === 1 ? 'trip completed' : 'trips completed'}
          </p>
        </div>

        {completedPlans.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-secondary)] rounded-lg">
            <CheckCircle size={48} className="mx-auto text-[var(--completed-color)] mb-4" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              No completed trips yet
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Plans marked as completed will appear here
            </p>
            <Link href="/plans">
              <span className="text-[var(--accent)] hover:underline">
                View active plans →
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
