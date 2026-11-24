import type { ChantierStatut } from "@/features/chantiers/models/Chantier";

/**
 * Job site sheet. Two sources, same screen:
 *  - GET /chantiers/:id (bureau, chef de chantier: his job sites) — never an amount for the chef
 *  - GET /portail/sous-traitant/chantiers/:id (sous-traitant: job sites opened to him, no price,
 *    no client phone)
 */
type Personne = { id?: number; nom: string; prenom?: string | null; telephone?: string | null; email?: string | null };

export type DocumentChantier = {
  id: number;
  nom: string;
  type: string;
  url: string | null;
  fichierId: number | null;
  createdAt: string;
};

export type TacheResume = { id: number; libelle: string; statut: string; avancement: number; dateDebut: string | null; dateFin: string | null };

export type ChantierFiche = {
  id: number;
  reference: string;
  statut: ChantierStatut;
  adresse: string;
  description: string | null;
  /** Internal notes: not sent to the sous-traitant */
  notes?: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  avancement: number;
  client: Personne;
  chefChantier: Personne | null;
  taches: TacheResume[];
  documents: DocumentChantier[];
  /** Free format of the plan editor (read only here) */
  plan2d?: Record<string, unknown> | null;
  devis?: { id: number; reference: string; statut: string }[];
};

export type ActionStatut = { action: "demarrer" | "suspendre" | "reprendre" | "terminer"; label: string; confirmer?: string };

/** Status buttons of the chef / bureau (same steps as the API). */
export const ACTIONS_STATUT: Partial<Record<ChantierStatut, ActionStatut[]>> = {
  PLANIFIE: [{ action: "demarrer", label: "Démarrer le chantier" }],
  EN_COURS: [
    { action: "terminer", label: "Terminer le chantier", confirmer: "Le chantier passera « Terminé ». Le bureau pourra ensuite le clôturer." },
    { action: "suspendre", label: "Suspendre" },
  ],
  SUSPENDU: [{ action: "reprendre", label: "Reprendre le chantier" }],
};

export type PieceDuPlan = { nom: string; detail: string | null };

/**
 * The plan editor format is free: shows the rooms when the plan has a list of rooms
 * (pieces / rooms / zones with a name and a surface), else nothing more than « plan disponible ».
 */
export function piecesDuPlan(plan: Record<string, unknown> | null | undefined): PieceDuPlan[] {
  if (!plan) return [];
  const liste = [plan.pieces, plan.rooms, plan.zones].find(Array.isArray) as unknown[] | undefined;
  if (!liste) return [];
  return liste
    .map((p) => {
      const o = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
      const nom = [o.nom, o.name, o.label].find((v) => typeof v === "string") as string | undefined;
      const surface = [o.surface, o.surfaceM2, o.area].find((v) => typeof v === "number") as number | undefined;
      return nom ? { nom, detail: surface !== undefined ? `${String(surface).replace(".", ",")} m²` : null } : null;
    })
    .filter((p): p is PieceDuPlan => p !== null);
}
