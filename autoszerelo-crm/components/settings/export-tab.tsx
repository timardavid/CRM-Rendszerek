import { Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EXPORTS = [
  { type: "customers", label: "Ügyfelek", description: "Név, elérhetőségek, jármű- és munkalapszám." },
  { type: "work-orders", label: "Munkalapok", description: "Minden munka, státusz, összeg, időpont." },
  { type: "invoices", label: "Számlák / Árajánlatok", description: "Könyveléshez: szám, összeg, kiállítás és fizetés dátuma." },
];

export function ExportTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adatexport</CardTitle>
        <CardDescription>
          CSV fájlok letöltése könyveléshez vagy biztonsági másolathoz. Excel-ben és Google Sheets-ben is
          megnyithatók.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {EXPORTS.map((exp) => (
          <div key={exp.type} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{exp.label}</p>
              <p className="text-xs text-muted-foreground">{exp.description}</p>
            </div>
            <a href={`/api/export/${exp.type}`} download>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" /> CSV letöltése
              </Button>
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
