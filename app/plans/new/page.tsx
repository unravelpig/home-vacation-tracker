'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import CountrySelector from '@/components/features/CountrySelector';
import { Idea, PlanStatus, TripType } from '@/lib/types';
import { PLAN_STATUSES, TRIP_TYPES } from '@/lib/utils';

export default function NewPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    idea_id: '',
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
    fetchIdeas();
  }, []);

  // Auto-select idea if coming from IdeaCard link
  useEffect(() => {
    if (!loading && ideas.length > 0) {
      const preselected = searchParams.get('idea');
      if (preselected) {
        handleIdeaSelect(preselected);
      }
    }
  }, [loading, ideas]);

  const fetchIdeas = async () => {
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIdeaSelect = (ideaId: string) => {
    if (!ideaId) return;
    // API returns id as number; select option values are strings — normalize to string
    const idea = ideas.find(i => String(i.id) === ideaId);
    if (idea) {
      setFormData(prev => ({
        ...prev,
        idea_id: ideaId,
        title: idea.title,
        description: idea.description || '',
        countries: idea.countries,
        cities: idea.cities,
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.idea_id) newErrors.idea_id = 'Select an idea';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.countries.length === 0) newErrors.countries = 'Select at least one country';
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es requerida';
    if (!formData.end_date) newErrors.end_date = 'La fecha de fin es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const savePlan = async (status: PlanStatus = 'planned') => {
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
          estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : null,
          trip_type: formData.trip_type || null,
        }),
      });

      if (res.ok) {
        router.push('/plans');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
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
            New Plan
          </h1>
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-8 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-[var(--text-secondary)] mb-4">
              You need at least one idea before you can turn it into a plan.
            </p>
            <Link href="/ideas/new">
              <Button>Create First Idea</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Idea selector */}
            <Select
              label="Original idea *"
              value={formData.idea_id}
              onChange={(e) => handleIdeaSelect(e.target.value)}
              options={[
                { value: '', label: '— Select an idea —' },
                ...ideas.map(idea => ({ value: idea.id, label: idea.title }))
              ]}
              error={errors.idea_id}
            />

            {formData.idea_id && (
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)] mb-1">Converting idea:</p>
                <p className="font-medium text-[var(--idea-color)]">{ideas.find(i => String(i.id) === formData.idea_id)?.title}</p>
              </div>
            )}

            <Input
              label="Plan title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Trip to Japan 2025"
              error={errors.title}
            />

            <Textarea
              label="Detailed description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the plan details..."
              rows={3}
            />

            <div>
              <CountrySelector
                label="Destination countries *"
                selectedCountries={formData.countries}
                onChange={(countries) => setFormData(prev => ({ ...prev, countries }))}
              />
              {errors.countries && (
                <p className="mt-1 text-sm text-red-600">{errors.countries}</p>
              )}
            </div>

            <Textarea
              label="Specific cities"
              value={formData.cities.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                cities: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
              }))}
              placeholder="e.g. Tokyo, Kyoto, Osaka"
              rows={2}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start date *"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                error={errors.start_date}
              />
              <Input
                label="End date *"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                error={errors.end_date}
              />
            </div>

            <Select
              label="Trip type"
              value={formData.trip_type}
              onChange={(e) => setFormData(prev => ({ ...prev, trip_type: e.target.value as TripType }))}
              options={[{ value: '', label: 'Select a type' }, ...TRIP_TYPES]}
            />

            <Input
              label="Estimated budget (€)"
              type="number"
              value={formData.estimated_budget}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_budget: e.target.value }))}
              placeholder="e.g. 3000"
            />

            <Select
              label="Plan status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PlanStatus }))}
              options={PLAN_STATUSES.map(s => ({ value: s.value, label: s.label }))}
            />

            <Textarea
              label="Additional notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information..."
              rows={3}
            />

            {/* Primary action */}
            <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
              <Button
                onClick={() => savePlan('planned')}
                disabled={saving}
                className="gap-2"
              >
                <CheckCircle size={18} />
                {saving ? 'Saving...' : 'Confirmar Plan'}
              </Button>
              <Link href="/plans">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
