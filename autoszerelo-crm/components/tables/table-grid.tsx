"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RowFormDialog, type FieldDef } from "@/components/tables/row-form-dialog";

type RowData = {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
};

function formatValue(field: FieldDef, value: unknown) {
  if (value === undefined || value === null || value === "") return "—";
  if (field.type === "BOOLEAN") return value ? "Igen" : "Nem";
  if (field.type === "CURRENCY") return `${value} Ft`;
  return String(value);
}

export function TableGrid({ slug, fields, rows }: { slug: string; fields: FieldDef[]; rows: RowData[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RowData | null>(null);

  async function handleAdd(data: Record<string, unknown>) {
    const res = await fetch(`/api/tables/${slug}/rows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error ?? "Hiba történt.");
      throw new Error(result.error);
    }
    toast.success("Rekord hozzáadva.");
    router.refresh();
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editingRow) return;
    const res = await fetch(`/api/tables/${slug}/rows/${editingRow.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error ?? "Hiba történt.");
      throw new Error(result.error);
    }
    toast.success("Rekord frissítve.");
    router.refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/tables/${slug}/rows/${pendingDelete.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült törölni a rekordot.");
      return;
    }
    toast.success("Rekord törölve.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Új rekord
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {fields.map((f) => (
                <th key={f.id} className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">
                  {f.name}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={fields.length + 1} className="px-3 py-6 text-center text-muted-foreground">
                  Még nincs rekord ebben a táblában.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                {fields.map((f) => (
                  <td key={f.id} className="whitespace-nowrap px-3 py-2 text-foreground">
                    {formatValue(f, row.data[f.key])}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingRow(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setPendingDelete(row)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RowFormDialog open={addOpen} onOpenChange={setAddOpen} fields={fields} onSubmit={handleAdd} title="Új rekord" />

      <RowFormDialog
        open={Boolean(editingRow)}
        onOpenChange={(open) => !open && setEditingRow(null)}
        fields={fields}
        initialData={editingRow?.data}
        onSubmit={handleEdit}
        title="Rekord szerkesztése"
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Rekord törlése"
        description="A rekord véglegesen törlődik a táblából."
        confirmLabel="Törlés"
        onConfirm={handleDelete}
      />
    </div>
  );
}
