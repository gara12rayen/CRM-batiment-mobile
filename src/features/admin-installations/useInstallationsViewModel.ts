import { useCallback, useEffect, useState } from "react";
import { getInstallations } from "./installations.service";
import { ETAPES, Installation, livraisonEnRetard } from "./types";

export function useInstallationsViewModel() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setInstallations(await getInstallations());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Groupé par étape (seulement les étapes non vides)
  const groupes = ETAPES.map((e) => ({
    etape: e,
    items: installations.filter((i) => i.etape === e.key),
  })).filter((g) => g.items.length > 0);

  const nbRetards = installations.filter(livraisonEnRetard).length;

  return { groupes, nbRetards, isLoading, reload: load };
}