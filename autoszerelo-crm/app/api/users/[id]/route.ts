import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Csak admin törölhet profilt." }, { status: 403 });
  }

  const { id } = await params;

  const totalUsers = await db.user.count();
  if (totalUsers <= 1) {
    return NextResponse.json({ error: "Az utolsó profilt nem törölheted." }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Nincs ilyen felhasználó." }, { status: 404 });

  await db.user.delete({ where: { id } });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "delete",
    entityType: "User",
    entityId: id,
    details: `Profil törölve: ${target.name}`,
  });

  return NextResponse.json({ success: true });
}
