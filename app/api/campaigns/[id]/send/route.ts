import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { sendSms } from "@/lib/orange";

// POST /api/campaigns/:id/send — envoie tous les SMS encore "pending".
// Envoi séquentiel léger pour respecter les quotas Orange.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const campaign = await store.getCampaign(id);
  if (!campaign) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const pending = campaign.records.filter((r) => r.status === "pending");
  let sent = 0;
  let failed = 0;

  for (const rec of pending) {
    const result = await sendSms(rec.telephone, rec.message);
    if (result.ok) {
      await store.updateRecord(campaign.id, rec.id, {
        status: "sent",
        orangeMessageId: result.orangeMessageId,
        sentAt: new Date().toISOString(),
        error: undefined,
      });
      sent++;
    } else {
      await store.updateRecord(campaign.id, rec.id, {
        status: "failed",
        error: result.error,
      });
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, processed: pending.length });
}
