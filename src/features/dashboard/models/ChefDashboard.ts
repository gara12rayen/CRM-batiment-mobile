/**
 * Données du tableau de bord du chef de chantier, lues dans les routes existantes de l'API web
 * (mêmes champs que la base). Aucun montant : l'API les retire pour le chef.
 */
import type { ChantierListItem } from "@/features/chantiers/models/Chantier";
import type { TacheStatut } from "@/features/chantiers/models/Tache";

/** Une tâche de GET /planning (tâches datées des chantiers ouverts). */
export type TachePlanning = {
  id: number;
  libelle: string;
  statut: TacheStatut;
  avancement: number;
  dateDebut: string | null;
  dateFin: string | null;
  chantier: { id: number; reference: string; adresse: string; statut: string };
  intervenants: { id: number; nom: string; prenom: string | null; role: string }[];
};

export type PlanningReponse = { du: string; au: string; taches: TachePlanning[] };

export type CommandeStatut = "CREEE" | "ENVOYEE" | "EXPEDIEE" | "PARTIELLE" | "RECUE" | "CLOTUREE" | "ANNULEE";

export const COMMANDE_STATUT: Record<CommandeStatut, string> = {
  CREEE: "Créée",
  ENVOYEE: "Commandée",
  EXPEDIEE: "Expédiée",
  PARTIELLE: "Reçue en partie",
  RECUE: "Reçue",
  CLOTUREE: "Clôturée",
  ANNULEE: "Annulée",
};

/** Livraisons encore attendues sur le chantier. */
export const COMMANDE_EN_ATTENTE: CommandeStatut[] = ["ENVOYEE", "EXPEDIEE", "PARTIELLE"];

/** Une ligne de GET /commandes-fournisseur. */
export type CommandeAttendue = {
  id: number;
  reference: string;
  statutLivraison: CommandeStatut;
  dateLivraisonPrevue: string | null;
  fournisseur: { id: number; nom: string };
  chantier: { id: number; reference: string } | null;
};

export type SavStatut = "OUVERT" | "EN_COURS" | "EN_ATTENTE_CLIENT" | "RESOLU" | "CLOTURE";
export type SavPriorite = "BASSE" | "NORMALE" | "HAUTE" | "URGENTE";

export const SAV_OUVERTS: SavStatut[] = ["OUVERT", "EN_COURS", "EN_ATTENTE_CLIENT"];

export const SAV_STATUT: Record<SavStatut, string> = {
  OUVERT: "Ouvert",
  EN_COURS: "En cours",
  EN_ATTENTE_CLIENT: "Attente client",
  RESOLU: "Résolu",
  CLOTURE: "Clôturé",
};

export const SAV_PRIORITE: Record<SavPriorite, { label: string; couleur: string; fond: string }> = {
  BASSE: { label: "Basse", couleur: "#475569", fond: "#F1F5F9" },
  NORMALE: { label: "Normale", couleur: "#1D4ED8", fond: "#DBEAFE" },
  HAUTE: { label: "Haute", couleur: "#B45309", fond: "#FEF3C7" },
  URGENTE: { label: "Urgente", couleur: "#B91C1C", fond: "#FEE2E2" },
};

/** Une ligne de GET /sav (triée par l'API : urgents d'abord). */
export type SavTicketItem = {
  id: number;
  reference: string;
  titre: string;
  statut: SavStatut;
  priorite: SavPriorite;
  chantierId: number | null;
  createdAt: string;
  client: { id: number; nom: string };
};

/** Un bloc du tableau de bord : chargé indépendamment des autres. */
export type Bloc<T> = { donnees: T[]; total: number; erreur: string | null };

export type ChefDashboardDonnees = {
  chantiersDuJour: Bloc<ChantierListItem>;
  tachesEnRetard: Bloc<TachePlanning>;
  livraisons: Bloc<CommandeAttendue>;
  sav: Bloc<SavTicketItem>;
};
