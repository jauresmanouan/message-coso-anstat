// Couche de stockage abstraite — une "prise" standard.
// Aujourd'hui : en mémoire. Demain : Supabase ou SQLite, sans toucher au reste.

import type { Campaign, SmsRecord, SmsStatus } from "./types";

export interface Store {
  createCampaign(c: Campaign): Promise<Campaign>;
  getCampaign(id: string): Promise<Campaign | null>;
  listCampaigns(): Promise<Campaign[]>;
  updateRecord(
    campaignId: string,
    recordId: string,
    patch: Partial<SmsRecord>,
  ): Promise<void>;
  // Mise à jour via l'identifiant Orange (pour les accusés de réception / webhooks)
  updateByOrangeId(
    orangeMessageId: string,
    patch: Partial<SmsRecord>,
  ): Promise<void>;
}

// --- Implémentation en mémoire ---------------------------------------------
// Persiste sur le globalThis pour survivre au hot-reload de Next en dev.

interface MemoryDB {
  campaigns: Map<string, Campaign>;
}

const g = globalThis as unknown as { __cosoDB?: MemoryDB };
const db: MemoryDB = g.__cosoDB ?? { campaigns: new Map() };
g.__cosoDB = db;

class MemoryStore implements Store {
  async createCampaign(c: Campaign) {
    db.campaigns.set(c.id, c);
    return c;
  }

  async getCampaign(id: string) {
    return db.campaigns.get(id) ?? null;
  }

  async listCampaigns() {
    return [...db.campaigns.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async updateRecord(
    campaignId: string,
    recordId: string,
    patch: Partial<SmsRecord>,
  ) {
    const campaign = db.campaigns.get(campaignId);
    if (!campaign) return;
    const rec = campaign.records.find((r) => r.id === recordId);
    if (rec) Object.assign(rec, patch);
  }

  async updateByOrangeId(orangeMessageId: string, patch: Partial<SmsRecord>) {
    for (const campaign of db.campaigns.values()) {
      const rec = campaign.records.find(
        (r) => r.orangeMessageId === orangeMessageId,
      );
      if (rec) {
        Object.assign(rec, patch);
        return;
      }
    }
  }
}

// Point d'injection unique : on change ici pour brancher Supabase/SQLite.
export const store: Store = new MemoryStore();

// Helper de calcul des stats — pur, réutilisable côté serveur ET client.
export function computeStats(campaign: Campaign) {
  const counts: Record<SmsStatus, number> = {
    pending: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
  };
  for (const r of campaign.records) counts[r.status]++;
  const total = campaign.records.length || 0;
  return {
    total,
    ...counts,
    deliveryRate: total ? Math.round((counts.delivered / total) * 100) : 0,
    failureRate: total ? Math.round((counts.failed / total) * 100) : 0,
  };
}
