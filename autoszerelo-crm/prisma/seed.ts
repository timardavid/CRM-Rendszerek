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

  const existing = await db.customTable.findUnique({ where: { slug: "jarmuvek" } });
  if (existing) {
    console.log("A 'Járművek' tábla már létezik, seed kihagyva.");
    return;
  }

  const table = await db.customTable.create({
    data: {
      name: "Járművek",
      slug: "jarmuvek",
      description: "Beérkezett járművek és szervizmunkák nyilvántartása.",
      fields: {
        create: [
          { name: "Rendszám", key: "rendszam", type: "TEXT", required: true, order: 0 },
          { name: "Ügyfél neve", key: "ugyfel_neve", type: "TEXT", required: true, order: 1 },
          { name: "Telefonszám", key: "telefonszam", type: "TEXT", required: false, order: 2 },
          { name: "Márka és típus", key: "marka_es_tipus", type: "TEXT", required: false, order: 3 },
          {
            name: "Státusz",
            key: "statusz",
            type: "SELECT",
            required: true,
            options: JSON.stringify(["Fogadva", "Folyamatban", "Kész", "Átadva"]),
            order: 4,
          },
          { name: "Várható bevétel", key: "varhato_bevetel", type: "CURRENCY", required: false, order: 5 },
          { name: "Megjegyzés", key: "megjegyzes", type: "TEXTAREA", required: false, order: 6 },
        ],
      },
    },
  });

  await db.customRow.createMany({
    data: [
      {
        tableId: table.id,
        data: {
          rendszam: "ABC-123",
          ugyfel_neve: "Kiss Péter",
          telefonszam: "+36 20 111 2222",
          marka_es_tipus: "Opel Astra",
          statusz: "Folyamatban",
          varhato_bevetel: 45000,
          megjegyzes: "Fékbetét csere, olajcsere.",
        },
      },
      {
        tableId: table.id,
        data: {
          rendszam: "XYZ-987",
          ugyfel_neve: "Nagy Anna",
          telefonszam: "+36 30 333 4444",
          marka_es_tipus: "Suzuki Vitara",
          statusz: "Kész",
          varhato_bevetel: 28000,
          megjegyzes: "Vizsgáztatás, futómű ellenőrzés.",
        },
      },
    ],
  });

  console.log("Seed kész: Kovács Autószerviz Kft. + Járművek tábla példa adatokkal.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
