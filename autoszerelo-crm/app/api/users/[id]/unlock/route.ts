import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Csak admin oldhatja fel a zárolást." }, { status: 403 });
  }

  const { id } = await params;
  const target = await db.user.update({
    where: { id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "update",
    entityType: "User",
    entityId: id,
    details: `Fiók feloldva: ${target.name}`,
  });

  return NextResponse.json({ success: true });
}
