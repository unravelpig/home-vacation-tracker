'use client';

import { useState, useEffect } from 'react';
import WorldMap from '@/components/features/WorldMap';
import AnnualCalendar from '@/components/features/AnnualCalendar';
import { Idea, Plan, WorkVacation } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { personLabel } from '@/lib/people';

function formatDateRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return `${format(s, 'd MMM')} – ${format(e, 'd MMM yyyy')}`;
}

export default function HomePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [workVacations, setWorkVacations] = useState<WorkVacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    date: Date;
    ideas: Idea[];
    plans: Plan[];
    workVacations: WorkVacation[];
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ideasRes, plansRes, wvRes] = await Promise.all([
        fetch('/api/ideas'),
        fetch('/api/plans'),
        fetch('/api/work-vacations')
      ]);

      const ideasData = await ideasRes.json();
      const plansData = await plansRes.json();
      const wvData = await wvRes.json();

      setIdeas(Array.isArray(ideasData) ? ideasData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setWorkVacations(Array.isArray(wvData) ? wvData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIdeas([]);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const completedPlans = plans.filter(p => p.status === 'completed');
  const activePlans = plans.filter(p => p.status !== 'completed');

  const handleDayClick = (date: Date, ideas: Idea[], plans: Plan[], workVacations: WorkVacation[]) => {
    setSelectedDayInfo({ date, ideas, plans, workVacations });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1
            className="page-title text-3xl font-bold text-[var(--text-primary)] mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Vacation Calendar
          </h1>
          <AnnualCalendar
            ideas={ideas}
            plans={plans}
            workVacations={workVacations}
            onDayClick={handleDayClick}
          />
        </div>

        <div>
          <h1
            className="page-title text-3xl font-bold text-[var(--text-primary)] mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            World Map
          </h1>
          <div className="bg-white rounded-lg border border-[var(--border)] h-[500px] shadow-[0_2px_8px_rgba(44,62,80,0.08)] overflow-hidden">
            <WorldMap ideas={ideas} plans={activePlans} allPlans={plans} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)] p-6 shadow-[0_2px_8px_rgba(44,62,80,0.08)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Summary
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-3xl font-bold text-[var(--idea-color)]">{ideas.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Ideas</p>
            </div>
            <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-3xl font-bold text-[var(--plan-color)]">{activePlans.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Active Plans</p>
            </div>
            <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-3xl font-bold text-[var(--completed-color)]">{completedPlans.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedDayInfo}
        onClose={() => setSelectedDayInfo(null)}
        title={`Trips on ${selectedDayInfo?.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      >
        {selectedDayInfo && (
          <div className="space-y-4">
            {selectedDayInfo.workVacations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2" style={{ color: '#E67E22' }}>Time Off</h3>
                <div className="space-y-2">
                  {selectedDayInfo.workVacations.map(wv => (
                    <div
                      key={wv.id}
                      className="p-3 rounded-lg flex items-center justify-between"
                      style={{ backgroundColor: wv.person === 'person1' ? 'rgba(230,126,34,0.1)' : 'rgba(22,160,133,0.1)' }}
                    >
                      <div>
                        <p className="font-medium capitalize">{personLabel(wv.person)}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{formatDateRange(wv.start_date, wv.end_date)}</p>
                        {wv.notes && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{wv.notes}</p>}
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Delete this time off?')) {
                            fetch(`/api/work-vacations?id=${wv.id}`, { method: 'DELETE' }).then(() => setSelectedDayInfo(null));
                          }
                        }}
                        className="text-red-400 hover:text-red-600 p-2"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayInfo.plans.length > 0 && (
              <div>
                <h3 className="font-semibold text-[var(--plan-color)] mb-2">Plans</h3>
                <div className="space-y-2">
                  {selectedDayInfo.plans.map(plan => (
                    <Link
                      key={plan.id}
                      href={`/plans/${plan.id}/edit`}
                      onClick={() => setSelectedDayInfo(null)}
                    >
                      <div className="p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors cursor-pointer">
                        <p className="font-medium">{plan.title}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{plan.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {selectedDayInfo.ideas.length > 0 && (
              <div>
                <h3 className="font-semibold text-[var(--idea-color)] mb-2">Ideas</h3>
                <div className="space-y-2">
                  {selectedDayInfo.ideas.map(idea => (
                    <Link
                      key={idea.id}
                      href={`/ideas/${idea.id}/edit`}
                      onClick={() => setSelectedDayInfo(null)}
                    >
                      <div className="p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors cursor-pointer">
                        <p className="font-medium">{idea.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {selectedDayInfo.workVacations.length === 0 &&
             selectedDayInfo.plans.length === 0 &&
             selectedDayInfo.ideas.length === 0 && (
              <p className="text-center text-[var(--text-secondary)] py-4">
                No trips for this day
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
