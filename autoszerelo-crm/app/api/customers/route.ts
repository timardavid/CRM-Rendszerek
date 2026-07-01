import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const customers = await db.customer.findMany({
    include: { _count: { select: { vehicles: true, workOrders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ customers });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const body = await req.json();
  const { name, phone, email, address, notes } = body ?? {};
  if (!name) return NextResponse.json({ error: "Az ügyfél neve kötelező." }, { status: 400 });

  const customer = await db.customer.create({
    data: { name, phone: phone || null, email: email || null, address: address || null, notes: notes || null },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "create",
    entityType: "Customer",
    entityId: customer.id,
    details: `Ügyfél létrehozva: ${customer.name}`,
  });

  return NextResponse.json({ customer });
}
