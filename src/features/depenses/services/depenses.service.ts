import { apiEndpoints } from "@/core/api/api-endpoints";
import { postMultipart } from "@/core/api/multipart";
import type { FichierLocal } from "@/shared/media/media.service";
import type { ChampFacture, FactureLue } from "../models/Depense";

/** POST /ocr/facture-fournisseur — the AI reads the invoice (nothing saved). */
export const lireFacture = (photo: FichierLocal) => postMultipart<FactureLue>(`${apiEndpoints.ocr}/facture-fournisseur`, {}, [{ champ: "photo", fichier: photo }], undefined, 90_000);

export type DepenseSaisie = {
  fournisseurNom: string;
  numeroFacture: string;
  dateFacture: string;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  chantierId?: number;
  commandeFournisseurId?: number;
  champsDouteux: ChampFacture[];
  notes?: string;
  latitude?: number;
  longitude?: number;
};

/**
 * POST /depenses (multipart: photo + fields) → expense in draft, the office is notified.
 * 409 DEPENSE_EXISTANTE: already sent ; 422 MONTANTS_INCOHERENTS: HT + TVA ≠ TTC.
 */
export const creerDepense = (d: DepenseSaisie, photo: FichierLocal, cle: string) =>
  postMultipart(`${apiEndpoints.depenses}`, { ...d, champsDouteux: d.champsDouteux.join(",") || undefined }, [{ champ: "fichier", fichier: photo }], cle);
