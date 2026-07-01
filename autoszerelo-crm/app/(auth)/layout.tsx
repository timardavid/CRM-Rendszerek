import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const companyName = settings?.companyName ?? "CRM";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">{companyName}</h1>
        {children}
      </div>
    </div>
  );
}
