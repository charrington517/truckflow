"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertTriangle, CalendarClock, ChevronLeft, ExternalLink, Loader2, Search, Ticket } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { findEventOpportunities, getLocalDataMap } from "@/lib/api";
import type { FlowEventsResult, LocalDataMapResult } from "@/types/report";

const LocalOpportunityMap = dynamic(() => import("@/components/map/local-opportunity-map").then((mod) => mod.LocalOpportunityMap), {
  ssr: false,
  loading: () => <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">Loading local opportunity map...</div>
});

function evidenceBadgeLabel(level?: string) {
  if (level === "verified") return "Verified";
  if (level === "nearby") return "Nearby";
  if (level === "model") return "Estimate";
  return "Needs Verification";
}

function EvidenceNotes({ notes }: { notes?: string[] }) {
  if (!notes?.length) return null;
  return (
    <details className="mt-4 rounded-md border border-border bg-secondary/20 p-3 text-xs text-muted-foreground">
      <summary className="cursor-pointer font-semibold text-foreground">View evidence</summary>
      <ul className="mt-3 grid gap-1 leading-5">
        {notes.slice(0, 4).map((note) => <li key={note}>- {note}</li>)}
      </ul>
    </details>
  );
}

export default function FlowEventsPage() {
  const [city, setCity] = useState("Portland, OR");
  const [foodType, setFoodType] = useState("Tacos");
  const [result, setResult] = useState<FlowEventsResult | null>(null);
  const [mapData, setMapData] = useState<LocalDataMapResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMapData(null);

    if (!city.trim() || !foodType.trim()) {
      setError("Enter a city and food type to find opportunities.");
      return;
    }

    setLoading(true);
    try {
      const cleanCity = city.trim();
      const cleanFoodType = foodType.trim();
      const [events, localMap] = await Promise.all([
        findEventOpportunities(cleanCity, cleanFoodType),
        getLocalDataMap(cleanCity, cleanFoodType)
      ]);
      setResult(events);
      setMapData(localMap);
    } catch {
      setError("TruckFlow could not load FlowEvents right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <BrandLogo compact wordmarkClassName="hidden h-9 max-w-[150px] sm:block" markClassName="h-9 w-9" />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
        <div className="mb-8 max-w-3xl">
          <Badge variant="secondary" className="mb-3">Operator tool</Badge>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">FlowEvents</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
            Find events, pop-ups, vendor calls, and permit opportunities for your food truck.
          </p>
        </div>

        <Card className="mb-6 overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/30">
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <Ticket className="h-5 w-5 text-primary" />
              Find Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div className="space-y-2">
                <label htmlFor="flow-city" className="text-sm font-semibold">City</label>
                <Input id="flow-city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Toledo, OR" />
              </div>
              <div className="space-y-2">
                <label htmlFor="flow-food" className="text-sm font-semibold">Food type</label>
                <Input id="flow-food" value={foodType} onChange={(event) => setFoodType(event.target.value)} placeholder="Birria" />
              </div>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Find Leads
              </Button>
            </form>
            {error ? (
              <div className="mt-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-muted-foreground">
          TruckFlow recommendations are decision-support, not confirmed bookings or permits. Verify locations, permits, and event availability before operating.
        </div>

        {result ? (
          <section>
            {mapData ? <div className="mb-6"><LocalOpportunityMap data={mapData} /></div> : null}
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Opportunity list</p>
                <h2 className="mt-1 text-2xl font-black">{result.opportunities.length} leads found</h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{result.summary}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {result.opportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardContent className="p-5">
                    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <h3 className="text-xl font-black">{opportunity.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge>{opportunity.score}/100</Badge>
                          <Badge variant="outline">{opportunity.type.replaceAll("_", " ")}</Badge>
                          <Badge variant={opportunity.source === "firecrawl" ? "teal" : "secondary"}>{opportunity.source === "firecrawl" ? "Live Research" : "Model"}</Badge>
                          <Badge variant={opportunity.evidenceLevel === "verified" ? "teal" : opportunity.evidenceLevel === "nearby" ? "outline" : "secondary"}>{evidenceBadgeLabel(opportunity.evidenceLevel)}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <CalendarClock className="h-4 w-4" />
                        {opportunity.typicalLeadTime}
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{opportunity.reason}</p>
                    <div className="mt-4 rounded-md border border-border bg-secondary/30 p-3 text-sm">
                      <span className="font-semibold">Suggested action:</span> {opportunity.suggestedAction}
                    </div>
                    <EvidenceNotes notes={opportunity.evidenceNotes} />
                    {opportunity.url ? (
                      <a href={opportunity.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Open source <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
