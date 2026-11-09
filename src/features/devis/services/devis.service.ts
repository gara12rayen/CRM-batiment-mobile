import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { PaginatedResponse } from "@/features/clients/services/clients.service";
import type { DevisDetail, DevisListItem, DevisStatut } from "../models/Devis";

/**
 * Quotes — everything is saved in the database of the web version, through the API
 * (same routes as the web: POST /devis, /devis/:id/lignes…). Totals are recalculated by the server.
 */
/** Paginated list (a chef de chantier only gets the quotes of his job sites, without amounts). */
export async function listDevis(params: { page: number; limit: number; search?: string; statuts?: DevisStatut[] }): Promise<PaginatedResponse<DevisListItem>> {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.statuts?.length) query.set("statuts", params.statuts.join(","));
  return apiRequest<PaginatedResponse<DevisListItem>>(`${apiEndpoints.devis}?${query.toString()}`);
}

export const getDevis = (id: number) => apiRequest<DevisDetail>(`${apiEndpoints.devis}/${id}`);

/** Draft quote (BROUILLON) for a client of the database. */
export async function creerDevis(clientId: number): Promise<DevisDetail> {
  return (await apiClient.post<DevisDetail>(apiEndpoints.devis, { clientId })).data;
}

/** VAT rate and internal notes (BROUILLON / REVISE only, checked by the API). */
export async function modifierDevis(id: number, body: { tauxTVA?: number; notes?: string | null }): Promise<DevisDetail> {
  return (await apiClient.patch<DevisDetail>(`${apiEndpoints.devis}/${id}`, body)).data;
}

export type LigneCatalogueInput = { prestationId: number; choixIds: number[]; quantite: number; prixUnitaireVente?: number };
export type LigneLibreInput = { description: string; quantite: number; unite: string; prixUnitaireVente: number };

/** Adds a line (catalogue: price suggested by the API unless overridden; free line: price given). */
export async function ajouterLigne(id: number, body: LigneCatalogueInput | LigneLibreInput): Promise<DevisDetail> {
  return (await apiClient.post<DevisDetail>(`${apiEndpoints.devis}/${id}/lignes`, body)).data;
}

export async function modifierLigne(id: number, ligneId: number, body: { quantite?: number; prixUnitaireVente?: number; description?: string | null }): Promise<DevisDetail> {
  return (await apiClient.patch<DevisDetail>(`${apiEndpoints.devis}/${id}/lignes/${ligneId}`, body)).data;
}

export async function supprimerLigne(id: number, ligneId: number): Promise<DevisDetail> {
  return (await apiClient.delete<DevisDetail>(`${apiEndpoints.devis}/${id}/lignes/${ligneId}`)).data;
}
