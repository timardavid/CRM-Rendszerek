import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const [settings, openWorkOrderCount, customerCount] = await Promise.all([
    db.settings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    db.workOrder.count({ where: { status: { not: "HANDED_OVER" } } }),
    db.customer.count(),
  ]);

  const companyName = settings?.companyName ?? "CRM";
  const accentColor = settings?.accentColor ?? "#2563eb";

  return (
    <div style={{ ["--primary" as string]: accentColor, ["--ring" as string]: accentColor }}>
      <DashboardShell
        companyName={companyName}
        userName={session?.user?.name ?? ""}
        userRole={session?.user?.role ?? "STAFF"}
        navCounts={{ workOrders: openWorkOrderCount, customers: customerCount }}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
