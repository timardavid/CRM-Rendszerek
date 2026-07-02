import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/authz";

const VALID_STATUSES = ["RECEIVED", "DIAGNOSED", "IN_PROGRESS", "DONE", "HANDED_OVER"];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { id } = await params;
  const workOrder = await db.workOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      items: { orderBy: { order: "asc" } },
      invoices: { orderBy: { issuedAt: "desc" } },
    },
  });
  if (!workOrder) return NextResponse.json({ error: "Nincs ilyen munkalap" }, { status: 404 });

  return NextResponse.json({ workOrder });
}

type ItemInput = { type: "LABOR" | "PART"; description: string; quantity: number; unitPrice: number };

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { id } = await params;
  const existing = await db.workOrder.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Nincs ilyen munkalap" }, { status: 404 });

  const body = await req.json();
  const { title, description, vehicleId, status, scheduledAt, items } = body ?? {};

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Érvénytelen státusz." }, { status: 400 });
  }

  const workOrder = await db.$transaction(async (tx) => {
    if (items) {
      await tx.workOrderItem.deleteMany({ where: { workOrderId: id } });
      await tx.workOrderItem.createMany({
        data: ((items as ItemInput[]) ?? [])
          .filter((i) => i.description?.trim())
          .map((i, index) => ({
            workOrderId: id,
            type: i.type === "PART" ? "PART" : "LABOR",
            description: i.description,
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice || 0,
            order: index,
          })),
      });
    }

    return tx.workOrder.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(vehicleId !== undefined ? { vehicleId: vehicleId || null } : {}),
        ...(scheduledAt !== undefined ? { scheduledAt: scheduledAt ? new Date(scheduledAt) : null } : {}),
        ...(status
          ? {
              status,
              closedAt: status === "HANDED_OVER" ? new Date() : null,
            }
          : {}),
      },
      include: { items: { orderBy: { order: "asc" } } },
    });
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "update",
    entityType: "WorkOrder",
    entityId: workOrder.id,
    details: status ? `Munkalap státusz: ${status}` : `Munkalap módosítva: ${workOrder.title}`,
  });

  return NextResponse.json({ workOrder });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const forbidden = requireAdmin(session, "Csak admin törölhet munkalapot.");
  if (forbidden) return forbidden;

  const { id } = await params;
  const workOrder = await db.workOrder.findUnique({ where: { id } });
  if (!workOrder) return NextResponse.json({ error: "Nincs ilyen munkalap" }, { status: 404 });

  await db.workOrder.delete({ where: { id } });

  await logActivity({
    userId: session!.user.id,
    userName: session!.user.name ?? "Ismeretlen",
    action: "delete",
    entityType: "WorkOrder",
    entityId: id,
    details: `Munkalap törölve: ${workOrder.title}`,
  });

  return NextResponse.json({ success: true });
}
