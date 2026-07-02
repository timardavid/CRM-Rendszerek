import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * Atomically claims the "first admin" slot: the singleton Settings row's
 * primary key enforces at the database level that only one concurrent
 * caller can ever succeed, preventing a race where two requests both see
 * userCount === 0 and both end up creating an admin account.
 *
 * Returns the created user, or null if the system was already set up.
 */
export async function claimBootstrapAdmin(params: { name: string; email: string; companyName: string; passwordHash?: string }) {
  const passwordHash = params.passwordHash ?? (await bcrypt.hash(randomBytes(32).toString("hex"), 12));

  try {
    return await db.$transaction(async (tx) => {
      await tx.settings.create({ data: { id: "singleton", companyName: params.companyName } });
      return tx.user.create({
        data: {
          name: params.name,
          email: params.email.toLowerCase().trim(),
          passwordHash,
          role: "ADMIN",
        },
      });
    });
  } catch {
    return null;
  }
}
