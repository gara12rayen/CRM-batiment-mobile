import type { UserRole } from "@/features/auth/models/auth.types";

/**
 * Barre de navigation inférieure : les onglets de chaque rôle, à un seul endroit.
 * 5 onglets au maximum. Chaque onglet n'appelle que des routes autorisées pour ce rôle par l'API.
 */
export type OngletNom =
  | "index"
  | "clients"
  | "prospects"
  | "devis"
  | "chantiers"
  | "planning"
  | "sav"
  | "portail"
  | "profile";

export const ONGLETS_PAR_ROLE: Record<UserRole, OngletNom[]> = {
  ADMIN: ["index", "clients", "devis", "chantiers", "profile"],
  TECHNICO: ["index", "prospects", "clients", "devis", "profile"],
  ASSISTANTE: ["index", "clients", "devis", "chantiers", "profile"],
  CHEF_CHANTIER: ["index", "chantiers", "planning", "sav", "profile"],
  SOUS_TRAITANT: ["portail", "profile"],
  FOURNISSEUR: ["portail", "profile"],
};

export const ongletVisible = (role: UserRole, onglet: OngletNom) => ONGLETS_PAR_ROLE[role]?.includes(onglet) ?? false;
