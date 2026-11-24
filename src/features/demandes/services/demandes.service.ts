import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import type { DevisDetail } from "@/features/devis/models/Devis";
import type { ActionDemande, DemandeDetail, DemandeListItem, DemandeSource, DemandeStatut, Page } from "../models/Demande";

export type FiltresListe = {
  statuts: DemandeStatut[];
  source?: DemandeSource;
  search?: string;
  page?: number;
};

/** GET /demandes-devis — newest first, 20 per page. */
export function listDemandes(f: FiltresListe) {
  const q = new URLSearchParams({ page: String(f.page ?? 1), limit: "20" });
  if (f.statuts.length) q.set("statuts", f.statuts.join(","));
  if (f.source) q.set("source", f.source);
  if (f.search?.trim()) q.set("search", f.search.trim());
  return apiRequest<Page<DemandeListItem>>(`${apiEndpoints.demandesDevis}?${q.toString()}`);
}

export const getDemande = (id: number) => apiRequest<DemandeDetail>(`${apiEndpoints.demandesDevis}/${id}`);

/** Status change (take over, qualify, reject, reopen). The API refuses a forbidden step (422). */
export async function changerStatutDemande(id: number, action: ActionDemande): Promise<DemandeListItem> {
  return (await apiClient.post<DemandeListItem>(`${apiEndpoints.demandesDevis}/${id}/${action}`, undefined, { headers: enteteIdempotence() })).data;
}

/** Empty draft quote of the request (ADMIN, TECHNICO). Already converted → the same quote. */
export async function transformerEnDevis(id: number): Promise<DevisDetail> {
  return (await apiClient.post<DevisDetail>(`${apiEndpoints.demandesDevis}/${id}/convertir-en-devis`, undefined, { headers: enteteIdempotence() })).data;
}
