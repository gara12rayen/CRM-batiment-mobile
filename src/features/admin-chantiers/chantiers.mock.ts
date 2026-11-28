import { Chantier } from "./types";

export const chantiersMock: Chantier[] = [
  {
    id: "ch1",
    nom: "Rénovation Villa Alaoui",
    client: "M. Alaoui",
    adresse: "12 rue Hassan, Rabat",
    statut: "EN_COURS",
    dateDebut: "01/09/2026",
    dateFinPrevue: "10/10/2026",
    taches: [
      { id: "t1", titre: "Démolition", faite: true },
      { id: "t2", titre: "Pose carrelage", faite: true },
      { id: "t3", titre: "Peinture", faite: false },
      { id: "t4", titre: "Finitions", faite: false },
    ],
    photos: [
      "https://placehold.co/400x300?text=Photo+1",
      "https://placehold.co/400x300?text=Photo+2",
    ],
    rapports: [
      { id: "r1", date: "05/10/2026", auteur: "Chef Karim", texte: "Carrelage terminé, peinture à démarrer." },
    ],
  },
  {
    id: "ch2",
    nom: "Cuisine Benani",
    client: "Mme Benani",
    adresse: "5 av. Mohammed V, Salé",
    statut: "PLANIFIE",
    dateDebut: "20/11/2026",
    dateFinPrevue: "15/12/2026",
    taches: [
      { id: "t1", titre: "Dépose ancienne cuisine", faite: false },
      { id: "t2", titre: "Installation meubles", faite: false },
    ],
    photos: [],
    rapports: [],
  },
  {
    id: "ch3",
    nom: "Façade Atlas",
    client: "Société Atlas",
    adresse: "Zone industrielle, Témara",
    statut: "TERMINE",
    dateDebut: "01/08/2026",
    dateFinPrevue: "30/09/2026",
    taches: [
      { id: "t1", titre: "Échafaudage", faite: true },
      { id: "t2", titre: "Ravalement", faite: true },
    ],
    photos: ["https://placehold.co/400x300?text=Facade"],
    rapports: [
      { id: "r1", date: "29/09/2026", auteur: "Chef Youssef", texte: "Chantier livré, réception OK." },
    ],
  },
];