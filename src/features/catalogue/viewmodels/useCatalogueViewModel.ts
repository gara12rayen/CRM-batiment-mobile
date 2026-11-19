import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/core/api/api-client";
import type { Categorie, Materiau, OngletCatalogue } from "../models/Catalogue";
import type { Prestation } from "../models/Prestation";
import { listerCategories, listerMateriaux, listerPrestations } from "../services/catalogue.service";

const PAGE_SIZE = 20;

type Element = { type: "PRESTATIONS"; item: Prestation } | { type: "MATERIAUX"; item: Materiau };

/**
 * Catalogue (read only): two tabs Prestations / Matériaux, search (after typing stops),
 * category filter for prestations, infinite scroll and pull to refresh.
 */
export function useCatalogueViewModel() {
  const [onglet, setOnglet] = useState<OngletCatalogue>("PRESTATIONS");
  const [search, setSearch] = useState("");
  const [categorieId, setCategorieId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [elements, setElements] = useState<Element[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requete = useRef(0);

  // Categories once (chips above the prestations list); an error here only hides the chips
  useEffect(() => {
    listerCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const charger = useCallback(
    async (p: number, mode: "remplacer" | "ajouter") => {
      const id = ++requete.current;
      try {
        const res =
          onglet === "PRESTATIONS"
            ? await listerPrestations({ page: p, limit: PAGE_SIZE, search, categorieId })
            : await listerMateriaux({ page: p, limit: PAGE_SIZE, search });
        if (id !== requete.current) return; // an older answer arriving late
        const nouveaux: Element[] =
          onglet === "PRESTATIONS"
            ? (res.data as Prestation[]).map((item) => ({ type: "PRESTATIONS", item }))
            : (res.data as Materiau[]).map((item) => ({ type: "MATERIAUX", item }));
        setElements((prev) => (mode === "ajouter" ? [...prev, ...nouveaux] : nouveaux));
        setPage(res.meta.page);
        setTotalPages(res.meta.totalPages);
        setError(null);
      } catch (e) {
        if (id === requete.current) {
          if (mode === "remplacer") setElements([]);
          setError(getErrorMessage(e, "Impossible de charger le catalogue."));
        }
      } finally {
        if (id === requete.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [onglet, search, categorieId],
  );

  // New tab, search (300 ms after typing stops) or category → first page
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => void charger(1, "remplacer"), 300);
    return () => clearTimeout(t);
  }, [charger]);

  return {
    onglet,
    changerOnglet: (o: OngletCatalogue) => {
      if (o === onglet) return;
      setElements([]);
      setOnglet(o);
    },
    search,
    setSearch,
    categories,
    categorieId,
    choisirCategorie: (id: number | null) => setCategorieId((actuelle) => (actuelle === id ? null : id)),
    elements,
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
