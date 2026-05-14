"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Brain, CalendarClock, ChefHat, CheckCircle2, ExternalLink, Loader2, LockKeyhole, MapPinned, Radar, Ticket, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateFreeReport, joinWaitlist } from "@/lib/api";
import type { FreeReport } from "@/types/report";

type FormErrors = {
  city?: string;
  foodType?: string;
  form?: string;
};

type LeadErrors = {
  email?: string;
  city?: string;
  foodType?: string;
  form?: string;
};

function validateReport(city: string, foodType: string) {
  const errors: FormErrors = {};

  if (!city.trim()) {
    errors.city = "Enter a city so TruckFlow can scan the market.";
  }

  if (!foodType.trim()) {
    errors.foodType = "Enter a food type so the report can tailor recommendations.";
  }

  return errors;
}

function validateLead(email: string, city: string, foodType: string) {
  const errors: LeadErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
    errors.email = "Email is required to save your report.";
  } else if (!emailPattern.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!city.trim()) {
    errors.city = "City is required.";
  }

  if (!foodType.trim()) {
    errors.foodType = "Food type is required.";
  }

  return errors;
}

export function FreeReportGenerator() {
  const [city, setCity] = useState("Portland, OR");
  const [foodType, setFoodType] = useState("Tacos");
  const [errors, setErrors] = useState<FormErrors>({});
  const [report, setReport] = useState<FreeReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateReport(city, foodType);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    setReport(null);

    try {
      const nextReport = await generateFreeReport(city.trim(), foodType.trim());
      setReport(nextReport);
    } catch {
      setErrors({
        form: "TruckFlow could not generate a report right now. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-5xl">
      <Card className="overflow-hidden border-primary/20 bg-card/95">
        <CardHeader className="border-b border-border bg-secondary/40">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge variant="outline" className="mb-3">Free report generator</Badge>
              <CardTitle className="text-2xl font-black">Run a TruckFlow market read</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Enter a city and food type. TruckFlow returns a tactical demo report from the backend API.
              </p>
            </div>
            <Badge className="w-fit">Live API</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 md:p-6">
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-start">
            <div className="space-y-2 text-left">
              <label className="text-sm font-semibold" htmlFor="city">City</label>
              <Input
                id="city"
                value={city}
                placeholder="Portland, OR"
                onChange={(event) => setCity(event.target.value)}
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city ? <p className="text-sm text-destructive">{errors.city}</p> : null}
            </div>
            <div className="space-y-2 text-left">
              <label className="text-sm font-semibold" htmlFor="foodType">Food type</label>
              <Input
                id="foodType"
                value={foodType}
                placeholder="Tacos"
                onChange={(event) => setFoodType(event.target.value)}
                aria-invalid={Boolean(errors.foodType)}
              />
              {errors.foodType ? <p className="text-sm text-destructive">{errors.foodType}</p> : null}
            </div>
            <Button type="submit" size="lg" className="mt-0 md:mt-7" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Generate Free Report
            </Button>
          </form>

          {errors.form ? (
            <div className="mt-5 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-left text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errors.form}</p>
            </div>
          ) : null}

          {report ? (
            <>
              <ReportResult report={report} />
              <WaitlistForm city={report.city} foodType={report.foodType} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function ScoreBreakdown({ report }: { report: FreeReport }) {
  if (!report.scores) {
    return null;
  }

  const rows = [
    ["Demand", report.scores.demandScore],
    ["Competition Gap", report.scores.competitionScore],
    ["Event Potential", report.scores.eventPotentialScore],
    ["Menu Gap", report.scores.menuGapScore],
    ["Revenue Boost", report.scores.revenueBoostScore]
  ] as const;

  return (
    <div className="mb-5 grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-5 md:grid-cols-[0.7fr_1.3fr]">
      <div>
        <p className="text-sm font-semibold text-muted-foreground">Opportunity Score</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-5xl font-black text-primary">{report.scores.finalScore}</span>
          <span className="mb-2 text-sm font-semibold text-muted-foreground">/100</span>
        </div>
        {report.summary ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.summary}</p> : null}
      </div>
      <div className="grid gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">{label}</span>
              <span>{value}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function LocalMarketSignals({ report }: { report: FreeReport }) {
  const research = report.research;

  if (!research?.enabled) {
    return (
      <div className="mt-5 rounded-lg border border-border bg-secondary/30 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Radar className="h-4 w-4 text-primary" />
          <p className="font-semibold">Local Market Signals</p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Live market research is not enabled yet. This report is using TruckFlow's local scoring model.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-lg border border-primary/20 bg-background/60 p-5 dark:bg-black/20">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Radar className="h-4 w-4 text-primary" />
            <p className="font-semibold">Local Market Signals</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{research.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="teal">{research.sources.length} sources</Badge>
          <Badge variant="outline">{research.signals.competitorMentions} competitor mentions</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Menu mentions</p>
          <div className="flex flex-wrap gap-2">
            {research.signals.menuMentions.length ? research.signals.menuMentions.map((item) => <Badge key={item}>{item}</Badge>) : <span className="text-sm text-muted-foreground">No strong menu terms found.</span>}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Opportunity gaps</p>
          <div className="grid gap-2 text-sm text-muted-foreground">
            {research.signals.opportunityGaps.length ? research.signals.opportunityGaps.map((item) => <p key={item}>{item}</p>) : <p>No obvious gaps returned.</p>}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Review signals</p>
          <div className="grid gap-2 text-sm text-muted-foreground">
            {research.signals.reviewSignals.length ? research.signals.reviewSignals.map((item) => <p key={item}>{item}</p>) : <p>No review signals returned.</p>}
          </div>
        </div>
      </div>

      {research.sources.length ? (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Sources</p>
          <div className="grid gap-2">
            {research.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">
                <span className="truncate">{source.title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


function evidenceBadgeLabel(level?: string) {
  if (level === "verified") return "Verified";
  if (level === "nearby") return "Nearby";
  if (level === "model") return "Estimate";
  return "Needs Verification";
}

function EvidenceNotes({ notes }: { notes?: string[] }) {
  if (!notes?.length) return null;

  return (
    <ul className="mt-3 grid gap-1 text-xs leading-5 text-muted-foreground">
      {notes.slice(0, 3).map((note) => <li key={note}>- {note}</li>)}
    </ul>
  );
}

function AccuracyDisclaimer() {
  return (
    <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-muted-foreground">
      TruckFlow recommendations are decision-support, not confirmed bookings or permits. Verify locations, permits, and event availability before operating.
    </div>
  );
}

function FlowEventsSection({ report }: { report: FreeReport }) {
  const [expanded, setExpanded] = useState(false);
  const flowEvents = report.flowEvents;
  const opportunities = flowEvents?.opportunities ?? [];
  const visible = expanded ? opportunities : opportunities.slice(0, 3);

  if (!flowEvents || opportunities.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 rounded-lg border border-primary/20 bg-background/60 p-5 dark:bg-black/20">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <p className="font-semibold">FlowEvents: Event + Permit Opportunities</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{flowEvents.summary}</p>
        </div>
        <Badge variant="outline">{opportunities.length} leads</Badge>
      </div>

      <div className="grid gap-3">
        {visible.map((opportunity) => (
          <article key={opportunity.id} className="rounded-md border border-border bg-card p-4">
            <div className="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h4 className="font-black">{opportunity.title}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{opportunity.score}/100</Badge>
                  <Badge variant="outline">{opportunity.type.replaceAll("_", " ")}</Badge>
                  <Badge variant={opportunity.source === "firecrawl" ? "teal" : "secondary"}>{opportunity.source === "firecrawl" ? "Live Research" : "Model"}</Badge>\n                  <Badge variant={opportunity.evidenceLevel === "verified" ? "teal" : opportunity.evidenceLevel === "nearby" ? "outline" : "secondary"}>{evidenceBadgeLabel(opportunity.evidenceLevel)}</Badge>
                </div>
              </div>
              <p className="text-sm font-semibold text-primary">{opportunity.typicalLeadTime}</p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{opportunity.reason}</p>
            <p className="mt-3 text-sm"><span className="font-semibold">Action:</span> {opportunity.suggestedAction}</p>
            {opportunity.url ? (
              <a href={opportunity.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </article>
        ))}
      </div>

      {opportunities.length > 3 ? (
        <Button type="button" variant="outline" className="mt-4" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show top opportunities" : "View all opportunities"}
        </Button>
      ) : null}
    </div>
  );
}

function StrategyBrief({ report }: { report: FreeReport }) {
  const narrative = report.aiNarrative;

  if (!narrative?.enabled) {
    return (
      <div className="mt-5 rounded-lg border border-border bg-secondary/30 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <p className="font-semibold">TruckFlow Strategy Brief</p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Strategy brief is using TruckFlow's scoring model. AI narrative generation is not enabled yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-lg border border-primary/20 bg-background/60 p-5 dark:bg-black/20">
      <div className="mb-4 flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <p className="font-semibold">TruckFlow Strategy Brief</p>
      </div>
      {narrative.executiveSummary ? (
        <div className="mb-5 rounded-md border border-border bg-card p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Executive Summary</p>
          <p className="text-sm leading-6 text-muted-foreground">{narrative.executiveSummary}</p>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Recommendations</p>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {(narrative.recommendations ?? []).map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Risks</p>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {(narrative.risks ?? []).map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Next Steps</p>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {(narrative.nextSteps ?? []).map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ReportResult({ report }: { report: FreeReport }) {
  const cards = [
    {
      title: "Best Spot Today",
      icon: MapPinned,
      badge: `${report.bestSpot.score}/100`,
      primary: report.bestSpot.name,
      meta: report.bestSpot.timeWindow,
      body: report.bestSpot.reason
    },
    {
      title: "Menu Opportunity",
      icon: ChefHat,
      badge: `${report.menuOpportunity.confidence}% confidence`,
      primary: report.menuOpportunity.item,
      meta: report.foodType,
      body: report.menuOpportunity.reason
    },
    {
      title: "Event Opportunity",
      icon: CalendarClock,
      badge: report.eventOpportunity.status,
      primary: report.eventOpportunity.name,
      meta: report.city,
      body: report.eventOpportunity.reason
    },
    {
      title: "Revenue Boost",
      icon: TrendingUp,
      badge: report.boostIdea.expectedLift,
      primary: report.boostIdea.promo,
      meta: "Slow-day lift strategy",
      body: "Package the offer around speed, certainty, and a clear lunch value signal."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mt-7 text-left"
    >
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Generated report</p>
          <h3 className="mt-1 text-2xl font-black">{report.city} / {report.foodType}</h3>
        </div>
        <Badge variant="teal">Rule-based intelligence v1</Badge>
      </div>
      <ScoreBreakdown report={report} />
      <LocalMarketSignals report={report} />
      <StrategyBrief report={report} />
      <FlowEventsSection report={report} />\n      <AccuracyDisclaimer />
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="rounded-lg border border-border bg-background/60 p-5 shadow-lg shadow-black/5 dark:bg-black/20"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant={index === 0 || index === 3 ? "default" : "secondary"}>{card.badge}</Badge>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">{card.title}</p>
              <h4 className="mt-2 text-xl font-black">{card.primary}</h4>
              <p className="mt-1 text-sm text-primary">{card.meta}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.body}</p>
            </motion.article>
          );
        })}
      </div>
    </motion.div>
  );
}

function WaitlistForm({ city, foodType }: { city: string; foodType: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [leadCity, setLeadCity] = useState(city);
  const [leadFoodType, setLeadFoodType] = useState(foodType);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLead(email, leadCity, leadFoodType);
    setErrors(nextErrors);
    setSuccessMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await joinWaitlist({
        name: name.trim() || undefined,
        email: email.trim(),
        businessName: businessName.trim() || undefined,
        city: leadCity.trim(),
        foodType: leadFoodType.trim()
      });
      setSuccessMessage(response.message);
    } catch {
      setErrors({
        form: "TruckFlow could not save your signup right now. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-lg border border-teal-500/25 bg-teal-500/10 p-5 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-black">You're on the early access list.</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">We'll notify you when TruckFlow opens.</p>
            <p className="mt-1 text-sm font-semibold text-teal-700 dark:text-teal-200">Your first report is saved.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.4 }}
      className="mt-6 rounded-lg border border-primary/20 bg-secondary/35 p-5 text-left"
    >
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Save this report</p>
          <h3 className="mt-1 text-2xl font-black">Want the full TruckFlow playbook?</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Join early access and keep this market read attached to your launch profile.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-2">
          <LockKeyhole className="h-3.5 w-3.5" />
          No spam
        </Badge>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="lead-name">Name</label>
          <Input id="lead-name" value={name} placeholder="Chance" onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="lead-email">Email</label>
          <Input
            id="lead-email"
            value={email}
            placeholder="test@example.com"
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="lead-business">Business name</label>
          <Input id="lead-business" value={businessName} placeholder="Birria Fusion" onChange={(event) => setBusinessName(event.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="lead-city">City</label>
            <Input id="lead-city" value={leadCity} onChange={(event) => setLeadCity(event.target.value)} aria-invalid={Boolean(errors.city)} />
            {errors.city ? <p className="text-sm text-destructive">{errors.city}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="lead-food-type">Food type</label>
            <Input id="lead-food-type" value={leadFoodType} onChange={(event) => setLeadFoodType(event.target.value)} aria-invalid={Boolean(errors.foodType)} />
            {errors.foodType ? <p className="text-sm text-destructive">{errors.foodType}</p> : null}
          </div>
        </div>
        <div className="md:col-span-2">
          {errors.form ? (
            <div className="mb-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errors.form}</p>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">No spam. Just early access updates and product launch info.</p>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Join Early Access
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
