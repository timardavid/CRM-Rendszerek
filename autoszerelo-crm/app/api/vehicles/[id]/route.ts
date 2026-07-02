import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/authz";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { licensePlate, make, model, year, vin, notes } = body ?? {};
  if (!licensePlate) return NextResponse.json({ error: "A rendszám kötelező." }, { status: 400 });

  const vehicle = await db.vehicle.update({
    where: { id },
    data: {
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
    action: "update",
    entityType: "Vehicle",
    entityId: vehicle.id,
    details: `Jármű módosítva: ${vehicle.licensePlate}`,
  });

  return NextResponse.json({ vehicle });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const forbidden = requireAdmin(session, "Csak admin törölhet járművet.");
  if (forbidden) return forbidden;

  const { id } = await params;
  const vehicle = await db.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ error: "Nincs ilyen jármű" }, { status: 404 });

  await db.vehicle.delete({ where: { id } });

  await logActivity({
    userId: session!.user.id,
    userName: session!.user.name ?? "Ismeretlen",
    action: "delete",
    entityType: "Vehicle",
    entityId: id,
    details: `Jármű törölve: ${vehicle.licensePlate}`,
  });

  return NextResponse.json({ success: true });
}
