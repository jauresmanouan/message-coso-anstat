import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { SmsStatus } from "@/lib/types";

// Webhook Orange — accusés de réception (delivery receipts).
// À configurer comme "callbackData" / URL de notification côté developer.orange.com.
// Format: deliveryInfoNotification.deliveryInfo.{ address, deliveryStatus }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const info = body?.deliveryInfoNotification?.deliveryInfo;
  if (!info) return NextResponse.json({ ok: true });

  const resourceURL: string | undefined =
    body?.deliveryInfoNotification?.callbackData ||
    info?.resourceURL;
  const orangeMessageId = resourceURL?.split("/").pop();

  const map: Record<string, SmsStatus> = {
    DeliveredToTerminal: "delivered",
    DeliveryImpossible: "failed",
    DeliveredToNetwork: "sent",
  };
  const status = map[info.deliveryStatus as string];

  if (orangeMessageId && status) {
    await store.updateByOrangeId(orangeMessageId, {
      status,
      ...(status === "delivered"
        ? { deliveredAt: new Date().toISOString() }
        : {}),
    });
  }
  return NextResponse.json({ ok: true });
}
