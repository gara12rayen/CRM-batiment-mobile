export type Dashboard = {
  caSigneMois: number;
  tauxConversion: number; // 0.42 = 42 %
  facturesImpayees: { nombre: number; montant: number };
  chantiersEnRetard: number;
  commandesEnAttente: number;
};

export type IndicatorKey =
  | "ca"
  | "conversion"
  | "factures"
  | "chantiers"
  | "commandes";