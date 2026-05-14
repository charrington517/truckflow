"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertTriangle, ChevronLeft, Loader2, Radar, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { scanFlowIntel } from "@/lib/api";
import type { FlowIntelResult } from "@/types/report";

const CompetitorMap = dynamic(() => import("@/components/map/competitor-map").then((mod) => mod.CompetitorMap), {
  ssr: false,
  loading: () => <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">Loading competitor map...</div>
});

export default function FlowIntelPage() {
  const [city, setCity] = useState("Newport, OR");
  const [foodType, setFoodType] = useState("Birria");
  const [result, setResult] = useState<FlowIntelResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!city.trim() || !foodType.trim()) {
      setError("Enter a city and food type to scan competitor signals.");
      return;
    }
    setLoading(true);
    try {
      setResult(await scanFlowIntel(city.trim(), foodType.trim()));
    } catch {
      setError("TruckFlow could not scan FlowIntel right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm"><Link href="/"><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Back</span></Link></Button>
            <BrandLogo compact wordmarkClassName="hidden h-9 max-w-[150px] sm:block" markClassName="h-9 w-9" />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
        <div className="mb-8 max-w-3xl">
          <Badge variant="secondary" className="mb-3">Competitor intelligence</Badge>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">FlowIntel</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
            Find nearby food trucks, stationary vendors, and competitor overlap before you choose a spot.
          </p>
        </div>

        <Card className="mb-6 overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/30">
            <CardTitle className="flex items-center gap-2 text-xl font-black"><Radar className="h-5 w-5 text-primary" />Scan Competitors</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div className="space-y-2"><label htmlFor="intel-city" className="text-sm font-semibold">City</label><Input id="intel-city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Newport, OR" /></div>
              <div className="space-y-2"><label htmlFor="intel-food" className="text-sm font-semibold">Food type</label><Input id="intel-food" value={foodType} onChange={(event) => setFoodType(event.target.value)} placeholder="Birria" /></div>
              <Button type="submit" size="lg" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Scan</Button>
            </form>
            {error ? <div className="mt-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div> : null}
          </CardContent>
        </Card>

        {result ? (
          <section className="grid gap-6">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-muted-foreground">
              FlowIntel uses public and manual data. No strong public competitor signals found does not mean no competitors exist.
            </div>
            <CompetitorMap competitors={result.competitors} city={result.city} />
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Scan result</p><h2 className="mt-1 text-2xl font-black">{result.competitors.length} competitor signals</h2></div>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{result.summary}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {result.competitors.map((competitor) => (
                    <article key={competitor.id} className="rounded-md border border-border bg-background/60 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div><h3 className="font-black">{competitor.name}</h3><p className="mt-1 text-sm text-muted-foreground">{competitor.usualLocation || "Location needs verification"}</p></div>
                        <Badge>{competitor.overlapScore ?? 0}/100</Badge>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant="outline">{competitor.stationary ? "Stationary" : "Mobile/unknown"}</Badge>
                        <Badge variant="secondary">{competitor.confidence || "unknown confidence"}</Badge>
                        <Badge variant="outline">{competitor.source || "unknown source"}</Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{competitor.notes || "Public signal needs manual verification."}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Last checked: {competitor.lastVerifiedAt ? new Date(competitor.lastVerifiedAt).toLocaleDateString() : "Not recorded"}</p>
                      {competitor.url ? <a className="mt-3 inline-flex text-sm font-semibold text-primary" href={competitor.url} target="_blank" rel="noreferrer">Open source</a> : null}
                    </article>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card><CardHeader><CardTitle>Opportunity Gaps</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm text-muted-foreground">{result.opportunityGaps.length ? result.opportunityGaps.map((gap) => <p key={gap}>{gap}</p>) : <p>No obvious gaps yet.</p>}</CardContent></Card>
              <Card><CardHeader><CardTitle>Warnings</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm text-muted-foreground">{result.warnings.map((warning) => <p key={warning}>{warning}</p>)}</CardContent></Card>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
