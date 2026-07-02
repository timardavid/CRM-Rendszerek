"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

type TableSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  rowCount: number;
};

export function TableList({ tables, isAdmin }: { tables: TableSummary[]; isAdmin: boolean }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<TableSummary | null>(null);

  async function handleDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/tables/${pendingDelete.slug}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült törölni a táblát.");
      return;
    }
    toast.success(`"${pendingDelete.name}" tábla törölve.`);
    router.refresh();
  }

  if (tables.length === 0) {
    return <p className="text-sm text-muted-foreground">Még nincs egyedi tábla létrehozva.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex flex-col gap-3 p-5">
              <Link href={`/tables/${t.slug}`} className="flex flex-col gap-1">
                <span className="font-medium text-foreground">{t.name}</span>
                {t.description && <span className="text-sm text-muted-foreground">{t.description}</span>}
                <span className="text-xs text-muted-foreground">{t.rowCount} rekord</span>
              </Link>
              {isAdmin && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => setPendingDelete(t)} aria-label="Tábla törlése">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`"${pendingDelete?.name}" tábla törlése`}
        description="A tábla összes mezője és rekordja véglegesen törlődik."
        confirmLabel="Tábla törlése"
        onConfirm={handleDelete}
      />
    </>
  );
}
