import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import type { DevisDetail } from "@/features/devis/models/Devis";
import type { CommercialDashboard } from "../models/CommercialDashboard";

/** Commercial dashboard (bureau). moi=true: only my requests / quotes / visits. */
export function getCommercialDashboard(params: { jours?: number; moi?: boolean } = {}) {
  const query = new URLSearchParams({ jours: String(params.jours ?? 30) });
  if (params.moi) query.set("moi", "true");
  return apiRequest<CommercialDashboard>(`${apiEndpoints.dashboardCommercial}?${query.toString()}`);
}

/**
 * POST /demandes-devis/:id/convertir-en-devis — creates the EMPTY draft quote of a request
 * (ADMIN, TECHNICO). Already converted → the same quote again (no duplicate).
 */
export async function convertirDemandeEnDevis(demandeId: number): Promise<DevisDetail> {
  return (await apiClient.post<DevisDetail>(`${apiEndpoints.demandesDevis}/${demandeId}/convertir-en-devis`, undefined, { headers: enteteIdempotence() })).data;
}
