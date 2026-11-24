import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { postMultipart } from "@/core/api/multipart";
import { enregistrerExecuteur } from "@/core/offline/fileEnvoi";
import type { PhotoMoment, PhotosReponse, RapportChantier } from "../models/PhotosRapports";

const base = (chantierId: number) => `${apiEndpoints.chantiers}/${chantierId}`;

export const listPhotos = (chantierId: number) => apiRequest<PhotosReponse>(`${base(chantierId)}/photos`);
export const listRapports = (chantierId: number) => apiRequest<RapportChantier[]>(`${base(chantierId)}/rapports`);

export async function supprimerPhoto(chantierId: number, id: number) {
  await apiClient.delete(`${base(chantierId)}/photos/${id}`);
}

export async function supprimerRapport(chantierId: number, id: number) {
  await apiClient.delete(`${base(chantierId)}/rapports/${id}`);
}

export type PhotosPayload = { chantierId: number; tacheId: number; moment: PhotoMoment; commentaire?: string };
export type RapportPayload = { chantierId: number; tacheId?: number; contenu: string };

// Sent now or later by the field queue (same code both times)
enregistrerExecuteur("PHOTOS_CHANTIER", async (e) => {
  const p = e.payload as PhotosPayload;
  await postMultipart(`${base(p.chantierId)}/photos`, { tacheId: p.tacheId, moment: p.moment, commentaire: p.commentaire }, e.fichiers.map((fichier) => ({ champ: "photos", fichier })), e.cle, 120_000);
});

enregistrerExecuteur("RAPPORT_CHANTIER", async (e) => {
  const p = e.payload as RapportPayload;
  await postMultipart(`${base(p.chantierId)}/rapports`, { tacheId: p.tacheId, contenu: p.contenu }, e.fichiers.map((fichier) => ({ champ: "photos", fichier })), e.cle, 120_000);
});
