import type { ChantierListItem } from "./Chantier";

/** Period and team filters of the job site list (applied on the loaded pages). */
export type Periode = "toutes" | "aujourdhui" | "semaine" | "mois";

export const PERIODES: { value: Periode; label: string }[] = [
  { value: "toutes", label: "Toutes dates" },
  { value: "aujourdhui", label: "Aujourd’hui" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
];

const jour = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

/** [start, end] of the period, today included. */
export function bornes(p: Periode, maintenant = new Date()): [Date, Date] | null {
  const j = jour(maintenant);
  if (p === "toutes") return null;
  if (p === "aujourdhui") return [j, j];
  if (p === "semaine") {
    const lundi = new Date(j);
    lundi.setUTCDate(j.getUTCDate() - ((j.getUTCDay() + 6) % 7));
    const dimanche = new Date(lundi);
    dimanche.setUTCDate(lundi.getUTCDate() + 6);
    return [lundi, dimanche];
  }
  return [new Date(Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), 1)), new Date(Date.UTC(j.getUTCFullYear(), j.getUTCMonth() + 1, 0))];
}

/** The job site runs during the period (no start date → only in « Toutes dates »; no end → still running). */
export function pendantPeriode(c: Pick<ChantierListItem, "dateDebut" | "dateFin">, p: Periode, maintenant = new Date()): boolean {
  const b = bornes(p, maintenant);
  if (!b) return true;
  if (!c.dateDebut) return false;
  const debut = new Date(c.dateDebut.slice(0, 10) + "T00:00:00Z");
  const fin = c.dateFin ? new Date(c.dateFin.slice(0, 10) + "T00:00:00Z") : null;
  return debut <= b[1] && (!fin || fin >= b[0]);
}

export function filtrerChantiers(items: ChantierListItem[], periode: Periode, chefId: number | null, maintenant = new Date()) {
  return items.filter((c) => pendantPeriode(c, periode, maintenant) && (chefId === null || c.chefChantier?.id === chefId));
}

/** The chefs of the loaded job sites (team filter of the office). */
export function equipes(items: ChantierListItem[]): { id: number; nom: string }[] {
  const m = new Map<number, string>();
  for (const c of items) if (c.chefChantier) m.set(c.chefChantier.id, [c.chefChantier.prenom, c.chefChantier.nom].filter(Boolean).join(" "));
  return [...m.entries()].map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
}
