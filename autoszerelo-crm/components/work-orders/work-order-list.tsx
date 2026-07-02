"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_ORDER, STATUS_BADGE_CLASSES, formatHuf, itemsTotal } from "@/lib/work-order";
import { cn } from "@/lib/utils";

export type WorkOrderSummary = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  customer: { id: string; name: string };
  vehicle: { id: string; licensePlate: string } | null;
  items: { quantity: number | string; unitPrice: number | string }[];
};

export function WorkOrderList({ workOrders }: { workOrders: WorkOrderSummary[] }) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filtered = statusFilter ? workOrders.filter((w) => w.status === statusFilter) : workOrders;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Munkalapok</h1>
        <Link href="/work-orders/new">
          <Button>
            <Plus className="h-4 w-4" /> Új munkalap
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={statusFilter === null ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(null)}>
          Összes
        </Button>
        {STATUS_ORDER.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-sm text-muted-foreground">Nincs ilyen munkalap.</p>}

      {/* Mobil: kártyás lista */}
      <div className="flex flex-col gap-2 md:hidden">
        {filtered.map((w) => (
          <Link
            key={w.id}
            href={`/work-orders/${w.id}`}
            className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm hover:bg-muted"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{w.title}</span>
              <span className="font-medium text-foreground">{formatHuf(itemsTotal(w.items))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {w.customer.name}
                {w.vehicle && ` · ${w.vehicle.licensePlate}`}
              </span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_BADGE_CLASSES[w.status])}>
                {STATUS_LABELS[w.status] ?? w.status}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Asztali: táblázat */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cím</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ügyfél</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Rendszám</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Státusz</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Összeg</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className="border-t border-border">
                <td className="px-3 py-2">
                  <Link href={`/work-orders/${w.id}`} className="text-foreground hover:underline">
                    {w.title}
                  </Link>
                </td>
                <td className="px-3 py-2 text-foreground">{w.customer.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{w.vehicle?.licensePlate ?? "—"}</td>
                <td className="px-3 py-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_BADGE_CLASSES[w.status])}>
                    {STATUS_LABELS[w.status] ?? w.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-foreground">{formatHuf(itemsTotal(w.items))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
