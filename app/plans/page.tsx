'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { Plan } from '@/lib/types';
import PlanCard from '@/components/features/PlanCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function PlanesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });

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

  const handleDelete = async () => {
    if (!deleteModal.planId) return;
    
    try {
      await fetch(`/api/plans/${deleteModal.planId}`, { method: 'DELETE' });
      setPlans(plans.filter(p => p.id !== deleteModal.planId));
      setDeleteModal({ open: false, planId: null });
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleMarkCompleted = async (planId: string) => {
    try {
      const res = await fetch(`/api/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      
      if (res.ok) {
        setPlans(plans.map(p => 
          p.id === planId ? { ...p, status: 'completed' as const } : p
        ));
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const activePlans = plans.filter(p => p.status !== 'completed');
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 
              className="page-title text-3xl font-bold text-[var(--text-primary)]" 
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Travel Plans
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              {activePlans.length} active plans · {completedPlans.length} completed
            </p>
          </div>
          <Link href="/plans/new">
            <Button className="gap-2">
              <Plus size={20} />
              Create New Plan
            </Button>
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-secondary)] rounded-lg">
            <Calendar size={48} className="mx-auto text-[var(--plan-color)] mb-4" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              No plans yet
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Create a plan from an idea or start from scratch
            </p>
            <Link href="/plans/new">
              <Button className="gap-2">
                <Plus size={20} />
                Create New Plan
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {activePlans.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Active Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePlans.map(plan => (
                    <PlanCard 
                      key={plan.id} 
                      plan={plan}
                      onDelete={(id) => setDeleteModal({ open: true, planId: id })}
                      onMarkCompleted={handleMarkCompleted}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedPlans.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-[var(--completed-color)] mb-4">Completed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedPlans.map(plan => (
                    <PlanCard 
                      key={plan.id} 
                      plan={plan}
                      onDelete={(id) => setDeleteModal({ open: true, planId: id })}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, planId: null })}
        title="Delete Plan"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setDeleteModal({ open: false, planId: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-[var(--text-secondary)]">
          Are you sure you want to delete this plan? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
