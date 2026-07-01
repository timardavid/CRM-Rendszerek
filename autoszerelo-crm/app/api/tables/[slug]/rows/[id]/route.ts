import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { slug, id } = await params;
  const table = await db.customTable.findUnique({ where: { slug }, include: { fields: true } });
  if (!table) return NextResponse.json({ error: "Nincs ilyen tábla" }, { status: 404 });

  const existingRow = await db.customRow.findFirst({ where: { id, tableId: table.id } });
  if (!existingRow) return NextResponse.json({ error: "Nincs ilyen rekord" }, { status: 404 });

  const body = await req.json();
  const data = body?.data ?? {};

  for (const field of table.fields) {
    if (field.required && (data[field.key] === undefined || data[field.key] === "")) {
      return NextResponse.json({ error: `"${field.name}" mező kitöltése kötelező.` }, { status: 400 });
    }
  }

  const row = await db.customRow.update({ where: { id }, data: { data } });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "update",
    entityType: `CustomRow:${table.name}`,
    entityId: row.id,
  });

  return NextResponse.json({ row });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const { slug, id } = await params;
  const table = await db.customTable.findUnique({ where: { slug } });
  if (!table) return NextResponse.json({ error: "Nincs ilyen tábla" }, { status: 404 });

  const existingRow = await db.customRow.findFirst({ where: { id, tableId: table.id } });
  if (!existingRow) return NextResponse.json({ error: "Nincs ilyen rekord" }, { status: 404 });

  await db.customRow.delete({ where: { id } });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "delete",
    entityType: `CustomRow:${table.name}`,
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
