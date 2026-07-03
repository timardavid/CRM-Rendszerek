import { Car, Wrench } from "lucide-react";

export function AuthHero({ companyName }: { companyName: string }) {
  return (
    <div className="relative flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />

      <span className="relative text-lg font-semibold text-gray-900">{companyName}</span>

      <div className="relative flex h-56 w-56 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-blue-100 shadow-inner">
        <Car className="h-24 w-24 text-blue-600" strokeWidth={1.2} />
        <div className="absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
          <Wrench className="h-8 w-8 text-orange-500" strokeWidth={1.6} />
        </div>
      </div>

      <div className="relative space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Minden egy helyen</h2>
        <p className="max-w-xs text-sm text-gray-500">
          Ügyfelek, járművek, munkalapok és számlák — kezeld a szervized napi működését egyetlen felületen.
        </p>
      </div>
    </div>
  );
}
