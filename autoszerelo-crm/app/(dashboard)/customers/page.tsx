import { db } from "@/lib/db";
import { CustomerList } from "@/components/customers/customer-list";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    include: { _count: { select: { vehicles: true, workOrders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <CustomerList
      customers={customers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        vehicleCount: c._count.vehicles,
        workOrderCount: c._count.workOrders,
      }))}
    />
  );
}
