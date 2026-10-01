import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface PlanRow {
  id: number;
  idea_id: number | null;
  title: string;
  description: string | null;
  countries: string;
  cities: string;
  start_date: string;
  end_date: string;
  trip_type: string | null;
  estimated_budget: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function parsePlan(row: PlanRow) {
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
    const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as PlanRow | undefined;
    
    if (!row) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    return NextResponse.json(parsePlan(row));
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const existing = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as PlanRow | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    const stmt = db.prepare(`
      UPDATE plans SET 
        idea_id = ?, title = ?, description = ?, countries = ?, cities = ?,
        start_date = ?, end_date = ?, trip_type = ?, estimated_budget = ?,
        status = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    stmt.run(
      body.idea_id ?? existing.idea_id,
      body.title ?? existing.title,
      body.description ?? existing.description,
      JSON.stringify(body.countries ?? JSON.parse(existing.countries || '[]')),
      JSON.stringify(body.cities ?? JSON.parse(existing.cities || '[]')),
      body.start_date ?? existing.start_date,
      body.end_date ?? existing.end_date,
      body.trip_type ?? existing.trip_type,
      body.estimated_budget ?? existing.estimated_budget,
      body.status ?? existing.status,
      body.notes ?? existing.notes,
      id
    );
    
    const updated = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as PlanRow;
    return NextResponse.json(parsePlan(updated));
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
    
    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    db.prepare('DELETE FROM plans WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
