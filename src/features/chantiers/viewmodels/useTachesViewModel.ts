import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { aujourdHui, jourDe } from "@/shared/utils/dates";
import { CHANTIER_FERME, type ChantierEntete } from "../models/Chantier";
import { estEnRetard, type Tache, type TacheStatut } from "../models/Tache";
import { getChantier } from "../services/chantiers.service";
import { listTaches, modifierTache } from "../services/taches.service";

export type FiltreTaches = "TOUTES" | "RETARD" | TacheStatut;

/** Tâches d'un chantier : liste, filtres, changement rapide de statut. Rechargée au retour sur l'écran. */
export function useTachesViewModel(chantierId: number) {
  const { user } = useAuth();
  const [chantier, setChantier] = useState<ChantierEntete | null>(null);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [filtre, setFiltre] = useState<FiltreTaches>("TOUTES");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<number | null>(null);

  const charger = useCallback(async () => {
    if (!Number.isInteger(chantierId) || chantierId <= 0) {
      setError("Chantier introuvable.");
      setLoading(false);
      return;
    }
    try {
      const [c, t] = await Promise.all([getChantier(chantierId), listTaches(chantierId)]);
      setChantier(c);
      setTaches(t);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Impossible de charger les tâches."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chantierId]);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  const jour = aujourdHui();
  const retard = useCallback((t: Tache) => estEnRetard(t, jour, jourDe), [jour]);

  const tachesFiltrees = useMemo(() => {
    if (filtre === "TOUTES") return taches;
    if (filtre === "RETARD") return taches.filter(retard);
    return taches.filter((t) => t.statut === filtre);
  }, [taches, filtre, retard]);

  const compteurs = useMemo(
    () => ({
      TOUTES: taches.length,
      RETARD: taches.filter(retard).length,
      A_FAIRE: taches.filter((t) => t.statut === "A_FAIRE").length,
      EN_COURS: taches.filter((t) => t.statut === "EN_COURS").length,
      BLOQUEE: taches.filter((t) => t.statut === "BLOQUEE").length,
      TERMINEE: taches.filter((t) => t.statut === "TERMINEE").length,
    }),
    [taches, retard],
  );

  /** Écriture : ADMIN, ASSISTANTE, CHEF_CHANTIER (le TECHNICO consulte), chantier ni clôturé ni annulé. */
  const peutModifier = !!user && permissions.canManageChantiers(user.role) && !!chantier && !CHANTIER_FERME.includes(chantier.statut);

  /** Changement rapide de statut depuis la liste (l'API garde avancement et statut cohérents). */
  async function changerStatut(t: Tache, statut: TacheStatut) {
    if (!peutModifier || t.statut === statut) return;
    setEnCours(t.id);
    setActionError(null);
    try {
      const maj = await modifierTache(chantierId, t.id, { statut });
      setTaches((prev) => prev.map((x) => (x.id === maj.id ? maj : x)));
    } catch (e) {
      setActionError(getErrorMessage(e, "Impossible de modifier la tâche."));
    } finally {
      setEnCours(null);
    }
  }

  return {
    chantier,
    taches: tachesFiltrees,
    total: taches.length,
    compteurs,
    filtre,
    setFiltre,
    estEnRetard: retard,
    loading,
    refreshing,
    error,
    actionError,
    enCours,
    peutModifier,
    changerStatut,
    refresh: () => {
      setRefreshing(true);
      void charger();
    },
    retry: () => {
      setLoading(true);
      void charger();
    },
  };
}
