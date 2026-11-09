import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { PaginatedResponse } from "@/features/clients/services/clients.service";
import type { PrestationDetail, Prestation, PrixSuggere } from "../models/Prestation";

/** Active prestations of the catalogue (8 per search, like the web picker). */
export async function rechercherPrestations(search: string): Promise<PaginatedResponse<Prestation>> {
  const query = new URLSearchParams({ page: "1", limit: "8", actif: "true" });
  if (search.trim()) query.set("search", search.trim());
  return apiRequest<PaginatedResponse<Prestation>>(`${apiEndpoints.catalogue}/prestations?${query.toString()}`);
}

export const getPrestation = (id: number) => apiRequest<PrestationDetail>(`${apiEndpoints.catalogue}/prestations/${id}`);

/** Suggested sale price for a quantity and chosen options (company pricing settings). */
export async function prixSuggere(id: number, quantite: number, choixIds: number[]): Promise<PrixSuggere> {
  const { data } = await apiClient.post<PrixSuggere>(`${apiEndpoints.catalogue}/prestations/${id}/chiffrage`, { quantite, choixIds });
  return { prixVenteSuggereUnite: data.prixVenteSuggereUnite, totalVenteHT: data.totalVenteHT, avertissements: data.avertissements ?? [] };
}
