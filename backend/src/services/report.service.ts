import { randomUUID } from "crypto";
import { generateAiNarrative } from "./aiReport.service";
import { generateEventOpportunities } from "./events.service";
import { promises as fs } from "fs";
import path from "path";
import { researchLocalMarket } from "./firecrawl.service";
import { generateOpportunityReport } from "./scoring.service";
import type { FreeReportRequest, ReportActivity } from "../types/truckflow";

const reportsFile = path.resolve(process.cwd(), "data", "reports.json");

async function ensureReportsFile() {
  await fs.mkdir(path.dirname(reportsFile), { recursive: true });

  try {
    await fs.access(reportsFile);
  } catch {
    await fs.writeFile(reportsFile, "[]\n", "utf8");
  }
}

async function readReports() {
  await ensureReportsFile();
  const raw = await fs.readFile(reportsFile, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ReportActivity[]) : [];
  } catch {
    return [];
  }
}

async function writeReports(reports: ReportActivity[]) {
  await ensureReportsFile();
  await fs.writeFile(reportsFile, `${JSON.stringify(reports, null, 2)}\n`, "utf8");
}

export async function createFreeReport(
  input: FreeReportRequest,
  meta: { userAgent?: string; ip?: string } = {}
) {
  const report = generateOpportunityReport(input);
  const research = await researchLocalMarket(input);

  report.research = research;
  if (research.enabled) {
    report.summary = `${report.summary} ${research.summary}`;
  }

  report.flowEvents = await generateEventOpportunities({
    city: input.city,
    foodType: input.foodType,
    research
  });

  report.aiNarrative = await generateAiNarrative({
    city: input.city,
    foodType: input.foodType,
    report,
    research
  });

  const reports = await readReports();

  reports.push({
    id: randomUUID(),
    city: input.city,
    foodType: input.foodType,
    report,
    createdAt: new Date().toISOString(),
    userAgent: meta.userAgent,
    ip: meta.ip
  });

  await writeReports(reports);

  return report;
}

export async function getReports() {
  const reports = await readReports();
  return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
