"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { STATUS_LABELS } from "@/lib/work-order";

export type StatusPoint = { status: string; count: number };

const COLORS = ["#94a3b8", "#60a5fa", "#f59e0b", "#22c55e", "#a78bfa"];

export function StatusChart({ data }: { data: StatusPoint[] }) {
  const chartData = data.map((d) => ({ name: STATUS_LABELS[d.status] ?? d.status, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} munkalap`} contentStyle={{ fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
