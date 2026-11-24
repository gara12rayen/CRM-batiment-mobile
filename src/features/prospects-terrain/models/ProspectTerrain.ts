import type { DemandeStatut } from "@/features/demandes/models/Demande";

/**
 * Prospect terrain (GET /prospects-terrain): a contact met on a job site, sent to the sales team.
 * The sender (often a chef de chantier) follows it without any amount.
 */
export type ProspectTerrain = {
  id: number;
  reference: string;
  statut: DemandeStatut;
  description: string;
  createdAt: string;
  updatedAt: string;
  client: { id: number; nom: string; prenom: string | null; telephone: string | null; adresseClient: string | null };
  devis: { id: number; reference: string; statut: string }[];
  _count: { fichiers: number };
  createur?: { id: number; nom: string; prenom: string | null } | null;
};

/** New contact met on the job site (POST /prospects-terrain, field « client »). */
export type NouveauContact = {
  typeClient: "PARTICULIER" | "PROFESSIONNEL";
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
};

/** 409 CLIENT_EXISTANT: clients with the same phone or email (no contact details for a chef). */
export type DoublonClient = {
  id: number;
  nom: string;
  prenom: string | null;
  statut: string;
  telephone?: string | null;
  email?: string | null;
  correspondances: ("TELEPHONE" | "EMAIL")[];
};

export const MAX_FICHIERS_PROSPECT = 20;
