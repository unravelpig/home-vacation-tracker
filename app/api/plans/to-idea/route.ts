import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface PlanRow {
  id: number;
  title: string;
  description: string | null;
  countries: string;
  cities: string;
  estimated_budget: number | null;
  notes: string | null;
  created_at: string;
}

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const planIdNum = Number(planId);
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planIdNum) as PlanRow | undefined;
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Insert new idea with only the shared fields
    // Shared: title, description, countries, cities, notes
    // Plan-only (not in Idea): idea_id, start_date, end_date, trip_type, estimated_budget, status
    // Idea-only (not in Plan): duration_days, season
    const ideaStmt = db.prepare(`
      INSERT INTO ideas (title, description, countries, cities, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    const ideaResult = ideaStmt.run(
      plan.title,
      plan.description,
      JSON.stringify(JSON.parse(plan.countries || '[]')),
      JSON.stringify(JSON.parse(plan.cities || '[]')),
      plan.notes
    );

    // Delete the plan after successful conversion
    db.prepare('DELETE FROM plans WHERE id = ?').run(planIdNum);

    return NextResponse.json({
      id: String(ideaResult.lastInsertRowid),
      title: plan.title,
      description: plan.description,
      countries: JSON.parse(plan.countries || '[]'),
      cities: JSON.parse(plan.cities || '[]'),
      notes: plan.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error converting plan to idea:', error);
    return NextResponse.json({ error: 'Failed to convert plan to idea' }, { status: 500 });
  }
}
