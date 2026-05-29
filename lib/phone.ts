// Normalise un numéro vers le format international.
// Par défaut indicatif Côte d'Ivoire (+225) ; configurable via DEFAULT_COUNTRY_CODE.
export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  let n = String(raw).replace(/[\s.\-()]/g, "").trim();
  if (!n) return null;

  const cc = process.env.DEFAULT_COUNTRY_CODE ?? "225";

  if (n.startsWith("00")) n = "+" + n.slice(2);
  if (n.startsWith("+")) {
    return /^\+\d{8,15}$/.test(n) ? n : null;
  }
  // Numéro local sans indicatif -> on préfixe.
  n = n.replace(/^0+/, "");
  const full = `+${cc}${n}`;
  return /^\+\d{8,15}$/.test(full) ? full : null;
}
