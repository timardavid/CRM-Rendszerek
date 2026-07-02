import { formatHuf } from "@/lib/work-order";

export type TopItem = { description: string; count: number; revenue: number };

export function TopItemsList({ items }: { items: TopItem[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Még nincs elég adat.</p>;

  const maxRevenue = Math.max(...items.map((i) => i.revenue));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.description} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              {item.description} <span className="text-muted-foreground">({item.count}×)</span>
            </span>
            <span className="font-medium text-foreground">{formatHuf(item.revenue)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary"
              style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
