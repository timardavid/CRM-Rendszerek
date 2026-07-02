"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);

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
        return;
      }
      if (result?.code?.startsWith("ACCOUNT_LOCKED")) {
        const minutes = result.code.split(":")[1] ?? "15";
        toast.error(`Túl sok sikertelen próbálkozás. Próbáld újra kb. ${minutes} perc múlva.`);
        return;
      }
      if (result?.error) {
        toast.error("Hibás email vagy jelszó.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bejelentkezés</CardTitle>
        <CardDescription>Add meg a fiókod adatait a folytatáshoz.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {needsTwoFactor && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="twoFactorCode">Kétfaktoros kód</Label>
              <Input
                id="twoFactorCode"
                type="text"
                inputMode="numeric"
                autoFocus
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
              />
            </div>
          )}
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Bejelentkezés…" : "Bejelentkezés"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
