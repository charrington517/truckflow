import type { Request, Response } from "express";
import { getLeads, saveLead } from "../services/leads.service";
import type { LeadInput } from "../types/lead";

export async function createLeadController(req: Request, res: Response) {
  const result = await saveLead(req.body as LeadInput);

  res.json({
    success: result.success,
    message: result.message
  });
}

export async function getLeadsController(_req: Request, res: Response) {
  // TODO: protect this endpoint before public launch.
  const leads = await getLeads();
  res.json(leads);
}
