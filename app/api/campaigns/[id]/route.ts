import { NextResponse } from "next/server";
import { store, computeStats } from "@/lib/store";

// GET /api/campaigns/:id — détail complet (records + stats), pour le suivi
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const campaign = await store.getCampaign(id);
  if (!campaign) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ...campaign, stats: computeStats(campaign) });
}
