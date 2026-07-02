import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { WorkOrderChart } from "@/components/reports/workorder-chart";
import { StatusChart } from "@/components/reports/status-chart";
import { TopItemsList } from "@/components/reports/top-items-list";
import { lastNMonths, isInMonth } from "@/lib/reports";

export default async function ReportsPage() {
  const months = lastNMonths(6);
  const rangeStart = new Date(months[0].year, months[0].month, 1);

  const [paidInvoices, recentWorkOrders, allItems, statusCounts] = await Promise.all([
    db.invoice.findMany({
      where: { type: "INVOICE", paidAt: { gte: rangeStart } },
      select: { totalAmount: true, paidAt: true },
    }),
    db.workOrder.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    db.workOrderItem.findMany({ select: { description: true, quantity: true, unitPrice: true } }),
    db.workOrder.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const revenueData = months.map(({ year, month, label }) => ({
    label,
    value: paidInvoices
      .filter((inv) => inv.paidAt && isInMonth(inv.paidAt, year, month))
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
  }));

  const workOrderData = months.map(({ year, month, label }) => ({
    label,
    value: recentWorkOrders.filter((w) => isInMonth(w.createdAt, year, month)).length,
  }));

  const statusData = statusCounts.map((s) => ({ status: s.status, count: s._count.status }));

  const itemTotals = new Map<string, { count: number; revenue: number }>();
  for (const item of allItems) {
    const key = item.description.trim();
    const existing = itemTotals.get(key) ?? { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += Number(item.quantity) * Number(item.unitPrice);
    itemTotals.set(key, existing);
  }
  const topItems = Array.from(itemTotals.entries())
    .map(([description, v]) => ({ description, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Riportok</h1>
        <p className="text-sm text-muted-foreground">Trendek az utolsó 6 hónapról, hogy lásd merre tart a vállalkozás.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Havi bevétel</CardTitle>
            <CardDescription>Csak a fizetettként megjelölt számlák, a fizetés dátuma szerint.</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Munkalapok száma</CardTitle>
            <CardDescription>Hány új munka érkezett havonta.</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkOrderChart data={workOrderData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Munkalapok állapot szerint</CardTitle>
            <CardDescription>Az összes (nem csak a friss) munkalap jelenlegi státusza.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={statusData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legjövedelmezőbb tételek</CardTitle>
            <CardDescription>Melyik munkadíj/alkatrész hozta a legtöbb bevételt eddig.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopItemsList items={topItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
