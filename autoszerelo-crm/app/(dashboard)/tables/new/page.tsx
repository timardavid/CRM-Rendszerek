"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FIELD_TYPES = [
  { value: "TEXT", label: "Szöveg" },
  { value: "TEXTAREA", label: "Hosszabb szöveg" },
  { value: "NUMBER", label: "Szám" },
  { value: "CURRENCY", label: "Pénzösszeg" },
  { value: "DATE", label: "Dátum" },
  { value: "BOOLEAN", label: "Igen/Nem" },
  { value: "SELECT", label: "Legördülő lista" },
] as const;

type FieldDraft = {
  name: string;
  type: (typeof FIELD_TYPES)[number]["value"];
  required: boolean;
  options: string;
};

export default function NewTablePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDraft[]>([{ name: "", type: "TEXT", required: false, options: "" }]);
  const [loading, setLoading] = useState(false);

  function updateField(index: number, patch: Partial<FieldDraft>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function addField() {
    setFields((prev) => [...prev, { name: "", type: "TEXT", required: false, options: "" }]);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const cleanFields = fields.filter((f) => f.name.trim());
    if (!name.trim() || cleanFields.length === 0) {
      toast.error("Adj meg egy nevet és legalább egy mezőt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          fields: cleanFields.map((f) => ({
            name: f.name,
            type: f.type,
            required: f.required,
            options: f.type === "SELECT" ? f.options.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hiba történt.");
        return;
      }
      toast.success("Tábla létrehozva.");
      router.push(`/tables/${data.table.slug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Új egyedi tábla</h1>

      <Card>
        <CardHeader>
          <CardTitle>Alapadatok</CardTitle>
          <CardDescription>Pl. „Járművek”, „Szervizmunkák”, „Beszállítók”.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tableName">Tábla neve</Label>
              <Input id="tableName" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tableDescription">Leírás (opcionális)</Label>
              <Input id="tableDescription" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Mezők</Label>
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-md border border-border p-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Mező neve, pl. Rendszám"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                    />
                    <select
                      className="h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as FieldDraft["type"] })}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeField(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {field.type === "SELECT" && (
                    <Input
                      placeholder="Lehetőségek vesszővel elválasztva, pl. Új,Folyamatban,Kész"
                      value={field.options}
                      onChange={(e) => updateField(index, { options: e.target.value })}
                    />
                  )}
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    Kötelező mező
                  </label>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addField}>
                <Plus className="h-4 w-4" /> Mező hozzáadása
              </Button>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Létrehozás…" : "Tábla létrehozása"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
