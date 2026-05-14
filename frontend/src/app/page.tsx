import { DashboardPreview } from "@/components/dashboard/dashboard-preview";
import { Hero } from "@/components/dashboard/hero";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <TopNav />
          <Hero />
          <DashboardPreview />
        </div>
      </div>
    </main>
  );
}
