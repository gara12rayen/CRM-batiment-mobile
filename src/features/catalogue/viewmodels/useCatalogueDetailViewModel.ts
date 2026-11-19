import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/core/api/api-client";

/** Loads one catalogue item (prestation or material) by id, with retry. */
export function useCatalogueDetailViewModel<T>(id: number, charger: (id: number) => Promise<T>, messageErreur: string) {
  const [element, setElement] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lancer = useCallback(async () => {
    if (!Number.isInteger(id) || id <= 0) {
      setError("Identifiant invalide.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setElement(await charger(id));
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, messageErreur));
    } finally {
      setLoading(false);
    }
  }, [id, charger, messageErreur]);

  useEffect(() => {
    void lancer();
  }, [lancer]);

  return { element, loading, error, retry: () => void lancer() };
}
