/**
 * Devis IA — same shapes as the API (POST /devis/:id/ia/proposer, …/proposer-photo,
 * …/transcrire, …/appliquer). A chef de chantier receives the same proposal WITHOUT any price.
 * Amounts are Prisma decimals: they may arrive as text ("45.5") → always read with Number().
 */

export type Montant = number | string;

export type PositionMarche = "BAS" | "DANS" | "HAUT";

export type PrixMarche = {
  source: string;
  nombre: number;
  basse: Montant;
  haute: Montant;
  mediane: Montant | null;
};

export type LigneProposition = {
  prestationId: number;
  nom: string;
  categorie: string;
  unite: string;
  quantite: number;
  justification: string;
  /** Absent for a chef de chantier */
  prixUnitaireHT?: Montant;
  totalHT?: Montant;
  marche?: PrixMarche | null;
  positionMarche?: PositionMarche | null;
};

export type AnalysePhoto = {
  piece: string;
  surfaceEstimeeM2: number | null;
  objetReference: boolean;
  elementsVisibles: string[];
  etat: string;
  qualitePhoto: string;
};

export type Proposition = {
  /** false = keyword matching only (no AI key on the server, or the AI failed) */
  modeIA: boolean;
  lignes: LigneProposition[];
  nonCouverts: string[];
  hypotheses: string[];
  totalHT?: Montant;
  avertissement: string | null;
  analysePhoto?: AnalysePhoto | null;
};

/** A proposal line while the user corrects it (texts = what is typed). */
export type LigneEditee = LigneProposition & {
  cle: string;
  quantiteTexte: string;
  prixTexte: string;
};

/** Photos sent to the AI at once (API limit). */
export const MAX_PHOTOS_IA = 3;
/** Shortest description accepted by the API. */
export const DESCRIPTION_MIN = 10;
export const DESCRIPTION_MAX = 3000;
/** Margin under which the recap shows a red alert. */
export const SEUIL_MARGE_ALERTE = 15;
/** After this delay, the waiting screen explains that it can take longer. */
export const ATTENTE_LONGUE_MS = 30_000;

export type Onglet = "texte" | "photo" | "vocal" | "plan";

export const ONGLETS: { value: Onglet; label: string }[] = [
  { value: "texte", label: "Texte" },
  { value: "photo", label: "Photo" },
  { value: "vocal", label: "Vocal" },
  { value: "plan", label: "Plan" },
];

/** « 12,5 » or « 12.5 » → 12.5 ; null when not a positive number. */
export function lireNombre(texte: string): number | null {
  const n = Number(texte.replace(",", ".").trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const versTexte = (n: Montant | null | undefined) => (n === null || n === undefined ? "" : String(Number(n)).replace(".", ","));

/** Margin of a line in %: (sale − cost) / sale. null when unknown. */
export function margeLigne(totalHT?: Montant | null, coutTotal?: Montant | null): number | null {
  const vente = Number(totalHT);
  const cout = Number(coutTotal);
  if (totalHT === undefined || totalHT === null || coutTotal === undefined || coutTotal === null) return null;
  if (!Number.isFinite(vente) || !Number.isFinite(cout) || vente <= 0) return null;
  return ((vente - cout) / vente) * 100;
}

// ── Request reminder (GET /demandes-devis/:id, bureau) ─────────────────────

export type PieceJointeDemande = {
  id: number;
  type: "PHOTO" | "AUDIO";
  dureeSecondes: number | null;
  fichier: { id: number; nom: string; mime: string; taille: number };
};

export type DemandeRappel = {
  id: number;
  reference: string;
  description: string;
  besoinStructure?: Record<string, unknown> | null;
  fichiers?: PieceJointeDemande[];
};

/** Kind of project written in the structured need of the request, if any. */
export function typeProjet(d: DemandeRappel | null): string | null {
  const b = d?.besoinStructure;
  if (!b) return null;
  for (const cle of ["typeProjet", "typeTravaux", "type"]) {
    const v = b[cle];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}
