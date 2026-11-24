import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import { postMultipart } from "@/core/api/multipart";
import { enregistrerExecuteur } from "@/core/offline/fileEnvoi";
import type { Page } from "@/features/demandes/models/Demande";
import type { SavCategorie, SavChantier, SavPriorite, SavTicket } from "../models/Sav";

/** Chef: his job sites (no clientId). Bureau: the job sites of the chosen client. */
export function listSavChantiers(clientId?: number) {
  const q = clientId ? `?clientId=${clientId}` : "";
  return apiRequest<{ savDureeMois: number; chantiers: SavChantier[] }>(`${apiEndpoints.sav}/chantiers${q}`);
}

/** Tickets visible to the user (the chef: his job sites), newest first. */
export function listSav(page = 1) {
  return apiRequest<Page<SavTicket>>(`${apiEndpoints.sav}?page=${page}&limit=30`);
}

export type SavPayload = {
  clientId: number;
  chantierId: number;
  titre: string;
  description: string;
  categorie?: SavCategorie;
  priorite?: SavPriorite;
};

/** POST /sav then POST /sav/:id/photos. Same keys on a retry: one ticket, photos once. */
enregistrerExecuteur("SAV", async (e) => {
  const p = e.payload as SavPayload;
  const { data } = await apiClient.post<{ id: number }>(apiEndpoints.sav, p, { headers: enteteIdempotence(e.cle) });
  if (e.fichiers.length) {
    await postMultipart(`${apiEndpoints.sav}/${data.id}/photos`, {}, e.fichiers.map((fichier) => ({ champ: "photos", fichier })), `${e.cle}-photos`, 120_000);
  }
});
