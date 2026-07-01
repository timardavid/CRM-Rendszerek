import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { id } = await params;
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) return NextResponse.json({ error: "Nincs ilyen ügyfél" }, { status: 404 });

  const body = await req.json();
  const { licensePlate, make, model, year, vin, notes } = body ?? {};
  if (!licensePlate) return NextResponse.json({ error: "A rendszám kötelező." }, { status: 400 });

  const vehicle = await db.vehicle.create({
    data: {
      customerId: id,
      licensePlate,
      make: make || null,
      model: model || null,
      year: year ? Number(year) : null,
      vin: vin || null,
      notes: notes || null,
    },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "create",
    entityType: "Vehicle",
    entityId: vehicle.id,
    details: `Jármű hozzáadva: ${vehicle.licensePlate} (${customer.name})`,
  });

  return NextResponse.json({ vehicle });
}
