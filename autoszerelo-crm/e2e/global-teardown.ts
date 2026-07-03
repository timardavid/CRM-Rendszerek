import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { QA_EMAIL, QA_PREFIX, AUTH_FILE } from "./global-setup";

export default async function globalTeardown() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  // Customer deletion cascades to its vehicles/work orders (see prisma/schema.prisma).
  await db.customer.deleteMany({ where: { name: { startsWith: QA_PREFIX } } });

  const qaUser = await db.user.findUnique({ where: { email: QA_EMAIL } });
  if (qaUser) {
    await db.activityLog.deleteMany({ where: { userId: qaUser.id } });
    await db.user.delete({ where: { id: qaUser.id } }).catch(() => {});
  }

  await db.$disconnect();
  fs.rmSync(path.dirname(AUTH_FILE), { recursive: true, force: true });
}
