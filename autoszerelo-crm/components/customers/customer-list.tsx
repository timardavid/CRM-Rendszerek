"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CustomerFormDialog, type CustomerFormValues } from "@/components/customers/customer-form-dialog";

export type CustomerSummary = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  vehicleCount: number;
  workOrderCount: number;
};

export function CustomerList({ customers }: { customers: CustomerSummary[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CustomerSummary | null>(null);

  async function handleAdd(values: CustomerFormValues) {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Hiba történt.");
      throw new Error(data.error);
    }
    toast.success("Ügyfél létrehozva.");
    router.refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/customers/${pendingDelete.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült törölni az ügyfelet.");
      return;
    }
    toast.success("Ügyfél törölve.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Ügyfelek</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Új ügyfél
        </Button>
      </div>

      {customers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Még nincs felvett ügyfél. Kattints az &quot;Új ügyfél&quot; gombra az első felvitelhez — utána hozzá tudsz
          rendelni járműveket és munkalapokat is.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-col gap-2 p-5">
              <Link href={`/customers/${c.id}`} className="flex flex-col gap-1">
                <span className="font-medium text-foreground">{c.name}</span>
                {c.phone && <span className="text-sm text-muted-foreground">{c.phone}</span>}
                {c.email && <span className="text-sm text-muted-foreground">{c.email}</span>}
                <span className="text-xs text-muted-foreground">
                  {c.vehicleCount} jármű · {c.workOrderCount} munkalap
                </span>
              </Link>
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(c)} aria-label="Ügyfél törlése">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CustomerFormDialog open={addOpen} onOpenChange={setAddOpen} title="Új ügyfél" onSubmit={handleAdd} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`"${pendingDelete?.name}" ügyfél törlése`}
        description="Az ügyfél összes járműve és munkalapja is véglegesen törlődik."
        confirmLabel="Ügyfél törlése"
        onConfirm={handleDelete}
      />
    </div>
  );
}
