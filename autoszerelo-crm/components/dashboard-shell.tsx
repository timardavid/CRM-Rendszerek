"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";

type Props = {
  companyName: string;
  userName: string;
  userRole: string;
  children: React.ReactNode;
};

export function DashboardShell({ companyName, userName, userRole, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="border-b border-border p-4">
          <p className="truncate font-semibold text-foreground">{companyName}</p>
        </div>
        <SidebarNav />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="truncate font-semibold text-foreground">{companyName}</p>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="mr-2 text-right text-sm leading-tight">
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
