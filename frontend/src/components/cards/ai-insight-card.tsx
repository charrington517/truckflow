"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Insight } from "@/types/truckflow";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AIInsightCard({ insight, index }: { insight: Insight; index: number }) {
  const Icon = insight.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.45 }} viewport={{ once: true }}>
      <Card className="group h-full overflow-hidden">
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="teal">{insight.trend}</Badge>
        </CardHeader>
        <CardContent>
          <CardTitle className="mb-2 text-sm text-muted-foreground">{insight.title}</CardTitle>
          <div className="mb-3 flex items-center gap-2">
            <p className="text-2xl font-black">{insight.value}</p>
            <ArrowUpRight className="h-5 w-5 text-primary opacity-0 transition group-hover:opacity-100" />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{insight.detail}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
