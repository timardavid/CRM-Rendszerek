import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

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
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "A jelszónak legalább 8 karakternek kell lennie." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: "ADMIN",
    },
  });

  await db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", companyName },
    update: { companyName },
  });

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
