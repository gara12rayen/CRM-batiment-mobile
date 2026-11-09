export const UNITES = ["M2", "ML", "M3", "PIECE", "JOUR", "HEURE", "LITRE", "KG", "FORFAIT"] as const;
export type Unite = (typeof UNITES)[number];

export type Prestation = {
  id: number;
  nom: string;
  description: string | null;
  unite: Unite;
  prixVenteMin: number;
  prixVenteMax: number;
  categorie: { id: number; nom: string };
  sousCategorie: { id: number; nom: string } | null;
};

export type ChoixOption = { id: number; nom: string; description?: string | null; impactPrix: number; actif: boolean };
export type OptionPrestation = { id: number; nom: string; description?: string | null; obligatoire: boolean; choix: ChoixOption[] };
export type PrestationDetail = Prestation & { options: OptionPrestation[] };

/** What the mobile shows of the pricing: the suggested price only (costs and margin stay on the web). */
export type PrixSuggere = { prixVenteSuggereUnite: number; totalVenteHT: number; avertissements: string[] };
