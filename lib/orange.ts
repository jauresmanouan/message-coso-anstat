// Brique "Orange SMS API" — isolée du reste de l'app.
// Doc: https://developer.orange.com/apis/sms
//
// Variables d'environnement requises (.env.local) :
//   ORANGE_CLIENT_ID, ORANGE_CLIENT_SECRET  -> obtenus sur developer.orange.com
//   ORANGE_SENDER_ADDRESS                   -> ex: "tel:+2250000" ou un nom court
//   ORANGE_SENDER_NAME (optionnel)          -> nom d'expéditeur affiché

const TOKEN_URL = "https://api.orange.com/oauth/v3/token";

// Cache du token en mémoire (évite de redemander à chaque SMS).
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.ORANGE_CLIENT_ID;
  const clientSecret = process.env.ORANGE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Identifiants Orange manquants : définis ORANGE_CLIENT_ID et ORANGE_CLIENT_SECRET dans .env.local",
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Échec d'authentification Orange (${res.status})`);
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

export interface SendResult {
  ok: boolean;
  orangeMessageId?: string;
  error?: string;
}

// Envoie un SMS à un destinataire. `to` doit être au format international (+225...).
export async function sendSms(to: string, message: string): Promise<SendResult> {
  const senderAddress = process.env.ORANGE_SENDER_ADDRESS;
  if (!senderAddress) {
    return { ok: false, error: "ORANGE_SENDER_ADDRESS non défini" };
  }

  try {
    const token = await getAccessToken();
    // L'adresse expéditrice sert aussi dans l'URL de la ressource.
    const encodedSender = encodeURIComponent(senderAddress);
    const url = `https://api.orange.com/smsmessaging/v1/outbound/${encodedSender}/requests`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        outboundSMSMessageRequest: {
          address: `tel:${to}`,
          senderAddress,
          ...(process.env.ORANGE_SENDER_NAME
            ? { senderName: process.env.ORANGE_SENDER_NAME }
            : {}),
          outboundSMSTextMessage: { message },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Orange ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = (await res.json()) as {
      outboundSMSMessageRequest?: { resourceURL?: string };
    };
    // resourceURL contient l'identifiant de la requête, utile pour le suivi.
    const resourceURL = data.outboundSMSMessageRequest?.resourceURL;
    const orangeMessageId = resourceURL?.split("/").pop();
    return { ok: true, orangeMessageId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
