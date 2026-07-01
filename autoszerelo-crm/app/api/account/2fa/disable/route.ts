import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  await db.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "update",
    entityType: "User",
    entityId: session.user.id,
    details: "Kétfaktoros hitelesítés kikapcsolva",
  });

  return NextResponse.json({ success: true });
}
