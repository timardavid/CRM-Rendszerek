import { db } from "@/lib/db";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";

export default async function NewWorkOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;

  const customers = await db.customer.findMany({
    select: { id: true, name: true, vehicles: { select: { id: true, licensePlate: true } } },
    orderBy: { name: "asc" },
  });

  return <WorkOrderForm customers={customers} defaultCustomerId={customerId} />;
}
