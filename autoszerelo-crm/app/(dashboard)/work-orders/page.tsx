import { auth } from "@/auth";
import { db } from "@/lib/db";
import { WorkOrderList } from "@/components/work-orders/work-order-list";

export default async function WorkOrdersPage() {
  const session = await auth();
  const workOrders = await db.workOrder.findMany({
    include: {
      customer: { select: { id: true, name: true } },
      vehicle: { select: { id: true, licensePlate: true } },
      items: { select: { quantity: true, unitPrice: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <WorkOrderList
      isAdmin={session?.user?.role === "ADMIN"}
      workOrders={workOrders.map((w) => ({
        id: w.id,
        title: w.title,
        status: w.status,
        createdAt: w.createdAt.toISOString(),
        customer: w.customer,
        vehicle: w.vehicle,
        items: w.items.map((i) => ({ quantity: i.quantity.toString(), unitPrice: i.unitPrice.toString() })),
      }))}
    />
  );
}
