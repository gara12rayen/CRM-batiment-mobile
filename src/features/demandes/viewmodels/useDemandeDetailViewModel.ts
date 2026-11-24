import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import type { ActionDemande, DemandeDetail } from "../models/Demande";
import { changerStatutDemande, getDemande, transformerEnDevis } from "../services/demandes.service";

/** One request: details, photos and voice notes, status actions, « transformer en devis ». */
export function useDemandeDetailViewModel(id: number) {
  const router = useRouter();
  const [demande, setDemande] = useState<DemandeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<ActionDemande | "transformer" | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setDemande(await getDemande(id));
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger la demande."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function agir(action: ActionDemande) {
    if (!demande) return;
    setEnCours(action);
    setErreur(null);
    try {
      const maj = await changerStatutDemande(demande.id, action);
      // The answer has no attachments: keep the ones already loaded
      setDemande((d) => (d ? { ...d, ...maj, fichiers: d.fichiers } : d));
    } catch (e) {
      setErreur(getErrorMessage(e, "L’action n’a pas pu être faite."));
      void charger();
    } finally {
      setEnCours(null);
    }
  }

  /** Empty draft → its detail screen (where « Ouvrir le Devis IA » is). */
  async function transformer() {
    if (!demande) return;
    setEnCours("transformer");
    setErreur(null);
    try {
      const devis = await transformerEnDevis(demande.id);
      router.push({ pathname: "/devis/[id]", params: { id: String(devis.id) } });
      void charger();
    } catch (e) {
      setErreur(getErrorMessage(e, "Le devis n’a pas pu être créé."));
    } finally {
      setEnCours(null);
    }
  }

  return { demande, loading, erreur, enCours, agir, transformer, recharger: charger };
}
