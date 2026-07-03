import { db } from "@/lib/db";
import { AuthHero } from "@/components/auth/auth-hero";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const companyName = settings?.companyName ?? "CRM";
  const contactEmail = settings?.contactEmail ?? null;
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden w-1/2 items-center justify-center bg-white md:flex">
        <AuthHero companyName={companyName} />
      </div>
      <div className="flex w-full flex-col md:w-1/2">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <h1 className="mb-6 text-center text-2xl font-semibold text-foreground md:hidden">{companyName}</h1>
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <div className="hidden justify-center pb-10 md:flex">
          <p className="text-xs text-muted-foreground">
            {contactEmail ? (
              <>
                Kérdésed van? Írj:{" "}
                <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:text-foreground">
                  {contactEmail}
                </a>
              </>
            ) : (
              `© ${year} ${companyName}`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
