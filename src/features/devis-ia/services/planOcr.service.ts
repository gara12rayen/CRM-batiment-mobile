import type { FichierLocal } from "@/shared/media/media.service";

/**
 * OCR of a plan (PDF) — SIMULATED for now: the API has no plan reading yet.
 * This file is the only one to replace when the real reading exists (same function, same types):
 * the screen does not change.
 */

export type PiecePlan = {
  id: string;
  nom: string;
  /** Dimensions read on the plan, in metres */
  longueurM: number;
  largeurM: number;
  surfaceM2: number;
  /** 0 to 1 — under SEUIL_CONFIANCE the room is shown « à vérifier » */
  confiance: number;
};

export type AnalysePlan = {
  fichier: string;
  simulation: boolean;
  pieces: PiecePlan[];
};

export const SEUIL_CONFIANCE = 0.6;

const MODELES = [
  { nom: "Séjour", l: 5.4, w: 4.1 },
  { nom: "Cuisine", l: 3.6, w: 2.9 },
  { nom: "Chambre 1", l: 3.8, w: 3.2 },
  { nom: "Chambre 2", l: 3.3, w: 3.0 },
  { nom: "Salle de bain", l: 2.6, w: 2.1 },
  { nom: "WC", l: 1.6, w: 0.9 },
  { nom: "Entrée", l: 2.4, w: 1.5 },
];

/** Same file → same result (a simple number taken from the name and size). */
function graine(f: FichierLocal): number {
  let h = 7;
  for (const c of `${f.nom}:${f.taille ?? 0}`) h = (h * 31 + c.charCodeAt(0)) % 100_003;
  return h;
}

const arrondi = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Reads the rooms of a plan. Simulated: 4 to 7 rooms with dimensions and a confidence. */
export async function analyserPlan(fichier: FichierLocal): Promise<AnalysePlan> {
  await new Promise((r) => setTimeout(r, 1200));
  const g = graine(fichier);
  const nombre = 4 + (g % 4);
  const pieces = MODELES.slice(0, nombre).map((m, i) => {
    const variation = 1 + (((g >> i) % 21) - 10) / 100; // ±10 %
    const longueurM = arrondi(m.l * variation);
    const largeurM = arrondi(m.w * variation);
    const confiance = arrondi(0.45 + (((g * (i + 3)) % 50) / 100), 2); // 0.45 → 0.94
    return { id: `p${i + 1}`, nom: m.nom, longueurM, largeurM, surfaceM2: arrondi(longueurM * largeurM, 1), confiance };
  });
  return { fichier: fichier.nom, simulation: true, pieces };
}

const nombreFr = (n: number) => String(n).replace(".", ",");

/** Selected rooms → text for the AI (or for the « Texte » tab). */
export function descriptionDepuisPlan(pieces: PiecePlan[]): string {
  if (!pieces.length) return "";
  const lignes = pieces.map((p) => `- ${p.nom} : ${nombreFr(p.surfaceM2)} m² (${nombreFr(p.longueurM)} × ${nombreFr(p.largeurM)} m)`);
  const total = arrondi(pieces.reduce((s, p) => s + p.surfaceM2, 0), 1);
  return `Pièces relevées sur le plan (surface totale ${nombreFr(total)} m²) :\n${lignes.join("\n")}`;
}
