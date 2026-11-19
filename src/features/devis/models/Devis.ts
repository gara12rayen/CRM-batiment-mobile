/**
 * Quote types — same columns and enums as the database of the web version
 * (prisma/schema.prisma : model Devis, LigneDevis, enum DevisStatut).
 * The mobile app never reads the database itself: it goes through the API (/api/v1/devis).
 */
export type DevisStatut =
  | "BROUILLON"
  | "ENVOYE"
  | "RENVOYE"
  | "ACCEPTE"
  | "SIGNE"
  | "SIGNE_PAPIER"
  | "REFUSE"
  | "REVISE"
  | "ANNULE";

export const DEVIS_STATUT: Record<DevisStatut, { label: string; couleur: string; fond: string }> = {
  BROUILLON: { label: "Brouillon", couleur: "#475569", fond: "#F1F5F9" },
  REVISE: { label: "En révision", couleur: "#B45309", fond: "#FEF3C7" },
  ENVOYE: { label: "Envoyé", couleur: "#1D4ED8", fond: "#DBEAFE" },
  RENVOYE: { label: "Renvoyé", couleur: "#1D4ED8", fond: "#DBEAFE" },
  ACCEPTE: { label: "Accepté", couleur: "#6D28D9", fond: "#EDE9FE" },
  SIGNE_PAPIER: { label: "Signé papier à vérifier", couleur: "#B45309", fond: "#FEF3C7" },
  SIGNE: { label: "Signé", couleur: "#15803D", fond: "#DCFCE7" },
  REFUSE: { label: "Refusé", couleur: "#B91C1C", fond: "#FEE2E2" },
  ANNULE: { label: "Annulé", couleur: "#475569", fond: "#F1F5F9" },
};

/** Same rule as the API: lines, VAT and notes can only change on a draft or revised quote. */
export const DEVIS_REGLES = {
  modifiable: ["BROUILLON", "REVISE"] as DevisStatut[],
  /** Envoyer par email / remis au client (BROUILLON → ENVOYE, REVISE → RENVOYE) */
  envoyable: ["BROUILLON", "REVISE"] as DevisStatut[],
  /** Waiting for the client's answer: WhatsApp link and « refused by the client » */
  enAttenteClient: ["ENVOYE", "RENVOYE"] as DevisStatut[],
  /** Signature on the advisor's phone (POST /devis/:id/signer-sur-place) */
  signableSurPlace: ["ENVOYE", "RENVOYE", "ACCEPTE"] as DevisStatut[],
};

/** Which actions the detail screen shows for a quote (the API checks the same rules again). */
export function actionsDisponibles(d: Pick<DevisDetail, "statut" | "lignes" | "client">) {
  const envoyable = DEVIS_REGLES.envoyable.includes(d.statut);
  const enAttente = DEVIS_REGLES.enAttenteClient.includes(d.statut);
  return {
    envoyer: envoyable,
    remettre: envoyable,
    whatsapp: enAttente,
    refuser: enAttente,
    /** Why « Envoyer » cannot work yet (null = ok) */
    blocageEnvoi: !d.lignes.length
      ? "Ajoutez au moins une ligne avant d’envoyer."
      : !d.client.email
        ? "Le client n’a pas d’email : utilisez « Remis au client » ou ajoutez un email."
        : null,
    blocageRemise: !d.lignes.length ? "Ajoutez au moins une ligne avant de remettre le devis." : null,
    blocageWhatsapp: !d.client.telephone ? "Le client n’a pas de numéro de téléphone." : null,
  };
}

export type DevisLigne = {
  id: number;
  prestationId?: number | null;
  description: string | null;
  quantite: number;
  unite: string;
  dimension: string | null;
  couleur: string | null;
  finition: string | null;
  optionsChoisies: { optionNom: string; choixNom: string }[] | null;
  /** Absent for a chef de chantier (no amounts) */
  prixUnitaireVente?: number;
  totalHT?: number;
  /** Bureau only: cost of the line (materials + labour), used for the margin */
  coutTotal?: number | string;
};

export type DevisDetail = {
  id: number;
  reference: string;
  statut: DevisStatut;
  versionCourante: number;
  dateCreation: string;
  dateEnvoi: string | null;
  /** Internal notes (never shown to the client) */
  notes?: string | null;
  tauxTVA?: number;
  totalHT?: number;
  totalTVA?: number;
  totalTTC?: number;
  /** Bureau only: margin of the whole quote, in % */
  margePourcent?: number | string | null;
  client: {
    id: number;
    nom: string;
    prenom: string | null;
    email?: string | null;
    telephone?: string | null;
    adresseChantier?: string | null;
  };
  createur?: { id: number; nom: string; prenom: string } | null;
  /** The request this quote comes from (bureau only) */
  demandeDevis?: { id: number; reference: string; description: string } | null;
  /** Job site created at the signature */
  chantier?: { id: number; reference: string; statut: string } | null;
  lignes: DevisLigne[];
};

/** VAT rates offered (France: normal, intermediate for renovation, reduced for energy work, none). */
export const TAUX_TVA = [20, 10, 5.5, 0] as const;

/** One row of GET /devis (DEVIS_LIST_SELECT of the API). Amounts are absent for a chef de chantier. */
export type DevisListItem = {
  id: number;
  reference: string;
  statut: DevisStatut;
  versionCourante: number;
  dateCreation: string;
  dateEnvoi: string | null;
  totalHT?: number;
  totalTTC?: number;
  /** Bureau only: margin of the whole quote, in % */
  margePourcent?: number | string | null;
  client: { id: number; nom: string; prenom: string | null; telephone?: string | null };
};

/** Filters of the list tab → statuses sent to the API (?statuts=...). */
export const DEVIS_FILTRES: { value: string; label: string; statuts: DevisStatut[] }[] = [
  { value: "TOUS", label: "Tous", statuts: [] },
  { value: "BROUILLON", label: "Brouillons", statuts: ["BROUILLON", "REVISE"] },
  { value: "ENVOYE", label: "Envoyés", statuts: ["ENVOYE", "RENVOYE", "ACCEPTE"] },
  { value: "SIGNE_PAPIER", label: "Signés papier à vérifier", statuts: ["SIGNE_PAPIER"] },
  { value: "SIGNE", label: "Signés", statuts: ["SIGNE"] },
  { value: "REFUSE", label: "Refusés / annulés", statuts: ["REFUSE", "ANNULE"] },
];
