"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  initialCompanyName: string;
  initialAccentColor: string;
  initialContactEmail: string;
  initialContactPhone: string;
  initialAddress: string;
};

export function BrandingTab({
  initialCompanyName,
  initialAccentColor,
  initialContactEmail,
  initialContactPhone,
  initialAddress,
}: Props) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [accentColor, setAccentColor] = useState(initialAccentColor);
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [contactPhone, setContactPhone] = useState(initialContactPhone);
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, accentColor, contactEmail, contactPhone, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      toast.success("Beállítások mentve.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cégadatok</CardTitle>
        <CardDescription>
          A cég neve jelenik meg a CRM címeként mindenhol (böngésző fül, bejelentkezés, oldalsáv). A lenti
          elérhetőségek pedig az árajánlatok és számlák fejlécén jelennek meg.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="companyName">Cég neve</Label>
            <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accentColor">Elsődleges szín</Label>
            <div className="flex items-center gap-2">
              <input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-14 rounded-md border border-border bg-card"
              />
              <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="max-w-32" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactEmail">Kapcsolattartó email</Label>
            <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactPhone">Telefonszám</Label>
            <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Cím</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-fit">
            {loading ? "Mentés…" : "Mentés"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
