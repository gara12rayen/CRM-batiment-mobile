import { apiClient, apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { Intervenant, Tache, TacheChecklistReponse, TacheCreation, TacheModification } from "../models/Tache";

/**
 * Tâches d'un chantier — mêmes routes que la version web, donc même base.
 * Lecture : ADMIN, TECHNICO, ASSISTANTE, CHEF_CHANTIER. Écriture : ADMIN, ASSISTANTE, CHEF_CHANTIER.
 */
const base = (chantierId: number) => `${apiEndpoints.chantiers}/${chantierId}/taches`;

export const listTaches = (chantierId: number) => apiRequest<Tache[]>(base(chantierId));

export async function creerTache(chantierId: number, body: TacheCreation): Promise<Tache> {
  return (await apiClient.post<Tache>(base(chantierId), body)).data;
}

/** Statut et avancement restent cohérents côté serveur (100 % ⇔ Terminée). */
export async function modifierTache(chantierId: number, tacheId: number, body: TacheModification): Promise<Tache> {
  return (await apiClient.patch<Tache>(`${base(chantierId)}/${tacheId}`, body)).data;
}

export async function supprimerTache(chantierId: number, tacheId: number): Promise<void> {
  await apiClient.delete(`${base(chantierId)}/${tacheId}`);
}

// ── Checklist : l'avancement de la tâche suit les cases cochées ──────────────
const checklist = (chantierId: number, tacheId: number) => `${base(chantierId)}/${tacheId}/checklist`;

export async function ajouterPoint(chantierId: number, tacheId: number, libelle: string): Promise<TacheChecklistReponse> {
  return (await apiClient.post<TacheChecklistReponse>(checklist(chantierId, tacheId), { libelle })).data;
}

export async function cocherPoint(chantierId: number, tacheId: number, itemId: number, fait: boolean): Promise<TacheChecklistReponse> {
  return (await apiClient.patch<TacheChecklistReponse>(`${checklist(chantierId, tacheId)}/${itemId}`, { fait })).data;
}

export async function supprimerPoint(chantierId: number, tacheId: number, itemId: number): Promise<TacheChecklistReponse> {
  return (await apiClient.delete<TacheChecklistReponse>(`${checklist(chantierId, tacheId)}/${itemId}`)).data;
}

/**
 * Personnes à qui affecter une tâche (GET /users/options).
 * Le chef de chantier ne peut ajouter que des sous-traitants ou lui-même (règle de l'API).
 */
export function listIntervenants(roles: string[]) {
  const query = new URLSearchParams({ roles: roles.join(",") });
  return apiRequest<Intervenant[]>(`${apiEndpoints.usersOptions}?${query.toString()}`);
}
