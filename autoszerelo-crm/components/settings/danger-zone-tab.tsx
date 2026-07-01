"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function DangerZoneTab() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDeleteAccount() {
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Nem sikerült törölni a fiókot.");
      return;
    }
    toast.success("Fiók törölve.");
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" /> Veszélyzóna
        </CardTitle>
        <CardDescription>Ezek a műveletek visszavonhatatlanok.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-md bg-destructive/10 p-4">
          <div>
            <p className="font-medium text-destructive">Saját fiók törlése</p>
            <p className="text-sm text-destructive/80">A profilod véglegesen törlődik, a hozzáférésed azonnal megszűnik.</p>
          </div>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Fiók törlése
          </Button>
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Fiók törlése"
        description="A fiókod és a hozzá tartozó bejelentkezési adatok véglegesen törlődnek."
        confirmLabel="Végleges törlés"
        onConfirm={handleDeleteAccount}
      />
    </Card>
  );
}
