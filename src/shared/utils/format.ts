const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export const formatEuros = (n?: number | string | null) => (n === null || n === undefined ? "—" : euro.format(Number(n)));

export function formatDate(date?: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
}

export const fullName = (p?: { prenom?: string | null; nom?: string | null } | null) =>
  [p?.prenom, p?.nom].filter(Boolean).join(" ");

const UNITES: Record<string, string> = {
  M2: "m²", ML: "ml", M3: "m³", PIECE: "pièce", JOUR: "jour", HEURE: "h", LITRE: "l", KG: "kg", FORFAIT: "forfait",
};
export const formatUnite = (u: string) => UNITES[u] ?? u.toLowerCase();

/** Number typed on a French keyboard (« 12,5 ») → 12.5 ; NaN when invalid. */
export function lireNombre(texte: string): number {
  const propre = texte.replace(/\s/g, "").replace(",", ".");
  return propre === "" ? Number.NaN : Number(propre);
}

/** 12.5 → « 12,5 » for an input field. */
export const nombreVersTexte = (n: number | null | undefined) => (n === null || n === undefined || Number.isNaN(n) ? "" : String(n).replace(".", ","));
