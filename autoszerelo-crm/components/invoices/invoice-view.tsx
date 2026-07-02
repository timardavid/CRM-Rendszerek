"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Printer, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatHuf, itemTotal } from "@/lib/work-order";

type ItemSnapshot = { type: "LABOR" | "PART"; description: string; quantity: string; unitPrice: string };

export type InvoiceData = {
  id: string;
  number: string;
  type: "QUOTE" | "INVOICE";
  totalAmount: string;
  issuedAt: string;
  paidAt: string | null;
  itemsSnapshot: ItemSnapshot[];
  workOrder: {
    id: string;
    title: string;
    customer: { name: string; phone: string | null; email: string | null; address: string | null };
    vehicle: { licensePlate: string; make: string | null; model: string | null } | null;
  };
  company: {
    companyName: string;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
};

export function InvoiceView({ invoice, isAdmin }: { invoice: InvoiceData; isAdmin: boolean }) {
  const router = useRouter();
  const [paid, setPaid] = useState(Boolean(invoice.paidAt));
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function togglePaid() {
    const next = !paid;
    setPaid(next);
    const res = await fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: next }),
    });
    if (!res.ok) {
      toast.error("Nem sikerült frissíteni.");
      setPaid(!next);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült törölni.");
      return;
    }
    toast.success("Dokumentum törölve.");
    router.push(`/work-orders/${invoice.workOrder.id}`);
  }

  const docLabel = invoice.type === "QUOTE" ? "Árajánlat" : "Számla";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => router.push(`/work-orders/${invoice.workOrder.id}`)}>
          <ArrowLeft className="h-4 w-4" /> Vissza a munkalaphoz
        </Button>
        <div className="flex gap-2">
          {invoice.type === "INVOICE" && (
            <Button variant={paid ? "default" : "outline"} onClick={togglePaid}>
              {paid ? "Fizetve ✓" : "Megjelölés fizetettként"}
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Nyomtatás / PDF mentés
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)} aria-label="Törlés">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 print:border-none print:p-0">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">{invoice.company.companyName}</p>
            {invoice.company.address && <p className="text-sm text-muted-foreground">{invoice.company.address}</p>}
            {invoice.company.contactEmail && <p className="text-sm text-muted-foreground">{invoice.company.contactEmail}</p>}
            {invoice.company.contactPhone && <p className="text-sm text-muted-foreground">{invoice.company.contactPhone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">{docLabel.toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">{invoice.number}</p>
            <p className="text-sm text-muted-foreground">{new Date(invoice.issuedAt).toLocaleDateString("hu-HU")}</p>
            {invoice.type === "INVOICE" && (
              <p className={`text-sm font-medium ${paid ? "text-green-600" : "text-destructive"}`}>
                {paid ? "Fizetve" : "Fizetésre vár"}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">Vevő</p>
          <p className="text-foreground">{invoice.workOrder.customer.name}</p>
          {invoice.workOrder.customer.address && <p className="text-sm text-muted-foreground">{invoice.workOrder.customer.address}</p>}
          {invoice.workOrder.customer.phone && <p className="text-sm text-muted-foreground">{invoice.workOrder.customer.phone}</p>}
          {invoice.workOrder.customer.email && <p className="text-sm text-muted-foreground">{invoice.workOrder.customer.email}</p>}
          {invoice.workOrder.vehicle && (
            <p className="mt-2 text-sm text-muted-foreground">
              Jármű: {invoice.workOrder.vehicle.licensePlate}
              {(invoice.workOrder.vehicle.make || invoice.workOrder.vehicle.model) &&
                ` — ${[invoice.workOrder.vehicle.make, invoice.workOrder.vehicle.model].filter(Boolean).join(" ")}`}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">Munka: {invoice.workOrder.title}</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 text-left font-medium text-muted-foreground">Megnevezés</th>
              <th className="py-2 text-right font-medium text-muted-foreground">Menny.</th>
              <th className="py-2 text-right font-medium text-muted-foreground">Egységár</th>
              <th className="py-2 text-right font-medium text-muted-foreground">Összeg</th>
            </tr>
          </thead>
          <tbody>
            {invoice.itemsSnapshot.map((item, index) => (
              <tr key={index} className="border-b border-border/50">
                <td className="py-2 text-foreground">
                  {item.description}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({item.type === "LABOR" ? "munkadíj" : "alkatrész"})
                  </span>
                </td>
                <td className="py-2 text-right text-foreground">{item.quantity}</td>
                <td className="py-2 text-right text-foreground">{formatHuf(Number(item.unitPrice))}</td>
                <td className="py-2 text-right text-foreground">{formatHuf(itemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <p className="text-lg font-semibold text-foreground">Végösszeg: {formatHuf(Number(invoice.totalAmount))}</p>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`${docLabel} törlése`}
        description="A dokumentum véglegesen törlődik."
        confirmLabel="Törlés"
        onConfirm={handleDelete}
      />
    </div>
  );
}
