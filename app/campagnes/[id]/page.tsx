"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, Badge, StatCard } from "@/components/ui";
import { StatsChart } from "@/components/StatsChart";
import { exportCampaign } from "@/lib/export";
import type { Campaign, CampaignStats } from "@/lib/types";

type Detail = Campaign & { stats: CampaignStats };

export default function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<Detail | null>(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${id}`);
    if (res.ok) setData(await res.json());
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Rafraîchit pour capter les accusés de réception qui arrivent en continu.
  useEffect(() => {
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  async function handleSend() {
    setSending(true);
    await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    await load();
    setSending(false);
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted">
        Chargement…
      </main>
    );
  }

  const s = data.stats;
  const records =
    filter === "all"
      ? data.records
      : data.records.filter((r) => r.status === filter);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/campagnes"
            className="text-xs font-semibold text-muted hover:text-orange-dark"
          >
            ← Campagnes
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            {data.name}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => exportCampaign(data.name, data.records)}
          >
            Exporter
          </Button>
          <Button onClick={handleSend} disabled={sending || s.pending === 0}>
            {sending
              ? "Envoi en cours…"
              : s.pending > 0
                ? `Envoyer (${s.pending})`
                : "Tout envoyé"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total" value={s.total} />
        <StatCard label="Envoyés" value={s.sent} />
        <StatCard label="Livrés" value={s.delivered} accent />
        <StatCard label="En attente" value={s.pending} />
        <StatCard label="Échecs" value={s.failed} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="mb-2 text-sm font-semibold">Répartition</p>
          <StatsChart stats={s} />
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-green-50 py-3">
              <p className="text-2xl font-extrabold text-green-700">
                {s.deliveryRate}%
              </p>
              <p className="text-xs text-muted">Taux de livraison</p>
            </div>
            <div className="rounded-xl bg-red-50 py-3">
              <p className="text-2xl font-extrabold text-red-600">
                {s.failureRate}%
              </p>
              <p className="text-xs text-muted">Taux d'échec</p>
            </div>
          </div>
        </Card>

        {/* Tableau de suivi */}
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Suivi des candidats</p>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-border px-2 py-1 text-xs outline-none focus:border-orange"
            >
              <option value="all">Tous</option>
              <option value="delivered">Livrés</option>
              <option value="sent">Envoyés</option>
              <option value="pending">En attente</option>
              <option value="failed">Échecs</option>
            </select>
          </div>
          <div className="max-h-[28rem] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-xs text-muted">
                <tr className="border-b border-border">
                  <th className="py-2 font-medium">Candidat</th>
                  <th className="py-2 font-medium">Téléphone</th>
                  <th className="py-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2.5 font-medium">
                      {r.prenom} {r.nom}
                    </td>
                    <td className="py-2.5 text-muted">{r.telephone}</td>
                    <td className="py-2.5">
                      <Badge status={r.status} />
                      {r.error && (
                        <span className="ml-2 text-xs text-red-500">
                          {r.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {!records.length && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted">
                      Aucun candidat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
