"use client";

import { Menu, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand/brand-logo";

export function TopNav() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-background/75 px-4 py-4 backdrop-blur-xl lg:px-7">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="lg:hidden" variant="outline" size="sm">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <div className="hidden items-center gap-4 sm:flex lg:hidden">
        <BrandLogo compact />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Live market intelligence</p>
        <h2 className="text-xl font-bold">Portland command view</h2>
      </div>
      <div className="hidden w-full max-w-sm items-center gap-2 rounded-md border border-border bg-card px-3 md:flex">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input className="border-0 bg-transparent px-0 focus-visible:ring-0" placeholder="Search zones, menus, events" />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>
    </header>
  );
}
