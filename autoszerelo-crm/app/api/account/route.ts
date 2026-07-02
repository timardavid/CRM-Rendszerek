import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { isValidEmail } from "@/lib/validate";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const body = await req.json();
  const { name, email, currentPassword, newPassword } = body ?? {};

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Nincs ilyen felhasználó" }, { status: 404 });

  const data: { name?: string; email?: string; passwordHash?: string } = {};

  if (name) data.name = name;
  if (email) {
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Érvénytelen email cím." }, { status: 400 });
    }
    data.email = String(email).toLowerCase().trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "A jelenlegi jelszó megadása kötelező." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Hibás jelenlegi jelszó." }, { status: 400 });
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Az új jelszónak legalább 8 karakternek kell lennie." }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await db.user.update({ where: { id: user.id }, data });

  await logActivity({
    userId: user.id,
    userName: name ?? user.name,
    action: "update",
    entityType: "User",
    entityId: user.id,
    details: "Fiókadatok módosítva",
  });

  return NextResponse.json({ success: true });
}
