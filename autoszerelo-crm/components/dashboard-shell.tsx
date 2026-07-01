"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarNav, type NavCounts } from "@/components/sidebar-nav";
import { SidebarSummary, type SidebarSummaryData } from "@/components/sidebar-summary";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { GlobalSearch } from "@/components/global-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarCollapsed } from "@/lib/use-sidebar-collapsed";

type Props = {
  companyName: string;
  userName: string;
  userRole: string;
  navCounts: NavCounts;
  summary: SidebarSummaryData;
  children: React.ReactNode;
};

export function DashboardShell({ companyName, userName, userRole, navCounts, summary, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-card transition-[width] duration-150 md:flex md:flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          {!collapsed && <p className="truncate font-semibold text-foreground">{companyName}</p>}
          <Button
            variant="ghost"
            size="icon"
            className={collapsed ? "mx-auto" : ""}
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Sidebar kinyitása" : "Sidebar összecsukása"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <SidebarNav counts={navCounts} collapsed={collapsed} />
        {!collapsed && (
          <div className="mt-auto">
            <SidebarSummary summary={summary} />
          </div>
        )}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="truncate font-semibold text-foreground">{companyName}</p>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav counts={navCounts} />
            <div className="mt-auto">
              <SidebarSummary summary={summary} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden flex-1 md:block">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/work-orders/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Új munkalap</span>
              </Button>
            </Link>
            <div className="mr-2 hidden text-right text-sm leading-tight sm:block">
              <p className="font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole === "ADMIN" ? "Admin" : "Munkatárs"}</p>
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
