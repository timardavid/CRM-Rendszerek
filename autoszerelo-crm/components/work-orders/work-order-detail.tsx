"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, FileText, Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ItemEditor, type ItemDraft } from "@/components/work-orders/item-editor";
import { STATUS_LABELS, STATUS_ORDER, formatHuf } from "@/lib/work-order";
import { Breadcrumbs } from "@/components/breadcrumbs";

export type WorkOrderData = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  customer: { id: string; name: string };
  vehicle: { id: string; licensePlate: string } | null;
  items: ItemDraft[];
  invoices: {
    id: string;
    number: string;
    type: "QUOTE" | "INVOICE";
    totalAmount: string;
    issuedAt: string;
    paidAt: string | null;
  }[];
};

export function WorkOrderDetail({ workOrder }: { workOrder: WorkOrderData }) {
  const router = useRouter();
  const [title, setTitle] = useState(workOrder.title);
  const [description, setDescription] = useState(workOrder.description ?? "");
  const [items, setItems] = useState<ItemDraft[]>(workOrder.items.length ? workOrder.items : []);
  const [status, setStatus] = useState(workOrder.status);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState<"QUOTE" | "INVOICE" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function saveDetails() {
    setSavingDetails(true);
    try {
      const res = await fetch(`/api/work-orders/${workOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        toast.error("Nem sikerült menteni.");
        return;
      }
      toast.success("Mentve.");
      router.refresh();
    } finally {
      setSavingDetails(false);
    }
  }

  async function saveItems() {
    setSavingItems(true);
    try {
      const res = await fetch(`/api/work-orders/${workOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items
            .filter((i) => i.description.trim())
            .map((i) => ({ type: i.type, description: i.description, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
        }),
      });
      if (!res.ok) {
        toast.error("Nem sikerült menteni a tételeket.");
        return;
      }
      toast.success("Tételek mentve.");
      router.refresh();
    } finally {
      setSavingItems(false);
    }
  }

  async function changeStatus(newStatus: string) {
    setStatus(newStatus);
    const res = await fetch(`/api/work-orders/${workOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      toast.error("Nem sikerült a státuszváltás.");
      setStatus(workOrder.status);
      return;
    }
    toast.success(`Státusz: ${STATUS_LABELS[newStatus]}`);
    router.refresh();
  }

  async function createInvoice(type: "QUOTE" | "INVOICE") {
    setCreatingInvoice(type);
    try {
      const res = await fetch(`/api/work-orders/${workOrder.id}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      router.push(`/invoices/${data.invoice.id}`);
    } finally {
      setCreatingInvoice(null);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/work-orders/${workOrder.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült törölni.");
      return;
    }
    toast.success("Munkalap törölve.");
    router.push("/work-orders");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Munkalapok", href: "/work-orders" },
          { label: workOrder.customer.name, href: `/customers/${workOrder.customer.id}` },
          { label: workOrder.title },
        ]}
      />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{workOrder.title}</h1>
          <p className="text-sm text-muted-foreground">
            <Link href={`/customers/${workOrder.customer.id}`} className="hover:underline">
              {workOrder.customer.name}
            </Link>
            {workOrder.vehicle && <> · {workOrder.vehicle.licensePlate}</>}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)} aria-label="Munkalap törlése">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Státusz</CardTitle>
          <CardDescription>
            Kattints arra az állapotra, ahol a munka éppen tart. Ez segít áttekinteni az Áttekintés oldalon, mely
            munkák vannak még folyamatban.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((s) => (
            <Button key={s} size="sm" variant={status === s ? "default" : "outline"} onClick={() => changeStatus(s)}>
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adatok</CardTitle>
          <CardDescription>A munka rövid címe (ez jelenik meg a listákban) és a részletes leírása.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="woTitle">Cím</Label>
            <Input id="woTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="woDescription">Leírás</Label>
            <textarea
              id="woDescription"
              className="min-h-20 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="pl. mit panaszolt az ügyfél, mit találtál diagnosztizáláskor…"
            />
          </div>
          <Button onClick={saveDetails} disabled={savingDetails} className="w-fit">
            {savingDetails ? "Mentés…" : "Mentés"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tételek</CardTitle>
          <CardDescription>Munkadíj és alkatrész tételek — ebből számolódik az árajánlat/számla összege.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ItemEditor items={items} onChange={setItems} />
          <Button onClick={saveItems} disabled={savingItems} className="w-fit">
            {savingItems ? "Mentés…" : "Tételek mentése"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Ne felejtsd el megnyomni a &quot;Tételek mentése&quot; gombot, különben az árajánlat/számla a régi
            tételekkel készül el.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Árajánlat / Számla</CardTitle>
          <CardDescription>
            <strong>Árajánlat</strong>: tájékoztató jellegű, nem kötelezi fizetésre az ügyfelet, munka előtt add oda.{" "}
            <strong>Számla</strong>: hivatalos, fizetési kötelezettséget keletkeztet, a munka végén állítsd ki.
            Mindkettő a fent mentett tételek alapján készül, és utólag is bármikor megnyithatod, kinyomtathatod.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => createInvoice("QUOTE")} disabled={creatingInvoice !== null}>
              <FileText className="h-4 w-4" /> Árajánlat készítése
            </Button>
            <Button onClick={() => createInvoice("INVOICE")} disabled={creatingInvoice !== null}>
              <Receipt className="h-4 w-4" /> Számla készítése
            </Button>
          </div>
          {workOrder.invoices.length > 0 && (
            <div className="flex flex-col gap-2">
              {workOrder.invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="text-foreground">
                    {inv.type === "QUOTE" ? "Árajánlat" : "Számla"} #{inv.number}
                  </span>
                  <span className="text-muted-foreground">
                    {formatHuf(Number(inv.totalAmount))} · {new Date(inv.issuedAt).toLocaleDateString("hu-HU")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Munkalap törlése"
        description="A munkalap és a hozzá tartozó tételek véglegesen törlődnek. A már kiállított árajánlatok/számlák is törlődnek."
        confirmLabel="Munkalap törlése"
        onConfirm={handleDelete}
      />
    </div>
  );
}
