import {
  CommandeAValider,
  FactureAMarquerPayee,
  SignatureAVerifier,
} from "./types";

export const signaturesMock: SignatureAVerifier[] = [
  {
    id: "s1",
    reference: "DEV-2026-0012",
    version: 2,
    client: "M. Alaoui",
    montant: 18500,
    motifAlerte: "Rature détectée",
    scanUrl: "https://placehold.co/600x800?text=Scan+DEV-2026-0012",
    lignesDevis: [
      { designation: "Carrelage 14,5 m²", quantite: 1 },
      { designation: "Pose et finitions", quantite: 1 },
    ],
  },
  {
    id: "s2",
    reference: "DEV-2026-0015",
    version: 1,
    client: "Mme Benani",
    montant: 12000,
    motifAlerte: "Mention « Bon pour accord » absente",
    scanUrl: "https://placehold.co/600x800?text=Scan+DEV-2026-0015",
    lignesDevis: [{ designation: "Cuisine équipée", quantite: 1 }],
  },
];

export const commandesMock: CommandeAValider[] = [
  { id: "c1", reference: "CMD-0201", fournisseur: "Sika", montant: 4200, chantier: "Villa Alaoui" },
  { id: "c2", reference: "CMD-0202", fournisseur: "Lafarge", montant: 2800, chantier: "Façade Atlas" },
];

export const facturesMock: FactureAMarquerPayee[] = [
  { id: "f1", reference: "FAC-2026-0031", client: "M. Alaoui", montant: 5550, echeance: "05/10/2026" },
  { id: "f2", reference: "FAC-2026-0034", client: "Mme Benani", montant: 3600, echeance: "15/10/2026" },
];