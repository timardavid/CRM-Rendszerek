"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatHuf, itemsTotal } from "@/lib/work-order";

export type ItemDraft = {
  type: "LABOR" | "PART";
  description: string;
  quantity: string;
  unitPrice: string;
};

export const EMPTY_ITEM: ItemDraft = { type: "LABOR", description: "", quantity: "1", unitPrice: "0" };

export function ItemEditor({ items, onChange }: { items: ItemDraft[]; onChange: (items: ItemDraft[]) => void }) {
  function update(index: number, patch: Partial<ItemDraft>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    onChange([...items, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  const total = itemsTotal(items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice })));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Vegyél fel egy sort minden elvégzett munkára (<strong>Munkadíj</strong>) és minden felhasznált
        alkatrészre (<strong>Alkatrész</strong>) külön-külön. Ezekből számolja a rendszer az összeget, és ezek
        kerülnek majd az árajánlatra/számlára is.
      </p>

      {/* Mobil: kártyás elrendezés, mezőnként feliratozva */}
      <div className="flex flex-col gap-3 md:hidden">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <select
                aria-label="Tétel típusa"
                className="h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                value={item.type}
                onChange={(e) => update(index, { type: e.target.value as ItemDraft["type"] })}
              >
                <option value="LABOR">Munkadíj</option>
                <option value="PART">Alkatrész</option>
              </select>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} aria-label="Tétel törlése">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Megnevezés</Label>
              <Input
                placeholder="pl. Fékbetét csere"
                value={item.description}
                onChange={(e) => update(index, { description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Mennyiség</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => update(index, { quantity: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Egységár (Ft)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={item.unitPrice}
                  onChange={(e) => update(index, { unitPrice: e.target.value })}
                />
              </div>
            </div>
            <p className="text-right text-sm font-medium text-foreground">
              {formatHuf(Number(item.quantity || 0) * Number(item.unitPrice || 0))}
            </p>
          </div>
        ))}
      </div>

      {/* Asztali: táblázat-szerű rács */}
      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[560px]">
          {items.length > 0 && (
            <div className="grid grid-cols-[110px_1fr_90px_120px_90px_auto] gap-2 px-1 pb-1 text-xs font-medium text-muted-foreground">
              <span>Típus</span>
              <span>Megnevezés</span>
              <span>Mennyiség</span>
              <span>Egységár (Ft)</span>
              <span className="text-right">Sor összesen</span>
              <span />
            </div>
          )}
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[110px_1fr_90px_120px_90px_auto] items-center gap-2">
                <select
                  aria-label="Tétel típusa"
                  className="h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                  value={item.type}
                  onChange={(e) => update(index, { type: e.target.value as ItemDraft["type"] })}
                >
                  <option value="LABOR">Munkadíj</option>
                  <option value="PART">Alkatrész</option>
                </select>
                <Input
                  aria-label="Megnevezés"
                  placeholder="pl. Fékbetét csere"
                  value={item.description}
                  onChange={(e) => update(index, { description: e.target.value })}
                />
                <Input
                  aria-label="Mennyiség"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => update(index, { quantity: e.target.value })}
                />
                <Input
                  aria-label="Egységár forintban"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={item.unitPrice}
                  onChange={(e) => update(index, { unitPrice: e.target.value })}
                />
                <span className="text-right text-sm font-medium text-foreground">
                  {formatHuf(Number(item.quantity || 0) * Number(item.unitPrice || 0))}
                </span>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} aria-label="Tétel törlése">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button type="button" variant="outline" onClick={addItem} className="w-fit">
        <Plus className="h-4 w-4" /> Tétel hozzáadása
      </Button>
      <p className="text-right text-sm font-medium text-foreground">Összesen: {formatHuf(total)}</p>
    </div>
  );
}
