import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { InvoiceView } from "@/components/invoices/invoice-view";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [invoice, settings] = await Promise.all([
    db.invoice.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            customer: true,
            vehicle: true,
          },
        },
      },
    }),
    db.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!invoice) notFound();

  return (
    <InvoiceView
      invoice={{
        id: invoice.id,
        number: invoice.number,
        type: invoice.type,
        totalAmount: invoice.totalAmount.toString(),
        issuedAt: invoice.issuedAt.toISOString(),
        paidAt: invoice.paidAt?.toISOString() ?? null,
        itemsSnapshot: invoice.itemsSnapshot as {
          type: "LABOR" | "PART";
          description: string;
          quantity: string;
          unitPrice: string;
        }[],
        workOrder: {
          id: invoice.workOrder.id,
          title: invoice.workOrder.title,
          customer: {
            name: invoice.workOrder.customer.name,
            phone: invoice.workOrder.customer.phone,
            email: invoice.workOrder.customer.email,
            address: invoice.workOrder.customer.address,
          },
          vehicle: invoice.workOrder.vehicle
            ? {
                licensePlate: invoice.workOrder.vehicle.licensePlate,
                make: invoice.workOrder.vehicle.make,
                model: invoice.workOrder.vehicle.model,
              }
            : null,
        },
        company: {
          companyName: settings?.companyName ?? "CRM",
          address: settings?.address ?? null,
          contactEmail: settings?.contactEmail ?? null,
          contactPhone: settings?.contactPhone ?? null,
        },
      }}
    />
  );
}
