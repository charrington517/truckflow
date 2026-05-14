import { randomUUID } from "node:crypto";
import type { Lead, LeadInput, LeadResult } from "../types/lead";
import { getDb } from "./db.service";

type LeadRow = {
  id: string;
  name: string | null;
  email: string;
  businessName: string | null;
  city: string;
  foodType: string;
  createdAt: string;
};

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name || undefined,
    email: row.email,
    businessName: row.businessName || undefined,
    city: row.city,
    foodType: row.foodType,
    createdAt: row.createdAt,
  };
}

export async function getLeads(): Promise<Lead[]> {
  const rows = getDb()
    .prepare("SELECT id, name, email, businessName, city, foodType, createdAt FROM leads ORDER BY datetime(createdAt) DESC")
    .all() as LeadRow[];

  return rows.map(rowToLead);
}

export async function saveLead(input: LeadInput): Promise<LeadResult> {
  const email = input.email.trim().toLowerCase();
  const existing = getDb()
    .prepare("SELECT id, name, email, businessName, city, foodType, createdAt FROM leads WHERE email = ?")
    .get(email) as LeadRow | undefined;

  if (existing) {
    return {
      success: true,
      message: "You are already on the TruckFlow early access list.",
      duplicate: true,
      lead: rowToLead(existing),
    };
  }

  const lead: Lead = {
    id: randomUUID(),
    name: input.name,
    email,
    businessName: input.businessName,
    city: input.city,
    foodType: input.foodType,
    createdAt: new Date().toISOString(),
  };

  getDb()
    .prepare(`
      INSERT INTO leads (
        id, name, email, businessName, city, foodType, createdAt
      ) VALUES (
        @id, @name, @email, @businessName, @city, @foodType, @createdAt
      )
    `)
    .run({
      id: lead.id,
      name: lead.name || null,
      email: lead.email,
      businessName: lead.businessName || null,
      city: lead.city,
      foodType: lead.foodType,
      createdAt: lead.createdAt,
    });

  return {
    success: true,
    message: "You are on the TruckFlow early access list.",
    duplicate: false,
    lead,
  };
}
