import { BarChart3, Gauge, Map, MenuSquare, Radar, Rocket, Settings, Shield, Ticket } from "lucide-react";
import { sidebarItems } from "@/data/demo";
import { BrandLogo } from "@/components/brand/brand-logo";

const navItems = [...sidebarItems, "FlowIntel", "Admin"];
const icons = [Gauge, Map, MenuSquare, Ticket, Rocket, BarChart3, Settings, Radar, Shield];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-border bg-card/90 p-5 shadow-xl shadow-black/5 backdrop-blur-xl dark:bg-black/40 lg:block">
      <div className="mb-9">
        <BrandLogo priority wordmarkClassName="max-w-[150px]" />
        <p className="ml-[52px] mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">Intel OS</p>
      </div>
      <nav className="grid gap-2">
        {navItems.map((item, index) => {
          const Icon = icons[index];
          const isAdmin = item === "Admin";
          const isFlowEvents = item === "FlowEvents";
          const isFlowIntel = item === "FlowIntel";
          return (
            <a
              key={item}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${index === 0 ? "bg-primary text-black" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              href={isAdmin ? "/admin" : isFlowIntel ? "/flowintel" : isFlowEvents ? "/flowevents" : "#dashboard"}
            >
              <Icon className="h-4 w-4" />
              {item}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
