'use client';

import Link from 'next/link';
import { MapPin, Calendar, Pencil, CheckCircle, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plan } from '@/lib/types';
import { formatDateRange, PLAN_STATUSES } from '@/lib/utils';
import countriesData from '@/public/data/countries.json';

interface PlanCardProps {
  plan: Plan;
  onDelete?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
}

export default function PlanCard({ plan, onDelete, onMarkCompleted }: PlanCardProps) {
  const statusInfo = PLAN_STATUSES.find(s => s.value === plan.status) || PLAN_STATUSES[0];

  const getCountryFlags = (codes: string[]) => {
    return codes.map(code => {
      const country = countriesData.find(c => c.code === code);
      return country?.flag_emoji || '';
    }).join(' ');
  };

  return (
    <Card hoverable className="p-4 border-l-4 border-l-[var(--plan-color)]">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <span 
            className="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
            style={{ 
              backgroundColor: `${statusInfo.color}20`,
              color: statusInfo.color 
            }}
          >
            {statusInfo.label}
          </span>
        </div>

        <div className="flex-1">
          <h3 
            className="text-lg font-semibold text-[var(--text-primary)] mb-2" 
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {plan.title}
          </h3>

          {plan.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
              {plan.description}
            </p>
          )}

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <MapPin size={14} />
              <span className="flex items-center gap-1">
                {getCountryFlags(plan.countries)}
                {plan.countries.map(code => {
                  const country = countriesData.find(c => c.code === code);
                  return country?.name || code;
                }).join(', ')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Calendar size={14} />
              <span>{formatDateRange(plan.start_date, plan.end_date)}</span>
            </div>

            {plan.estimated_budget && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <DollarSign size={14} />
                <span>${plan.estimated_budget.toLocaleString()}</span>
              </div>
            )}

            {plan.trip_type && (
              <span className="inline-block px-2 py-0.5 bg-[var(--plan-color)]/10 text-[var(--plan-color)] text-xs rounded-full">
                {plan.trip_type}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-auto pt-3 border-t border-[var(--border)]">
          <Link href={`/plans/${plan.id}/edit`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full gap-1">
              <Pencil size={14} />
              Edit
            </Button>
          </Link>
          {onMarkCompleted && plan.status !== 'completed' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onMarkCompleted(plan.id);
              }}
              className="text-[var(--completed-color)]"
            >
              <CheckCircle size={14} />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plan.id);
              }}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
