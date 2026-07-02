import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/authz";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { slug } = await params;
  const table = await db.customTable.findUnique({
    where: { slug },
    include: {
      fields: { orderBy: { order: "asc" } },
      rows: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!table) return NextResponse.json({ error: "Nincs ilyen tábla" }, { status: 404 });

  return NextResponse.json({ table });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const forbidden = requireAdmin(session, "Csak admin törölhet egyedi táblát.");
  if (forbidden) return forbidden;

  const { slug } = await params;
  const table = await db.customTable.findUnique({ where: { slug } });
  if (!table) return NextResponse.json({ error: "Nincs ilyen tábla" }, { status: 404 });

  await db.customTable.delete({ where: { slug } });

  await logActivity({
    userId: session!.user.id,
    userName: session!.user.name ?? "Ismeretlen",
    action: "delete",
    entityType: "CustomTable",
    entityId: table.id,
    details: `Tábla törölve: ${table.name}`,
  });

  return NextResponse.json({ success: true });
}
