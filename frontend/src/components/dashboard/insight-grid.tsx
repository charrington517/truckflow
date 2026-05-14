import { insights } from "@/data/demo";
import { AIInsightCard } from "@/components/cards/ai-insight-card";

export function InsightGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {insights.map((insight, index) => (
        <AIInsightCard key={insight.title} insight={insight} index={index} />
      ))}
    </section>
  );
}
