import { IndicatorKey } from "./types";

export type DetailItem = {
  id: string;
  titre: string;
  sousTitre: string;
  valeur?: string;
  enRetard?: boolean;
};

export const detailTitres: Record<IndicatorKey, string> = {
  ca: "CA signé du mois",
  conversion: "Taux de conversion",
  factures: "Factures impayées",
  chantiers: "Chantiers en retard",
  commandes: "Commandes en attente",
};

export const detailMock: Record<IndicatorKey, DetailItem[]> = {
  ca: [
    { id: "1", titre: "DEV-2026-0012 – v2", sousTitre: "M. Alaoui", valeur: "18 500 €" },
    { id: "2", titre: "DEV-2026-0015 – v1", sousTitre: "Mme Benani", valeur: "12 000 €" },
    { id: "3", titre: "DEV-2026-0018 – v1", sousTitre: "Société Atlas", valeur: "18 000 €" },
  ],
  conversion: [
    { id: "1", titre: "Devis envoyés", sousTitre: "ce mois-ci", valeur: "24" },
    { id: "2", titre: "Devis signés", sousTitre: "ce mois-ci", valeur: "10" },
    { id: "3", titre: "Devis refusés", sousTitre: "ce mois-ci", valeur: "4" },
  ],
  factures: [
    { id: "1", titre: "FAC-2026-0031", sousTitre: "M. Alaoui · échue depuis 12 j", valeur: "5 550 €", enRetard: true },
    { id: "2", titre: "FAC-2026-0034", sousTitre: "Mme Benani · échue depuis 3 j", valeur: "3 600 €", enRetard: true },
    { id: "3", titre: "FAC-2026-0040", sousTitre: "Société Atlas · à échoir", valeur: "3 150 €" },
  ],
  chantiers: [
    { id: "1", titre: "Rénovation Villa Alaoui", sousTitre: "Prévu 10/10 · retard 9 j", enRetard: true },
    { id: "2", titre: "Cuisine Benani", sousTitre: "Prévu 15/10 · retard 4 j", enRetard: true },
    { id: "3", titre: "Façade Atlas", sousTitre: "Prévu 18/10 · retard 1 j", enRetard: true },
  ],
  commandes: [
    { id: "1", titre: "CMD-0201 · Sika", sousTitre: "En attente de validation" },
    { id: "2", titre: "CMD-0202 · Lafarge", sousTitre: "En attente de validation" },
    { id: "3", titre: "CMD-0205 · Knauf", sousTitre: "En attente de validation" },
  ],
};
