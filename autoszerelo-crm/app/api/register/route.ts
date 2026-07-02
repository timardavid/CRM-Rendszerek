import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { isValidEmail } from "@/lib/validate";

export async function GET() {
  const userCount = await db.user.count();
  return NextResponse.json({ setupDone: userCount > 0 });
}

export async function POST(req: Request) {
  const userCount = await db.user.count();
  if (userCount > 0) {
    return NextResponse.json(
      { error: "A rendszer már be van állítva. Új fiókot a Beállításokban tud létrehozni admin felhasználó." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { companyName, name, email, password } = body ?? {};

  if (!companyName || !name || !email || !password) {
    return NextResponse.json({ error: "Minden mező kitöltése kötelező." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Érvénytelen email cím." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "A jelszónak legalább 8 karakternek kell lennie." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Atomically claim the bootstrap slot: the singleton Settings row's primary
  // key enforces at the database level that only one concurrent request can
  // ever create it, preventing a race where two requests both see userCount
  // === 0 and both end up creating an admin account.
  let user;
  try {
    user = await db.$transaction(async (tx) => {
      await tx.settings.create({ data: { id: "singleton", companyName } });
      return tx.user.create({
        data: {
          name,
          email: String(email).toLowerCase().trim(),
          passwordHash,
          role: "ADMIN",
        },
      });
    });
  } catch {
    return NextResponse.json(
      { error: "A rendszer már be van állítva. Új fiókot a Beállításokban tud létrehozni admin felhasználó." },
      { status: 403 }
    );
  }

  await logActivity({
    userId: user.id,
    userName: user.name,
    action: "register",
    entityType: "User",
    entityId: user.id,
    details: "Kezdeti admin fiók létrehozva",
  });

  return NextResponse.json({ success: true });
}
