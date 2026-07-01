"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, Activity, Settings, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavCounts = {
  workOrders?: number;
  customers?: number;
};

const links = [
  { href: "/", label: "Áttekintés", icon: LayoutDashboard, countKey: undefined },
  { href: "/customers", label: "Ügyfelek", icon: Users, countKey: "customers" as const },
  { href: "/work-orders", label: "Munkalapok", icon: Wrench, countKey: "workOrders" as const },
  { href: "/tables", label: "Egyedi táblák", icon: Table2, countKey: undefined },
  { href: "/activity", label: "Aktivitás", icon: Activity, countKey: undefined },
  { href: "/settings", label: "Beállítások", icon: Settings, countKey: undefined },
];

export function SidebarNav({ counts, collapsed = false }: { counts?: NavCounts; collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links.map(({ href, label, icon: Icon, countKey }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const count = countKey ? counts?.[countKey] : undefined;
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{label}</span>
                {typeof count === "number" && count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
