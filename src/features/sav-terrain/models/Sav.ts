/** After-sales ticket (SAV). The chef opens one for a FINISHED job site of his, within the SAV period. */
export type SavStatut = "OUVERT" | "EN_COURS" | "EN_ATTENTE_CLIENT" | "RESOLU" | "CLOTURE";
export type SavCategorie = "DEFAUT_TRAVAUX" | "RETARD" | "FACTURATION" | "QUALITE" | "SAV_TECHNIQUE" | "AUTRE";
export type SavPriorite = "BASSE" | "NORMALE" | "HAUTE" | "URGENTE";

export const SAV_STATUTS: Record<SavStatut, { label: string; couleur: string; fond: string }> = {
  OUVERT: { label: "Ouvert", couleur: "#B45309", fond: "#FEF3C7" },
  EN_COURS: { label: "En cours", couleur: "#1D4ED8", fond: "#DBEAFE" },
  EN_ATTENTE_CLIENT: { label: "Attente client", couleur: "#6D28D9", fond: "#EDE9FE" },
  RESOLU: { label: "Résolu", couleur: "#15803D", fond: "#DCFCE7" },
  CLOTURE: { label: "Clôturé", couleur: "#475569", fond: "#F1F5F9" },
};

export const SAV_CATEGORIES: { value: SavCategorie; label: string }[] = [
  { value: "DEFAUT_TRAVAUX", label: "Défaut des travaux" },
  { value: "QUALITE", label: "Qualité" },
  { value: "SAV_TECHNIQUE", label: "Technique" },
  { value: "RETARD", label: "Retard" },
  { value: "FACTURATION", label: "Facturation" },
  { value: "AUTRE", label: "Autre" },
];

export const SAV_PRIORITES: { value: SavPriorite; label: string }[] = [
  { value: "BASSE", label: "Basse" },
  { value: "NORMALE", label: "Normale" },
  { value: "HAUTE", label: "Haute" },
  { value: "URGENTE", label: "Urgente" },
];

/** GET /sav/chantiers: the job sites and whether a ticket may be opened (finished, in time). */
export type SavChantier = {
  id: number;
  reference: string;
  adresse: string;
  statut: string;
  dateFin: string | null;
  client: { id: number; nom: string; prenom: string | null };
  savPossible: boolean;
  savJusquau: string | null;
  savMotif: string | null;
};

export type SavTicket = {
  id: number;
  reference: string;
  titre: string;
  statut: SavStatut;
  priorite: SavPriorite;
  categorie: SavCategorie | null;
  createdAt: string;
  client: { id: number; nom: string };
};

export const MAX_PHOTOS_SAV = 10;
