"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Megerősítem",
  danger = true,
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={danger ? "border-destructive/50" : undefined}>
        <DialogHeader>
          <DialogTitle className={cn(danger && "flex items-center gap-2 text-destructive")}>
            {danger && <AlertTriangle className="h-5 w-5" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {danger && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Ez a művelet nem visszavonható. Biztosan folytatod?
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Mégse
          </Button>
          <Button variant={danger ? "destructive" : "default"} onClick={handleConfirm} disabled={loading}>
            {loading ? "Folyamatban…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
