import { Wrench, Activity, Banknote } from "lucide-react";
import { formatHuf } from "@/lib/work-order";

export type SidebarSummaryData = {
  openWorkOrders: number;
  todayActivity: number;
  monthlyRevenue: number;
};

export function SidebarSummary({ summary }: { summary: SidebarSummaryData }) {
  const rows = [
    { label: "Nyitott munkalap", value: summary.openWorkOrders, icon: Wrench },
    { label: "Mai aktivitás", value: summary.todayActivity, icon: Activity },
    { label: "Havi bevétel", value: formatHuf(summary.monthlyRevenue), icon: Banknote },
  ];

  return (
    <div className="flex flex-col gap-2 border-t border-border p-3">
      <p className="px-1 text-xs font-medium text-muted-foreground">Gyors áttekintés</p>
      {rows.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex items-center gap-2 rounded-md px-1 py-1 text-xs">
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="flex-1 text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}
