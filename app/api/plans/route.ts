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

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM plans ORDER BY created_at DESC').all() as PlanRow[];
    return NextResponse.json(rows.map(parsePlan));
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.countries || body.countries.length === 0 || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'Title, countries, start_date and end_date are required' }, { status: 400 });
    }

    const ideaId = body.idea_id ? Number(body.idea_id) : null;

    const stmt = db.prepare(`
      INSERT INTO plans (idea_id, title, description, countries, cities, start_date, end_date, trip_type, estimated_budget, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      ideaId,
      body.title,
      body.description || null,
      JSON.stringify(body.countries || []),
      JSON.stringify(body.cities || []),
      body.start_date,
      body.end_date,
      body.trip_type || null,
      body.estimated_budget || null,
      body.status || 'planned',
      body.notes || null
    );

    // If this plan came from an idea, delete the original idea
    if (ideaId !== null) {
      db.prepare('DELETE FROM ideas WHERE id = ?').run(ideaId);
    }

    const newPlan = {
      id: String(result.lastInsertRowid),
      idea_id: ideaId,
      title: body.title,
      description: body.description || null,
      countries: body.countries || [],
      cities: body.cities || [],
      start_date: body.start_date,
      end_date: body.end_date,
      trip_type: body.trip_type || null,
      estimated_budget: body.estimated_budget || null,
      status: body.status || 'planned',
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
