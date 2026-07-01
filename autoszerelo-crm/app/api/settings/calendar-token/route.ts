import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Csak admin generálhat naptár-tokent." }, { status: 403 });
  }

  const token = randomBytes(24).toString("hex");

  const settings = await db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", companyName: "CRM", calendarToken: token },
    update: { calendarToken: token },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "update",
    entityType: "Settings",
    details: "Naptár-feliratkozási token újragenerálva",
  });

  return NextResponse.json({ calendarToken: settings.calendarToken });
}
