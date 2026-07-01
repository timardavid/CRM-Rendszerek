import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table2, Users, Activity, Layers } from "lucide-react";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function OverviewPage() {
  const [tableCount, userCount, todayActivityCount, tables, recentActivity] = await Promise.all([
    db.customTable.count(),
    db.user.count(),
    db.activityLog.count({ where: { createdAt: { gte: startOfToday() } } }),
    db.customTable.findMany({
      include: { _count: { select: { rows: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const totalRows = tables.reduce((sum, t) => sum + t._count.rows, 0);

  const stats = [
    { label: "Egyedi táblák", value: tableCount, icon: Table2 },
    { label: "Összes rekord", value: totalRows, icon: Layers },
    { label: "Mai aktivitás", value: todayActivityCount, icon: Activity },
    { label: "Felhasználók", value: userCount, icon: Users },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Áttekintés</h1>

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
            <CardTitle>Táblák</CardTitle>
            <CardDescription>Gyors hozzáférés a nyilvántartásokhoz.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {tables.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Még nincs egyedi tábla. Hozz létre egyet a{" "}
                <Link href="/tables/new" className="text-primary underline">
                  Egyedi táblák
                </Link>{" "}
                menüben.
              </p>
            )}
            {tables.map((t) => (
              <Link
                key={t.id}
                href={`/tables/${t.slug}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="text-foreground">{t.name}</span>
                <span className="text-muted-foreground">{t._count.rows} rekord</span>
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
