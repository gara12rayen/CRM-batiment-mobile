import { apiClient } from "@/core/api/api-client";
import { enteteIdempotence } from "@/core/api/idempotency";
import { partieFormData, type FichierLocal } from "@/shared/media/media.service";

export type Champs = Record<string, string | number | boolean | null | undefined>;

/**
 * POST multipart/form-data (fields + files). The phone adds the boundary itself, so the
 * FormData must not be turned into JSON. `cle` = Idempotency-Key (same key = saved once).
 */
export async function postMultipart<T>(url: string, champs: Champs, fichiers: { champ: string; fichier: FichierLocal }[], cle?: string, timeout = 60_000): Promise<T> {
  const form = new FormData();
  for (const [k, v] of Object.entries(champs)) {
    if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
  }
  for (const { champ, fichier } of fichiers) form.append(champ, (await partieFormData(fichier)) as unknown as Blob, fichier.nom);
  const { data } = await apiClient.post<T>(url, form, {
    headers: { "Content-Type": "multipart/form-data", ...(cle ? enteteIdempotence(cle) : {}) },
    transformRequest: (d: unknown) => d,
    timeout,
  });
  return data;
}
