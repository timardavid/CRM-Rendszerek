export function AuthHero({ companyName }: { companyName: string }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-10 text-center">
      <span className="text-lg font-semibold text-gray-900">{companyName}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/auth-illustration.svg" alt="" className="h-64 w-auto" />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Biztonságos hozzáférés</h2>
        <p className="text-sm text-gray-500">A fiókod és az ügyféladatok titkosítva, védett kapcsolaton át érhetők el.</p>
      </div>
    </div>
  );
}
