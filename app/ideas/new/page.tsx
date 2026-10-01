'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import CountrySelector from '@/components/features/CountrySelector';
import CitySelector from '@/components/features/CitySelector';

export default function NewIdeaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    countries: [] as string[],
    cities: [] as string[],
    duration_days: '',
    season: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.countries.length === 0) newErrors.countries = 'Select at least one country';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
        }),
      });
      
      if (res.ok) {
        router.push('/ideas');
      } else {
        console.error('Error response:', await res.text());
      }
    } catch (error) {
      console.error('Error creating idea:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/ideas" 
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-2 inline-block"
          >
            ← Back to Ideas
          </Link>
          <h1 
            className="page-title text-3xl font-bold text-[var(--text-primary)]" 
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            New Idea
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Trip title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Trip to Japan"
            error={errors.title}
          />

          <Textarea
            label="Short description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your travel idea..."
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

          <CitySelector
            label="Specific cities"
            selectedCountries={formData.countries}
            selectedCities={formData.cities}
            onChange={(cities) => setFormData({ ...formData, cities })}
          />

          <Input
            label="Estimated trip length (days)"
            type="number"
            value={formData.duration_days}
            onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
            placeholder="e.g. 10"
          />

          <Input
            label="Time of year"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            placeholder="e.g. Summer, Spring 2025, July..."
          />

          <Textarea
            label="Additional notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information..."
            rows={3}
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Idea'}
            </Button>
            <Link href="/ideas">
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
