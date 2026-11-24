/**
 * Supplier order and its deliveries (GET /commandes-fournisseur, /commandes-fournisseur/:id).
 * The chef and the sous-traitant never receive a price. Received quantity of a line is capped by
 * what is left to receive: more than that is a gap « en trop » (API rule).
 */
export type CommandeStatut = "CREEE" | "ENVOYEE" | "EXPEDIEE" | "PARTIELLE" | "RECUE" | "CLOTUREE" | "ANNULEE";

export const COMMANDE_STATUTS: Record<CommandeStatut, { label: string; couleur: string; fond: string }> = {
  CREEE: { label: "À envoyer", couleur: "#475569", fond: "#F1F5F9" },
  ENVOYEE: { label: "Envoyée", couleur: "#1D4ED8", fond: "#DBEAFE" },
  EXPEDIEE: { label: "Expédiée", couleur: "#6D28D9", fond: "#EDE9FE" },
  PARTIELLE: { label: "Livrée en partie", couleur: "#B45309", fond: "#FEF3C7" },
  RECUE: { label: "Reçue", couleur: "#15803D", fond: "#DCFCE7" },
  CLOTUREE: { label: "Clôturée", couleur: "#475569", fond: "#F1F5F9" },
  ANNULEE: { label: "Annulée", couleur: "#B91C1C", fond: "#FEE2E2" },
};

/** Only these orders can receive a delivery. */
export const RECEPTIONNABLES: CommandeStatut[] = ["ENVOYEE", "EXPEDIEE", "PARTIELLE"];

export type CommandeListItem = {
  id: number;
  reference: string;
  statutLivraison: CommandeStatut;
  date: string;
  dateLivraisonPrevue: string | null;
  fournisseur: { id: number; nom: string };
  chantier: { id: number; reference: string } | null;
};

export type LigneCommande = {
  id: number;
  materiauNom: string;
  quantite: number | string;
  quantiteRecue: number | string;
  unite: string;
};

export type CommandeDetail = CommandeListItem & {
  lignes: LigneCommande[];
  receptions: { id: number; dateReception: string; statutControle: string; ecarts: { id: number; type: string; libelle: string }[] }[];
};

export type EcartType = "MANQUANT" | "EN_TROP" | "INCONNU" | "ABIME";

export type Ecart = { type: EcartType; ligneId?: number; libelle: string; quantite?: number };

/** Answer of POST /ocr/bon-livraison. */
export type BonLivraisonLu = {
  modeIA: true;
  numeroBL: string | null;
  fournisseur: string | null;
  lignes: { libelle: string; quantite: number | null; unite: string | null; ligneId: number | null; confiance: number; douteux: boolean }[];
  avertissement: string | null;
};

/** One line of the order while checking the delivery. */
export type LigneControle = {
  ligneId: number;
  nom: string;
  unite: string;
  restant: number;
  /** Quantity printed on the delivery note (null: not on the note / no reading) */
  surBon: number | null;
  recuTexte: string;
  abimeTexte: string;
  douteux: boolean;
};

export type ArticleInconnu = { cle: string; libelle: string; quantiteTexte: string };

/** « 12,5 » → 12.5 ; "" → 0 ; invalid or negative → null. */
export function lireQuantite(t: string): number | null {
  const s = t.replace(",", ".").trim();
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 1000) / 1000 : null;
}

/**
 * What is sent to POST /commandes-fournisseur/:id/receptions:
 * - received ≤ left to receive (the rest is « en trop »)
 * - note says more than counted → « manquant »; damaged → « abîmé »; not ordered → « inconnu »
 */
export function calculerReception(lignes: LigneControle[], inconnus: ArticleInconnu[]): { lignes: { ligneId: number; quantite: number }[]; ecarts: Ecart[]; invalide: boolean } {
  const out: { ligneId: number; quantite: number }[] = [];
  const ecarts: Ecart[] = [];
  let invalide = false;
  for (const l of lignes) {
    const recu = lireQuantite(l.recuTexte);
    const abime = lireQuantite(l.abimeTexte);
    if (recu === null || abime === null || abime > recu) {
      invalide = true;
      continue;
    }
    if (recu > 0) out.push({ ligneId: l.ligneId, quantite: Math.min(recu, l.restant) });
    if (recu > l.restant) ecarts.push({ type: "EN_TROP", ligneId: l.ligneId, libelle: l.nom, quantite: Math.round((recu - l.restant) * 1000) / 1000 });
    if (l.surBon !== null && recu < l.surBon) ecarts.push({ type: "MANQUANT", ligneId: l.ligneId, libelle: l.nom, quantite: Math.round((l.surBon - recu) * 1000) / 1000 });
    if (abime > 0) ecarts.push({ type: "ABIME", ligneId: l.ligneId, libelle: l.nom, quantite: abime });
  }
  for (const a of inconnus) {
    const q = lireQuantite(a.quantiteTexte);
    if (!a.libelle.trim() || q === null) {
      invalide = true;
      continue;
    }
    ecarts.push({ type: "INCONNU", libelle: a.libelle.trim(), quantite: q || undefined });
  }
  return { lignes: out, ecarts, invalide };
}
