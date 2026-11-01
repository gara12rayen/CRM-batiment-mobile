
import { apiEndpoints } from "@/core/api/api-endpoints";
import { apiClient, apiRequest } from "@/core/api/api-client";
import type { Client } from "../models/Client";
import type { ClientDetails } from "../models/ClientDetails";

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetClientsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type ClientPayload = {
  nom: string;
  prenom?: string | null;
  typeClient?: "PARTICULIER" | "PROFESSIONNEL";
  telephone?: string | null;
  email?: string | null;
  siret?: string | null;
  tvaIntracom?: string | null;
  contactNom?: string | null;
  contactFonction?: string | null;
  adresseClient?: string | null;
  adresseChantier?: string | null;
  besoin?: string | null;
  notes?: string | null;
};

export async function getClients(
  params: GetClientsParams = {},
): Promise<PaginatedResponse<Client>> {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  return apiRequest<PaginatedResponse<Client>>(
    `${apiEndpoints.clients}?${query.toString()}`,
  );
}

export async function getClientById(
  id: number,
): Promise<ClientDetails> {
  return apiRequest<ClientDetails>(
    `${apiEndpoints.clients}/${id}`,
  );
}

export async function createClient(
  payload: ClientPayload,
): Promise<Client> {
  const response = await apiClient.post<Client>(
    apiEndpoints.clients,
    payload,
  );

  return response.data;
}

export async function updateClient(
  id: number,
  payload: Partial<ClientPayload>,
): Promise<Client> {
  const response = await apiClient.patch<Client>(
    `${apiEndpoints.clients}/${id}`,
    payload,
  );

  return response.data;
}
