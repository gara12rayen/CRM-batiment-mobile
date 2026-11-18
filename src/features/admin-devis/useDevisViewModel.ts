import { useCallback, useEffect, useState } from "react";
import { changerStatut, envoyerDevis, getDevisList } from "./devis.service";
import { Devis, DevisStatut } from "./types";

export function useDevisViewModel() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [filtre, setFiltre] = useState<DevisStatut | "TOUS">("TOUS");
  const [isLoading, setIsLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setDevis(await getDevisList());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const liste = filtre === "TOUS" ? devis : devis.filter((d) => d.statut === filtre);

  const mettreAJour = (maj: Devis) =>
    setDevis((l) => l.map((d) => (d.id === maj.id ? maj : d)));

  const changer = async (id: string, statut: DevisStatut) => {
    try {
      setErreur("");
      mettreAJour(await changerStatut(id, statut));
    } catch (e: any) {
      setErreur(e.message);
    }
  };

  const envoyer = async (id: string) => {
    try {
      setErreur("");
      mettreAJour(await envoyerDevis(id));
    } catch (e: any) {
      setErreur(e.message);
    }
  };

  return { liste, filtre, setFiltre, isLoading, erreur, changer, envoyer, reload: load };
}