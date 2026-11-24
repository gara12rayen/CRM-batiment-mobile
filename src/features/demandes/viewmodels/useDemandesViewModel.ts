import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import { statutsDuFiltre, type DemandeListItem, type FiltreDemandes } from "../models/Demande";
import { listDemandes } from "../services/demandes.service";

/** List of quote requests: status filter, « prospects terrain » only, search, pages of 20. */
export function useDemandesViewModel() {
  const [filtre, setFiltre] = useState<FiltreDemandes>("actives");
  const [terrainSeulement, setTerrainSeulement] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [rechercheEnvoyee, setRechercheEnvoyee] = useState("");
  const [items, setItems] = useState<DemandeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const requete = useRef(0);

  // The search is sent 400 ms after the last key
  useEffect(() => {
    const t = setTimeout(() => setRechercheEnvoyee(recherche), 400);
    return () => clearTimeout(t);
  }, [recherche]);

  const charger = useCallback(
    async (pageVoulue: number) => {
      const id = ++requete.current;
      setErreur(null);
      try {
        const r = await listDemandes({
          statuts: statutsDuFiltre(filtre),
          source: terrainSeulement ? "TERRAIN" : undefined,
          search: rechercheEnvoyee,
          page: pageVoulue,
        });
        if (id !== requete.current) return;
        setItems((avant) => (pageVoulue === 1 ? r.data : [...avant, ...r.data]));
        setTotal(r.meta.total);
        setPage(pageVoulue);
      } catch (e) {
        if (id === requete.current) setErreur(getErrorMessage(e, "Impossible de charger les demandes."));
      } finally {
        if (id === requete.current) {
          setLoading(false);
          setRefreshing(false);
          setPlus(false);
        }
      }
    },
    [filtre, terrainSeulement, rechercheEnvoyee],
  );

  // New filter → back to page 1; also when coming back on the screen (a status may have changed)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void charger(1);
    }, [charger]),
  );

  const refresh = () => {
    setRefreshing(true);
    void charger(1);
  };

  const chargerPlus = () => {
    if (plus || loading || items.length >= total) return;
    setPlus(true);
    void charger(page + 1);
  };

  return {
    filtre,
    setFiltre,
    terrainSeulement,
    setTerrainSeulement,
    recherche,
    setRecherche,
    items,
    total,
    loading,
    refreshing,
    plus,
    erreur,
    refresh,
    chargerPlus,
    retry: () => charger(1),
  };
}
