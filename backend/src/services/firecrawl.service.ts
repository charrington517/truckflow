type MarketResearchSource = {
  title: string;
  url: string;
  snippet?: string;
};

export type MarketResearch = {
  enabled: boolean;
  sources: MarketResearchSource[];
  signals: {
    competitorMentions: number;
    menuMentions: string[];
    opportunityGaps: string[];
    reviewSignals: string[];
  };
  summary: string;
};

const emptySignals = {
  competitorMentions: 0,
  menuMentions: [] as string[],
  opportunityGaps: [] as string[],
  reviewSignals: [] as string[]
};

const disabledResearch: MarketResearch = {
  enabled: false,
  sources: [],
  signals: emptySignals,
  summary: "Live market research is not enabled yet. This report is using TruckFlow's local scoring model."
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function toSource(item: Record<string, unknown>): MarketResearchSource | null {
  const url = normalizeText(item.url);
  if (!url) {
    return null;
  }

  return {
    title: normalizeText(item.title) || new URL(url).hostname,
    url,
    snippet: normalizeText(item.description ?? item.snippet ?? item.markdown)
  };
}

function uniqueSources(sources: MarketResearchSource[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.url)) {
      return false;
    }

    seen.add(source.url);
    return true;
  });
}

async function searchFirecrawl(apiKey: string, query: string) {
  const response = await fetchWithTimeout("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      limit: 3
    })
  });

  if (!response.ok) {
    return [];
  }

  const json = (await response.json()) as { data?: Array<Record<string, unknown>> };
  return Array.isArray(json.data) ? json.data.map(toSource).filter(Boolean) as MarketResearchSource[] : [];
}

async function scrapeFirecrawl(apiKey: string, url: string) {
  const response = await fetchWithTimeout("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true
    })
  });

  if (!response.ok) {
    return "";
  }

  const json = (await response.json()) as { data?: { markdown?: string; title?: string; description?: string } };
  return normalizeText(json.data?.markdown ?? json.data?.description ?? json.data?.title);
}

function extractMenuMentions(text: string, foodType: string) {
  const candidates = [
    foodType,
    "tacos",
    "birria",
    "burgers",
    "bbq",
    "ramen",
    "pizza",
    "coffee",
    "seafood",
    "vegan",
    "breakfast",
    "dessert",
    "combo",
    "bowl",
    "special"
  ];

  const lower = text.toLowerCase();
  return [...new Set(candidates.filter((item) => lower.includes(item.toLowerCase())))]
    .slice(0, 8)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}

function extractOpportunityGaps(text: string, foodType: string) {
  const lower = text.toLowerCase();
  const gaps = [];

  if (!lower.includes("late night")) gaps.push("Late-night positioning looks under-served.");
  if (!lower.includes("breakfast") && ["coffee", "breakfast", "tacos", "birria"].includes(foodType.toLowerCase())) gaps.push("Breakfast crossover could stand out.");
  if (!lower.includes("family pack")) gaps.push("Family/share-pack offer is not obvious in visible menus.");
  if (!lower.includes("fusion")) gaps.push("Fusion menu angle appears lightly represented.");
  if (lower.includes("restaurant") && !lower.includes("food truck")) gaps.push("Restaurant demand exists, but mobile-truck supply appears thinner.");

  return gaps.slice(0, 4);
}

function extractReviewSignals(text: string) {
  const lower = text.toLowerCase();
  const signals = [];

  if (lower.includes("line") || lower.includes("wait")) signals.push("Speed and line management may influence conversion.");
  if (lower.includes("fresh") || lower.includes("local")) signals.push("Fresh/local positioning appears valuable.");
  if (lower.includes("spicy") || lower.includes("flavor")) signals.push("Bold flavor callouts show up in local demand language.");
  if (lower.includes("price") || lower.includes("expensive")) signals.push("Clear combo pricing could reduce purchase friction.");

  return signals.slice(0, 4);
}

export async function researchLocalMarket(input: { city: string; foodType: string }): Promise<MarketResearch> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    return disabledResearch;
  }

  try {
    const queries = [
      `${input.foodType} food truck ${input.city}`,
      `${input.foodType} restaurant menu ${input.city}`,
      `best food trucks ${input.city}`,
      `food truck events ${input.city}`,
      `street food ${input.city}`
    ];

    const found: MarketResearchSource[] = [];

    for (const query of queries) {
      if (found.length >= 5) {
        break;
      }

      const results = await searchFirecrawl(apiKey, query);
      found.push(...results);
    }

    const sources = uniqueSources(found).slice(0, 5);
    const scrapeTargets = sources.slice(0, 2);
    const scrapeTexts = await Promise.all(scrapeTargets.map((source) => scrapeFirecrawl(apiKey, source.url).catch(() => "")));
    const combinedText = [sources.map((source) => `${source.title} ${source.snippet ?? ""}`).join(" "), ...scrapeTexts].join(" ");
    const menuMentions = extractMenuMentions(combinedText, input.foodType);
    const opportunityGaps = extractOpportunityGaps(combinedText, input.foodType);
    const reviewSignals = extractReviewSignals(combinedText);
    const competitorMentions = sources.length;

    return {
      enabled: true,
      sources,
      signals: {
        competitorMentions,
        menuMentions,
        opportunityGaps,
        reviewSignals
      },
      summary:
        sources.length > 0
          ? `Live research found ${sources.length} public source${sources.length === 1 ? "" : "s"} around ${input.foodType} in ${input.city}. TruckFlow is using those signals to flag menu overlap, positioning gaps, and competitor density.`
          : `Firecrawl research ran for ${input.foodType} in ${input.city}, but no strong public sources were returned. TruckFlow is relying primarily on local scoring for this report.`
    };
  } catch {
    return {
      ...disabledResearch,
      summary: "Live market research could not complete, so this report is using TruckFlow's local scoring model."
    };
  }
}
