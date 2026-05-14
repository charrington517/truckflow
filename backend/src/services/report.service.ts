import { randomUUID } from "crypto";
import { generateAiNarrative } from "./aiReport.service";
import { generateEventOpportunities } from "./events.service";
import { researchLocalMarket } from "./firecrawl.service";
import { scanCompetitors } from "./competitorIntel.service";
import { getLocalDataChecks } from "./osm.service";
import { filterRecommendations } from "./recommendationQuality.service";
import { suggestNearbyOpportunities } from "./nearbyMarkets.service";
import { getReportFeedback } from "./reportFeedback.service";
import { generateOpportunityReport } from "./scoring.service";
import { getDb } from "./db.service";
import type { FreeReportRequest, ReportActivity } from "../types/truckflow";

export async function createFreeReport(
  input: FreeReportRequest,
  meta: { userAgent?: string; ip?: string } = {}
) {
  const report = generateOpportunityReport(input);
  const [research, localData] = await Promise.all([
    researchLocalMarket(input),
    getLocalDataChecks({ city: input.city })
  ]);

  report.localData = localData;
  const nearbyExpansion = suggestNearbyOpportunities({ city: input.city, foodType: input.foodType, localData });
  report.nearbyExpansion = nearbyExpansion;

  report.research = research;
  if (research.enabled) {
    report.summary = `${report.summary} ${research.summary}`;
  }

  report.flowEvents = await generateEventOpportunities({
    city: input.city,
    foodType: input.foodType,
    research,
    localData,
    nearbyExpansion,
  });

  const qualityControl = filterRecommendations({
    city: input.city,
    foodType: input.foodType,
    recommendations: report.flowEvents.opportunities,
    localData,
    nearbyExpansion,
    feedback: getReportFeedback(),
  });

  report.flowEvents.opportunities = qualityControl.recommendations;
  report.qualityControl = qualityControl;

  report.flowIntel = await scanCompetitors(input);

  report.aiNarrative = await generateAiNarrative({
    city: input.city,
    foodType: input.foodType,
    report,
    research,
  });

  const activity: ReportActivity = {
    id: randomUUID(),
    city: input.city,
    foodType: input.foodType,
    report,
    createdAt: new Date().toISOString(),
    userAgent: meta.userAgent,
    ip: meta.ip,
  };

  getDb()
    .prepare(`
      INSERT INTO reports (
        id, city, foodType, reportJson, createdAt, userAgent, ip
      ) VALUES (
        @id, @city, @foodType, @reportJson, @createdAt, @userAgent, @ip
      )
    `)
    .run({
      id: activity.id,
      city: activity.city,
      foodType: activity.foodType,
      reportJson: JSON.stringify(activity.report),
      createdAt: activity.createdAt,
      userAgent: activity.userAgent || null,
      ip: activity.ip || null,
    });

  return report;
}

type ReportRow = {
  id: string;
  city: string;
  foodType: string;
  reportJson: string;
  createdAt: string;
  userAgent: string | null;
  ip: string | null;
};

export async function getReports() {
  const rows = getDb()
    .prepare(
      "SELECT id, city, foodType, reportJson, createdAt, userAgent, ip FROM reports ORDER BY datetime(createdAt) DESC"
    )
    .all() as ReportRow[];

  return rows.flatMap((row): ReportActivity[] => {
    try {
      return [
        {
          id: row.id,
          city: row.city,
          foodType: row.foodType,
          report: JSON.parse(row.reportJson),
          createdAt: row.createdAt,
          userAgent: row.userAgent || undefined,
          ip: row.ip || undefined,
        },
      ];
    } catch {
      return [];
    }
  });
}
