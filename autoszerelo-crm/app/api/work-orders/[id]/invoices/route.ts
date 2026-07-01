import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { id } = await params;
  const workOrder = await db.workOrder.findUnique({
    where: { id },
    include: { items: { orderBy: { order: "asc" } }, customer: true },
  });
  if (!workOrder) return NextResponse.json({ error: "Nincs ilyen munkalap" }, { status: 404 });
  if (workOrder.items.length === 0) {
    return NextResponse.json({ error: "A munkalapnak nincs tétele, előbb adj hozzá tételeket." }, { status: 400 });
  }

  const body = await req.json();
  const type = body?.type === "INVOICE" ? "INVOICE" : "QUOTE";

  const itemsSnapshot = workOrder.items.map((i) => ({
    type: i.type,
    description: i.description,
    quantity: i.quantity.toString(),
    unitPrice: i.unitPrice.toString(),
  }));
  const totalAmount = workOrder.items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0);

  const year = new Date().getFullYear();
  const prefix = type === "QUOTE" ? "AJ" : "SZ";
  const countThisYear = await db.invoice.count({
    where: { type, issuedAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
  });
  const number = `${prefix}-${year}-${String(countThisYear + 1).padStart(4, "0")}`;

  const invoice = await db.invoice.create({
    data: {
      workOrderId: id,
      number,
      type,
      itemsSnapshot,
      totalAmount,
      createdById: session.user.id,
    },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "create",
    entityType: type === "QUOTE" ? "Quote" : "Invoice",
    entityId: invoice.id,
    details: `${type === "QUOTE" ? "Árajánlat" : "Számla"} kiállítva: ${number} (${workOrder.customer.name})`,
  });

  return NextResponse.json({ invoice });
}
