import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, twoFactorEnabled: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Csak admin adhat hozzá új profilt." }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role } = body ?? {};

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Minden mező kitöltése kötelező." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "A jelszónak legalább 8 karakternek kell lennie." }, { status: 400 });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return NextResponse.json({ error: "Ez az email cím már foglalt." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: role === "ADMIN" ? "ADMIN" : "STAFF",
    },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "create",
    entityType: "User",
    entityId: user.id,
    details: `Profil létrehozva: ${user.name}`,
  });

  return NextResponse.json({ success: true });
}
