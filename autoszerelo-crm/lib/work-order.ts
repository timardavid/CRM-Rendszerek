export const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Fogadva",
  DIAGNOSED: "Diagnosztizálva",
  IN_PROGRESS: "Javítás alatt",
  DONE: "Kész",
  HANDED_OVER: "Átadva",
};

export const STATUS_ORDER = ["RECEIVED", "DIAGNOSED", "IN_PROGRESS", "DONE", "HANDED_OVER"] as const;

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  RECEIVED: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  DIAGNOSED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DONE: "bg-green-500/10 text-green-600 dark:text-green-400",
  HANDED_OVER: "bg-muted text-muted-foreground",
};

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
