import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Lead, LeadInput, LeadResult } from "../types/lead";

const leadsFile = path.resolve(process.cwd(), "data", "leads.json");

async function ensureLeadsFile() {
  await mkdir(path.dirname(leadsFile), { recursive: true });

  try {
    await readFile(leadsFile, "utf8");
  } catch {
    await writeFile(leadsFile, "[]", "utf8");
  }
}

export async function getLeads(): Promise<Lead[]> {
  await ensureLeadsFile();
  const raw = await readFile(leadsFile, "utf8");

  try {
    const leads = JSON.parse(raw);
    return Array.isArray(leads) ? leads : [];
  } catch {
    return [];
  }
}

export async function saveLead(input: LeadInput): Promise<LeadResult> {
  const leads = await getLeads();
  const normalizedEmail = input.email.trim().toLowerCase();
  const duplicate = leads.find((lead) => lead.email.trim().toLowerCase() === normalizedEmail);

  if (duplicate) {
    return {
      success: true,
      message: "You are already on the TruckFlow early access list.",
      duplicate: true
    };
  }

  const lead: Lead = {
    name: input.name?.trim() || undefined,
    email: normalizedEmail,
    businessName: input.businessName?.trim() || undefined,
    city: input.city.trim(),
    foodType: input.foodType.trim(),
    createdAt: new Date().toISOString()
  };

  leads.push(lead);
  await writeFile(leadsFile, `${JSON.stringify(leads, null, 2)}\n`, "utf8");

  return {
    success: true,
    message: "You are on the TruckFlow early access list.",
    duplicate: false,
    lead
  };
}
