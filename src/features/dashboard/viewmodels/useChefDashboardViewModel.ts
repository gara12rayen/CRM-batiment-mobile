import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import type { ChantierListItem } from "@/features/chantiers/models/Chantier";
import { estEnRetard } from "@/features/chantiers/models/Tache";
import { listChantiers } from "@/features/chantiers/services/chantiers.service";
import { ajouterJours, aujourdHui, jourDe } from "@/shared/utils/dates";
import type { Bloc, ChefDashboardDonnees, CommandeAttendue, TachePlanning } from "../models/ChefDashboard";
import { getPlanning, listLivraisonsAttendues, listSavOuverts } from "../services/chefDashboard.service";

const vide = <T,>(): Bloc<T> => ({ donnees: [], total: 0, erreur: null });

/** Période relue pour trouver les tâches en retard (l'API accepte 45 jours au maximum). */
const JOURS_RETARD = 44;

/** Chantier « du jour » : planifié ou en cours, et aujourd'hui dans ses dates (dates vides = pas de limite). */
function estDuJour(c: ChantierListItem, jour: string): boolean {
  const debut = jourDe(c.dateDebut);
  const fin = jourDe(c.dateFin);
  if (c.statut === "PLANIFIE" && !debut) return false;
  return (!debut || debut <= jour) && (!fin || fin >= jour);
}

/** Livraisons : date prévue la plus proche d'abord, sans date à la fin. */
function trierLivraisons(a: CommandeAttendue, b: CommandeAttendue): number {
  const da = jourDe(a.dateLivraisonPrevue) ?? "9999";
  const db = jourDe(b.dateLivraisonPrevue) ?? "9999";
  return da.localeCompare(db);
}

/**
 * Tableau de bord du chef : 4 blocs chargés en parallèle. Un bloc en erreur n'empêche pas
 * les autres de s'afficher. Rechargé à chaque retour sur l'écran.
 */
export function useChefDashboardViewModel() {
  const [donnees, setDonnees] = useState<ChefDashboardDonnees>({
    chantiersDuJour: vide(),
    tachesEnRetard: vide(),
    livraisons: vide(),
    sav: vide(),
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jour, setJour] = useState(aujourdHui());
  const requete = useRef(0);

  const charger = useCallback(async () => {
    const id = ++requete.current;
    const today = aujourdHui();
    const [chantiers, planning, livraisons, sav] = await Promise.allSettled([
      listChantiers({ statuts: ["PLANIFIE", "EN_COURS"], limit: 100 }),
      getPlanning(ajouterJours(today, -JOURS_RETARD), today),
      listLivraisonsAttendues(),
      listSavOuverts(),
    ]);
    if (id !== requete.current) return;

    const erreur = (r: PromiseRejectedResult) => getErrorMessage(r.reason, "Impossible de charger ce bloc.");

    const chantiersDuJour: Bloc<ChantierListItem> =
      chantiers.status === "fulfilled"
        ? (() => {
            const liste = chantiers.value.data.filter((c) => estDuJour(c, today));
            return { donnees: liste, total: liste.length, erreur: null };
          })()
        : { ...vide<ChantierListItem>(), erreur: erreur(chantiers) };

    const tachesEnRetard: Bloc<TachePlanning> =
      planning.status === "fulfilled"
        ? (() => {
            const liste = planning.value.taches
              .filter((t) => estEnRetard(t, today, jourDe))
              .sort((a, b) => (jourDe(a.dateFin ?? a.dateDebut) ?? "").localeCompare(jourDe(b.dateFin ?? b.dateDebut) ?? ""));
            return { donnees: liste, total: liste.length, erreur: null };
          })()
        : { ...vide<TachePlanning>(), erreur: erreur(planning) };

    setDonnees({
      chantiersDuJour,
      tachesEnRetard,
      livraisons:
        livraisons.status === "fulfilled"
          ? { donnees: [...livraisons.value.data].sort(trierLivraisons), total: livraisons.value.meta.total, erreur: null }
          : { ...vide<CommandeAttendue>(), erreur: erreur(livraisons) },
      sav:
        sav.status === "fulfilled"
          ? { donnees: sav.value.data, total: sav.value.meta.total, erreur: null }
          : { ...vide(), erreur: erreur(sav) },
    });
    setJour(today);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  return {
    ...donnees,
    jour,
    loading,
    refreshing,
    refresh: () => {
      setRefreshing(true);
      void charger();
    },
  };
}
