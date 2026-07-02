import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/authz";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: { createdAt: "desc" } },
      workOrders: {
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, invoices: true },
      },
    },
  });
  if (!customer) return NextResponse.json({ error: "Nincs ilyen ügyfél" }, { status: 404 });

  return NextResponse.json({ customer });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, phone, email, address, notes } = body ?? {};
  if (!name) return NextResponse.json({ error: "Az ügyfél neve kötelező." }, { status: 400 });

  const customer = await db.customer.update({
    where: { id },
    data: { name, phone: phone || null, email: email || null, address: address || null, notes: notes || null },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "update",
    entityType: "Customer",
    entityId: customer.id,
    details: `Ügyfél módosítva: ${customer.name}`,
  });

  return NextResponse.json({ customer });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const forbidden = requireAdmin(session, "Csak admin törölhet ügyfelet.");
  if (forbidden) return forbidden;

  const { id } = await params;
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) return NextResponse.json({ error: "Nincs ilyen ügyfél" }, { status: 404 });

  await db.customer.delete({ where: { id } });

  await logActivity({
    userId: session!.user.id,
    userName: session!.user.name ?? "Ismeretlen",
    action: "delete",
    entityType: "Customer",
    entityId: id,
    details: `Ügyfél törölve: ${customer.name}`,
  });

  return NextResponse.json({ success: true });
}
