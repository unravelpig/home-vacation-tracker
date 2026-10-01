'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, eachDayOfInterval, isSameDay, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { Idea, Plan, WorkVacation } from '@/lib/types';
import { PEOPLE } from '@/lib/people';

interface AnnualCalendarProps {
  ideas: Idea[];
  plans: Plan[];
  workVacations?: WorkVacation[];
  onDayClick?: (date: Date, ideas: Idea[], plans: Plan[], workVacations: WorkVacation[]) => void;
}

type DayStatus = 'idea' | 'plan' | 'completed' | 'work_person1' | 'work_person2' | 'work_both' | null;

const COLORS: Record<string, string> = {
  idea: '#3498DB',
  plan: '#27AE60',
  completed: '#9B59B6',
  work_person1: '#E67E22',
  work_person2: '#16A085',
  work_both: '#E74C3C',
};

export default function AnnualCalendar({ ideas, plans, workVacations = [], onDayClick }: AnnualCalendarProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Compare dates as calendar date strings (YYYY-MM-DD) in local timezone.
  // This avoids timezone issues where new Date('2026-07-06') in UTC+2 becomes 02:00 July 6.
  const dateStr = (d: Date) => format(d, 'yyyy-MM-dd');
  const inRange = (day: Date, start: string, end: string) =>
    dateStr(day) >= start && dateStr(day) <= end;

  const getDateStatus = (day: Date): DayStatus => {
    const dayKey = dateStr(day);

    // Priority: completed > planned > work overlap > individual work
    const inCompleted = plans.some(p =>
      p.status === 'completed' && inRange(day, p.start_date, p.end_date)
    );
    if (inCompleted) return 'completed';

    const inPlanned = plans.some(p =>
      p.status !== 'completed' && inRange(day, p.start_date, p.end_date)
    );
    if (inPlanned) return 'plan';

    const person1Ranges = workVacations.filter(w => w.person === 'person1');
    const person2Ranges = workVacations.filter(w => w.person === 'person2');

    const inPerson1 = person1Ranges.some(w => inRange(day, w.start_date, w.end_date));
    const inPerson2 = person2Ranges.some(w => inRange(day, w.start_date, w.end_date));
    if (inPerson1 && inPerson2) return 'work_both';
    if (inPerson1) return 'work_person1';
    if (inPerson2) return 'work_person2';

    return null;
  };

  const getTripsForDate = (day: Date) => {
    const dayKey = dateStr(day);
    const dayIdeas = ideas.filter(i =>
      i.estimated_start_date && i.estimated_end_date &&
      inRange(day, i.estimated_start_date, i.estimated_end_date)
    );
    const dayPlans = plans.filter(p =>
      inRange(day, p.start_date, p.end_date)
    );
    const dayWorkVacations = workVacations.filter(w =>
      inRange(day, w.start_date, w.end_date)
    );
    return { ideas: dayIdeas, plans: dayPlans, workVacations: dayWorkVacations };
  };

  const handlePrevYear = () => setCurrentYear(y => y - 1);
  const handleNextYear = () => setCurrentYear(y => y + 1);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const result = getTripsForDate(day);
    onDayClick?.(day, result.ideas, result.plans, result.workVacations);
  };

  const renderMonth = (monthIndex: number) => {
    const monthStart = new Date(currentYear, monthIndex, 1);
    const monthEnd = new Date(currentYear, monthIndex + 1, 0);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = getDay(monthStart);
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);

    return (
      <div key={monthIndex} className="flex-1 min-w-[150px] bg-white rounded-xl border border-[var(--border)] p-3 shadow-sm">
        <div className="text-center text-xs font-medium text-[var(--text-secondary)] mb-1 py-1">
          {monthNames[monthIndex].substring(0, 3)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] text-[var(--text-secondary)]">{day}</div>
          ))}
          {[...paddedDays, ...daysInMonth].map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

            const status = getDateStatus(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const bgColor = status ? COLORS[status] : undefined;

            return (
              <button
                key={dateStr(day)}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square flex items-center justify-center rounded text-[10px]
                  transition-all duration-200
                  ${isSelected ? 'ring-1 ring-[var(--accent)]' : ''}
                  ${status ? 'text-white font-semibold cursor-pointer' : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}
                `}
                style={{ backgroundColor: bgColor ?? (isToday ? 'rgba(230,126,34,0.1)' : undefined) }}
              >
                <span style={{ color: status ? 'white' : isToday ? '#E67E22' : undefined }}>
                  {format(day, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4 shadow-[0_2px_8px_rgba(44,62,80,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevYear} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-[var(--text-secondary)]" />
        </button>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
          {currentYear}
        </h3>
        <button onClick={handleNextYear} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
          <ChevronRight size={20} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {monthNames.map((_, idx) => renderMonth(idx))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.plan }}></div>
          <span className="text-[var(--text-secondary)]">Plans</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.completed }}></div>
          <span className="text-[var(--text-secondary)]">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.work_person1 }}></div>
          <span className="text-[var(--text-secondary)]">{PEOPLE.person1.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.work_person2 }}></div>
          <span className="text-[var(--text-secondary)]">{PEOPLE.person2.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.work_both }}></div>
          <span className="text-[var(--text-secondary)]">Both</span>
        </div>
      </div>
    </div>
  );
}
