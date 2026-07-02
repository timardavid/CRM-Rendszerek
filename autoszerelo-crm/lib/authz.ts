import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export function requireAdmin(session: Session | null, message = "Csak admin végezheti ezt a műveletet.") {
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  return null;
}
