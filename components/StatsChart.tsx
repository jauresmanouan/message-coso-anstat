"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { CampaignStats } from "@/lib/types";

const COLORS = {
  delivered: "#16a34a",
  sent: "#2563eb",
  pending: "#a1a1aa",
  failed: "#dc2626",
};

export function StatsChart({ stats }: { stats: CampaignStats }) {
  const data = [
    { key: "delivered", name: "Livrés", value: stats.delivered },
    { key: "sent", name: "Envoyés", value: stats.sent },
    { key: "pending", name: "En attente", value: stats.pending },
    { key: "failed", name: "Échecs", value: stats.failed },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        Aucune donnée à afficher
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((d) => (
            <Cell key={d.key} fill={COLORS[d.key as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
