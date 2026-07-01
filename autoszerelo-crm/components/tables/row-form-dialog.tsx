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

export type FieldDef = {
  id: string;
  name: string;
  key: string;
  type: "TEXT" | "TEXTAREA" | "NUMBER" | "CURRENCY" | "DATE" | "BOOLEAN" | "SELECT";
  required: boolean;
  options: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FieldDef[];
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  title: string;
};

export function RowFormDialog({ open, onOpenChange, fields, initialData, onSubmit, title }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(initialData ?? {});
  const [loading, setLoading] = useState(false);

  function setValue(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    for (const field of fields) {
      if (field.required && !values[field.key]) {
        toast.error(`"${field.name}" mező kitöltése kötelező.`);
        return;
      }
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
        if (next) setValues(initialData ?? {});
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Töltsd ki a mezőket, majd mentsd a rekordot.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key}>
                {field.name}
                {field.required && <span className="text-destructive"> *</span>}
              </Label>
              {field.type === "TEXTAREA" && (
                <textarea
                  id={field.key}
                  className="min-h-20 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                  value={(values[field.key] as string) ?? ""}
                  onChange={(e) => setValue(field.key, e.target.value)}
                />
              )}
              {field.type === "BOOLEAN" && (
                <input
                  id={field.key}
                  type="checkbox"
                  className="h-5 w-5"
                  checked={Boolean(values[field.key])}
                  onChange={(e) => setValue(field.key, e.target.checked)}
                />
              )}
              {field.type === "SELECT" && (
                <select
                  id={field.key}
                  className="h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                  value={(values[field.key] as string) ?? ""}
                  onChange={(e) => setValue(field.key, e.target.value)}
                >
                  <option value="">Válassz…</option>
                  {(JSON.parse(field.options ?? "[]") as string[]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
              {(field.type === "TEXT" || field.type === "NUMBER" || field.type === "CURRENCY" || field.type === "DATE") && (
                <Input
                  id={field.key}
                  type={field.type === "NUMBER" || field.type === "CURRENCY" ? "number" : field.type === "DATE" ? "date" : "text"}
                  value={(values[field.key] as string) ?? ""}
                  onChange={(e) => setValue(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
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
