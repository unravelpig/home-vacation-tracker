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

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM ideas ORDER BY created_at DESC').all() as IdeaRow[];
    return NextResponse.json(rows.map(parseIdea));
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.countries || body.countries.length === 0) {
      return NextResponse.json({ error: 'Title and countries are required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO ideas (title, description, countries, cities, estimated_start_date, estimated_end_date, trip_type, estimated_budget, duration_days, season, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.title,
      body.description || null,
      JSON.stringify(body.countries || []),
      JSON.stringify(body.cities || []),
      body.estimated_start_date || null,
      body.estimated_end_date || null,
      body.trip_type || null,
      body.estimated_budget || null,
      body.duration_days || null,
      body.season || null,
      body.notes || null
    );

    const newIdea = {
      id: String(result.lastInsertRowid),
      title: body.title,
      description: body.description || null,
      countries: body.countries || [],
      cities: body.cities || [],
      estimated_start_date: body.estimated_start_date || null,
      estimated_end_date: body.estimated_end_date || null,
      trip_type: body.trip_type || null,
      estimated_budget: body.estimated_budget || null,
      duration_days: body.duration_days || null,
      season: body.season || null,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(newIdea, { status: 201 });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}
