/**
 * Before / after photos of the tasks (GET /chantiers/:id/photos) and job site reports
 * (GET /chantiers/:id/rapports). Sent by the chef or the office: validated at once.
 * An author can take back his photo or report during 15 minutes after sending it (API rule).
 */
type Personne = { id: number; nom: string; prenom: string | null };

export type PhotoMoment = "AVANT" | "APRES";

export type PhotoChantier = {
  id: number;
  date: string;
  moment: PhotoMoment;
  commentaire: string | null;
  statut: "EN_ATTENTE" | "VALIDEE" | "MASQUEE";
  createdAt: string;
  fichierId: number;
  tache: { id: number; libelle: string };
  checklistItem: { id: number; libelle: string } | null;
  auteur: Personne;
};

export type PhotosReponse = {
  data: PhotoChantier[];
  totaux: { enAttente: number; validees: number; masquees: number };
};

export type RapportChantier = {
  id: number;
  contenu: string;
  statut: "SOUMIS" | "VALIDE" | "REJETE";
  avancement: number | null;
  createdAt: string;
  auteur: Personne;
  tache: { id: number; libelle: string } | null;
  photos: { id: number; nom: string; mime: string; taille: number }[];
};

export const MAX_PHOTOS_ENVOI = 10;
export const DELAI_SUPPRESSION_MS = 15 * 60_000;

/** My own item, sent less than 15 minutes ago. */
export const supprimable = (auteurId: number, createdAt: string, userId: number | undefined) =>
  auteurId === userId && Date.now() - new Date(createdAt).getTime() < DELAI_SUPPRESSION_MS;

export const MOMENTS: { value: PhotoMoment; label: string }[] = [
  { value: "AVANT", label: "Avant" },
  { value: "APRES", label: "Après" },
];

/** Photos grouped by day, newest first. */
export function parJour(photos: PhotoChantier[]): { jour: string; photos: PhotoChantier[] }[] {
  const groupes = new Map<string, PhotoChantier[]>();
  for (const p of photos) {
    const j = p.date.slice(0, 10);
    groupes.set(j, [...(groupes.get(j) ?? []), p]);
  }
  return [...groupes.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([jour, ps]) => ({ jour, photos: ps }));
}
