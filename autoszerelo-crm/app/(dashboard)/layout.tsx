import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { startOfToday, startOfMonth } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const now = new Date();
  const [settings, openWorkOrderCount, customerCount, todayActivityCount, monthlyPaidInvoices, upcomingAppointmentCount] =
    await Promise.all([
      db.settings.findUnique({ where: { id: "singleton" } }).catch(() => null),
      db.workOrder.count({ where: { status: { not: "HANDED_OVER" } } }),
      db.customer.count(),
      db.activityLog.count({ where: { createdAt: { gte: startOfToday() } } }),
      db.invoice.findMany({
        where: { type: "INVOICE", paidAt: { gte: startOfMonth() } },
        select: { totalAmount: true },
      }),
      db.workOrder.count({ where: { scheduledAt: { gte: now }, status: { not: "HANDED_OVER" } } }),
    ]);

  const companyName = settings?.companyName ?? "CRM";
  const accentColor = settings?.accentColor ?? "#2563eb";
  const monthlyRevenue = monthlyPaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

  return (
    <div style={{ ["--primary" as string]: accentColor, ["--ring" as string]: accentColor }}>
      <DashboardShell
        companyName={companyName}
        userName={session?.user?.name ?? ""}
        userRole={session?.user?.role ?? "STAFF"}
        navCounts={{ workOrders: openWorkOrderCount, customers: customerCount }}
        summary={{
          todayActivity: todayActivityCount,
          monthlyRevenue,
          upcomingAppointments: upcomingAppointmentCount,
        }}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
