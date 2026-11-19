/**
 * GET /dashboard/commercial — TECHNICO: his own requests and quotes; ADMIN / ASSISTANTE: the
 * whole company. Amounts are Prisma decimals (may arrive as text): read them with Number().
 */

type ClientCourt = { id: number; nom: string; prenom: string | null; telephone: string | null };

export type DemandeStatut = "NOUVEAU" | "EN_COURS" | "QUALIFIE" | "CONVERTI" | "PERDU";

export const DEMANDE_STATUT: Record<string, { label: string; couleur: string; fond: string }> = {
  NOUVEAU: { label: "Nouvelle", couleur: "#B45309", fond: "#FEF3C7" },
  EN_COURS: { label: "En cours", couleur: "#1D4ED8", fond: "#DBEAFE" },
  QUALIFIE: { label: "Qualifiée", couleur: "#6D28D9", fond: "#EDE9FE" },
};

export type DemandeRecente = {
  id: number;
  reference: string;
  statut: DemandeStatut;
  source: string;
  createdAt: string;
  client: ClientCourt;
};

export type DevisARelancer = {
  id: number;
  reference: string;
  statut: string;
  dateEnvoi: string | null;
  remisLe: string | null;
  totalTTC: number | string | null;
  client: ClientCourt;
};

export type VisiteProchaine = {
  id: number;
  dateHeure: string;
  dureeMinutes: number | null;
  adresse: string | null;
  objet: string | null;
  statut: string;
  client: ClientCourt;
  demandeDevis: { id: number; reference: string; statut: string } | null;
  commercial: { id: number; nom: string; prenom: string | null } | null;
};

export type CommercialDashboard = {
  perimetre: "MOI" | "ENTREPRISE";
  periodeJours: number;
  prospects: { total: number; nouveaux: number; enCours: number; qualifies: number; derniers: DemandeRecente[] };
  devis: { brouillons: number; enAttenteClient: number; acceptes: number; signesPapierAVerifier: number };
  conversion: { envoyes: number; gagnes: number; taux: number | null };
  chiffreAffaires: { signeMoisHT: number | string; devisSignesMois: number };
  aRelancer: { total: number; joursSansReponse: number; items: DevisARelancer[] };
  visites: { aVenir: number; prochaines: VisiteProchaine[] };
};
