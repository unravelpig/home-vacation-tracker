'use client';

import Link from 'next/link';
import { MapPin, Calendar, Pencil, Clock, Sun, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Idea } from '@/lib/types';
import countriesData from '@/public/data/countries.json';

interface IdeaCardProps {
  idea: Idea;
  onDelete?: (id: string) => void;
}

export default function IdeaCard({ idea, onDelete }: IdeaCardProps) {
  const getCountryFlags = (codes: string[]) => {
    return codes.map(code => {
      const country = countriesData.find(c => c.code === code);
      return country?.flag_emoji || '';
    }).join(' ');
  };

  return (
    <Card hoverable className="p-4 border-l-4 border-l-[var(--idea-color)]">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3
            className="text-lg font-semibold text-[var(--text-primary)] mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {idea.title}
          </h3>

          {idea.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
              {idea.description}
            </p>
          )}

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <MapPin size={14} />
              <span className="flex items-center gap-1">
                {getCountryFlags(idea.countries)}
                {idea.countries.map(code => {
                  const country = countriesData.find(c => c.code === code);
                  return country?.name || code;
                }).join(', ')}
              </span>
            </div>

            {idea.cities && idea.cities.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin size={14} className="ml-4" />
                <span>{idea.cities.join(', ')}</span>
              </div>
            )}

            {idea.duration_days && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Clock size={14} />
                <span>{idea.duration_days} days</span>
              </div>
            )}

            {idea.season && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Sun size={14} />
                <span>{idea.season}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-auto pt-3 border-t border-[var(--border)]">
          <Link href={`/plans/new?idea=${idea.id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full gap-1 text-[var(--plan-color)] hover:text-[var(--plan-color)]">
              <ArrowRight size={14} />
              Create Plan
            </Button>
          </Link>
          <Link href={`/ideas/${idea.id}/edit`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full gap-1">
              <Pencil size={14} />
              Edit
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(idea.id);
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
