"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-[100px_1fr_80px_110px_auto] gap-2 items-center">
          <select
            className="h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground"
            value={item.type}
            onChange={(e) => update(index, { type: e.target.value as ItemDraft["type"] })}
          >
            <option value="LABOR">Munkadíj</option>
            <option value="PART">Alkatrész</option>
          </select>
          <Input
            placeholder="Megnevezés"
            value={item.description}
            onChange={(e) => update(index, { description: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Menny."
            value={item.quantity}
            onChange={(e) => update(index, { quantity: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="Egységár"
            value={item.unitPrice}
            onChange={(e) => update(index, { unitPrice: e.target.value })}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addItem} className="w-fit">
        <Plus className="h-4 w-4" /> Tétel hozzáadása
      </Button>
      <p className="text-right text-sm font-medium text-foreground">
        Összesen: {formatHuf(total)}
      </p>
    </div>
  );
}
