import { formatEuros, formatUnite } from "@/shared/utils/format";
import type { Prestation } from "../models/Prestation";

/** Price range « 40,00 € – 60,00 € HT / m² » (null for a chef de chantier: the API sends no price). */
export function fourchettePrix(p: Pick<Prestation, "prixVenteMin" | "prixVenteMax" | "unite">): string | null {
  if (p.prixVenteMin === undefined || p.prixVenteMax === undefined) return null;
  return `${formatEuros(p.prixVenteMin)} – ${formatEuros(p.prixVenteMax)} HT / ${formatUnite(p.unite)}`;
}

/** Price impact of an option choice « +12,00 € » (null when 0 or hidden). */
export function impactPrix(impact?: number | null): string | null {
  if (impact === undefined || impact === null || Number(impact) === 0) return null;
  return `${Number(impact) > 0 ? "+" : ""}${formatEuros(impact)}`;
}
