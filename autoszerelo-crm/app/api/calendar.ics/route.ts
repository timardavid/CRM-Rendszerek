import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildIcsCalendar } from "@/lib/ics";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });

  if (!settings?.calendarToken || token !== settings.calendarToken) {
    return NextResponse.json({ error: "Érvénytelen vagy hiányzó token." }, { status: 401 });
  }

  const workOrders = await db.workOrder.findMany({
    where: { scheduledAt: { not: null } },
    include: { customer: true, vehicle: true },
    orderBy: { scheduledAt: "asc" },
  });

  const events = workOrders
    .filter((w) => w.scheduledAt)
    .map((w) => {
      const start = w.scheduledAt as Date;
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const vehiclePart = w.vehicle ? ` (${w.vehicle.licensePlate})` : "";
      return {
        uid: `workorder-${w.id}@${settings.companyName.replace(/\s+/g, "-").toLowerCase()}`,
        start,
        end,
        summary: `${w.title} — ${w.customer.name}${vehiclePart}`,
        description: w.description ?? undefined,
        location: settings.address ?? undefined,
      };
    });

  const ics = buildIcsCalendar(`${settings.companyName} — Munkalapok`, events);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="munkalapok.ics"',
      "Cache-Control": "no-store",
    },
  });
}
