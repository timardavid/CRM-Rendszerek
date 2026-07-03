import "dotenv/config";
import path from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Isolated identity/data used only by the e2e suite — never real customer data.
// global-teardown.ts removes everything created here after the run.
export const QA_EMAIL = "qa-e2e@local.test";
export const QA_PASSWORD = "QaE2ePlaywright!2026";
export const QA_PREFIX = "QA-E2E-";
export const AUTH_FILE = path.join(__dirname, ".auth", "admin.json");

export default async function globalSetup(config: FullConfig) {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(QA_PASSWORD, 12);
  await db.user.upsert({
    where: { email: QA_EMAIL },
    update: { passwordHash, role: "ADMIN", lockedUntil: null, failedLoginCount: 0 },
    create: { name: "QA E2E", email: QA_EMAIL, passwordHash, role: "ADMIN" },
  });
  await db.$disconnect();

  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3001";
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${baseURL}/login`);
  await page.fill("#email", QA_EMAIL);
  await page.fill("#password", QA_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${baseURL}/`, { timeout: 15_000 });
  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
}
