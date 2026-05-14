import OpenAI from "openai";

export type AiNarrative = {
  enabled: boolean;
  executiveSummary?: string;
  recommendations?: string[];
  risks?: string[];
  nextSteps?: string[];
};

const disabledNarrative: AiNarrative = {
  enabled: false
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function cleanList(value: unknown, limit: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(cleanString).filter(Boolean).slice(0, limit);
}

function parseOutputText(response: unknown) {
  const direct = (response as { output_text?: unknown }).output_text;
  if (typeof direct === "string" && direct.trim()) {
    return direct;
  }

  const output = (response as { output?: Array<{ content?: Array<{ text?: string; type?: string }> }> }).output;
  const text = output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? "")
    .join("\n")
    .trim();

  return text ?? "";
}

export async function generateAiNarrative(input: {
  city: string;
  foodType: string;
  report: unknown;
  research?: unknown;
}): Promise<AiNarrative> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return disabledNarrative;
  }

  try {
    const client = new OpenAI({
      apiKey,
      maxRetries: 0,
      timeout: 15000
    });

    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
    const response = await client.responses.create({
      model,
      store: false,
      temperature: 0.35,
      max_output_tokens: 900,
      instructions:
        "You advise food truck operators. Base conclusions only on the supplied scoring and research data. Say when data is limited. Do not invent permits, events, competitors, prices, revenue guarantees, or fake statistics. Avoid guaranteed/definitely/you will make. Keep advice practical, plain-English, and actionable.",
      input: JSON.stringify({
        city: input.city,
        foodType: input.foodType,
        report: input.report,
        research: input.research ?? null
      }),
      text: {
        format: {
          type: "json_schema",
          name: "truckflow_strategy_brief",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              executiveSummary: {
                type: "string",
                description: "2-4 practical sentences for the food truck operator."
              },
              recommendations: {
                type: "array",
                minItems: 3,
                maxItems: 5,
                items: { type: "string" }
              },
              risks: {
                type: "array",
                minItems: 2,
                maxItems: 4,
                items: { type: "string" }
              },
              nextSteps: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string" }
              }
            },
            required: ["executiveSummary", "recommendations", "risks", "nextSteps"]
          }
        }
      }
    } as never);

    const rawText = parseOutputText(response);
    if (!rawText) {
      return disabledNarrative;
    }

    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const executiveSummary = cleanString(parsed.executiveSummary);
    const recommendations = cleanList(parsed.recommendations, 5);
    const risks = cleanList(parsed.risks, 4);
    const nextSteps = cleanList(parsed.nextSteps, 3);

    if (!executiveSummary || recommendations.length < 3 || risks.length < 2 || nextSteps.length < 3) {
      return disabledNarrative;
    }

    return {
      enabled: true,
      executiveSummary,
      recommendations,
      risks,
      nextSteps
    };
  } catch {
    return disabledNarrative;
  }
}
