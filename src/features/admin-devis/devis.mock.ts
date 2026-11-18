import { Devis } from "./types";

export const devisMock: Devis[] = [
  {
    id: "d1", reference: "DEV-2026-0012", version: 2, client: "M. Alaoui",
    statut: "ENVOYE", date: "02/10/2026",
    lignes: [
      { designation: "Carrelage 14,5 m²", quantite: 14.5, prixUnitaire: 55 },
      { designation: "Pose et finitions", quantite: 1, prixUnitaire: 1200 },
    ],
  },
  {
    id: "d2", reference: "DEV-2026-0015", version: 1, client: "Mme Benani",
    statut: "BROUILLON", date: "05/10/2026",
    lignes: [{ designation: "Cuisine équipée", quantite: 1, prixUnitaire: 12000 }],
  },
  {
    id: "d3", reference: "DEV-2026-0018", version: 1, client: "Société Atlas",
    statut: "SIGNE", date: "08/10/2026",
    lignes: [{ designation: "Ravalement façade", quantite: 1, prixUnitaire: 18000 }],
  },
];