"use client";

import dynamic from "next/dynamic";
import { Activity, Brain, MapPinned, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightGrid } from "@/components/dashboard/insight-grid";

const HotspotMap = dynamic(() => import("@/components/map/hotspot-map").then((mod) => mod.HotspotMap), {
  ssr: false,
  loading: () => <div className="grid h-[420px] place-items-center rounded-lg border border-border bg-card text-muted-foreground">Loading FlowMap</div>
});

export function DashboardPreview() {
  return (
    <section id="dashboard" className="mx-auto w-full max-w-7xl px-4 pb-20">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="outline" className="mb-3">Dashboard shell</Badge>
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">Built like an intelligence desk, not a brochure.</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">Fake data for now, but the product shape is real: location scoring, event signals, menu suggestions, and revenue lift in one operational cockpit.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2"><MapPinned className="h-5 w-5 text-primary" /> FlowMap</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Portland OR hotspot scan</p>
            </div>
            <Badge>Live demo</Badge>
          </CardHeader>
          <CardContent>
            <HotspotMap />
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {[
            ["Signal Confidence", "94%", Activity],
            ["AI Recommendations", "18", Brain],
            ["Active Zones", "7", Radio]
          ].map(([label, value, Icon]) => (
            <Card key={label as string}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{label as string}</p>
                  <p className="mt-1 text-3xl font-black">{value as string}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-md bg-secondary">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <InsightGrid />
      </div>
    </section>
  );
}
