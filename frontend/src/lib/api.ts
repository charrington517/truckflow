import type { LeadPayload, LeadResponse, WaitlistLead } from "@/types/lead";
import type { FlowEventsResult, FreeReport, ReportActivity } from "@/types/report";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.0.210:4000";

export async function generateFreeReport(city: string, foodType: string): Promise<FreeReport> {
  const response = await fetch(`${apiUrl}/api/report/free`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ city, foodType })
  });

  if (!response.ok) {
    throw new Error("TruckFlow could not generate a report right now. Please try again.");
  }

  return response.json() as Promise<FreeReport>;
}

export async function joinWaitlist(payload: LeadPayload): Promise<LeadResponse> {
  const response = await fetch(`${apiUrl}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("TruckFlow could not save your signup right now. Please try again.");
  }

  return response.json() as Promise<LeadResponse>;
}

export async function findEventOpportunities(city: string, foodType: string): Promise<FlowEventsResult> {
  const response = await fetch(`${apiUrl}/api/events/find`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ city, foodType })
  });

  if (!response.ok) {
    throw new Error("TruckFlow could not load FlowEvents right now. Please try again.");
  }

  return response.json() as Promise<FlowEventsResult>;
}

async function fetchAdminResource<T>(path: string, adminKey: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      "x-admin-key": adminKey
    },
    cache: "no-store"
  });

  if (response.status === 401) {
    throw new Error("Admin access denied. Check API key.");
  }

  if (!response.ok) {
    throw new Error("Could not load admin data.");
  }

  return response.json() as Promise<T>;
}

export function getWaitlistLeads(adminKey: string): Promise<WaitlistLead[]> {
  return fetchAdminResource<WaitlistLead[]>("/api/leads", adminKey);
}

export function getReportHistory(adminKey: string): Promise<ReportActivity[]> {
  return fetchAdminResource<ReportActivity[]>("/api/reports", adminKey);
}
