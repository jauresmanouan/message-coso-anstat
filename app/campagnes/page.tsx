"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import type { CampaignStats } from "@/lib/types";

interface Item {
  id: string;
  name: string;
  createdAt: string;
  stats: CampaignStats;
}

export default function CampaignsPage() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Campagnes</h1>
        <Link
          href="/"
          className="rounded-xl bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark"
        >
          + Nouvelle campagne
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {items === null && <p className="text-sm text-muted">Chargement…</p>}
        {items?.length === 0 && (
          <Card>
            <p className="text-center text-sm text-muted">
              Aucune campagne. Crée-en une depuis l&apos;accueil.
            </p>
          </Card>
        )}
        {items?.map((c) => (
          <Link key={c.id} href={`/campagnes/${c.id}`}>
            <Card className="transition-colors hover:border-orange">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-xs text-muted">
                    {new Date(c.createdAt).toLocaleString("fr-FR")} ·{" "}
                    {c.stats.total} destinataires
                  </p>
                </div>
                <div className="flex items-center gap-5 text-center text-xs">
                  <div>
                    <p className="text-lg font-extrabold text-green-700">
                      {c.stats.delivered}
                    </p>
                    <p className="text-muted">Livrés</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-orange-dark">
                      {c.stats.deliveryRate}%
                    </p>
                    <p className="text-muted">Taux</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
