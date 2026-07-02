import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { buildMonthGrid, isSameDay, WEEKDAY_LABELS, MONTH_LABELS } from "@/lib/calendar-grid";
import { Button } from "@/components/ui/button";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const year = params.year ? Number(params.year) : today.getFullYear();
  const month = params.month ? Number(params.month) - 1 : today.getMonth();

  const weeks = buildMonthGrid(year, month);
  const rangeStart = weeks[0][0];
  const rangeEnd = weeks[weeks.length - 1][6];
  const rangeEndExclusive = new Date(rangeEnd);
  rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);

  const workOrders = await db.workOrder.findMany({
    where: { scheduledAt: { gte: rangeStart, lt: rangeEndExclusive } },
    include: { customer: { select: { name: true } }, vehicle: { select: { licensePlate: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  const prevMonth = month === 0 ? { year: year - 1, month: 12 } : { year, month };
  const nextDate = new Date(year, month + 1, 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Naptár</h1>
        <p className="text-sm text-muted-foreground">
          Az időponttal rendelkező munkalapok itt jelennek meg. A Beállítások → Naptár fülön feliratkozhatsz erre a
          listára a telefonod/Google naptáradból is.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Link href={`/calendar?year=${prevMonth.year}&month=${month === 0 ? 12 : month}`}>
          <Button variant="outline" size="icon" aria-label="Előző hónap">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-lg font-medium text-foreground">
          {MONTH_LABELS[month]} {year}
        </p>
        <Link href={`/calendar?year=${nextDate.getFullYear()}&month=${nextDate.getMonth() + 1}`}>
          <Button variant="outline" size="icon" aria-label="Következő hónap">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Mobil: napok szerint csoportosított lista, csak a foglalt napok */}
      <div className="flex flex-col gap-3 md:hidden">
        {workOrders.length === 0 && (
          <p className="text-sm text-muted-foreground">Ebben a hónapban nincs beütemezett munka.</p>
        )}
        {weeks
          .flat()
          .filter((day) => day.getMonth() === month)
          .map((day) => {
            const dayOrders = workOrders.filter((w) => w.scheduledAt && isSameDay(w.scheduledAt, day));
            if (dayOrders.length === 0) return null;
            const isToday = isSameDay(day, today);
            return (
              <div key={day.toISOString()} className="flex flex-col gap-2">
                <p className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                  {day.toLocaleDateString("hu-HU", { weekday: "long", month: "long", day: "numeric" })}
                  {isToday && " · ma"}
                </p>
                {dayOrders.map((w) => (
                  <Link
                    key={w.id}
                    href={`/work-orders/${w.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm hover:bg-muted"
                  >
                    <span className="text-foreground">
                      {w.title} <span className="text-muted-foreground">({w.customer.name})</span>
                    </span>
                    <span className="text-muted-foreground">
                      {w.scheduledAt?.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </Link>
                ))}
              </div>
            );
          })}
      </div>

      {/* Asztali: hónap-rács nézet */}
      <div className="hidden overflow-x-auto md:block">
        <div className="grid min-w-[700px] grid-cols-7 gap-px rounded-md border border-border bg-border">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
              {label}
            </div>
          ))}
          {weeks.flat().map((day) => {
            const inMonth = day.getMonth() === month;
            const isToday = isSameDay(day, today);
            const dayOrders = workOrders.filter((w) => w.scheduledAt && isSameDay(w.scheduledAt, day));

            return (
              <div
                key={day.toISOString()}
                className={`flex min-h-24 flex-col gap-1 bg-card p-1.5 ${inMonth ? "" : "opacity-40"}`}
              >
                <span
                  className={`text-xs ${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {day.getDate()}
                </span>
                {dayOrders.slice(0, 3).map((w) => (
                  <Link
                    key={w.id}
                    href={`/work-orders/${w.id}`}
                    className="truncate rounded bg-primary/10 px-1 py-0.5 text-xs text-foreground hover:bg-primary/20"
                    title={`${w.title} — ${w.customer.name}`}
                  >
                    {w.scheduledAt?.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })} {w.title}
                  </Link>
                ))}
                {dayOrders.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{dayOrders.length - 3} további</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
