import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Csak admin módosíthatja a beállításokat." }, { status: 403 });
  }

  const body = await req.json();
  const { companyName, accentColor, contactEmail, contactPhone, address } = body ?? {};

  if (!companyName) {
    return NextResponse.json({ error: "A cég neve kötelező." }, { status: 400 });
  }

  await db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", companyName, accentColor, contactEmail, contactPhone, address },
    update: { companyName, accentColor, contactEmail, contactPhone, address },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "update",
    entityType: "Settings",
    details: "Cégadatok módosítva",
  });

  return NextResponse.json({ success: true });
}
