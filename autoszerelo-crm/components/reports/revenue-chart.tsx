"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatHuf } from "@/lib/work-order";

export type MonthlyPoint = { label: string; value: number };

export function RevenueChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={70} tickFormatter={(v) => formatHuf(v)} />
        <Tooltip formatter={(value) => formatHuf(Number(value))} contentStyle={{ fontSize: 12 }} />
        <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
