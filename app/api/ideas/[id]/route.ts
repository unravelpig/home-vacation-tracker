import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface IdeaRow {
  id: number;
  title: string;
  description: string | null;
  countries: string;
  cities: string;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  trip_type: string | null;
  estimated_budget: number | null;
  duration_days: number | null;
  season: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function parseIdea(row: IdeaRow) {
  return {
    ...row,
    countries: JSON.parse(row.countries || '[]'),
    cities: JSON.parse(row.cities || '[]'),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id) as IdeaRow | undefined;
    
    if (!row) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    return NextResponse.json(parseIdea(row));
  } catch (error) {
    console.error('Error fetching idea:', error);
    return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id) as IdeaRow | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    const stmt = db.prepare(`
      UPDATE ideas SET 
        title = ?, description = ?, countries = ?, cities = ?,
        estimated_start_date = ?, estimated_end_date = ?, trip_type = ?, 
        estimated_budget = ?, duration_days = ?, season = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    stmt.run(
      body.title ?? existing.title,
      body.description ?? existing.description,
      JSON.stringify(body.countries ?? JSON.parse(existing.countries || '[]')),
      JSON.stringify(body.cities ?? JSON.parse(existing.cities || '[]')),
      body.estimated_start_date ?? existing.estimated_start_date,
      body.estimated_end_date ?? existing.estimated_end_date,
      body.trip_type ?? existing.trip_type,
      body.estimated_budget ?? existing.estimated_budget,
      body.duration_days ?? existing.duration_days,
      body.season ?? existing.season,
      body.notes ?? existing.notes,
      id
    );
    
    const updated = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id) as IdeaRow;
    return NextResponse.json(parseIdea(updated));
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id);
    
    if (!existing) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    db.prepare('DELETE FROM ideas WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}
