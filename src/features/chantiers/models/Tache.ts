/**
 * Tâche de chantier — mêmes champs que la base de la version web
 * (prisma : model Tache, AffectationTache, TacheChecklistItem, enum TacheStatut).
 */
export type TacheStatut = "A_FAIRE" | "EN_COURS" | "BLOQUEE" | "TERMINEE";

export const TACHE_STATUT: Record<TacheStatut, { label: string; couleur: string; fond: string }> = {
  A_FAIRE: { label: "À faire", couleur: "#475569", fond: "#F1F5F9" },
  EN_COURS: { label: "En cours", couleur: "#1D4ED8", fond: "#DBEAFE" },
  BLOQUEE: { label: "Bloquée", couleur: "#B91C1C", fond: "#FEE2E2" },
  TERMINEE: { label: "Terminée", couleur: "#15803D", fond: "#DCFCE7" },
};

export const TACHE_STATUTS: TacheStatut[] = ["A_FAIRE", "EN_COURS", "BLOQUEE", "TERMINEE"];

export type Intervenant = { id: number; nom: string; prenom: string | null; role: string };

export type ChecklistItem = {
  id: number;
  libelle: string;
  fait: boolean;
  ordre: number;
  faitLe: string | null;
  faitPar: { id: number; nom: string; prenom: string | null } | null;
};

/** Réponse de GET /chantiers/:id/taches (et de POST / PATCH d'une tâche). */
export type Tache = {
  id: number;
  chantierId: number;
  libelle: string;
  description: string | null;
  statut: TacheStatut;
  dateDebut: string | null;
  dateFin: string | null;
  /** 0–100 ; suit la checklist quand la tâche en a une */
  avancement: number;
  /** Note libre sur la tâche (un seul texte, pas encore un fil de commentaires) */
  commentaire: string | null;
  ordre: number;
  affectations: { id: number; userId: number | null; user: Intervenant | null }[];
  checklist: ChecklistItem[];
};

/** Réponse des routes de checklist : la tâche recalculée avec sa checklist. */
export type TacheChecklistReponse = Pick<Tache, "id" | "statut" | "avancement" | "checklist">;

/** Champs envoyés à POST /chantiers/:id/taches. */
export type TacheCreation = {
  libelle: string;
  description?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  /** Comptes utilisateurs (chef, sous-traitants…) */
  assigneeIds?: number[];
};

/** Champs envoyés à PATCH /chantiers/:id/taches/:tacheId. */
export type TacheModification = Partial<TacheCreation> & {
  statut?: TacheStatut;
  avancement?: number;
  commentaire?: string | null;
};

export const intervenantsDe = (t: Pick<Tache, "affectations">): Intervenant[] =>
  t.affectations.map((a) => a.user).filter((u): u is Intervenant => u !== null);

/** En retard : pas terminée et date de fin (ou de début si pas de fin) avant aujourd'hui. */
export function estEnRetard(t: { statut: TacheStatut; dateDebut: string | null; dateFin: string | null }, aujourdHui: string, jourDe: (d?: string | null) => string | null): boolean {
  if (t.statut === "TERMINEE") return false;
  const limite = jourDe(t.dateFin) ?? jourDe(t.dateDebut);
  return limite !== null && limite < aujourdHui;
}
