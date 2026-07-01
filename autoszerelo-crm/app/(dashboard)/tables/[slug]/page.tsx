import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TableGrid } from "@/components/tables/table-grid";

export default async function TableDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const table = await db.customTable.findUnique({
    where: { slug },
    include: {
      fields: { orderBy: { order: "asc" } },
      rows: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!table) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{table.name}</h1>
        {table.description && <p className="text-sm text-muted-foreground">{table.description}</p>}
      </div>

      <TableGrid
        slug={table.slug}
        fields={table.fields}
        rows={table.rows.map((r) => ({
          id: r.id,
          data: r.data as Record<string, unknown>,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
