"use client";

import { useEffect, useRef, useState, SubmitEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const companyNameRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!checking && !setupDone) companyNameRef.current?.focus();
  }, [checking, setupDone]);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">A rendszer már be van állítva</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Ehhez a CRM-hez már tartozik admin fiók. Új felhasználót bejelentkezés után, a Beállítások menüben tudsz
            hozzáadni.
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full">Ugrás a bejelentkezéshez</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Kezdeti beállítás</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Hozd létre a cégedet és az első admin fiókot.</p>
      </div>

      <OAuthButtons google={google} github={github} />
      {(google || github) && (
        <p className="-mt-4 text-xs text-muted-foreground">
          A Google/GitHub gombbal egy kattintással létrejön az első admin fiókod a fenti szolgáltató email címével
          és nevével — a cégnevet utólag a Beállításokban tudod megadni.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companyName">Cég neve</Label>
          <Input
            id="companyName"
            ref={companyNameRef}
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Neved</Label>
          <Input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Jelszó</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              className="pr-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              className="pr-9"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={passwordsMismatch}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordsMismatch && <p className="text-xs text-destructive">A két jelszó nem egyezik.</p>}
        </div>
        <Button type="submit" disabled={loading || passwordsMismatch} className="mt-1">
          {loading ? "Létrehozás…" : "Fiók létrehozása"}
        </Button>
      </form>
    </div>
  );
}
