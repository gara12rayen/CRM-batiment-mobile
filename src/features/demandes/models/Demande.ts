/**
 * Quote request (GET /demandes-devis, bureau). Same statuses as the API:
 *   NOUVEAU → EN_COURS → QUALIFIE → CONVERTI ; any active → PERDU ; PERDU → EN_COURS (reopen)
 */
export type DemandeStatut = "NOUVEAU" | "EN_COURS" | "QUALIFIE" | "CONVERTI" | "PERDU";

export type DemandeSource =
  | "CHATBOT"
  | "TECHNICO_COMMERCIAL"
  | "APPEL"
  | "RECOMMANDATION"
  | "SITE_WEB"
  | "WHATSAPP"
  | "EMAIL"
  | "AUTRE"
  | "TERRAIN";

export const DEMANDE_STATUTS: Record<DemandeStatut, { label: string; couleur: string; fond: string }> = {
  NOUVEAU: { label: "Nouvelle", couleur: "#B45309", fond: "#FEF3C7" },
  EN_COURS: { label: "En cours", couleur: "#1D4ED8", fond: "#DBEAFE" },
  QUALIFIE: { label: "Qualifiée", couleur: "#6D28D9", fond: "#EDE9FE" },
  CONVERTI: { label: "Transformée en devis", couleur: "#15803D", fond: "#DCFCE7" },
  PERDU: { label: "Rejetée", couleur: "#B91C1C", fond: "#FEE2E2" },
};

export const DEMANDE_SOURCES: Record<DemandeSource, string> = {
  CHATBOT: "Assistant du site",
  TECHNICO_COMMERCIAL: "Commercial",
  APPEL: "Appel",
  RECOMMANDATION: "Recommandation",
  SITE_WEB: "Site web",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  AUTRE: "Autre",
  TERRAIN: "Prospect terrain",
};

type Personne = { id: number; nom: string; prenom: string | null };

export type DemandeListItem = {
  id: number;
  reference: string;
  statut: DemandeStatut;
  source: DemandeSource;
  description: string;
  createdAt: string;
  client: Personne & { email: string | null; telephone: string | null };
  createur: Personne | null;
  devis: { id: number; reference: string; statut: string }[];
};

export type PieceJointe = {
  id: number;
  type: "PHOTO" | "AUDIO";
  dureeSecondes: number | null;
  createdAt: string;
  fichier: { id: number; nom: string; mime: string; taille: number };
};

export type DemandeDetail = DemandeListItem & {
  besoinStructure: Record<string, unknown> | null;
  updatedAt: string;
  fichiers: PieceJointe[];
};

export type Page<T> = { data: T[]; meta: { page: number; limit: number; total: number } };

/** Filters of the list. « actives » = what still needs work. */
export type FiltreDemandes = "actives" | DemandeStatut;

export const FILTRES_DEMANDES: { value: FiltreDemandes; label: string }[] = [
  { value: "actives", label: "À traiter" },
  { value: "NOUVEAU", label: "Nouvelles" },
  { value: "EN_COURS", label: "En cours" },
  { value: "QUALIFIE", label: "Qualifiées" },
  { value: "CONVERTI", label: "Transformées" },
  { value: "PERDU", label: "Rejetées" },
];

export const statutsDuFiltre = (f: FiltreDemandes): DemandeStatut[] => (f === "actives" ? ["NOUVEAU", "EN_COURS", "QUALIFIE"] : [f]);

export type ActionDemande = "prendre-en-charge" | "qualifier" | "perdre" | "reouvrir";

/** Actions allowed by the API for a status (same table as demande-status.ts on the server). */
export function actionsPossibles(statut: DemandeStatut): { action: ActionDemande; label: string; danger?: boolean }[] {
  switch (statut) {
    case "NOUVEAU":
      return [
        { action: "prendre-en-charge", label: "Prendre en charge" },
        { action: "qualifier", label: "Qualifier" },
        { action: "perdre", label: "Rejeter", danger: true },
      ];
    case "EN_COURS":
      return [
        { action: "qualifier", label: "Qualifier" },
        { action: "perdre", label: "Rejeter", danger: true },
      ];
    case "QUALIFIE":
      return [{ action: "perdre", label: "Rejeter", danger: true }];
    case "PERDU":
      return [{ action: "reouvrir", label: "Rouvrir" }];
    default:
      return [];
  }
}

export const peutTransformer = (statut: DemandeStatut) => statut === "NOUVEAU" || statut === "EN_COURS" || statut === "QUALIFIE";

/** Structured need (besoinStructure) → readable lines « Clé : valeur ». */
export function lignesBesoin(b: Record<string, unknown> | null): { cle: string; valeur: string }[] {
  if (!b) return [];
  return Object.entries(b)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => ({
      cle: k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      valeur: Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v),
    }));
}
