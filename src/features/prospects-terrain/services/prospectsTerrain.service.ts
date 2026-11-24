import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import { postMultipart } from "@/core/api/multipart";
import { enregistrerExecuteur } from "@/core/offline/fileEnvoi";
import type { Page } from "@/features/demandes/models/Demande";
import type { NouveauContact, ProspectTerrain } from "../models/ProspectTerrain";

/** My prospects sent from the field (the bureau sees all of them), newest first. */
export function listProspectsTerrain(params: { page?: number; limit?: number } = {}) {
  const q = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 50) });
  return apiRequest<Page<ProspectTerrain>>(`${apiEndpoints.prospectsTerrain}?${q.toString()}`);
}

export const getProspectTerrain = (id: number) => apiRequest<ProspectTerrain>(`${apiEndpoints.prospectsTerrain}/${id}`);

export type ProspectPayload = {
  clientId?: number;
  client?: NouveauContact;
  description: string;
  creerQuandMeme?: boolean;
  /** Length of the voice notes, same order as the files (null for a photo) */
  durees: (number | null)[];
};

/**
 * POST /prospects-terrain (the sales team is notified), then each photo / voice note with
 * POST /prospects-terrain/:id/fichiers. Same keys on a retry: nothing is created twice.
 */
enregistrerExecuteur("PROSPECT_TERRAIN", async (e) => {
  const p = e.payload as ProspectPayload;
  const { data } = await apiClient.post<ProspectTerrain>(
    apiEndpoints.prospectsTerrain,
    { clientId: p.clientId, client: p.client, description: p.description, creerQuandMeme: p.creerQuandMeme },
    { headers: enteteIdempotence(e.cle) },
  );
  for (const [i, fichier] of e.fichiers.entries()) {
    await postMultipart(`${apiEndpoints.prospectsTerrain}/${data.id}/fichiers`, { dureeSecondes: p.durees[i] ?? undefined }, [{ champ: "fichier", fichier }], `${e.cle}-f${i}`);
  }
});
