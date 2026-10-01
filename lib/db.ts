import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tracker.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    countries TEXT NOT NULL DEFAULT '[]',
    cities TEXT NOT NULL DEFAULT '[]',
    estimated_start_date TEXT,
    estimated_end_date TEXT,
    trip_type TEXT,
    estimated_budget REAL,
    duration_days INTEGER,
    season TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    countries TEXT NOT NULL DEFAULT '[]',
    cities TEXT NOT NULL DEFAULT '[]',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    trip_type TEXT,
    estimated_budget REAL,
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS work_vacations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person TEXT NOT NULL CHECK(person IN ('person1', 'person2')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

const addColumnIfNotExists = (table: string, column: string, type: string) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  } catch {
  }
};

addColumnIfNotExists('ideas', 'estimated_start_date', 'TEXT');
addColumnIfNotExists('ideas', 'estimated_end_date', 'TEXT');
addColumnIfNotExists('ideas', 'trip_type', 'TEXT');
addColumnIfNotExists('ideas', 'estimated_budget', 'REAL');

export default db;
