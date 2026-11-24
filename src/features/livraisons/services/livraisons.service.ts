import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import { postMultipart } from "@/core/api/multipart";
import type { Page } from "@/features/demandes/models/Demande";
import type { FichierLocal } from "@/shared/media/media.service";
import type { BonLivraisonLu, CommandeDetail, CommandeListItem, Ecart } from "../models/Livraison";

/** Orders of a job site (the API has no job site filter: filtered here; chef = his job sites). */
export async function listCommandesChantier(chantierId: number): Promise<CommandeListItem[]> {
  const r = await apiRequest<Page<CommandeListItem>>(`${apiEndpoints.commandesFournisseur}?limit=100&statuts=ENVOYEE,EXPEDIEE,PARTIELLE,RECUE`);
  return r.data.filter((c) => c.chantier?.id === chantierId);
}

export const getCommande = (id: number) => apiRequest<CommandeDetail>(`${apiEndpoints.commandesFournisseur}/${id}`);

/** POST /ocr/bon-livraison — the AI reads the photo against the order lines (nothing saved). */
export const lireBonLivraison = (commandeId: number, photo: FichierLocal) =>
  postMultipart<BonLivraisonLu>(`${apiEndpoints.ocr}/bon-livraison`, { commandeId }, [{ champ: "photo", fichier: photo }], undefined, 90_000);

/** POST /commandes-fournisseur/:id/receptions — updates the stock, the office checks the gaps. */
export async function receptionner(commandeId: number, body: { lignes: { ligneId: number; quantite: number }[]; ecarts: Ecart[]; notes?: string }, cle: string): Promise<{ receptionId: number }> {
  const { data } = await apiClient.post<{ receptionId: number }>(`${apiEndpoints.commandesFournisseur}/${commandeId}/receptions`, body, { headers: enteteIdempotence(cle) });
  return data;
}

/** Photo of the delivery note kept as proof (with the place). */
export const joindreBonLivraison = (receptionId: number, photo: FichierLocal, gps: { latitude: number; longitude: number } | null, cle: string) =>
  postMultipart(`${apiEndpoints.receptions}/${receptionId}/fichiers`, { latitude: gps?.latitude, longitude: gps?.longitude }, [{ champ: "fichier", fichier: photo }], cle);
