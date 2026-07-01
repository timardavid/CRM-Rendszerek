"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Áttekintés", icon: LayoutDashboard },
  { href: "/tables", label: "Egyedi táblák", icon: Table2 },
  { href: "/activity", label: "Aktivitás", icon: Activity },
  { href: "/settings", label: "Beállítások", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
