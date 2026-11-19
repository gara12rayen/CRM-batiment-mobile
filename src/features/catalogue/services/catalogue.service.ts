import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { PaginatedResponse } from "@/features/clients/services/clients.service";
import type { Categorie, Materiau } from "../models/Catalogue";
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

// ── Catalogue en consultation (lecture seule) ─────────────────────────────────────────────

/** Active categories with their sub-categories (not paginated: a few dozen at most). */
export const listerCategories = () => apiRequest<Categorie[]>(`${apiEndpoints.catalogue}/categories?actif=true`);

/** Active prestations, by page, optional search on the name and category filter. */
export async function listerPrestations(params: { page: number; limit: number; search?: string; categorieId?: number | null }): Promise<PaginatedResponse<Prestation>> {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit), actif: "true" });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.categorieId) query.set("categorieId", String(params.categorieId));
  return apiRequest<PaginatedResponse<Prestation>>(`${apiEndpoints.catalogue}/prestations?${query.toString()}`);
}

/** Active materials, by page, optional search on the name. */
export async function listerMateriaux(params: { page: number; limit: number; search?: string }): Promise<PaginatedResponse<Materiau>> {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit), actif: "true" });
  if (params.search?.trim()) query.set("search", params.search.trim());
  return apiRequest<PaginatedResponse<Materiau>>(`${apiEndpoints.catalogue}/materiaux?${query.toString()}`);
}

export const getMateriau = (id: number) => apiRequest<Materiau>(`${apiEndpoints.catalogue}/materiaux/${id}`);
