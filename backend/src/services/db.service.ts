import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

let db: Database.Database | null = null;

const dataDir = path.resolve(process.cwd(), "data");
const dbPath = path.join(dataDir, "truckflow.db");

export function getDb() {
  if (db) {
    return db;
  }

  mkdirSync(dataDir, { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      businessName TEXT,
      city TEXT NOT NULL,
      foodType TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      city TEXT NOT NULL,
      foodType TEXT NOT NULL,
      reportJson TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      userAgent TEXT,
      ip TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(createdAt);
    CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(createdAt);
  `);

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
