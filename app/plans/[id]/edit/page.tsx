'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import CountrySelector from '@/components/features/CountrySelector';
import { TripType, PlanStatus, Plan } from '@/lib/types';
import { TRIP_TYPES, PLAN_STATUSES } from '@/lib/utils';

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    countries: [] as string[],
    cities: [] as string[],
    start_date: '',
    end_date: '',
    trip_type: '' as TripType | '',
    estimated_budget: '',
    status: 'planned' as PlanStatus,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchPlan();
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      const res = await fetch(`/api/plans/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          countries: data.countries || [],
          cities: data.cities || [],
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          trip_type: data.trip_type || '',
          estimated_budget: data.estimated_budget?.toString() || '',
          status: data.status || 'planned',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToIdea = async () => {
    if (!confirm('Convert this plan back to an idea? Dates and status will be cleared. This action cannot be undone.')) return;
    setConverting(true);
    try {
      const res = await fetch('/api/plans/to-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id }),
      });
      if (res.ok) {
        router.push('/ideas');
      }
    } catch (error) {
      console.error('Error converting plan to idea:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.countries.length === 0) newErrors.countries = 'Select at least one country';
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es requerida';
    if (!formData.end_date) newErrors.end_date = 'La fecha de fin es requerida';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : null,
          trip_type: formData.trip_type || null,
        }),
      });
      
      if (res.ok) {
        router.push('/plans');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent)] border-t-transparent"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-[var(--text-secondary)]">Plan not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/plans" 
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-2 inline-block"
          >
            ← Back to Plans
          </Link>
          <h1 
            className="page-title text-3xl font-bold text-[var(--text-primary)]" 
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Edit Plan
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Plan title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Trip to Japan 2025"
            error={errors.title}
          />

          <Textarea
            label="Detailed description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the plan details..."
            rows={3}
          />

          <div>
            <CountrySelector
              label="Destination countries *"
              selectedCountries={formData.countries}
              onChange={(countries) => setFormData({ ...formData, countries })}
            />
            {errors.countries && (
              <p className="mt-1 text-sm text-red-600">{errors.countries}</p>
            )}
          </div>

          <Textarea
            label="Specific cities"
            value={formData.cities.join(', ')}
            onChange={(e) => setFormData({ 
              ...formData, 
              cities: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
            })}
            placeholder="e.g. Tokyo, Kyoto, Osaka"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start date *"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              error={errors.start_date}
            />
            <Input
              label="End date *"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              error={errors.end_date}
            />
          </div>

          <Select
            label="Trip type"
            value={formData.trip_type}
            onChange={(e) => setFormData({ ...formData, trip_type: e.target.value as TripType })}
            options={[{ value: '', label: 'Select a type' }, ...TRIP_TYPES]}
          />

          <Input
            label="Estimated budget"
            type="number"
            value={formData.estimated_budget}
            onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
            placeholder="e.g. 3000"
          />

          <Select
            label="Plan status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as PlanStatus })}
            options={PLAN_STATUSES.map(s => ({ value: s.value, label: s.label }))}
          />

          <Textarea
            label="Additional notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information..."
            rows={3}
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleConvertToIdea}
              disabled={converting}
              className="text-[var(--idea-color)]"
            >
              {converting ? 'Converting...' : '← Back to Idea'}
            </Button>
            <Link href="/plans">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
