"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";
import { FreeReportGenerator } from "@/components/report/free-report-generator";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.07)_1px,transparent_1px)] bg-[size:44px_44px] dark:bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)]" />
      <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 flex justify-center">
            <BrandLogo priority wordmarkClassName="h-16 max-w-[250px] md:h-20 md:max-w-[320px]" markClassName="h-12 w-12 md:h-14 md:w-14" />
          </div>
          <Badge variant="secondary" className="mb-6 gap-2">
            <Radar className="h-3.5 w-3.5 text-primary" />
            Food truck intelligence platform
          </Badge>
          <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Go where the <span className="text-primary">money</span> is.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
            TruckFlow tells food trucks where to park, what to sell, and how to make more money automatically.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#free-report">
                Get Free Report
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline">
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>
          <div id="free-report">
            <FreeReportGenerator />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
