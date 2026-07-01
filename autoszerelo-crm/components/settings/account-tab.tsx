"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  initialName: string;
  initialEmail: string;
};

export function AccountTab({ initialName, initialEmail }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      toast.success("Fiókadatok frissítve.");
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fiók adatok</CardTitle>
        <CardDescription>Név, email cím és jelszó módosítása.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accName">Név</Label>
            <Input id="accName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accEmail">Email</Label>
            <Input id="accEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Jelenlegi jelszó</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Csak jelszóváltáshoz"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">Új jelszó</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Legalább 8 karakter"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-fit">
            {loading ? "Mentés…" : "Mentés"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
