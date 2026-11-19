import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import type { DevisDetail } from "@/features/devis/models/Devis";

/** GET /auth/me/signature — null when the advisor has not signed yet. */
export type MaSignature = { signatureBase64: string | null; signatureUpdatedAt: string | null };

export const getMaSignature = () => apiRequest<MaSignature>(apiEndpoints.auth.maSignature);

/** PUT /auth/me/signature — saves (or replaces) the advisor's signature. */
export async function enregistrerMaSignature(signatureBase64: string): Promise<{ signatureUpdatedAt: string }> {
  return (await apiClient.put<{ signatureUpdatedAt: string }>(apiEndpoints.auth.maSignature, { signatureBase64 })).data;
}

export type SignatureSurPlaceInput = {
  signatureClientBase64: string;
  nomSignataire: string;
  latitude?: number;
  longitude?: number;
};

/**
 * POST /devis/:id/signer-sur-place — the client signs on the advisor's phone → SIGNE.
 * The server then creates the job site, the deposit invoice and the supplier orders.
 * Same key for a retry of the same tap: the server signs only once.
 */
export async function signerSurPlace(id: number, body: SignatureSurPlaceInput, cle: string): Promise<DevisDetail> {
  return (await apiClient.post<DevisDetail>(`${apiEndpoints.devis}/${id}/signer-sur-place`, body, { headers: enteteIdempotence(cle), timeout: 30000 })).data;
}

/** POST /devis/:id/demander-signature — email with a signature link (quote ACCEPTE only). */
export async function demanderSignatureEmail(id: number): Promise<{ emailSent: boolean }> {
  const { data } = await apiClient.post<{ emailSent: boolean }>(`${apiEndpoints.devis}/${id}/demander-signature`, undefined, { headers: enteteIdempotence() });
  return { emailSent: !!data.emailSent };
}
