import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { enteteIdempotence } from "@/core/api/idempotency";
import type { ChantierStatut } from "@/features/chantiers/models/Chantier";
import type { ChantierFiche } from "../models/ChantierFiche";

/** Bureau and chef: GET /chantiers/:id (the API removes the amounts for the chef). */
export const getChantierFiche = (id: number) => apiRequest<ChantierFiche>(`${apiEndpoints.chantiers}/${id}`);

/** Sous-traitant: his portal (no price, no client phone). */
export const getChantierSousTraitant = (id: number) => apiRequest<ChantierFiche>(`${apiEndpoints.portailSousTraitant}/chantiers/${id}`);

export type ChantierSousTraitantItem = {
  id: number;
  reference: string;
  adresse: string;
  statut: ChantierStatut;
  dateDebut: string | null;
  dateFin: string | null;
  client: { nom: string };
  avancement: number;
  mesTaches: number;
};

export const listChantiersSousTraitant = () => apiRequest<ChantierSousTraitantItem[]>(`${apiEndpoints.portailSousTraitant}/chantiers`);

/** POST /chantiers/:id/demarrer | suspendre | reprendre | terminer */
export async function changerStatutChantier(id: number, action: "demarrer" | "suspendre" | "reprendre" | "terminer"): Promise<void> {
  await apiClient.post(`${apiEndpoints.chantiers}/${id}/${action}`, undefined, { headers: enteteIdempotence() });
}

/** PATCH /chantiers/:id — the chef may change the dates and the notes (not the chef himself). */
export async function modifierChantier(id: number, body: { dateDebut?: string | null; dateFin?: string | null; notes?: string | null }): Promise<void> {
  await apiClient.patch(`${apiEndpoints.chantiers}/${id}`, body);
}
