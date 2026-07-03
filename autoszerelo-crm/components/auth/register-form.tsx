"use client";

import { useEffect, useState, SubmitEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export function RegisterForm({ google, github }: { google: boolean; github: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    if (searchParams.get("error")) {
      toast.error("A gyors regisztráció nem sikerült — lehet, hogy közben már létrejött egy admin fiók.");
    }
  }, [searchParams]);

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
      <Card className="shadow-sm">
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
    <Card className="shadow-sm">
      <CardHeader>
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <CardTitle>Kezdeti beállítás</CardTitle>
        <CardDescription>Hozd létre a cégedet és az első admin fiókot.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <OAuthButtons google={google} github={github} />
        {(google || github) && (
          <p className="-mt-2 text-xs text-muted-foreground">
            A Google/GitHub gombbal egy kattintással létrejön az első admin fiókod a fenti szolgáltató email címével
            és nevével — a cégnevet utólag a Beállításokban tudod megadni.
          </p>
        )}
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
