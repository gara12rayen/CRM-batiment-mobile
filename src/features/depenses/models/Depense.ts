/** Supplier invoice photographed on the job site → expense « à valider » for the office. */
export const CHAMPS_FACTURE = ["fournisseur", "numeroFacture", "dateFacture", "montantHT", "montantTVA", "montantTTC"] as const;
export type ChampFacture = (typeof CHAMPS_FACTURE)[number];

export const LIBELLES_CHAMPS: Record<ChampFacture, string> = {
  fournisseur: "Fournisseur",
  numeroFacture: "Numéro de facture",
  dateFacture: "Date (JJ/MM/AAAA)",
  montantHT: "Total HT",
  montantTVA: "TVA",
  montantTTC: "Total TTC",
};

/** Answer of POST /ocr/facture-fournisseur. */
export type FactureLue = {
  modeIA: true;
  valeurs: {
    fournisseur: string | null;
    numeroFacture: string | null;
    dateFacture: string | null;
    montantHT: number | null;
    montantTVA: number | null;
    montantTTC: number | null;
  };
  champsDouteux: ChampFacture[];
  avertissement: string | null;
};

/** Same tolerance as the API (rounding only). */
export const TOLERANCE_MONTANTS = 0.05;

/** « 1 234,50 » → 1234.5 ; null when not a number ≥ 0. */
export function lireMontant(t: string): number | null {
  const s = t.replace(/\s/g, "").replace("€", "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

export const montantsCoherents = (ht: number | null, tva: number | null, ttc: number | null) => ht !== null && tva !== null && ttc !== null && Math.abs(ht + tva - ttc) <= TOLERANCE_MONTANTS;
