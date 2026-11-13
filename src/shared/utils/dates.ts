/** Dates "jour" (sans heure), en heure locale du téléphone. */

const pad = (n: number) => String(n).padStart(2, "0");

/** Date → « 2026-11-13 » (format attendu par l'API pour un jour). */
export function versJourISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const aujourdHui = () => versJourISO(new Date());

export function ajouterJours(jour: string, n: number): string {
  const [a, m, j] = jour.split("-").map(Number);
  return versJourISO(new Date(a, m - 1, j + n));
}

/** Date de l'API (ISO, avec ou sans heure) → « 2026-11-13 » en heure locale, ou null. */
export function jourDe(date?: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : versJourISO(d);
}

/** « 13/11/2026 » saisi → « 2026-11-13 » ; "" → null ; date impossible → undefined. */
export function lireJour(texte: string): string | null | undefined {
  const t = texte.trim();
  if (!t) return null;
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t);
  if (!m) return undefined;
  const [j, mo, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(a, mo - 1, j);
  if (d.getFullYear() !== a || d.getMonth() !== mo - 1 || d.getDate() !== j) return undefined;
  return versJourISO(d);
}

/** Date de l'API → « 13/11/2026 » pour un champ de saisie. */
export function jourVersTexte(date?: string | null): string {
  const jour = jourDe(date);
  if (!jour) return "";
  const [a, m, j] = jour.split("-");
  return `${j}/${m}/${a}`;
}
