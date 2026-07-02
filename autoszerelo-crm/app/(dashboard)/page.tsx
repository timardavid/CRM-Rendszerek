import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wrench, Users, Activity, Banknote } from "lucide-react";
import { STATUS_LABELS, STATUS_BADGE_CLASSES, formatHuf, itemsTotal } from "@/lib/work-order";
import { startOfToday, startOfMonth } from "@/lib/date";
import { activityIcon, activityIconColor, activitySentence } from "@/lib/activity-format";
import { cn } from "@/lib/utils";

const STALE_DAYS = 5;

export default async function OverviewPage() {
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const staleThreshold = new Date(now.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000);

  const [
    openWorkOrders,
    customerCount,
    todayActivityCount,
    monthlyPaidInvoices,
    recentActivity,
    upcomingAppointments,
    staleWorkOrders,
  ] = await Promise.all([
    db.workOrder.findMany({
      where: { status: { not: "HANDED_OVER" } },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { licensePlate: true } },
        items: { select: { quantity: true, unitPrice: true } },
      },
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
    db.workOrder.findMany({
      where: { scheduledAt: { gte: now, lte: in48h }, status: { not: "HANDED_OVER" } },
      include: { customer: { select: { name: true } }, vehicle: { select: { licensePlate: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    db.workOrder.findMany({
      where: { status: { in: ["RECEIVED", "DIAGNOSED", "IN_PROGRESS"] }, updatedAt: { lt: staleThreshold } },
      include: { customer: { select: { name: true } } },
      orderBy: { updatedAt: "asc" },
      take: 5,
    }),
  ]);

  const openWorkOrderCount = await db.workOrder.count({ where: { status: { not: "HANDED_OVER" } } });
  const monthlyRevenue = monthlyPaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
  const hasReminders = upcomingAppointments.length > 0 || staleWorkOrders.length > 0;

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

      {hasReminders && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" /> Emlékeztetők
            </CardTitle>
            <CardDescription>Amire most érdemes ránézni.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {upcomingAppointments.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4" /> Közelgő időpontok (48 órán belül)
                </p>
                {upcomingAppointments.map((w) => (
                  <Link
                    key={w.id}
                    href={`/work-orders/${w.id}`}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                  >
                    <span className="text-foreground">
                      {w.title} <span className="text-muted-foreground">({w.customer.name}{w.vehicle ? ` — ${w.vehicle.licensePlate}` : ""})</span>
                    </span>
                    <span className="text-muted-foreground">
                      {w.scheduledAt?.toLocaleString("hu-HU", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {staleWorkOrders.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <AlertTriangle className="h-4 w-4" /> {STALE_DAYS}+ napja nincs frissítve
                </p>
                {staleWorkOrders.map((w) => (
                  <Link
                    key={w.id}
                    href={`/work-orders/${w.id}`}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                  >
                    <span className="text-foreground">
                      {w.title} <span className="text-muted-foreground">({w.customer.name})</span>
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_BADGE_CLASSES[w.status])}>
                      {STATUS_LABELS[w.status] ?? w.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm hover:bg-muted"
              >
                <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-foreground">{w.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {w.customer.name}
                    {w.vehicle && ` · ${w.vehicle.licensePlate}`}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_BADGE_CLASSES[w.status])}
                  >
                    {STATUS_LABELS[w.status] ?? w.status}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {formatHuf(itemsTotal(w.items.map((i) => ({ quantity: i.quantity.toString(), unitPrice: i.unitPrice.toString() }))))}
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legutóbbi aktivitás</CardTitle>
            <CardDescription>Ki mit csinált a rendszerben.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">Még nincs rögzített aktivitás.</p>}
            {recentActivity.map((log) => {
              const Icon = activityIcon(log.action);
              return (
                <div key={log.id} className="flex items-center gap-3 rounded-md px-1 py-1.5 text-sm">
                  <Icon className={cn("h-4 w-4 shrink-0", activityIconColor(log.action))} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-foreground">
                      <span className="font-medium">{log.userName}</span> {activitySentence(log)}
                    </span>
                    <span className="text-xs text-muted-foreground">{log.createdAt.toLocaleString("hu-HU")}</span>
                  </div>
                </div>
              );
            })}
            <Link href="/activity" className="mt-2 text-sm text-primary underline">
              Teljes napló megtekintése
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
