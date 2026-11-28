import { useCallback, useEffect, useState } from "react";
import { getChantiers } from "./chantiers.service";
import { Chantier, ChantierStatut } from "./types";

export function useChantiersViewModel() {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [filtre, setFiltre] = useState<ChantierStatut | "TOUS">("TOUS");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setChantiers(await getChantiers());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const liste = filtre === "TOUS" ? chantiers : chantiers.filter((c) => c.statut === filtre);

  return { liste, filtre, setFiltre, isLoading, reload: load };
}