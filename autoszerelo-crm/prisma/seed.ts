import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  await db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", companyName: "Kovács Autószerviz Kft.", accentColor: "#ea580c" },
    update: {},
  });

  const existing = await db.customer.findFirst({ where: { name: "Kiss Péter" } });
  if (existing) {
    console.log("Példa ügyfelek már léteznek, seed kihagyva.");
    return;
  }

  const kiss = await db.customer.create({
    data: {
      name: "Kiss Péter",
      phone: "+36 20 111 2222",
      email: "kiss.peter@example.com",
      vehicles: {
        create: [{ licensePlate: "ABC-123", make: "Opel", model: "Astra", year: 2015 }],
      },
    },
    include: { vehicles: true },
  });

  const nagy = await db.customer.create({
    data: {
      name: "Nagy Anna",
      phone: "+36 30 333 4444",
      vehicles: {
        create: [{ licensePlate: "XYZ-987", make: "Suzuki", model: "Vitara", year: 2019 }],
      },
    },
    include: { vehicles: true },
  });

  await db.workOrder.create({
    data: {
      customerId: kiss.id,
      vehicleId: kiss.vehicles[0].id,
      title: "Fékbetét csere, olajcsere",
      status: "IN_PROGRESS",
      items: {
        create: [
          { type: "LABOR", description: "Fékbetét csere munkadíj", quantity: 1, unitPrice: 15000, order: 0 },
          { type: "PART", description: "Fékbetét készlet", quantity: 1, unitPrice: 18000, order: 1 },
          { type: "LABOR", description: "Olajcsere munkadíj", quantity: 1, unitPrice: 6000, order: 2 },
          { type: "PART", description: "Motorolaj + szűrő", quantity: 1, unitPrice: 12000, order: 3 },
        ],
      },
    },
  });

  await db.workOrder.create({
    data: {
      customerId: nagy.id,
      vehicleId: nagy.vehicles[0].id,
      title: "Vizsgáztatás, futómű ellenőrzés",
      status: "DONE",
      items: {
        create: [
          { type: "LABOR", description: "Műszaki vizsga ügyintézés", quantity: 1, unitPrice: 10000, order: 0 },
          { type: "LABOR", description: "Futómű ellenőrzés", quantity: 1, unitPrice: 8000, order: 1 },
        ],
      },
    },
  });

  console.log("Seed kész: Kovács Autószerviz Kft. + 2 ügyfél, jármű és munkalap példaadattal.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
