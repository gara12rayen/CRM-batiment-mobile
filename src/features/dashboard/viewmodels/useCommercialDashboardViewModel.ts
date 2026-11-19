import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import type { CommercialDashboard } from "../models/CommercialDashboard";
import { convertirDemandeEnDevis, getCommercialDashboard } from "../services/commercialDashboard.service";

/** Commercial dashboard: loaded at each return on the screen, pull to refresh. */
export function useCommercialDashboardViewModel() {
  const router = useRouter();
  const [donnees, setDonnees] = useState<CommercialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [conversion, setConversion] = useState<number | null>(null);
  const requete = useRef(0);

  const charger = useCallback(async () => {
    const id = ++requete.current;
    setErreur(null);
    try {
      const d = await getCommercialDashboard();
      if (id === requete.current) setDonnees(d);
    } catch (e) {
      if (id === requete.current) setErreur(getErrorMessage(e, "Impossible de charger le tableau de bord."));
    } finally {
      if (id === requete.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  const refresh = () => {
    setRefreshing(true);
    void charger();
  };

  /** Request → empty draft quote → its detail screen (where the Devis IA can be opened). */
  async function creerDevis(demandeId: number) {
    setConversion(demandeId);
    setErreur(null);
    try {
      const devis = await convertirDemandeEnDevis(demandeId);
      router.push({ pathname: "/devis/[id]", params: { id: String(devis.id) } });
    } catch (e) {
      setErreur(getErrorMessage(e, "Le devis n’a pas pu être créé."));
    } finally {
      setConversion(null);
    }
  }

  return { donnees, loading, refreshing, erreur, refresh, retry: charger, conversion, creerDevis };
}
