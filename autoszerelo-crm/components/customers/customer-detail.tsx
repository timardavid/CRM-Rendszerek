"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CustomerFormDialog, type CustomerFormValues } from "@/components/customers/customer-form-dialog";
import { VehicleFormDialog, type VehicleFormValues } from "@/components/customers/vehicle-form-dialog";
import { STATUS_LABELS } from "@/lib/work-order";
import { Breadcrumbs } from "@/components/breadcrumbs";

export type CustomerDetailData = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  vehicles: { id: string; licensePlate: string; make: string | null; model: string | null; year: number | null }[];
  workOrders: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    vehicle: { licensePlate: string } | null;
  }[];
};

export function CustomerDetail({ customer, isAdmin }: { customer: CustomerDetailData; isAdmin: boolean }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteCustomerOpen, setDeleteCustomerOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<CustomerDetailData["vehicles"][number] | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<CustomerDetailData["vehicles"][number] | null>(null);

  async function handleEditCustomer(values: CustomerFormValues) {
    const res = await fetch(`/api/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Hiba történt.");
      throw new Error(data.error);
    }
    toast.success("Ügyfél frissítve.");
    router.refresh();
  }

  async function handleDeleteCustomer() {
    const res = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült törölni.");
      return;
    }
    toast.success("Ügyfél törölve.");
    router.push("/customers");
  }

  async function handleAddVehicle(values: VehicleFormValues) {
    const res = await fetch(`/api/customers/${customer.id}/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Hiba történt.");
      throw new Error(data.error);
    }
    toast.success("Jármű hozzáadva.");
    router.refresh();
  }

  async function handleEditVehicle(values: VehicleFormValues) {
    if (!editVehicle) return;
    const res = await fetch(`/api/vehicles/${editVehicle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Hiba történt.");
      throw new Error(data.error);
    }
    toast.success("Jármű frissítve.");
    router.refresh();
  }

  async function handleDeleteVehicle() {
    if (!deleteVehicle) return;
    const res = await fetch(`/api/vehicles/${deleteVehicle.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült törölni a járművet.");
      return;
    }
    toast.success("Jármű törölve.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Ügyfelek", href: "/customers" }, { label: customer.name }]} />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[customer.phone, customer.email, customer.address].filter(Boolean).join(" · ") || "Nincs elérhetőség megadva"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} aria-label="Ügyfél szerkesztése">
            <Pencil className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={() => setDeleteCustomerOpen(true)} aria-label="Ügyfél törlése">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {customer.notes && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">{customer.notes}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Járművek</CardTitle>
              <CardDescription>Az ügyfélhez tartozó rendszámok.</CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddVehicleOpen(true)}>
              <Plus className="h-4 w-4" /> Jármű
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {customer.vehicles.length === 0 && <p className="text-sm text-muted-foreground">Még nincs jármű felvéve.</p>}
            {customer.vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <span className="text-foreground">
                  {v.licensePlate}
                  {(v.make || v.model) && (
                    <span className="text-muted-foreground"> — {[v.make, v.model].filter(Boolean).join(" ")}</span>
                  )}
                  {v.year && <span className="text-muted-foreground"> ({v.year})</span>}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditVehicle(v)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => setDeleteVehicle(v)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Munkalapok</CardTitle>
              <CardDescription>Korábbi és folyamatban lévő munkák.</CardDescription>
            </div>
            <Link href={`/work-orders/new?customerId=${customer.id}`}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Munkalap
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {customer.workOrders.length === 0 && <p className="text-sm text-muted-foreground">Még nincs munkalap.</p>}
            {customer.workOrders.map((w) => (
              <Link
                key={w.id}
                href={`/work-orders/${w.id}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="text-foreground">
                  {w.title} {w.vehicle && <span className="text-muted-foreground">({w.vehicle.licensePlate})</span>}
                </span>
                <span className="text-muted-foreground">{STATUS_LABELS[w.status] ?? w.status}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Ügyfél szerkesztése"
        initial={{
          name: customer.name,
          phone: customer.phone ?? "",
          email: customer.email ?? "",
          address: customer.address ?? "",
          notes: customer.notes ?? "",
        }}
        onSubmit={handleEditCustomer}
      />

      <VehicleFormDialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen} title="Új jármű" onSubmit={handleAddVehicle} />

      <VehicleFormDialog
        open={Boolean(editVehicle)}
        onOpenChange={(open) => !open && setEditVehicle(null)}
        title="Jármű szerkesztése"
        initial={
          editVehicle
            ? {
                licensePlate: editVehicle.licensePlate,
                make: editVehicle.make ?? "",
                model: editVehicle.model ?? "",
                year: editVehicle.year ? String(editVehicle.year) : "",
              }
            : undefined
        }
        onSubmit={handleEditVehicle}
      />

      <ConfirmDialog
        open={deleteCustomerOpen}
        onOpenChange={setDeleteCustomerOpen}
        title="Ügyfél törlése"
        description="Az ügyfél összes járműve és munkalapja is véglegesen törlődik."
        confirmLabel="Ügyfél törlése"
        onConfirm={handleDeleteCustomer}
      />

      <ConfirmDialog
        open={Boolean(deleteVehicle)}
        onOpenChange={(open) => !open && setDeleteVehicle(null)}
        title={`"${deleteVehicle?.licensePlate}" jármű törlése`}
        description="A jármű adatai véglegesen törlődnek."
        confirmLabel="Jármű törlése"
        onConfirm={handleDeleteVehicle}
      />
    </div>
  );
}
