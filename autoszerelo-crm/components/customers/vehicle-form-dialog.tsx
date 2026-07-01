"use client";

import { useState, SubmitEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type VehicleFormValues = {
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  notes: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial?: Partial<VehicleFormValues>;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
};

const EMPTY: VehicleFormValues = { licensePlate: "", make: "", model: "", year: "", vin: "", notes: "" };

export function VehicleFormDialog({ open, onOpenChange, title, initial, onSubmit }: Props) {
  const [values, setValues] = useState<VehicleFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof VehicleFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!values.licensePlate.trim()) {
      toast.error("A rendszám kötelező.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setValues({ ...EMPTY, ...initial });
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>A jármű adatai.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehPlate">Rendszám *</Label>
            <Input id="vehPlate" placeholder="pl. ABC-123" value={values.licensePlate} onChange={(e) => set("licensePlate", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehMake">Márka</Label>
              <Input id="vehMake" placeholder="pl. Opel" value={values.make} onChange={(e) => set("make", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehModel">Típus</Label>
              <Input id="vehModel" placeholder="pl. Astra" value={values.model} onChange={(e) => set("model", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehYear">Évjárat</Label>
              <Input id="vehYear" type="number" placeholder="pl. 2018" value={values.year} onChange={(e) => set("year", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehVin">Alvázszám (opcionális)</Label>
              <Input id="vehVin" placeholder="VIN azonosító" value={values.vin} onChange={(e) => set("vin", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehNotes">Megjegyzés</Label>
            <textarea
              id="vehNotes"
              className="min-h-16 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Mégse
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Mentés…" : "Mentés"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
