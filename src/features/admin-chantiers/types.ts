export type ChantierStatut = "PLANIFIE" | "EN_COURS" | "SUSPENDU" | "TERMINE";

export type Tache = {
  id: string;
  titre: string;
  faite: boolean;
};

export type Rapport = {
  id: string;
  date: string;
  auteur: string;
  texte: string;
};

export type Chantier = {
  id: string;
  nom: string;
  client: string;
  adresse: string;
  statut: ChantierStatut;
  dateDebut: string; // JJ/MM/AAAA
  dateFinPrevue: string; // JJ/MM/AAAA
  taches: Tache[];
  photos: string[];
  rapports: Rapport[];
};

export const STATUTS: ChantierStatut[] = ["PLANIFIE", "EN_COURS", "SUSPENDU", "TERMINE"];

export const avancement = (c: Chantier) =>
  c.taches.length === 0
    ? 0
    : Math.round((c.taches.filter((t) => t.faite).length / c.taches.length) * 100);

// JJ/MM/AAAA -> Date
export function parseDate(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

export const enRetard = (c: Chantier) => {
  const fin = parseDate(c.dateFinPrevue);
  return !!fin && c.statut !== "TERMINE" && fin.getTime() < Date.now();
};