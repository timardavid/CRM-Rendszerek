import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { activityIcon, activityIconColor, activitySentence } from "@/lib/activity-format";
import { cn } from "@/lib/utils";

export default async function ActivityPage() {
  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Aktivitás napló</h1>
        <p className="text-sm text-muted-foreground">Ki, mikor és mit csinált a rendszerben — az utolsó 200 esemény.</p>
      </div>

      {logs.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">Még nincs rögzített aktivitás.</CardContent>
        </Card>
      )}

      {/* Mobil: egyszerű, elválasztott lista (nem külön kártyák egymás alatt) */}
      {logs.length > 0 && (
        <Card className="md:hidden">
          <CardContent className="divide-y divide-border p-0">
            {logs.map((log) => {
              const Icon = activityIcon(log.action);
              return (
                <div key={log.id} className="flex items-center gap-3 p-3">
                  <Icon className={cn("h-4 w-4 shrink-0", activityIconColor(log.action))} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      <span className="font-medium">{log.userName}</span> {activitySentence(log)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {log.createdAt.toLocaleString("hu-HU")}
                      {log.details ? ` · ${log.details}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Asztali: táblázat */}
      {logs.length > 0 && (
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Időpont</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Felhasználó</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Esemény</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Részletek</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const Icon = activityIcon(log.action);
                    return (
                      <tr key={log.id} className="border-t border-border">
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                          {log.createdAt.toLocaleString("hu-HU")}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-foreground">{log.userName}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-foreground">
                          <span className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4 shrink-0", activityIconColor(log.action))} />
                            {activitySentence(log)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{log.details ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
