"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wrench, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { STATUS_LABELS, STATUS_BADGE_CLASSES, formatHuf, itemsTotal } from "@/lib/work-order";
import { cn } from "@/lib/utils";

export type OpenWorkOrder = {
  id: string;
  title: string;
  status: string;
  customer: { name: string };
  vehicle: { licensePlate: string } | null;
  items: { quantity: string; unitPrice: string }[];
};

export function OpenWorkOrdersCard({ workOrders, isAdmin }: { workOrders: OpenWorkOrder[]; isAdmin: boolean }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<OpenWorkOrder | null>(null);

  async function handleDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/work-orders/${pendingDelete.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült törölni.");
      return;
    }
    toast.success("Munkalap törölve.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nyitott munkalapok</CardTitle>
        <CardDescription>Folyamatban lévő munkák.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {workOrders.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nincs nyitott munkalap. Hozz létre egyet az{" "}
            <Link href="/work-orders/new" className="text-primary underline">
              Munkalapok
            </Link>{" "}
            menüben.
          </p>
        )}
        {workOrders.map((w) => (
          <div key={w.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm">
            <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Link href={`/work-orders/${w.id}`} className="flex min-w-0 flex-1 flex-col hover:underline">
              <span className="truncate font-medium text-foreground">{w.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {w.customer.name}
                {w.vehicle && ` · ${w.vehicle.licensePlate}`}
              </span>
            </Link>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_BADGE_CLASSES[w.status])}>
                {STATUS_LABELS[w.status] ?? w.status}
              </span>
              <span className="text-xs font-medium text-foreground">{formatHuf(itemsTotal(w.items))}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link href={`/work-orders/${w.id}`}>
                <Button variant="ghost" size="icon" aria-label="Szerkesztés">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              {isAdmin && (
                <Button variant="ghost" size="icon" aria-label="Törlés" onClick={() => setPendingDelete(w)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`"${pendingDelete?.title}" munkalap törlése`}
        description="A munkalap, a tételei és a hozzá tartozó árajánlatok/számlák is véglegesen törlődnek."
        confirmLabel="Munkalap törlése"
        onConfirm={handleDelete}
      />
    </Card>
  );
}
