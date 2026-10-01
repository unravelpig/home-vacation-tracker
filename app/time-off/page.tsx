'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, User } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { WorkVacation, WorkPerson } from '@/lib/types';
import { formatDateRange } from '@/lib/utils';
import { PEOPLE, personLabel } from '@/lib/people';

export default function TimeOffPage() {
  const [activeTab, setActiveTab] = useState<WorkPerson>('person1');
  const [entries, setEntries] = useState<WorkVacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ start_date: '', end_date: '', notes: '' });

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/work-vacations');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleAdd = async () => {
    if (!form.start_date || !form.end_date) return;
    setSaving(true);
    try {
      const res = await fetch('/api/work-vacations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person: activeTab,
          start_date: form.start_date,
          end_date: form.end_date,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        setForm({ start_date: '', end_date: '', notes: '' });
        fetchEntries();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this time off?')) return;
    try {
      const res = await fetch(`/api/work-vacations?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to delete');
        return;
      }
      fetchEntries();
    } catch (error) {
      console.error('Error deleting vacation:', error);
      alert('Failed to delete time off');
    }
  };

  const person1Entries = entries.filter(e => e.person === 'person1');
  const person2Entries = entries.filter(e => e.person === 'person2');
  const currentEntries = activeTab === 'person1' ? person1Entries : person2Entries;

  // Days used by each person for the summary
  const calcDays = (list: WorkVacation[]) =>
    list.reduce((sum, e) => {
      const diff = new Date(e.end_date).getTime() - new Date(e.start_date).getTime();
      return sum + Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }, 0);

  const person1Days = calcDays(person1Entries);
  const person2Days = calcDays(person2Entries);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1
            className="page-title text-3xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Time Off
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Job vacation days
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-[var(--border)] p-4 text-center shadow-sm">
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: '#E67E22' }}></div>
            <p className="text-2xl font-bold" style={{ color: '#E67E22' }}>{person1Days}</p>
            <p className="text-sm text-[var(--text-secondary)]">{PEOPLE.person1.label} days</p>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-4 text-center shadow-sm">
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: '#16A085' }}></div>
            <p className="text-2xl font-bold" style={{ color: '#16A085' }}>{person2Days}</p>
            <p className="text-sm text-[var(--text-secondary)]">{PEOPLE.person2.label} days</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 bg-[var(--bg-secondary)] p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('person1')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'person1'
                ? 'bg-white text-[#E67E22] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User size={16} /> {PEOPLE.person1.label}
          </button>
          <button
            onClick={() => setActiveTab('person2')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'person2'
                ? 'bg-white text-[#16A085] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User size={16} /> {PEOPLE.person2.label}
          </button>
        </div>

        {/* Add form */}
        <div className="bg-white rounded-lg border border-[var(--border)] p-4 mb-6 shadow-sm">
          <h3
            className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Calendar size={16} />
            Add time off — {personLabel(activeTab)}
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              label="From"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
            />
            <Input
              label="To"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <Input
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Easter break not included..."
            />
          </div>
          <Button onClick={handleAdd} disabled={saving || !form.start_date || !form.end_date} className="w-full">
            <Plus size={16} />
            {saving ? 'Saving...' : 'Add time off'}
          </Button>
        </div>

        {/* Entries list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent"></div>
          </div>
        ) : currentEntries.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <Calendar size={32} className="mx-auto mb-2 opacity-30" />
            <p>No time off added for {personLabel(activeTab)}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentEntries.map(entry => (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-[var(--border)] p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">
                    {formatDateRange(entry.start_date, entry.end_date)}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{entry.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(String(entry.id))}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-4"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
