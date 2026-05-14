import { BarChart3, Flame, MapPinned, Sparkles } from "lucide-react";
import type { Hotspot, Insight } from "@/types/truckflow";

export const insights: Insight[] = [
  {
    title: "Best Location Today",
    value: "Pearl District",
    detail: "Lunch demand is outrunning nearby supply from 11:20 AM to 1:45 PM.",
    trend: "+31% demand",
    icon: MapPinned
  },
  {
    title: "Suggested Menu Item",
    value: "Loaded birria fries",
    detail: "Social chatter and nearby event menus point to high late-lunch conversion.",
    trend: "+18% attach rate",
    icon: Sparkles
  },
  {
    title: "Event Opportunity",
    value: "Waterfront concert",
    detail: "Move by 5:10 PM to catch the pre-show line before vendor saturation.",
    trend: "2.4k attendees",
    icon: Flame
  },
  {
    title: "Revenue Boost Opportunity",
    value: "$740 upside",
    detail: "Shift two hours later and bundle drinks with premium entrees.",
    trend: "+22% revenue",
    icon: BarChart3
  }
];

export const hotspots: Hotspot[] = [
  { id: "pearl", label: "High Lunch Demand", type: "demand", position: [45.5289, -122.6819], metric: "+31% demand" },
  { id: "hawthorne", label: "Low Taco Competition", type: "competition", position: [45.5122, -122.6251], metric: "2 trucks nearby" },
  { id: "waterfront", label: "+22% Revenue Opportunity", type: "event", position: [45.5152, -122.6731], metric: "Event spike" },
  { id: "mississippi", label: "Dinner Flow Building", type: "demand", position: [45.5511, -122.6757], metric: "+16% traffic" }
];

export const sidebarItems = ["Dashboard", "FlowMap", "FlowMenu", "FlowEvents", "FlowBoost", "Analytics", "Settings"];
