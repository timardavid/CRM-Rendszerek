import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const totalUsers = await db.user.count();
  if (totalUsers <= 1) {
    return NextResponse.json(
      { error: "Az utolsó fiókot nem törölheted. Előbb hozz létre másik felhasználót." },
      { status: 400 }
    );
  }

  await logActivity({
    userId: null,
    userName: session.user.name ?? "Ismeretlen",
    action: "delete",
    entityType: "User",
    entityId: session.user.id,
    details: "Saját fiók törölve",
  });

  await db.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true });
}
