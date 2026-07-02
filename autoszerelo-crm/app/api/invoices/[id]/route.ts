import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/authz";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { id } = await params;
  const existing = await db.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Nincs ilyen dokumentum" }, { status: 404 });

  const body = await req.json();
  const paid = Boolean(body?.paid);

  const invoice = await db.invoice.update({
    where: { id },
    data: { paidAt: paid ? new Date() : null },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "update",
    entityType: "Invoice",
    entityId: invoice.id,
    details: `${invoice.number} megjelölve: ${paid ? "fizetve" : "nem fizetve"}`,
  });

  return NextResponse.json({ invoice });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const forbidden = requireAdmin(session, "Csak admin törölhet számlát/árajánlatot.");
  if (forbidden) return forbidden;

  const { id } = await params;
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Nincs ilyen dokumentum" }, { status: 404 });

  await db.invoice.delete({ where: { id } });

  await logActivity({
    userId: session!.user.id,
    userName: session!.user.name ?? "Ismeretlen",
    action: "delete",
    entityType: "Invoice",
    entityId: id,
    details: `${invoice.number} törölve`,
  });

  return NextResponse.json({ success: true });
}
