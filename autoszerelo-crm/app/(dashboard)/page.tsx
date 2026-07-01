import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wrench, Users, Activity, Banknote } from "lucide-react";
import { STATUS_LABELS, formatHuf } from "@/lib/work-order";
import { startOfToday, startOfMonth } from "@/lib/date";

export default async function OverviewPage() {
  const [openWorkOrders, customerCount, todayActivityCount, monthlyPaidInvoices, recentActivity] = await Promise.all([
    db.workOrder.findMany({
      where: { status: { not: "HANDED_OVER" } },
      include: { customer: { select: { name: true } }, vehicle: { select: { licensePlate: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.customer.count(),
    db.activityLog.count({ where: { createdAt: { gte: startOfToday() } } }),
    db.invoice.findMany({
      where: { type: "INVOICE", paidAt: { gte: startOfMonth() } },
      select: { totalAmount: true },
    }),
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const openWorkOrderCount = await db.workOrder.count({ where: { status: { not: "HANDED_OVER" } } });
  const monthlyRevenue = monthlyPaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

  const stats = [
    { label: "Nyitott munkalapok", value: openWorkOrderCount, icon: Wrench },
    { label: "Ügyfelek", value: customerCount, icon: Users },
    { label: "Havi bevétel (fizetve)", value: formatHuf(monthlyRevenue), icon: Banknote },
    { label: "Mai aktivitás", value: todayActivityCount, icon: Activity },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Áttekintés</h1>
        <p className="text-sm text-muted-foreground">
          Gyors pillantás arra, mi van folyamatban. A &quot;Havi bevétel&quot; csak a fizetettként megjelölt
          számlákat számolja, a folyó hónapra.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
              </div>
              <Icon className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nyitott munkalapok</CardTitle>
            <CardDescription>Folyamatban lévő munkák.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {openWorkOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nincs nyitott munkalap. Hozz létre egyet az{" "}
                <Link href="/work-orders/new" className="text-primary underline">
                  Munkalapok
                </Link>{" "}
                menüben.
              </p>
            )}
            {openWorkOrders.map((w) => (
              <Link
                key={w.id}
                href={`/work-orders/${w.id}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="text-foreground">
                  {w.title} <span className="text-muted-foreground">({w.customer.name})</span>
                </span>
                <span className="text-muted-foreground">{STATUS_LABELS[w.status] ?? w.status}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legutóbbi aktivitás</CardTitle>
            <CardDescription>Ki mit csinált a rendszerben.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">Még nincs rögzített aktivitás.</p>}
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  <span className="font-medium">{log.userName}</span> — {log.action} ({log.entityType})
                </span>
                <span className="text-muted-foreground">{log.createdAt.toLocaleString("hu-HU")}</span>
              </div>
            ))}
            <Link href="/activity" className="mt-2 text-sm text-primary underline">
              Teljes napló megtekintése
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
