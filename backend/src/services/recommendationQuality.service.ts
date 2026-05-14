import { getDb } from "./db.service";
import type {
  FlowEventOpportunity,
  LocalDataResult,
  NearbyExpansionResult,
  RecommendationQualityResult
} from "../types/truckflow";
import type { ReportFeedback } from "../types/reportFeedback";

type QualityInput = {
  city: string;
  foodType: string;
  recommendations: FlowEventOpportunity[];
  localData?: LocalDataResult;
  nearbyExpansion?: NearbyExpansionResult;
  feedback?: ReportFeedback[];
};

type RecentReportRow = {
  reportJson: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

function countLocalData(localData: LocalDataResult | undefined, queryType: string) {
  return localData?.checks.find((check) => check.queryType === queryType)?.resultCount ?? 0;
}

function textFor(recommendation: FlowEventOpportunity) {
  return normalize([recommendation.title, recommendation.type, recommendation.reason].join(" "));
}

function nearbySupports(text: string, nearbyExpansion?: NearbyExpansionResult) {
  if (!nearbyExpansion?.usedNearbyExpansion) {
    return false;
  }

  return nearbyExpansion.recommendations.some((recommendation) =>
    [recommendation.title, recommendation.reason, recommendation.strongestOpportunityTypes.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(text)
  );
}

function getRecentTitles(city: string, foodType: string) {
  const rows = getDb()
    .prepare(
      "SELECT reportJson FROM reports WHERE lower(city) = lower(?) AND lower(foodType) = lower(?) ORDER BY datetime(createdAt) DESC LIMIT 5"
    )
    .all(city, foodType) as RecentReportRow[];

  return rows.flatMap((row) => {
    try {
      const report = JSON.parse(row.reportJson);
      return (report.flowEvents?.opportunities ?? []).map((item: FlowEventOpportunity) => item.title);
    } catch {
      return [];
    }
  });
}

function downgrade(recommendation: FlowEventOpportunity, note: string): FlowEventOpportunity {
  return {
    ...recommendation,
    score: Math.max(40, recommendation.score - 14),
    status: "Quality check - verify before acting",
    evidenceLevel: recommendation.evidenceLevel === "verified" ? "nearby" : "low_confidence",
    evidenceNotes: [...recommendation.evidenceNotes, note]
  };
}

export function filterRecommendations(input: QualityInput): RecommendationQualityResult {
  const suppressed: RecommendationQualityResult["suppressed"] = [];
  const qualityNotes: string[] = [];
  const recentTitles = getRecentTitles(input.city, input.foodType).map(normalize);
  const hasSeriousFeedback = (input.feedback ?? []).some((item) =>
    ["inaccurate_location", "fake_specific_claim"].includes(item.issueType ?? "")
  );

  const breweryCount = countLocalData(input.localData, "brewery");
  const collegeCount = countLocalData(input.localData, "college");
  const tourismCount = countLocalData(input.localData, "tourism");

  qualityNotes.push(`OpenStreetMap brewery/bar/pub signals: ${breweryCount}.`);
  qualityNotes.push(`OpenStreetMap college signals: ${collegeCount}.`);
  qualityNotes.push(`OpenStreetMap tourism/waterfront signals: ${tourismCount}.`);

  if (hasSeriousFeedback) {
    qualityNotes.push("Recent admin feedback includes accuracy concerns, so TruckFlow downgraded confidence on sensitive recommendations.");
  }

  const processed = input.recommendations.map((recommendation) => {
    const text = textFor(recommendation);
    const title = normalize(recommendation.title);
    const repeated = recentTitles.filter((recentTitle) => recentTitle === title).length >= 3;

    let next = recommendation;
    let suppressReason = "";

    if (text.includes("brewery") && breweryCount === 0 && !nearbySupports("brewery", input.nearbyExpansion)) {
      suppressReason = "No brewery/bar/pub signals were found nearby, so TruckFlow removed this low-confidence brewery recommendation.";
    }

    if (text.includes("college") && collegeCount === 0 && !nearbySupports("college", input.nearbyExpansion)) {
      suppressReason = "No college/university signals were found nearby, so TruckFlow removed this low-confidence college recommendation.";
    }

    if ((text.includes("tourist") || text.includes("tourism") || text.includes("waterfront")) && tourismCount === 0 && !nearbySupports("tourist", input.nearbyExpansion)) {
      suppressReason = "No tourism/waterfront signals were found nearby, so TruckFlow removed this low-confidence visitor-market recommendation.";
    }

    if (suppressReason) {
      return { recommendation, suppressReason };
    }

    if (repeated) {
      next = downgrade(next, "This recommendation title appeared repeatedly in recent reports for this market, so TruckFlow lowered its priority.");
      qualityNotes.push(`Repeated recommendation downgraded: ${recommendation.title}.`);
    }

    if (hasSeriousFeedback && next.evidenceLevel !== "verified") {
      next = downgrade(next, "Admin feedback has flagged similar accuracy issues, so this recommendation needs extra verification.");
    }

    return { recommendation: next, suppressReason: "" };
  });

  let recommendations = processed.filter((item) => !item.suppressReason).map((item) => item.recommendation);

  for (const item of processed.filter((entry) => entry.suppressReason)) {
    suppressed.push({ title: item.recommendation.title, reason: item.suppressReason });
    if (recommendations.length < 3) {
      recommendations.push(downgrade(item.recommendation, item.suppressReason));
      qualityNotes.push(`Low-confidence recommendation downgraded instead of removed to preserve useful alternatives: ${item.recommendation.title}.`);
    } else {
      qualityNotes.push(`Suppressed low-confidence recommendation: ${item.recommendation.title}.`);
    }
  }

  recommendations = recommendations.sort((a, b) => b.score - a.score).slice(0, 5);

  if (suppressed.length === 0 && !qualityNotes.some((note) => note.includes("downgraded"))) {
    qualityNotes.push("No high-risk recommendations were removed by quality controls.");
  }

  return {
    applied: true,
    recommendations,
    suppressed,
    qualityNotes
  };
}
