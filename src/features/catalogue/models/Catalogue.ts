import type { Unite } from "./Prestation";

/** GET /catalogue/categories (with their sub-categories and number of prestations). */
export type SousCategorie = { id: number; nom: string; description: string | null; _count?: { prestations: number } };
export type Categorie = {
  id: number;
  nom: string;
  description: string | null;
  sousCategories: SousCategorie[];
  _count?: { prestations: number };
};

/** GET /catalogue/materiaux. The purchase price is absent for a chef de chantier (removed by the API). */
export type Materiau = {
  id: number;
  nom: string;
  couleur: string | null;
  finition: string | null;
  unite: Unite;
  prixAchatFixe?: number;
  stockActuel?: number;
  actif: boolean;
  fournisseur: { id: number; nom: string } | null;
};

export type OngletCatalogue = "PRESTATIONS" | "MATERIAUX";
