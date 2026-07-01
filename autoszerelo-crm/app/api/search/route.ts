import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ customers: [], vehicles: [], workOrders: [] });

  const [customers, vehicles, workOrders] = await Promise.all([
    db.customer.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, phone: true },
      take: 5,
    }),
    db.vehicle.findMany({
      where: { licensePlate: { contains: q, mode: "insensitive" } },
      select: { id: true, licensePlate: true, make: true, model: true, customerId: true },
      take: 5,
    }),
    db.workOrder.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, customer: { select: { name: true } } },
      take: 5,
    }),
  ]);

  return NextResponse.json({ customers, vehicles, workOrders });
}
