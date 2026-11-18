import { useCallback, useEffect, useState } from "react";
import {
  confirmerSignature,
  getCommandes,
  getFactures,
  getSignatures,
  marquerFacturePayee,
  refuserSignature,
  validerCommande,
} from "./validations.service";
import {
  CommandeAValider,
  FactureAMarquerPayee,
  SignatureAVerifier,
  ValidationTab,
} from "./types";

export function useValidationsViewModel() {
  const [tab, setTab] = useState<ValidationTab>("signatures");
  const [signatures, setSignatures] = useState<SignatureAVerifier[]>([]);
  const [commandes, setCommandes] = useState<CommandeAValider[]>([]);
  const [factures, setFactures] = useState<FactureAMarquerPayee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [s, c, f] = await Promise.all([getSignatures(), getCommandes(), getFactures()]);
    setSignatures(s);
    setCommandes(c);
    setFactures(f);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmer = async (id: string) => {
    await confirmerSignature(id);
    setSignatures((l) => l.filter((x) => x.id !== id));
  };

  const refuser = async (id: string, motif: string) => {
    await refuserSignature(id, motif);
    setSignatures((l) => l.filter((x) => x.id !== id));
  };

  const valider = async (id: string) => {
    await validerCommande(id);
    setCommandes((l) => l.filter((x) => x.id !== id));
  };

  const marquerPayee = async (id: string) => {
    await marquerFacturePayee(id);
    setFactures((l) => l.filter((x) => x.id !== id));
  };

  return {
    tab, setTab, isLoading,
    signatures, commandes, factures,
    confirmer, refuser, valider, marquerPayee,
  };
}
