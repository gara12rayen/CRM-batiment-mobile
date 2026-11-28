import { useCallback, useEffect, useState } from "react";
import { getClients } from "./clients.service";
import { Client } from "./types";

export function useClientsViewModel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [recherche, setRecherche] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setClients(await getClients());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const liste = clients.filter((c) =>
    (c.nom + c.email + c.telephone).toLowerCase().includes(recherche.toLowerCase())
  );

  return { liste, recherche, setRecherche, isLoading, reload: load };
}