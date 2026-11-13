import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import { DEVIS_FILTRES, type DevisListItem } from "../models/Devis";
import { listDevis } from "../services/devis.service";

const PAGE_SIZE = 20;

/** Quotes tab: search, status filter, infinite scroll, pull to refresh, reload when the tab comes back. */
export function useDevisListViewModel() {
  const [devis, setDevis] = useState<DevisListItem[]>([]);
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("TOUS");
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
        const statuts = DEVIS_FILTRES.find((f) => f.value === filtre)?.statuts ?? [];
        const res = await listDevis({ page: p, limit: PAGE_SIZE, search, statuts });
        if (id !== requete.current) return; // an older answer arriving late
        setDevis((prev) => (mode === "ajouter" ? [...prev, ...res.data] : res.data));
        setPage(res.meta.page);
        setTotalPages(res.meta.totalPages);
        setError(null);
      } catch (e) {
        if (id === requete.current) {
          // Nouvelle recherche / nouveau filtre en erreur : ne pas laisser l'ancienne liste affichée
          if (mode === "remplacer") setDevis([]);
          setError(getErrorMessage(e, "Impossible de charger les devis."));
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

  // New search (after typing stops) or new filter → first page
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => void charger(1, "remplacer"), 350);
    return () => clearTimeout(t);
  }, [charger]);

  // Back on the tab (e.g. after creating a quote) → refresh silently
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
    devis,
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
