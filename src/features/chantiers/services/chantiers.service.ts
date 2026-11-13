import { apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { PaginatedResponse } from "@/features/clients/services/clients.service";
import type { ChantierEntete, ChantierListItem, ChantierStatut } from "../models/Chantier";

/** GET /chantiers — le chef de chantier ne reçoit que ses chantiers (filtré par l'API). */
export async function listChantiers(params: { statuts?: ChantierStatut[]; search?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 50) });
  if (params.statuts?.length) query.set("statuts", params.statuts.join(","));
  if (params.search?.trim()) query.set("search", params.search.trim());
  return apiRequest<PaginatedResponse<ChantierListItem>>(`${apiEndpoints.chantiers}?${query.toString()}`);
}

export const getChantier = (id: number) => apiRequest<ChantierEntete>(`${apiEndpoints.chantiers}/${id}`);
