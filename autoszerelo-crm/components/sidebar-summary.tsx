import Link from "next/link";
import { Activity, Banknote, CalendarClock } from "lucide-react";
import { formatHuf } from "@/lib/work-order";
import { cn } from "@/lib/utils";

export type SidebarSummaryData = {
  todayActivity: number;
  monthlyRevenue: number;
  upcomingAppointments: number;
};

export function SidebarSummary({
  summary,
  variant = "default",
  onNavigate,
}: {
  summary: SidebarSummaryData;
  variant?: "default" | "mono";
  onNavigate?: () => void;
}) {
  const mono = variant === "mono";

  const rows = [
    { label: "Közelgő időpont", value: summary.upcomingAppointments, icon: CalendarClock, href: "/calendar" },
    { label: "Mai aktivitás", value: summary.todayActivity, icon: Activity, href: "/activity" },
    { label: "Havi bevétel", value: formatHuf(summary.monthlyRevenue), icon: Banknote, href: "/reports" },
  ];

  return (
    <div className={cn("flex flex-col gap-1 border-t p-3", mono ? "border-white/10" : "border-border")}>
      <p className={cn("px-1 pb-1 text-xs font-medium", mono ? "text-white/50" : "text-muted-foreground")}>
        Gyors áttekintés
      </p>
      {rows.map(({ label, value, icon: Icon, href }) => (
        <Link
          key={label}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-md px-1 py-1 text-xs transition-colors",
            mono ? "hover:bg-white/10" : "hover:bg-muted"
          )}
        >
          <Icon className={cn("h-3.5 w-3.5 shrink-0", mono ? "text-white/70" : "text-primary")} />
          <span className={cn("flex-1", mono ? "text-white/60" : "text-muted-foreground")}>{label}</span>
          <span className={cn("font-medium", mono ? "text-white" : "text-foreground")}>{value}</span>
        </Link>
      ))}
    </div>
  );
}
