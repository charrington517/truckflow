"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpZA,
  BarChart3,
  Building2,
  CalendarClock,
  ChevronLeft,
  ClipboardCheck,
  KeyRound,
  Mail,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Utensils,
  X
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getReportFeedback, getReportHistory, getWaitlistLeads, submitReportFeedback } from "@/lib/api";
import type { WaitlistLead } from "@/types/lead";
import type { ReportActivity, ReportFeedback, ReportFeedbackIssueType } from "@/types/report";

type SortMode = "newest" | "oldest";
type AdminTab = "leads" | "reports" | "accuracy";

const storageKey = "truckflow-admin-key";
const issueTypes: ReportFeedbackIssueType[] = [
  "inaccurate_location",
  "fake_specific_claim",
  "repetitive_answer",
  "weak_recommendation",
  "wrong_food_type",
  "missing_nearby_market",
  "other"
];

const issueLabel = (value?: string) => value ? value.replaceAll("_", " ") : "No issue type";

const formatDate = (value?: string) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
};

function getTopFoodType(items: Array<{ foodType: string }>) {
  if (items.length === 0) return "No data";
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = item.foodType.trim() || "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No data";
}

function mostCommonIssue(feedback: ReportFeedback[]) {
  const counts = feedback.reduce<Record<string, number>>((acc, item) => {
    const key = item.issueType ?? "other";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function leadSearchText(lead: WaitlistLead) {
  return [lead.name, lead.email, lead.businessName, lead.city, lead.foodType].filter(Boolean).join(" ").toLowerCase();
}

function reportSearchText(report: ReportActivity) {
  return [
    report.city,
    report.foodType,
    report.report.bestSpot.name,
    report.report.menuOpportunity.item,
    report.report.eventOpportunity.name,
    report.report.boostIdea.promo,
    report.report.summary ?? "",
    report.report.research?.summary ?? "",
    report.report.aiNarrative?.executiveSummary ?? ""
  ].join(" ").toLowerCase();
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [leads, setLeads] = useState<WaitlistLead[]>([]);
  const [reports, setReports] = useState<ReportActivity[]>([]);
  const [feedback, setFeedback] = useState<ReportFeedback[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>("leads");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedKey = window.sessionStorage.getItem(storageKey) ?? "";
    setAdminKey(savedKey);
    setKeyInput(savedKey);
  }, []);

  useEffect(() => {
    if (!adminKey) return;
    let mounted = true;
    setLoading(true);

    Promise.all([getWaitlistLeads(adminKey), getReportHistory(adminKey), getReportFeedback(adminKey)])
      .then(([leadData, reportData, feedbackData]) => {
        if (!mounted) return;
        setLeads(leadData);
        setReports(reportData);
        setFeedback(feedbackData);
        setError("");
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Could not load admin data.";
        setError(message === "Admin access denied. Check API key." ? message : "Could not load admin data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [adminKey]);

  const sortedLeads = useMemo(() => [...leads].sort((a, b) => sortMode === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [leads, sortMode]);
  const sortedReports = useMemo(() => [...reports].sort((a, b) => sortMode === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [reports, sortMode]);
  const sortedFeedback = useMemo(() => [...feedback].sort((a, b) => sortMode === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [feedback, sortMode]);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery ? sortedLeads.filter((lead) => leadSearchText(lead).includes(normalizedQuery)) : sortedLeads;
  }, [query, sortedLeads]);

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery ? sortedReports.filter((report) => reportSearchText(report).includes(normalizedQuery)) : sortedReports;
  }, [query, sortedReports]);

  const filteredFeedback = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery ? sortedFeedback.filter((item) => [item.reportId, item.issueType, item.notes].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery)) : sortedFeedback;
  }, [query, sortedFeedback]);

  const feedbackByReport = useMemo(() => {
    return feedback.reduce<Record<string, ReportFeedback[]>>((acc, item) => {
      acc[item.reportId] = [...(acc[item.reportId] ?? []), item];
      return acc;
    }, {});
  }, [feedback]);

  const leadStats = useMemo(() => {
    const uniqueCities = new Set(leads.map((lead) => lead.city.trim().toLowerCase()).filter(Boolean));
    const latest = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return [
      { label: "Total Leads", value: leads.length.toString(), detail: "Early access signups", icon: TrendingUp },
      { label: "Unique Cities", value: uniqueCities.size.toString(), detail: "Markets showing demand", icon: MapPin },
      { label: "Top Food Type", value: getTopFoodType(leads), detail: "Most requested concept", icon: Truck },
      { label: "Latest Signup", value: latest ? formatDate(latest.createdAt) : "No leads yet", detail: latest?.email ?? "Waiting for first capture", icon: CalendarClock }
    ];
  }, [leads]);

  const reportStats = useMemo(() => {
    const uniqueCities = new Set(reports.map((report) => report.city.trim().toLowerCase()).filter(Boolean));
    const latest = [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const flowEventCount = reports.reduce((sum, report) => sum + (report.report.flowEvents?.opportunities.length ?? 0), 0);
    const sourceCount = reports.reduce((sum, report) => sum + (report.report.research?.sources.length ?? 0), 0);
    const scored = reports.filter((report) => report.report.scores?.finalScore);
    const averageScore = scored.length ? Math.round(scored.reduce((sum, report) => sum + (report.report.scores?.finalScore ?? 0), 0) / scored.length).toString() : "No data";
    return [
      { label: "Total Reports", value: reports.length.toString(), detail: `Avg score: ${averageScore}`, icon: BarChart3 },
      { label: "Unique Cities", value: uniqueCities.size.toString(), detail: "Markets requested", icon: MapPin },
      { label: "FlowEvents", value: flowEventCount.toString(), detail: `${sourceCount} research sources`, icon: Utensils },
      { label: "Latest Report", value: latest ? formatDate(latest.createdAt) : "No reports yet", detail: latest ? `${latest.city} / ${latest.foodType}` : "Waiting for demand", icon: Sparkles }
    ];
  }, [reports]);

  const accuracyStats = useMemo(() => {
    const rated = feedback.filter((item) => typeof item.rating === "number");
    const average = rated.length ? (rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length).toFixed(1) : "No ratings";
    const latest = sortedFeedback[0];
    return [
      { label: "Average Rating", value: average, detail: rated.length ? `${rated.length} rated reviews` : "Waiting for QA", icon: Star },
      { label: "Feedback Items", value: feedback.length.toString(), detail: "Accuracy reviews logged", icon: ClipboardCheck },
      { label: "Common Issue", value: issueLabel(mostCommonIssue(feedback)), detail: "Most frequent QA label", icon: Shield },
      { label: "Latest Review", value: latest ? formatDate(latest.createdAt) : "No feedback yet", detail: latest?.notes || latest?.reportId || "Waiting for review", icon: CalendarClock }
    ];
  }, [feedback, sortedFeedback]);

  function handleKeySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedKey = keyInput.trim();
    if (!trimmedKey) {
      setError("Admin access denied. Check API key.");
      return;
    }
    window.sessionStorage.setItem(storageKey, trimmedKey);
    setAdminKey(trimmedKey);
    setError("");
  }

  function clearKey() {
    window.sessionStorage.removeItem(storageKey);
    setAdminKey("");
    setKeyInput("");
    setLeads([]);
    setReports([]);
    setFeedback([]);
    setError("");
  }

  function refreshData() {
    setAdminKey("");
    window.setTimeout(() => setAdminKey(keyInput.trim()), 0);
  }

  async function handleFeedbackSaved(reportFeedback: ReportFeedback) {
    setFeedback((current) => [reportFeedback, ...current]);
  }

  const stats = activeTab === "leads" ? leadStats : activeTab === "reports" ? reportStats : accuracyStats;

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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden gap-2 sm:inline-flex">
              <Shield className="h-3.5 w-3.5" />
              Internal admin
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="mb-3">Demand command view</Badge>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">TruckFlow Admin</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track signups, report demand, and recommendation accuracy before launch.
            </p>
          </div>
          <div className="flex gap-2">
            {adminKey ? <Button onClick={refreshData} variant="outline">Refresh Data</Button> : null}
            {adminKey ? <Button onClick={clearKey} variant="ghost">Clear Key</Button> : null}
          </div>
        </div>

        {!adminKey ? (
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-md bg-primary/15 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-black">Enter Admin Key</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">This private view uses the backend admin key.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleKeySubmit} className="grid gap-4">
                <Input type="password" value={keyInput} onChange={(event) => setKeyInput(event.target.value)} placeholder="ADMIN_API_KEY" />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit">Unlock Admin</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-5 inline-flex rounded-lg border border-border bg-card p-1">
              {(["leads", "reports", "accuracy"] as AdminTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setQuery("");
                  }}
                  className={`rounded-md px-4 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? "bg-primary text-black" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="flex items-start justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                        <p className="mt-2 truncate text-2xl font-black">{stat.value}</p>
                        <p className="mt-2 truncate text-xs text-muted-foreground">{stat.detail}</p>
                      </div>
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-secondary/30">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <CardTitle className="text-xl font-black">
                      {activeTab === "leads" ? "Waitlist Leads" : activeTab === "reports" ? "Report History" : "Accuracy Review"}
                    </CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {activeTab === "leads"
                        ? `${filteredLeads.length} visible of ${leads.length} total`
                        : activeTab === "reports"
                          ? `${filteredReports.length} visible of ${reports.length} total`
                          : `${filteredFeedback.length} visible of ${feedback.length} total`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-card px-3 sm:w-80">
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <Input className="border-0 bg-transparent px-0 focus-visible:ring-0" placeholder="Search admin data" value={query} onChange={(event) => setQuery(event.target.value)} />
                    </div>
                    <Button variant="outline" onClick={() => setSortMode((current) => (current === "newest" ? "oldest" : "newest"))}>
                      {sortMode === "newest" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpZA className="h-4 w-4" />}
                      {sortMode === "newest" ? "Newest" : "Oldest"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-sm text-muted-foreground">Loading admin data...</div>
                ) : error ? (
                  <div className="m-5 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error === "Admin access denied. Check API key." ? error : "Could not load admin data."}
                  </div>
                ) : activeTab === "leads" ? (
                  <LeadTable leads={filteredLeads} total={leads.length} />
                ) : activeTab === "reports" ? (
                  <ReportTable reports={filteredReports} total={reports.length} adminKey={adminKey} feedbackByReport={feedbackByReport} onFeedbackSaved={handleFeedbackSaved} />
                ) : (
                  <AccuracyTable feedback={filteredFeedback} reports={reports} total={feedback.length} />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </main>
  );
}

function LeadTable({ leads, total }: { leads: WaitlistLead[]; total: number }) {
  if (leads.length === 0) return <div className="p-8 text-sm text-muted-foreground">{total === 0 ? "No leads yet." : "No leads match that search."}</div>;
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-secondary/20 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr><th className="px-5 py-4 font-semibold">Lead</th><th className="px-5 py-4 font-semibold">Business</th><th className="px-5 py-4 font-semibold">Market</th><th className="px-5 py-4 font-semibold">Food Type</th><th className="px-5 py-4 font-semibold">Created</th></tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={`${lead.email}-${lead.createdAt}`} className="border-b border-border/70 last:border-0">
                <td className="px-5 py-4"><p className="font-semibold">{lead.name || "Unnamed lead"}</p><p className="mt-1 flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{lead.email}</p></td>
                <td className="px-5 py-4">{lead.businessName || "Not provided"}</td>
                <td className="px-5 py-4">{lead.city}</td>
                <td className="px-5 py-4"><Badge>{lead.foodType}</Badge></td>
                <td className="px-5 py-4 text-muted-foreground">{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 lg:hidden">
        {leads.map((lead) => (
          <article key={`${lead.email}-${lead.createdAt}`} className="rounded-lg border border-border bg-background/60 p-4">
            <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-black">{lead.name || "Unnamed lead"}</h2><p className="mt-1 truncate text-sm text-muted-foreground">{lead.email}</p></div><Badge>{lead.foodType}</Badge></div>
            <div className="grid gap-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />{lead.businessName || "Business not provided"}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{lead.city}</p><p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" />{formatDate(lead.createdAt)}</p></div>
          </article>
        ))}
      </div>
    </>
  );
}

function evidenceLabel(level?: string) {
  if (level === "verified") return "Verified";
  if (level === "nearby") return "Nearby";
  if (level === "model") return "Estimate";
  return "Needs Verification";
}

function ReportTable({
  reports,
  total,
  adminKey,
  feedbackByReport,
  onFeedbackSaved
}: {
  reports: ReportActivity[];
  total: number;
  adminKey: string;
  feedbackByReport: Record<string, ReportFeedback[]>;
  onFeedbackSaved: (feedback: ReportFeedback) => void;
}) {
  const [reviewing, setReviewing] = useState<ReportActivity | null>(null);
  if (reports.length === 0) return <div className="p-8 text-sm text-muted-foreground">{total === 0 ? "No reports yet." : "No reports match that search."}</div>;
  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-secondary/20 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-semibold">Market</th><th className="px-5 py-4 font-semibold">Score</th><th className="px-5 py-4 font-semibold">Research</th><th className="px-5 py-4 font-semibold">FlowEvents</th><th className="px-5 py-4 font-semibold">Evidence</th><th className="px-5 py-4 font-semibold">Nearby</th><th className="px-5 py-4 font-semibold">Quality</th><th className="px-5 py-4 font-semibold">Accuracy</th><th className="px-5 py-4 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((item) => (
              <tr key={item.id} className="border-b border-border/70 last:border-0">
                <td className="px-5 py-4"><p className="font-semibold">{item.city}</p><Badge className="mt-2">{item.foodType}</Badge></td>
                <td className="px-5 py-4">{item.report.scores?.finalScore ? <Badge>{item.report.scores.finalScore}/100</Badge> : "Legacy"}</td>
                <td className="px-5 py-4">{item.report.localData?.checks?.length ? `${item.report.localData.checks.filter((check) => check.resultCount > 0).length} OSM checks` : "Scoring only"}</td>
                <td className="px-5 py-4">{item.report.flowEvents?.opportunities.length ? `${item.report.flowEvents.opportunities.length} / ${item.report.flowEvents.opportunities[0]?.title}` : "Legacy"}</td>
                <td className="px-5 py-4">{item.report.flowEvents?.opportunities[0]?.evidenceLevel ? <Badge variant="outline">{evidenceLabel(item.report.flowEvents.opportunities[0].evidenceLevel)}</Badge> : "Legacy"}</td>
                <td className="px-5 py-4">{item.report.nearbyExpansion?.usedNearbyExpansion ? <Badge variant="outline">{item.report.nearbyExpansion.recommendations[0]?.city ?? "Used"}</Badge> : "No"}</td>
                <td className="px-5 py-4">{item.report.qualityControl?.applied ? `${item.report.qualityControl.suppressed.length} suppressed / ${item.report.qualityControl.qualityNotes.length} notes` : "Legacy"}</td><td className="px-5 py-4"><Button variant="outline" size="sm" onClick={() => setReviewing(item)}>Review Accuracy</Button>{feedbackByReport[item.id]?.length ? <p className="mt-2 text-xs text-muted-foreground">{feedbackByReport[item.id].length} review(s)</p> : null}</td>
                <td className="px-5 py-4 text-muted-foreground">{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 xl:hidden">
        {reports.map((item) => (
          <article key={item.id} className="rounded-lg border border-border bg-background/60 p-4">
            <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-black">{item.city}</h2><p className="mt-1 truncate text-sm text-muted-foreground">{formatDate(item.createdAt)}</p></div><Badge>{item.foodType}</Badge></div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p><span className="font-semibold text-foreground">Score:</span> {item.report.scores?.finalScore ? `${item.report.scores.finalScore}/100` : "Legacy report"}</p>
              <p><span className="font-semibold text-foreground">FlowEvents:</span> {item.report.flowEvents?.opportunities.length ? `${item.report.flowEvents.opportunities.length} leads, top: ${item.report.flowEvents.opportunities[0]?.title}` : "Legacy report"}</p>
              <p><span className="font-semibold text-foreground">Top evidence:</span> {evidenceLabel(item.report.flowEvents?.opportunities[0]?.evidenceLevel)}</p>
              <p><span className="font-semibold text-foreground">Nearby expansion:</span> {item.report.nearbyExpansion?.usedNearbyExpansion ? item.report.nearbyExpansion.recommendations.map((rec) => rec.city).join(", ") : "No"}</p><p><span className="font-semibold text-foreground">Quality:</span> {item.report.qualityControl?.applied ? `${item.report.qualityControl.suppressed.length} suppressed / ${item.report.qualityControl.qualityNotes.length} notes` : "Legacy"}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setReviewing(item)}>Review Accuracy</Button>
          </article>
        ))}
      </div>
      {reviewing ? <ReviewModal report={reviewing} adminKey={adminKey} onClose={() => setReviewing(null)} onSaved={onFeedbackSaved} /> : null}
    </>
  );
}

function ReviewModal({ report, adminKey, onClose, onSaved }: { report: ReportActivity; adminKey: string; onClose: () => void; onSaved: (feedback: ReportFeedback) => void }) {
  const [rating, setRating] = useState(3);
  const [issueType, setIssueType] = useState<ReportFeedbackIssueType>("weak_recommendation");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = await submitReportFeedback(report.id, { rating, issueType, notes }, adminKey);
      onSaved(saved);
      onClose();
    } catch {
      setError("Could not save accuracy feedback.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-lg border border-border bg-background p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Accuracy review</p><h2 className="mt-1 text-xl font-black">{report.city} / {report.foodType}</h2></div>
          <button onClick={onClose} className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Rating</label>
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm">
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Issue type</label>
            <select value={issueType} onChange={(event) => setIssueType(event.target.value as ReportFeedbackIssueType)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm">
              {issueTypes.map((type) => <option key={type} value={type}>{issueLabel(type)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Notes</label>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-28 w-full rounded-md border border-border bg-card px-3 py-2 text-sm" placeholder="What was wrong, repetitive, missing, or too confident?" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Submit Review"}</Button></div>
        </form>
      </div>
    </div>
  );
}

function AccuracyTable({ feedback, reports, total }: { feedback: ReportFeedback[]; reports: ReportActivity[]; total: number }) {
  if (feedback.length === 0) return <div className="p-8 text-sm text-muted-foreground">{total === 0 ? "No accuracy feedback yet." : "No feedback matches that search."}</div>;
  const reportById = Object.fromEntries(reports.map((report) => [report.id, report]));
  return (
    <div className="grid gap-3 p-4">
      {feedback.map((item) => {
        const report = reportById[item.reportId];
        return (
          <article key={item.id} className="rounded-lg border border-border bg-background/60 p-4">
            <div className="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div><h3 className="font-black">{report ? `${report.city} / ${report.foodType}` : item.reportId}</h3><p className="mt-1 text-sm text-muted-foreground">{formatDate(item.createdAt)}</p></div>
              <div className="flex flex-wrap gap-2"><Badge>{item.rating ?? "No"} / 5</Badge><Badge variant="outline">{issueLabel(item.issueType)}</Badge></div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{item.notes || "No notes provided."}</p>
          </article>
        );
      })}
    </div>
  );
}
