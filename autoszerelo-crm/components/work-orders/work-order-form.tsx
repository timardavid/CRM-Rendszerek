"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemEditor, type ItemDraft, EMPTY_ITEM } from "@/components/work-orders/item-editor";
import { Breadcrumbs } from "@/components/breadcrumbs";

type CustomerOption = {
  id: string;
  name: string;
  vehicles: { id: string; licensePlate: string }[];
};

export function WorkOrderForm({
  customers,
  defaultCustomerId,
}: {
  customers: CustomerOption[];
  defaultCustomerId?: string;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? customers[0]?.id ?? "");
  const [vehicleId, setVehicleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([{ ...EMPTY_ITEM }]);
  const [loading, setLoading] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!customerId || !title.trim()) {
      toast.error("Ügyfél és cím megadása kötelező.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          vehicleId: vehicleId || undefined,
          title,
          description,
          items: items
            .filter((i) => i.description.trim())
            .map((i) => ({ type: i.type, description: i.description, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      toast.success("Munkalap létrehozva.");
      router.push(`/work-orders/${data.workOrder.id}`);
    } finally {
      setLoading(false);
    }
  }

  if (customers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Előbb vegyél fel legalább egy ügyfelet az Ügyfelek menüpontban.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Breadcrumbs items={[{ label: "Munkalapok", href: "/work-orders" }, { label: "Új munkalap" }]} />
      <h1 className="text-2xl font-semibold text-foreground">Új munkalap</h1>
      <Card>
        <CardHeader>
          <CardTitle>Alapadatok</CardTitle>
          <CardDescription>Válaszd ki az ügyfelet, a járművet és add meg a munka tételeit.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="woCustomer">Ügyfél *</Label>
                <select
                  id="woCustomer"
                  className="h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    setVehicleId("");
                  }}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="woVehicle">Jármű</Label>
                <select
                  id="woVehicle"
                  className="h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                >
                  <option value="">Nincs kiválasztva</option>
                  {selectedCustomer?.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="woTitle">Munka címe *</Label>
              <Input id="woTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="pl. Fékbetét csere" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="woDescription">Leírás</Label>
              <textarea
                id="woDescription"
                className="min-h-20 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tételek</Label>
              <ItemEditor items={items} onChange={setItems} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Létrehozás…" : "Munkalap létrehozása"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
