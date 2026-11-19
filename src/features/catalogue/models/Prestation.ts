export const UNITES = ["M2", "ML", "M3", "PIECE", "JOUR", "HEURE", "LITRE", "KG", "FORFAIT"] as const;
export type Unite = (typeof UNITES)[number];

export type Prestation = {
  id: number;
  nom: string;
  description: string | null;
  unite: Unite;
  /** Absent for a chef de chantier (the API removes every price) */
  prixVenteMin?: number;
  prixVenteMax?: number;
  categorie: { id: number; nom: string };
  sousCategorie: { id: number; nom: string } | null;
};

/** impactPrix: absent for a chef de chantier */
export type ChoixOption = { id: number; nom: string; description?: string | null; impactPrix?: number; actif: boolean };
export type OptionPrestation = { id: number; nom: string; description?: string | null; obligatoire: boolean; choix: ChoixOption[] };
/** One component of a prestation, per unit (material or labour). Costs are not shown in the app. */
export type CompositionPrestation = {
  id: number;
  quantiteParUnite: number;
  materiau: { id: number; nom: string; unite: Unite } | null;
  serviceMainOeuvre: { id: number; nom: string; unite: Unite } | null;
};
export type PrestationDetail = Prestation & { options: OptionPrestation[]; compositions?: CompositionPrestation[] };

/** What the mobile shows of the pricing: the suggested price only (costs and margin stay on the web). */
export type PrixSuggere = { prixVenteSuggereUnite: number; totalVenteHT: number; avertissements: string[] };
