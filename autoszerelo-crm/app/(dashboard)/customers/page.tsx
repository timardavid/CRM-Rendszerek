import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CustomerList } from "@/components/customers/customer-list";

export default async function CustomersPage() {
  const session = await auth();
  const customers = await db.customer.findMany({
    include: { _count: { select: { vehicles: true, workOrders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <CustomerList
      isAdmin={session?.user?.role === "ADMIN"}
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
