// Types partagés — la "fiche technique" de chaque brique.

export type SmsStatus =
  | "pending" // en file d'attente, pas encore envoyé
  | "sent" // accepté par Orange
  | "delivered" // accusé de réception : reçu sur le téléphone
  | "failed"; // échec d'envoi ou de livraison

export interface Candidate {
  id: string;
  nom: string;
  prenom: string;
  telephone: string; // format international, ex: +2250700000000
}

export interface SmsRecord extends Candidate {
  status: SmsStatus;
  message: string;
  orangeMessageId?: string; // identifiant retourné par Orange (pour le suivi)
  error?: string;
  sentAt?: string; // ISO
  deliveredAt?: string; // ISO
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  createdAt: string; // ISO
  records: SmsRecord[];
}

export interface CampaignStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number; // % livrés sur total
  failureRate: number; // % échecs sur total
}
