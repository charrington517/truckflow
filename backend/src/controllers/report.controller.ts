import type { Request, Response } from "express";
import { createFreeReport, getReports } from "../services/report.service";
import type { FreeReportRequest } from "../types/truckflow";

export async function createFreeReportController(req: Request, res: Response) {
  const report = await createFreeReport(req.body as FreeReportRequest, {
    userAgent: req.header("user-agent") ?? undefined,
    ip: req.ip
  });

  res.json(report);
}

export async function getReportsController(_req: Request, res: Response) {
  const reports = await getReports();
  res.json(reports);
}
