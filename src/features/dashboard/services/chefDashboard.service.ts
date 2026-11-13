import { apiRequest } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { PaginatedResponse } from "@/features/clients/services/clients.service";
import { COMMANDE_EN_ATTENTE, SAV_OUVERTS, type CommandeAttendue, type PlanningReponse, type SavTicketItem } from "../models/ChefDashboard";

/**
 * Le tableau de bord du chef assemble 4 routes existantes de l'API web
 * (GET /dashboard est réservé à l'ADMIN). Chaque route filtre déjà sur les chantiers du chef.
 */

/** Tâches datées sur une période (45 jours au maximum, règle de l'API). */
export function getPlanning(du: string, au: string) {
  const query = new URLSearchParams({ du, au });
  return apiRequest<PlanningReponse>(`${apiEndpoints.planning}?${query.toString()}`);
}

/** Commandes fournisseur dont la livraison est encore attendue. */
export function listLivraisonsAttendues(limit = 50) {
  const query = new URLSearchParams({ page: "1", limit: String(limit), statuts: COMMANDE_EN_ATTENTE.join(",") });
  return apiRequest<PaginatedResponse<CommandeAttendue>>(`${apiEndpoints.commandesFournisseur}?${query.toString()}`);
}

/** Tickets SAV pas encore résolus (urgents d'abord). */
export function listSavOuverts(limit = 10) {
  const query = new URLSearchParams({ page: "1", limit: String(limit), statuts: SAV_OUVERTS.join(",") });
  return apiRequest<PaginatedResponse<SavTicketItem>>(`${apiEndpoints.sav}?${query.toString()}`);
}
