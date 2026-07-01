import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { WorkOrderDetail } from "@/components/work-orders/work-order-detail";

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const workOrder = await db.workOrder.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true } },
      vehicle: { select: { id: true, licensePlate: true } },
      items: { orderBy: { order: "asc" } },
      invoices: { orderBy: { issuedAt: "desc" } },
    },
  });

  if (!workOrder) notFound();

  return (
    <WorkOrderDetail
      workOrder={{
        id: workOrder.id,
        title: workOrder.title,
        description: workOrder.description,
        status: workOrder.status,
        scheduledAt: workOrder.scheduledAt?.toISOString() ?? null,
        customer: workOrder.customer,
        vehicle: workOrder.vehicle,
        items: workOrder.items.map((i) => ({
          type: i.type,
          description: i.description,
          quantity: i.quantity.toString(),
          unitPrice: i.unitPrice.toString(),
        })),
        invoices: workOrder.invoices.map((inv) => ({
          id: inv.id,
          number: inv.number,
          type: inv.type,
          totalAmount: inv.totalAmount.toString(),
          issuedAt: inv.issuedAt.toISOString(),
          paidAt: inv.paidAt?.toISOString() ?? null,
        })),
      }}
    />
  );
}
