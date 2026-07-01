import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { slugify, fieldKey } from "@/lib/slug";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const tables = await db.customTable.findMany({
    include: { fields: { orderBy: { order: "asc" } }, _count: { select: { rows: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ tables });
}

type FieldInput = {
  name: string;
  type: "TEXT" | "TEXTAREA" | "NUMBER" | "CURRENCY" | "DATE" | "BOOLEAN" | "SELECT";
  required?: boolean;
  options?: string[];
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const body = await req.json();
  const { name, description, icon, fields } = body ?? {};

  if (!name || !Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json({ error: "Adj meg egy nevet és legalább egy mezőt." }, { status: 400 });
  }

  const slug = slugify(name);
  const existing = await db.customTable.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Már létezik ilyen nevű tábla." }, { status: 409 });
  }

  const table = await db.customTable.create({
    data: {
      name,
      slug,
      description: description || null,
      icon: icon || null,
      createdById: session.user.id,
      fields: {
        create: (fields as FieldInput[]).map((f, index) => ({
          name: f.name,
          key: fieldKey(f.name),
          type: f.type,
          required: Boolean(f.required),
          options: f.options?.length ? JSON.stringify(f.options) : null,
          order: index,
        })),
      },
    },
    include: { fields: true },
  });

  await logActivity({
    userId: session.user.id,
    userName: session.user.name ?? "Ismeretlen",
    action: "create",
    entityType: "CustomTable",
    entityId: table.id,
    details: `Tábla létrehozva: ${table.name}`,
  });

  return NextResponse.json({ table });
}
