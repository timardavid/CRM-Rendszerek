import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const workOrders = await db.workOrder.findMany({
    include: {
      customer: { select: { id: true, name: true } },
      vehicle: { select: { id: true, licensePlate: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ workOrders });
}

type ItemInput = { type: "LABOR" | "PART"; description: string; quantity: number; unitPrice: number };

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const body = await req.json();
  const { customerId, vehicleId, title, description, items } = body ?? {};

  if (!customerId || !title) {
    return NextResponse.json({ error: "Ügyfél és cím megadása kötelező." }, { status: 400 });
  }

  const customer = await db.customer.findUnique({ where: { id: customerId } });
  if (!customer) return NextResponse.json({ error: "Nincs ilyen ügyfél." }, { status: 404 });

  const workOrder = await db.workOrder.create({
    data: {
      customerId,
      vehicleId: vehicleId || null,
      title,
      description: description || null,
      createdById: session.user.id,
      items: {
        create: ((items as ItemInput[]) ?? [])
          .filter((i) => i.description?.trim())
          .map((i, index) => ({
            type: i.type === "PART" ? "PART" : "LABOR",
            description: i.description,
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice || 0,
            order: index,
          })),
      },
    },
    include: { items: true },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "create",
    entityType: "WorkOrder",
    entityId: workOrder.id,
    details: `Munkalap létrehozva: ${workOrder.title} (${customer.name})`,
  });

  return NextResponse.json({ workOrder });
}
