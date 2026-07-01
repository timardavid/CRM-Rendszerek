import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TableList } from "@/components/tables/table-list";
import { Plus } from "lucide-react";

export default async function TablesPage() {
  const tables = await db.customTable.findMany({
    include: { _count: { select: { rows: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Egyedi táblák</h1>
        <Link href="/tables/new">
          <Button>
            <Plus className="h-4 w-4" /> Új tábla
          </Button>
        </Link>
      </div>

      <TableList
        tables={tables.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          rowCount: t._count.rows,
        }))}
      />
    </div>
  );
}
