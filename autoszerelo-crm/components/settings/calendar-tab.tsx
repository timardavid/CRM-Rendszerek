"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useHasMounted } from "@/lib/use-has-mounted";

export function CalendarTab({ calendarToken, isAdmin }: { calendarToken: string | null; isAdmin: boolean }) {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const feedUrl =
    hasMounted && calendarToken ? `${window.location.origin}/api/calendar.ics?token=${calendarToken}` : "";

  async function generateToken() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/calendar-token", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      toast.success("Naptár link elkészült.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(feedUrl);
    toast.success("Link vágólapra másolva.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Naptár szinkronizálás</CardTitle>
        <CardDescription>
          Az időponttal rendelkező munkalapok automatikusan megjelennek a telefonod/Google naptáradban, ha
          feliratkozol az alábbi linkre. Nincs szükség jelszóra vagy Google-fiók összekötésre — a link maga a kulcs,
          ezért ne oszd meg illetéktelenekkel.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!calendarToken && isAdmin && (
          <Button className="w-fit" onClick={generateToken} disabled={loading}>
            {loading ? "Generálás…" : "Naptár link létrehozása"}
          </Button>
        )}

        {!calendarToken && !isAdmin && (
          <p className="text-sm text-muted-foreground">A naptár linket még nem hozta létre admin felhasználó.</p>
        )}

        {calendarToken && (
          <>
            <div className="flex gap-2">
              <Input readOnly value={feedUrl} className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={copyUrl} aria-label="Link másolása">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Google Calendar</p>
                <p>
                  Google Calendar → bal oldalt &quot;Egyéb naptárak&quot; melletti + → &quot;URL alapján&quot; →
                  illeszd be a fenti linket.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">iPhone / Apple Calendar</p>
                <p>
                  Beállítások → Naptár → Fiókok → Fiók hozzáadása → Egyéb → Naptár-előfizetés hozzáadása → illeszd
                  be a fenti linket.
                </p>
              </div>
            </div>

            {isAdmin && (
              <Button variant="outline" className="w-fit" onClick={() => setConfirmOpen(true)}>
                <RefreshCw className="h-4 w-4" /> Link újragenerálása
              </Button>
            )}
          </>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Naptár link újragenerálása"
        description="A régi link ezután nem fog működni, a már feliratkozott naptáraidban le kell cserélned az újra."
        confirmLabel="Újragenerálás"
        onConfirm={generateToken}
      />
    </Card>
  );
}
