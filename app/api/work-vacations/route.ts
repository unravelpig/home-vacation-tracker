import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface WorkVacationRow {
  id: number;
  person: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM work_vacations ORDER BY start_date ASC').all() as WorkVacationRow[];
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching work vacations:', error);
    return NextResponse.json({ error: 'Failed to fetch work vacations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.person || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'person, start_date and end_date are required' }, { status: 400 });
    }

    if (!['person1', 'person2'].includes(body.person)) {
      return NextResponse.json({ error: 'person must be person1 or person2' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO work_vacations (person, start_date, end_date, notes)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.person,
      body.start_date,
      body.end_date,
      body.notes || null
    );

    const newEntry: WorkVacationRow = {
      id: Number(result.lastInsertRowid),
      person: body.person,
      start_date: body.start_date,
      end_date: body.end_date,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating work vacation:', error);
    return NextResponse.json({ error: 'Failed to create work vacation' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM work_vacations WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work vacation:', error);
    return NextResponse.json({ error: 'Failed to delete work vacation' }, { status: 500 });
  }
}
