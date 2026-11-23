export type Etape =
  | "DEVIS_SIGNE"
  | "COMMANDES"
  | "LIVRAISON_PLANIFIEE"
  | "LIVRE"
  | "PLANIFIE"
  | "EN_COURS"
  | "TERMINE_PV"
  | "CLOTURE";

export const ETAPES: { key: Etape; label: string }[] = [
  { key: "DEVIS_SIGNE", label: "Devis signé" },
  { key: "COMMANDES", label: "Commandes" },
  { key: "LIVRAISON_PLANIFIEE", label: "Livraison planifiée" },
  { key: "LIVRE", label: "Livré" },
  { key: "PLANIFIE", label: "Planifié" },
  { key: "EN_COURS", label: "En cours" },
  { key: "TERMINE_PV", label: "Terminé (PV signé)" },
  { key: "CLOTURE", label: "Clôturé" },
];

export const labelEtape = (e: Etape) => ETAPES.find((x) => x.key === e)!.label;
export const indexEtape = (e: Etape) => ETAPES.findIndex((x) => x.key === e);

export type Installateur = { id: string; nom: string; note: number };

export type Evenement = { id: string; date: string; texte: string };

export type Installation = {
  id: string;
  chantier: string;
  client: string;
  etape: Etape;
  installateurId?: string;
  dateLivraisonPrevue: string; // JJ/MM/AAAA
  dateInstallationPrevue: string; // JJ/MM/AAAA
  pvSigne: boolean;
  chronologie: Evenement[];
  problemes: string[];
};

function parseDate(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

// Livraison en retard = date prévue dépassée et pas encore livré
export const livraisonEnRetard = (i: Installation) => {
  const d = parseDate(i.dateLivraisonPrevue);
  return !!d && indexEtape(i.etape) < indexEtape("LIVRE") && d.getTime() < Date.now();
};