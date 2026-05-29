// Export du rapport de campagne en Excel — côté client.
import * as XLSX from "xlsx";
import type { SmsRecord } from "./types";

const STATUS_FR: Record<string, string> = {
  pending: "En attente",
  sent: "Envoyé",
  delivered: "Livré",
  failed: "Échec",
};

export function exportCampaign(name: string, records: SmsRecord[]) {
  const rows = records.map((r) => ({
    Nom: r.nom,
    Prénom: r.prenom,
    Téléphone: r.telephone,
    Statut: STATUS_FR[r.status] ?? r.status,
    "Envoyé le": r.sentAt ? new Date(r.sentAt).toLocaleString("fr-FR") : "",
    "Livré le": r.deliveredAt
      ? new Date(r.deliveredAt).toLocaleString("fr-FR")
      : "",
    Erreur: r.error ?? "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rapport");
  const safe = name.replace(/[^\w\-]+/g, "_").slice(0, 40);
  XLSX.writeFile(wb, `COSO_${safe}.xlsx`);
}
