import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { closeDb, getDb } from "../services/db.service";

type JsonLead = {
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
  city?: string;
  foodType?: string;
  createdAt?: string;
};

type JsonReport = {
  id?: string;
  city?: string;
  foodType?: string;
  report?: unknown;
  createdAt?: string;
  userAgent?: string;
  ip?: string;
};

function readJsonArray<T>(filePath: string): T[] {
  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Could not parse ${filePath}:`, error);
    return [];
  }
}

const db = getDb();
const dataDir = path.resolve(process.cwd(), "data");

const leads = readJsonArray<JsonLead>(path.join(dataDir, "leads.json"));
const reports = readJsonArray<JsonReport>(path.join(dataDir, "reports.json"));

const insertLead = db.prepare(`
  INSERT OR IGNORE INTO leads (
    id, name, email, businessName, city, foodType, createdAt
  ) VALUES (
    @id, @name, @email, @businessName, @city, @foodType, @createdAt
  )
`);

const insertReport = db.prepare(`
  INSERT OR IGNORE INTO reports (
    id, city, foodType, reportJson, createdAt, userAgent, ip
  ) VALUES (
    @id, @city, @foodType, @reportJson, @createdAt, @userAgent, @ip
  )
`);

let importedLeads = 0;
let skippedLeads = 0;
let importedReports = 0;
let skippedReports = 0;

const importTransaction = db.transaction(() => {
  for (const lead of leads) {
    if (!lead.email || !lead.city || !lead.foodType) {
      skippedLeads += 1;
      continue;
    }

    const result = insertLead.run({
      id: lead.id || randomUUID(),
      name: lead.name || null,
      email: lead.email.trim().toLowerCase(),
      businessName: lead.businessName || null,
      city: lead.city,
      foodType: lead.foodType,
      createdAt: lead.createdAt || new Date().toISOString(),
    });

    if (result.changes > 0) {
      importedLeads += 1;
    } else {
      skippedLeads += 1;
    }
  }

  for (const report of reports) {
    if (!report.city || !report.foodType || !report.report || !report.createdAt) {
      skippedReports += 1;
      continue;
    }

    const result = insertReport.run({
      id: report.id || randomUUID(),
      city: report.city,
      foodType: report.foodType,
      reportJson: JSON.stringify(report.report),
      createdAt: report.createdAt,
      userAgent: report.userAgent || null,
      ip: report.ip || null,
    });

    if (result.changes > 0) {
      importedReports += 1;
    } else {
      skippedReports += 1;
    }
  }
});

importTransaction();
closeDb();

console.log(`Leads imported: ${importedLeads}`);
console.log(`Leads skipped: ${skippedLeads}`);
console.log(`Reports imported: ${importedReports}`);
console.log(`Reports skipped: ${skippedReports}`);
