import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { buildCsv } from "@/lib/csv";
import { STATUS_LABELS } from "@/lib/work-order";

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Csak admin exportálhat." }, { status: 403 });
  }

  const { type } = await params;

  let csv: string;
  let filename: string;

  if (type === "customers") {
    const customers = await db.customer.findMany({
      include: { _count: { select: { vehicles: true, workOrders: true } } },
      orderBy: { name: "asc" },
    });
    csv = buildCsv(
      ["Név", "Telefonszám", "Email", "Cím", "Járművek száma", "Munkalapok száma", "Létrehozva"],
      customers.map((c) => [
        c.name,
        c.phone,
        c.email,
        c.address,
        c._count.vehicles,
        c._count.workOrders,
        c.createdAt.toISOString(),
      ])
    );
    filename = "ugyfelek.csv";
  } else if (type === "work-orders") {
    const workOrders = await db.workOrder.findMany({
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { licensePlate: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    csv = buildCsv(
      ["Cím", "Ügyfél", "Rendszám", "Státusz", "Összeg (Ft)", "Létrehozva", "Időpont"],
      workOrders.map((w) => [
        w.title,
        w.customer.name,
        w.vehicle?.licensePlate ?? "",
        STATUS_LABELS[w.status] ?? w.status,
        w.items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0),
        w.createdAt.toISOString(),
        w.scheduledAt?.toISOString() ?? "",
      ])
    );
    filename = "munkalapok.csv";
  } else if (type === "invoices") {
    const invoices = await db.invoice.findMany({
      include: { workOrder: { include: { customer: { select: { name: true } } } } },
      orderBy: { issuedAt: "desc" },
    });
    csv = buildCsv(
      ["Szám", "Típus", "Ügyfél", "Munka", "Összeg (Ft)", "Kiállítva", "Fizetve"],
      invoices.map((inv) => [
        inv.number,
        inv.type === "QUOTE" ? "Árajánlat" : "Számla",
        inv.workOrder.customer.name,
        inv.workOrder.title,
        inv.totalAmount.toString(),
        inv.issuedAt.toISOString(),
        inv.paidAt ? inv.paidAt.toISOString() : "",
      ])
    );
    filename = "szamlak.csv";
  } else {
    return NextResponse.json({ error: "Ismeretlen export típus." }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
