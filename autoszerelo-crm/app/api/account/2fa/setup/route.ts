import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  const issuer = settings?.companyName ?? "CRM";

  const secret = speakeasy.generateSecret({
    name: `${issuer} (${session.user.email})`,
  });

  await db.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret.base32, twoFactorEnabled: false },
  });

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url ?? "");

  return NextResponse.json({ secret: secret.base32, qrCodeDataUrl });
}
