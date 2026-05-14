import type { LucideIcon } from "lucide-react";

export type Insight = {
  title: string;
  value: string;
  detail: string;
  trend: string;
  icon: LucideIcon;
};

export type Hotspot = {
  id: string;
  label: string;
  type: "demand" | "competition" | "event";
  position: [number, number];
  metric: string;
};
