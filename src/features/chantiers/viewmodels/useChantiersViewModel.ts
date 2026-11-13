import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import type { ChantierListItem, ChantierStatut } from "../models/Chantier";
import { listChantiers } from "../services/chantiers.service";

const PAGE_SIZE = 20;

export const FILTRES_CHANTIERS: { value: string; label: string; statuts: ChantierStatut[] }[] = [
  { value: "OUVERTS", label: "En cours / planifiés", statuts: ["EN_COURS", "PLANIFIE", "SUSPENDU"] },
  { value: "EN_COURS", label: "En cours", statuts: ["EN_COURS"] },
  { value: "PLANIFIE", label: "Planifiés", statuts: ["PLANIFIE"] },
  { value: "SUSPENDU", label: "Suspendus", statuts: ["SUSPENDU"] },
  { value: "TERMINE", label: "Terminés", statuts: ["TERMINE", "CLOTURE"] },
  { value: "TOUS", label: "Tous", statuts: [] },
];

/** Liste des chantiers (le chef ne reçoit que les siens) : recherche, filtre statut, pagination. */
export function useChantiersViewModel() {
  const [chantiers, setChantiers] = useState<ChantierListItem[]>([]);
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("OUVERTS");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requete = useRef(0);

  const charger = useCallback(
    async (p: number, mode: "remplacer" | "ajouter") => {
      const id = ++requete.current;
      try {
        const statuts = FILTRES_CHANTIERS.find((f) => f.value === filtre)?.statuts ?? [];
        const res = await listChantiers({ page: p, limit: PAGE_SIZE, search, statuts });
        if (id !== requete.current) return;
        setChantiers((prev) => (mode === "ajouter" ? [...prev, ...res.data] : res.data));
        setPage(res.meta.page);
        setTotalPages(res.meta.totalPages);
        setError(null);
      } catch (e) {
        if (id === requete.current) {
          // Nouvelle recherche / nouveau filtre en erreur : ne pas laisser l'ancienne liste affichée
          if (mode === "remplacer") setChantiers([]);
          setError(getErrorMessage(e, "Impossible de charger les chantiers."));
        }
      } finally {
        if (id === requete.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [filtre, search],
  );

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => void charger(1, "remplacer"), 350);
    return () => clearTimeout(t);
  }, [charger]);

  const premierFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (premierFocus.current) {
        premierFocus.current = false;
        return;
      }
      void charger(1, "remplacer");
    }, [charger]),
  );

  return {
    chantiers,
    search,
    setSearch,
    filtre,
    setFiltre,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh: () => {
      setRefreshing(true);
      void charger(1, "remplacer");
    },
    chargerPlus: () => {
      if (loading || loadingMore || page >= totalPages) return;
      setLoadingMore(true);
      void charger(page + 1, "ajouter");
    },
    retry: () => {
      setLoading(true);
      void charger(1, "remplacer");
    },
  };
}
