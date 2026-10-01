import { TripType, PlanStatus } from './types';

export const TRIP_TYPES: { value: TripType; label: string }[] = [
  { value: 'beach', label: 'Beach' },
  { value: 'mountain', label: 'Mountain' },
  { value: 'city', label: 'City' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
];

export const PLAN_STATUSES: { value: PlanStatus; label: string; color: string }[] = [
  { value: 'planned', label: 'Planned', color: '#27AE60' },
  { value: 'reserved', label: 'Reserved', color: '#E67E22' },
  { value: 'completed', label: 'Completed', color: '#9B59B6' },
];

export const formatDate = (date: string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateRange = (start: string | null, end: string | null): string => {
  if (!start && !end) return 'No dates';
  if (start && !end) return `From ${formatDate(start)}`;
  if (!start && end) return `To ${formatDate(end)}`;
  return `${formatDate(start)} - ${formatDate(end)}`;
};

export const getCountryFlag = (code: string, countries: { code: string; flag_emoji: string }[]): string => {
  const country = countries.find(c => c.code === code);
  return country?.flag_emoji || '';
};

export const getCountryName = (code: string, countries: { code: string; name: string }[]): string => {
  const country = countries.find(c => c.code === code);
  return country?.name || code;
};
