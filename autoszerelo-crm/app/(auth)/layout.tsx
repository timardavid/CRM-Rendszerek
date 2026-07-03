import { db } from "@/lib/db";
import { AuthHero } from "@/components/auth/auth-hero";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const companyName = settings?.companyName ?? "CRM";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden w-1/2 items-center justify-center bg-white p-12 md:flex lg:w-3/5">
        <AuthHero companyName={companyName} />
      </div>
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:w-1/2 lg:w-2/5">
        <h1 className="mb-6 text-center text-2xl font-semibold text-foreground md:hidden">{companyName}</h1>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
