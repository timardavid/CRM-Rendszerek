"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Plus, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{companyName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {userName} · {userRole === "ADMIN" ? "Admin" : "Munkatárs"}
              </p>
            </div>
          )}
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

      <div className="relative flex-1 overflow-hidden md:contents">
        {/* Mobil: háttérben lévő menü, amit a tartalom "elhúzása" fed fel — mindig sötét, függetlenül a világos/sötét témától */}
        <div className="fixed inset-0 z-0 flex flex-col bg-black md:hidden">
          <div className="border-b border-white/10 p-4 pt-6">
            <p className="truncate font-semibold text-white">{companyName}</p>
            <p className="truncate text-xs text-white/50">
              {userName} · {userRole === "ADMIN" ? "Admin" : "Munkatárs"}
            </p>
          </div>
          <SidebarNav counts={navCounts} onNavigate={() => setMobileOpen(false)} variant="mono" />
          <div className="mt-auto">
            <SidebarSummary summary={summary} variant="mono" />
          </div>
        </div>

        <motion.div
          animate={
            mobileOpen ? { x: 240, scale: 0.88, borderRadius: 24 } : { x: 0, scale: 1, borderRadius: 0 }
          }
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          style={{ transformOrigin: "left center" }}
          className="relative z-10 flex min-h-screen flex-1 flex-col bg-background"
        >
          {mobileSearchOpen ? (
            <div className="flex h-14 items-center gap-2 border-b border-border bg-card px-4 md:hidden">
              <div className="flex-1">
                <GlobalSearch autoFocus fullWidth />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen(false)} aria-label="Keresés bezárása">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((o) => !o)}>
                <motion.div
                  animate={{ rotate: mobileOpen ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Menu className="h-4 w-4" />
                </motion.div>
              </Button>
              <div className="hidden flex-1 md:block">
                <GlobalSearch />
              </div>
              <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileSearchOpen(true)}
                  aria-label="Keresés"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Link href="/work-orders/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Új munkalap</span>
                  </Button>
                </Link>
                <ThemeToggle />
                <LogoutButton />
              </div>
            </header>
          )}
          <main className="flex-1 p-4 md:p-6">{children}</main>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                className="absolute inset-0 z-20 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
