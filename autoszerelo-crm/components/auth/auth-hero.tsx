import { Car, Check, Wrench } from "lucide-react";

function ChecklistRow() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600">
        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
      </div>
      <div className="h-2 flex-1 rounded-full bg-blue-100" />
    </div>
  );
}

function FlatIllustration() {
  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      <div className="flex h-56 w-48 -rotate-3 flex-col gap-4 rounded-2xl border border-gray-200 bg-blue-50 p-5">
        <Car className="h-9 w-9 text-blue-600" strokeWidth={1.5} />
        <div className="flex flex-col gap-2.5">
          <ChecklistRow />
          <ChecklistRow />
          <ChecklistRow />
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 flex h-14 w-14 rotate-6 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <Wrench className="h-6 w-6 text-orange-500" strokeWidth={1.6} />
      </div>
    </div>
  );
}

export function AuthHero({ companyName }: { companyName: string }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-10 text-center">
      <span className="text-lg font-semibold text-gray-900">{companyName}</span>
      <FlatIllustration />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Minden a szervized körül</h2>
        <p className="text-sm text-gray-500">Ügyfelek, munkalapok és számlák egy helyen, papír nélkül.</p>
      </div>
    </div>
  );
}
