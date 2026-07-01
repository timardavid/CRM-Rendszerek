import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

const ACTION_LABELS: Record<string, string> = {
  login: "Bejelentkezés",
  logout: "Kijelentkezés",
  register: "Regisztráció",
  create: "Létrehozás",
  update: "Módosítás",
  delete: "Törlés",
};

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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Időpont</th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Felhasználó</th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Művelet</th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Érintett elem</th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">Részletek</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      Még nincs rögzített aktivitás.
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-border">
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {log.createdAt.toLocaleString("hu-HU")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-foreground">{log.userName}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-foreground">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-foreground">{log.entityType}</td>
                    <td className="px-3 py-2 text-muted-foreground">{log.details ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
