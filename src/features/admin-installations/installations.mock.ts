import { Installateur, Installation } from "./types";

export const installateursMock: Installateur[] = [
  { id: "i1", nom: "Atlas Pose", note: 4.6 },
  { id: "i2", nom: "Rabat Rénov", note: 3.9 },
  { id: "i3", nom: "Pro Install", note: 4.2 },
];

export const installationsMock: Installation[] = [
  {
    id: "in1",
    chantier: "Villa Alaoui",
    client: "M. Alaoui",
    etape: "LIVRAISON_PLANIFIEE",
    installateurId: "i1",
    dateLivraisonPrevue: "10/11/2026", // dépassée => retard
    dateInstallationPrevue: "20/11/2026",
    pvSigne: false,
    chronologie: [
      { id: "e1", date: "02/10/2026", texte: "Devis signé" },
      { id: "e2", date: "04/10/2026", texte: "Commandes passées" },
      { id: "e3", date: "15/10/2026", texte: "Livraison planifiée" },
    ],
    problemes: [],
  },
  {
    id: "in2",
    chantier: "Cuisine Benani",
    client: "Mme Benani",
    etape: "DEVIS_SIGNE",
    dateLivraisonPrevue: "15/12/2026",
    dateInstallationPrevue: "20/12/2026",
    pvSigne: false,
    chronologie: [{ id: "e1", date: "10/11/2026", texte: "Devis signé" }],
    problemes: [],
  },
  {
    id: "in3",
    chantier: "Façade Atlas",
    client: "Société Atlas",
    etape: "TERMINE_PV",
    installateurId: "i3",
    dateLivraisonPrevue: "01/10/2026",
    dateInstallationPrevue: "10/10/2026",
    pvSigne: true,
    chronologie: [
      { id: "e1", date: "20/09/2026", texte: "Devis signé" },
      { id: "e2", date: "01/10/2026", texte: "Livré" },
      { id: "e3", date: "15/10/2026", texte: "Installation en cours" },
      { id: "e4", date: "30/10/2026", texte: "PV signé par le client" },
    ],
    problemes: ["Une palette abîmée à la livraison (ticket SAV créé)"],
  },
  {
    id: "in4",
    chantier: "Salle de bain Idrissi",
    client: "M. Idrissi",
    etape: "EN_COURS",
    installateurId: "i2",
    dateLivraisonPrevue: "05/11/2026",
    dateInstallationPrevue: "12/11/2026",
    pvSigne: false,
    chronologie: [
      { id: "e1", date: "28/10/2026", texte: "Devis signé" },
      { id: "e2", date: "05/11/2026", texte: "Livré" },
      { id: "e3", date: "12/11/2026", texte: "Installation en cours" },
    ],
    problemes: [],
  },
];