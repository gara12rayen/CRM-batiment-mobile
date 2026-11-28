export type DevisStatut = "BROUILLON" | "ENVOYE" | "SIGNE" | "FACTURE" | "REFUSE";

export type DevisLigne = {
  designation: string;
  quantite: number;
  prixUnitaire: number;
};

export type Devis = {
  id: string;
  reference: string;
  version: number;
  client: string;
  statut: DevisStatut;
  date: string;
  lignes: DevisLigne[];
};

export const STATUTS_SUIVANTS: Record<DevisStatut, DevisStatut[]> = {
  BROUILLON: ["ENVOYE"],
  ENVOYE: ["SIGNE", "REFUSE"],
  SIGNE: ["FACTURE"],
  FACTURE: [],
  REFUSE: [],
};

export const totalDevis = (d: Devis) =>
  d.lignes.reduce((t, l) => t + l.quantite * l.prixUnitaire, 0);