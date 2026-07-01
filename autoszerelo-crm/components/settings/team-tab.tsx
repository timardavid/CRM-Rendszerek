"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
};

export function TeamTab({ members, currentUserId }: { members: TeamMember[]; currentUserId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);

  async function handleAdd(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      toast.success("Profil létrehozva.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("STAFF");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/users/${pendingDelete.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Nem sikerült törölni.");
      return;
    }
    toast.success("Profil törölve.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Csapat</CardTitle>
          <CardDescription>
            A rendszerhez hozzáférő profilok. Az utolsó belépés oszlopból látod, ki mikor használta a rendszert
            utoljára.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  {m.name} <span className="text-muted-foreground">({m.role === "ADMIN" ? "admin" : "munkatárs"})</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.email} · 2FA: {m.twoFactorEnabled ? "be" : "ki"} · utolsó belépés:{" "}
                  {m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString("hu-HU") : "még nem"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPendingDelete(m)} aria-label="Profil törlése">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Új profil hozzáadása</CardTitle>
          <CardDescription>
            <strong>Admin</strong>: mindenhez hozzáfér, ő állíthatja be a márkázást, kezelheti a csapatot és láthatja a
            veszélyzónát. <strong>Munkatárs</strong>: a napi munkához fér hozzá (ügyfelek, munkalapok, egyedi táblák),
            de nem módosíthatja a rendszer beállításait és nem adhat hozzá/törölhet más profilt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newName">Név</Label>
                <Input id="newName" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newEmail">Email</Label>
                <Input id="newEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">Jelszó</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newRole">Szerepkör</Label>
                <select
                  id="newRole"
                  className="h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "STAFF")}
                >
                  <option value="STAFF">Munkatárs</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-fit">
              <Plus className="h-4 w-4" /> {loading ? "Létrehozás…" : "Profil hozzáadása"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`"${pendingDelete?.name}" profil törlése`}
        description={
          pendingDelete?.id === currentUserId
            ? "Ez a saját fiókod. Törlés után azonnal kijelentkezel."
            : "A profil és a hozzáférése véglegesen törlődik."
        }
        confirmLabel="Profil törlése"
        onConfirm={handleDelete}
      />
    </div>
  );
}
