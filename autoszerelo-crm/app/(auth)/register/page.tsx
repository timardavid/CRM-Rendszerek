"use client";

import { useEffect, useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [setupDone, setSetupDone] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/register")
      .then((res) => res.json())
      .then((data) => setSetupDone(Boolean(data.setupDone)))
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("A két jelszó nem egyezik.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      toast.success("Fiók létrehozva, most jelentkezz be.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  if (setupDone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>A rendszer már be van állítva</CardTitle>
          <CardDescription>
            Ehhez a CRM-hez már tartozik admin fiók. Új felhasználót bejelentkezés után, a Beállítások menüben tudsz
            hozzáadni.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Ugrás a bejelentkezéshez</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kezdeti beállítás</CardTitle>
        <CardDescription>Hozd létre a cégedet és az első admin fiókot.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="companyName">Cég neve</Label>
            <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Neved</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Jelszó</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Létrehozás…" : "Fiók létrehozása"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
