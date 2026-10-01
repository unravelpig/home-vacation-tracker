'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Lightbulb } from 'lucide-react';
import { Idea } from '@/lib/types';
import IdeaCard from '@/components/features/IdeaCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; ideaId: string | null }>({ open: false, ideaId: null });

  useEffect(() => {
    fetchIdeas();
  }, []);

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

  const handleDelete = async () => {
    if (!deleteModal.ideaId) return;
    
    try {
      await fetch(`/api/ideas/${deleteModal.ideaId}`, { method: 'DELETE' });
      setIdeas(ideas.filter(i => i.id !== deleteModal.ideaId));
      setDeleteModal({ open: false, ideaId: null });
    } catch (error) {
      console.error('Error deleting idea:', error);
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <div>
            <h1 
              className="page-title text-3xl font-bold text-[var(--text-primary)]" 
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Travel Ideas
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} saved
            </p>
          </div>
          <Link href="/ideas/new">
            <Button className="gap-2">
              <Plus size={20} />
              Create New Idea
            </Button>
          </Link>
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-secondary)] rounded-lg">
            <Lightbulb size={48} className="mx-auto text-[var(--idea-color)] mb-4" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              No ideas yet
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Start by adding your first travel idea
            </p>
            <Link href="/ideas/new">
              <Button className="gap-2">
                <Plus size={20} />
                Create New Idea
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map(idea => (
              <IdeaCard 
                key={idea.id} 
                idea={idea}
                onDelete={(id) => setDeleteModal({ open: true, ideaId: id })}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, ideaId: null })}
        title="Delete Idea"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setDeleteModal({ open: false, ideaId: null })}
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
          Are you sure you want to delete this idea? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
