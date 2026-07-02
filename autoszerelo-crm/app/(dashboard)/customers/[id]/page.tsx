import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CustomerDetail } from "@/components/customers/customer-detail";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: { createdAt: "desc" } },
      workOrders: {
        orderBy: { createdAt: "desc" },
        include: { vehicle: { select: { licensePlate: true } } },
      },
    },
  });

  if (!customer) notFound();

  return (
    <CustomerDetail
      isAdmin={session?.user?.role === "ADMIN"}
      customer={{
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        notes: customer.notes,
        vehicles: customer.vehicles,
        workOrders: customer.workOrders.map((w) => ({
          id: w.id,
          title: w.title,
          status: w.status,
          createdAt: w.createdAt.toISOString(),
          vehicle: w.vehicle,
        })),
      }}
    />
  );
}
