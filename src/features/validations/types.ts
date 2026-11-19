export type SignatureAVerifier = {
  id: string;
  reference: string; // ex: DEV-2026-0012
  version: number;
  client: string;
  montant: number;
  motifAlerte: string; // ex: "Rature détectée"
  scanUrl: string; // image/PDF du scan (simulé)
  lignesDevis: { designation: string; quantite: number }[];
};

export type CommandeAValider = {
  id: string;
  reference: string; // ex: CMD-0201
  fournisseur: string;
  montant: number;
  chantier: string;
};

export type FactureAMarquerPayee = {
  id: string;
  reference: string; // ex: FAC-2026-0031
  client: string;
  montant: number;
  echeance: string;
};

export type ValidationTab = "signatures" | "commandes" | "factures";