import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import type { DevisDetail } from "@/features/devis/models/Devis";
import { partieFormData, type FichierLocal } from "@/shared/media/media.service";
import type { DemandeRappel, Proposition } from "../models/DevisIA";

/** The AI can take up to a minute (photos): longer than the usual 15 s. */
const TIMEOUT_IA = 90_000;
/** Multipart: the phone adds the boundary itself; the FormData must not be turned into JSON. */
const multipart = { headers: { "Content-Type": "multipart/form-data" }, transformRequest: (d: unknown) => d, timeout: TIMEOUT_IA };

const base = (devisId: number) => `${apiEndpoints.devis}/${devisId}/ia`;

/** Text description → proposed catalogue lines (nothing is saved). */
export async function proposerTexte(devisId: number, description: string): Promise<Proposition> {
  return (await apiClient.post<Proposition>(`${base(devisId)}/proposer`, { description: description.trim() }, { timeout: TIMEOUT_IA })).data;
}

/** 1 to 3 photos (+ optional text) → proposed lines. The photos are not kept by the server. */
export async function proposerPhotos(devisId: number, photos: FichierLocal[], description: string): Promise<Proposition> {
  const form = new FormData();
  for (const p of photos) form.append("photos", (await partieFormData(p)) as unknown as Blob, p.nom);
  if (description.trim()) form.append("description", description.trim());
  return (await apiClient.post<Proposition>(`${base(devisId)}/proposer-photo`, form, multipart)).data;
}

/** Voice note → text (to read and correct before asking for the lines). */
export async function transcrire(devisId: number, audio: FichierLocal): Promise<string> {
  const form = new FormData();
  form.append("audio", (await partieFormData(audio)) as unknown as Blob, audio.nom);
  const { data } = await apiClient.post<{ texte: string }>(`${base(devisId)}/transcrire`, form, multipart);
  return data.texte ?? "";
}

/** Adds the kept lines to the draft (one transaction). Answers the updated quote. */
export async function appliquer(devisId: number, lignes: { prestationId: number; quantite: number }[]): Promise<DevisDetail> {
  return (await apiClient.post<DevisDetail>(`${base(devisId)}/appliquer`, { lignes }, { headers: enteteIdempotence(), timeout: 30000 })).data;
}

/** The request the quote comes from (description, photos, voice notes). Bureau only. */
export const getDemandeRappel = (id: number) => apiRequest<DemandeRappel>(`${apiEndpoints.demandesDevis}/${id}`);
