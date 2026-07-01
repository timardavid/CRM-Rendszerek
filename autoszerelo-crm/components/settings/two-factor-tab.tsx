"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function TwoFactorTab({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  async function startSetup() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      setQrCodeDataUrl(data.qrCodeDataUrl);
    } finally {
      setLoading(false);
    }
  }

  async function confirmSetup() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hibás kód.");
        return;
      }
      toast.success("Kétfaktoros hitelesítés bekapcsolva.");
      setQrCodeDataUrl(null);
      setCode("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    const res = await fetch("/api/account/2fa/disable", { method: "POST" });
    if (!res.ok) {
      toast.error("Nem sikerült kikapcsolni.");
      return;
    }
    toast.success("Kétfaktoros hitelesítés kikapcsolva.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kétfaktoros hitelesítés (2FA)</CardTitle>
        <CardDescription>
          Extra védelem a fiókodnak: bejelentkezéskor a jelszó mellett egy telefonos alkalmazásból (pl. Google
          Authenticator, Microsoft Authenticator) kapott, folyamatosan változó 6 jegyű kódot is be kell írnod. Így
          akkor sem tud belépni más, ha kitudódik a jelszavad.{" "}
          <strong>{enabled ? "Jelenleg be van kapcsolva a fiókodon." : "Jelenleg ki van kapcsolva."}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {enabled ? (
          <Button variant="destructive" className="w-fit" onClick={() => setDisableOpen(true)}>
            2FA kikapcsolása
          </Button>
        ) : qrCodeDataUrl ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Olvasd be a kódot egy hitelesítő alkalmazással (pl. Google Authenticator), majd add meg az általa mutatott
              6 jegyű kódot.
            </p>
            <Image src={qrCodeDataUrl} alt="2FA QR kód" width={180} height={180} className="rounded-md border border-border" unoptimized />
            <div className="flex max-w-xs gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6 jegyű kód" />
              <Button onClick={confirmSetup} disabled={loading}>
                Megerősítés
              </Button>
            </div>
          </div>
        ) : (
          <Button className="w-fit" onClick={startSetup} disabled={loading}>
            {loading ? "Folyamatban…" : "2FA bekapcsolása"}
          </Button>
        )}
      </CardContent>

      <ConfirmDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        title="2FA kikapcsolása"
        description="Ez csökkenti a fiókod védelmét. Biztosan kikapcsolod a kétfaktoros hitelesítést?"
        confirmLabel="Kikapcsolás"
        onConfirm={handleDisable}
      />
    </Card>
  );
}
