"use client";

import { useEffect, useRef, useState, SubmitEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Mail, Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export function LoginForm({ google, github }: { google: boolean; github: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "AccessDenied") {
      toast.error("Ehhez az email címhez nincs fiók a rendszerben. Kérd meg az adminodat, hogy adjon hozzá.");
    } else if (error) {
      toast.error("Nem sikerült bejelentkezni.");
    }
  }, [searchParams]);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        twoFactorCode,
        redirect: false,
      });

      if (result?.code === "2FA_REQUIRED") {
        setNeedsTwoFactor(true);
        toast.info("Add meg a kétfaktoros hitelesítő kódot.");
        return;
      }
      if (result?.code === "2FA_INVALID") {
        toast.error("Hibás 2FA kód.");
        setTwoFactorCode("");
        return;
      }
      if (result?.code?.startsWith("ACCOUNT_LOCKED")) {
        const minutes = result.code.split(":")[1] ?? "15";
        toast.error(`Túl sok sikertelen próbálkozás. Próbáld újra kb. ${minutes} perc múlva.`);
        return;
      }
      if (result?.error) {
        toast.error("Hibás email vagy jelszó.");
        setPassword("");
        passwordRef.current?.focus();
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Bejelentkezés</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Add meg a fiókod adatait a folytatáshoz.</p>
      </div>

      <OAuthButtons google={google} github={github} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              className="pl-8"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Jelszó</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="pl-8 pr-9"
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
        {needsTwoFactor && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="twoFactorCode">Kétfaktoros kód</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="twoFactorCode"
                type="text"
                inputMode="numeric"
                autoFocus
                autoComplete="one-time-code"
                className="pl-8"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">Nyisd meg a hitelesítő appot (pl. Google Authenticator) a kódért.</p>
          </div>
        )}
        <Button type="submit" disabled={loading} className="mt-1">
          {loading ? "Bejelentkezés…" : "Bejelentkezés"}
        </Button>
      </form>
    </div>
  );
}
