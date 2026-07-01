export const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Fogadva",
  DIAGNOSED: "Diagnosztizálva",
  IN_PROGRESS: "Javítás alatt",
  DONE: "Kész",
  HANDED_OVER: "Átadva",
};

export const STATUS_ORDER = ["RECEIVED", "DIAGNOSED", "IN_PROGRESS", "DONE", "HANDED_OVER"] as const;

export function formatHuf(amount: number) {
  return new Intl.NumberFormat("hu-HU").format(amount) + " Ft";
}

export type ItemLike = { quantity: number | string; unitPrice: number | string };

export function itemTotal(item: ItemLike) {
  return Number(item.quantity) * Number(item.unitPrice);
}

export function itemsTotal(items: ItemLike[]) {
  return items.reduce((sum, i) => sum + itemTotal(i), 0);
}
