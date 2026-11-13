/**
 * Chantier — mêmes champs et statuts que la base de la version web
 * (prisma : model Chantier, enum ChantierStatut). Le chef de chantier ne reçoit jamais de montant.
 */
export type ChantierStatut = "PLANIFIE" | "EN_COURS" | "SUSPENDU" | "TERMINE" | "CLOTURE" | "ANNULE";

export const CHANTIER_STATUT: Record<ChantierStatut, { label: string; couleur: string; fond: string }> = {
  PLANIFIE: { label: "Planifié", couleur: "#1D4ED8", fond: "#DBEAFE" },
  EN_COURS: { label: "En cours", couleur: "#15803D", fond: "#DCFCE7" },
  SUSPENDU: { label: "Suspendu", couleur: "#B45309", fond: "#FEF3C7" },
  TERMINE: { label: "Terminé", couleur: "#6D28D9", fond: "#EDE9FE" },
  CLOTURE: { label: "Clôturé", couleur: "#475569", fond: "#F1F5F9" },
  ANNULE: { label: "Annulé", couleur: "#B91C1C", fond: "#FEE2E2" },
};

type Personne = { id: number; nom: string; prenom: string | null };

/** Une ligne de GET /chantiers (le chef ne reçoit que SES chantiers). */
export type ChantierListItem = {
  id: number;
  reference: string;
  statut: ChantierStatut;
  adresse: string;
  dateDebut: string | null;
  dateFin: string | null;
  client: Personne;
  chefChantier: Personne | null;
  /** Moyenne de l'avancement des tâches (0–100), calculée par l'API */
  avancement: number;
  nombreTaches: number;
};

/** Partie de GET /chantiers/:id utilisée pour l'en-tête de l'écran des tâches. */
export type ChantierEntete = {
  id: number;
  reference: string;
  statut: ChantierStatut;
  adresse: string;
  dateDebut: string | null;
  dateFin: string | null;
  client: Personne & { telephone?: string | null };
  chefChantier: (Personne & { telephone?: string | null }) | null;
  avancement: number;
};

/** On ne modifie plus les tâches d'un chantier clôturé ou annulé (règle de l'API). */
export const CHANTIER_FERME: ChantierStatut[] = ["CLOTURE", "ANNULE"];
