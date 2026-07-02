"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchResults = {
  customers: { id: string; name: string; phone: string | null }[];
  vehicles: { id: string; licensePlate: string; make: string | null; model: string | null; customerId: string }[];
  workOrders: { id: string; title: string; customer: { name: string } }[];
};

const EMPTY: SearchResults = { customers: [], vehicles: [], workOrders: [] };

export function GlobalSearch({ autoFocus, fullWidth }: { autoFocus?: boolean; fullWidth?: boolean } = {}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function go(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  const hasResults = results.customers.length + results.vehicles.length + results.workOrders.length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", !fullWidth && "max-w-sm")}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus={autoFocus}
          placeholder="Keresés: ügyfél, rendszám, munka…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className="pl-8"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-96 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
          {!hasResults && <p className="p-3 text-sm text-muted-foreground">Nincs találat.</p>}

          {results.customers.length > 0 && (
            <div className="border-b border-border p-2">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Ügyfelek</p>
              {results.customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go(`/customers/${c.id}`)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span className="text-foreground">{c.name}</span>
                  {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                </button>
              ))}
            </div>
          )}

          {results.vehicles.length > 0 && (
            <div className="border-b border-border p-2">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Járművek</p>
              {results.vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => go(`/customers/${v.customerId}`)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span className="text-foreground">{v.licensePlate}</span>
                  <span className="text-xs text-muted-foreground">{[v.make, v.model].filter(Boolean).join(" ")}</span>
                </button>
              ))}
            </div>
          )}

          {results.workOrders.length > 0 && (
            <div className="p-2">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Munkalapok</p>
              {results.workOrders.map((w) => (
                <button
                  key={w.id}
                  onClick={() => go(`/work-orders/${w.id}`)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span className="text-foreground">{w.title}</span>
                  <span className="text-xs text-muted-foreground">{w.customer.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
