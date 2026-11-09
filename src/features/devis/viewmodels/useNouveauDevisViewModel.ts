import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import type { Client } from "@/features/clients/models/Client";
import { getClients } from "@/features/clients/services/clients.service";
import { creerDevis } from "../services/devis.service";

/**
 * New quote: pick the client (search), the draft is created and opened.
 * With `clientId` (from a client page) the draft is created at once.
 */
export function useNouveauDevisViewModel(clientId?: number) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [creation, setCreation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requete = useRef(0);
  const dejaCree = useRef(false);

  const creer = async (id: number) => {
    if (creation) return;
    setCreation(true);
    setError(null);
    try {
      const devis = await creerDevis(id);
      router.replace(`/devis/${devis.id}`);
    } catch (e) {
      setError(getErrorMessage(e, "Impossible de créer le devis."));
      setCreation(false);
    }
  };

  // Opened from a client page: no need to choose
  useEffect(() => {
    if (clientId && !dejaCree.current) {
      dejaCree.current = true;
      void creer(clientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    if (clientId) return;
    const id = ++requete.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getClients({ page: 1, limit: 15, search });
        if (id === requete.current) {
          setClients(res.data);
          setError(null);
        }
      } catch (e) {
        if (id === requete.current) setError(getErrorMessage(e, "Impossible de charger les clients."));
      } finally {
        if (id === requete.current) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, clientId]);

  return { search, setSearch, clients, loading, creation, error, choisir: (c: Client) => void creer(c.id) };
}
