import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import type { DevisDetail } from "../models/Devis";
import { getDevis } from "../services/devis.service";

/** Loads a quote from the API; reloads when the screen comes back into view (after adding a line). */
export function useDevisDetailViewModel(id: number) {
  const [devis, setDevis] = useState<DevisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charger = useCallback(async () => {
    if (!Number.isInteger(id) || id <= 0) {
      setError("Identifiant du devis invalide.");
      setLoading(false);
      return;
    }
    try {
      setDevis(await getDevis(id));
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Impossible de charger le devis."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  return {
    devis,
    setDevis,
    loading,
    refreshing,
    error,
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
