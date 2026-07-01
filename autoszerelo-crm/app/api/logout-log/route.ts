import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: true });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "logout",
    entityType: "User",
    entityId: session.user.id,
  });

  return NextResponse.json({ success: true });
}
