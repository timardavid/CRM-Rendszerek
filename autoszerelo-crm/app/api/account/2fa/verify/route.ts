import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { code } = await req.json();
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.twoFactorSecret) {
    return NextResponse.json({ error: "Előbb indítsd el a 2FA beállítást." }, { status: 400 });
  }

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: String(code ?? "").trim(),
    window: 2,
  });

  if (!valid) return NextResponse.json({ error: "Hibás kód." }, { status: 400 });

  await db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });

  await logActivity({
    userId: user.id,
    userName: user.name,
    action: "update",
    entityType: "User",
    entityId: user.id,
    details: "Kétfaktoros hitelesítés bekapcsolva",
  });

  return NextResponse.json({ success: true });
}
