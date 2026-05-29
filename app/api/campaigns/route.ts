import { NextResponse } from "next/server";
import { store, computeStats } from "@/lib/store";
import { normalizePhone } from "@/lib/phone";
import type { Campaign, SmsRecord } from "@/lib/types";

// GET /api/campaigns — liste des campagnes avec leurs stats
export async function GET() {
  const campaigns = await store.listCampaigns();
  return NextResponse.json(
    campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      message: c.message,
      createdAt: c.createdAt,
      stats: computeStats(c),
    })),
  );
}

interface CreateBody {
  name: string;
  message: string;
  candidates: { nom: string; prenom: string; telephone: string }[];
}

// POST /api/campaigns — crée une campagne à partir des candidats importés
export async function POST(req: Request) {
  const body = (await req.json()) as CreateBody;
  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }
  if (!body.candidates?.length) {
    return NextResponse.json({ error: "Aucun candidat" }, { status: 400 });
  }

  const records: SmsRecord[] = body.candidates.map((c, i) => {
    const tel = normalizePhone(c.telephone);
    return {
      id: `r${i}`,
      nom: c.nom ?? "",
      prenom: c.prenom ?? "",
      telephone: tel ?? c.telephone,
      message: personalize(body.message, c),
      status: tel ? "pending" : "failed",
      error: tel ? undefined : "Numéro invalide",
    };
  });

  const campaign: Campaign = {
    id: `c${Date.now()}`,
    name: body.name?.trim() || "Campagne COSO",
    message: body.message,
    createdAt: new Date().toISOString(),
    records,
  };
  await store.createCampaign(campaign);
  return NextResponse.json({ id: campaign.id });
}

// Personnalisation simple : {prenom} {nom} dans le message.
function personalize(
  template: string,
  c: { nom: string; prenom: string },
): string {
  return template
    .replaceAll("{prenom}", c.prenom ?? "")
    .replaceAll("{nom}", c.nom ?? "");
}
