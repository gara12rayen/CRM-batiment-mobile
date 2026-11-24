import { apiClient } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import type { DevisDetail } from "@/features/devis/models/Devis";

/**
 * POST /devis/brouillon-chef — the chef starts a draft for the Devis IA (no price).
 * Allowed client: one of his job sites, or a prospect terrain he sent (then demandeDevisId).
 */
export async function creerBrouillonChef(body: { clientId: number; demandeDevisId?: number }): Promise<DevisDetail> {
  return (await apiClient.post<DevisDetail>(`${apiEndpoints.devis}/brouillon-chef`, body, { headers: enteteIdempotence() })).data;
}
