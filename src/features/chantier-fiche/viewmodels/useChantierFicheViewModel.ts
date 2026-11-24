import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { Linking } from "react-native";
import { ApiError, getErrorMessage } from "@/core/api/api-client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { telechargerFichier } from "@/shared/media/media.service";
import type { ChantierFiche, DocumentChantier } from "../models/ChantierFiche";
import { changerStatutChantier, getChantierFiche, getChantierSousTraitant, modifierChantier } from "../services/chantierFiche.service";

/** « 25/11/2026 » or « 2026-11-25 » → « 2026-11-25 » ; "" → null ; invalid → undefined. */
export function lireDate(texte: string): string | null | undefined {
  const t = texte.trim();
  if (!t) return null;
  const fr = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  const iso = fr ? `${fr[3]}-${fr[2].padStart(2, "0")}-${fr[1].padStart(2, "0")}` : /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
  if (!iso) return undefined;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso ? iso : undefined;
}

export const versDateFr = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "UTC" }) : "");

export function useChantierFicheViewModel(id: number) {
  const { user } = useAuth();
  const sousTraitant = user?.role === "SOUS_TRAITANT";
  const peutModifier = !!user && permissions.canEditChantier(user.role);

  const [fiche, setFiche] = useState<ChantierFiche | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [refuse, setRefuse] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [ouverture, setOuverture] = useState<number | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setFiche(await (sousTraitant ? getChantierSousTraitant(id) : getChantierFiche(id)));
      setRefuse(false);
    } catch (e) {
      // 403 / 404: outside the user's scope → « Accès refusé »
      if (e instanceof ApiError && (e.status === 403 || e.status === 404)) setRefuse(true);
      else setErreur(getErrorMessage(e, "Impossible de charger le chantier."));
    } finally {
      setLoading(false);
    }
  }, [id, sousTraitant]);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  async function changerStatut(a: "demarrer" | "suspendre" | "reprendre" | "terminer") {
    setAction(a);
    setErreur(null);
    try {
      await changerStatutChantier(id, a);
      await charger();
    } catch (e) {
      setErreur(getErrorMessage(e, "Le statut n’a pas pu être changé."));
    } finally {
      setAction(null);
    }
  }

  /** Dates (JJ/MM/AAAA) and notes. Returns an error message to show in the form, or null. */
  async function enregistrer(champs: { debut: string; fin: string; notes: string }): Promise<string | null> {
    const dateDebut = lireDate(champs.debut);
    const dateFin = lireDate(champs.fin);
    if (dateDebut === undefined || dateFin === undefined) return "Date invalide : écrivez-la comme 25/11/2026.";
    if (dateDebut && dateFin && dateFin < dateDebut) return "La date de fin est avant la date de début.";
    setAction("modifier");
    try {
      await modifierChantier(id, { dateDebut, dateFin, notes: champs.notes.trim() || null });
      await charger();
      return null;
    } catch (e) {
      return getErrorMessage(e, "Les modifications n’ont pas pu être enregistrées.");
    } finally {
      setAction(null);
    }
  }

  /** A link opens in the browser; a stored file is downloaded (with the token) then shared/opened. */
  async function ouvrirDocument(doc: DocumentChantier) {
    setErreur(null);
    if (doc.url) {
      void Linking.openURL(doc.url);
      return;
    }
    if (!doc.fichierId) return;
    setOuverture(doc.id);
    try {
      const uri = await telechargerFichier(doc.fichierId, doc.nom);
      if (Platform.OS === "web") window.open(uri, "_blank");
      else if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { dialogTitle: doc.nom });
    } catch (e) {
      setErreur(getErrorMessage(e, "Le document n’a pas pu être ouvert."));
    } finally {
      setOuverture(null);
    }
  }

  return { fiche, loading, erreur, refuse, action, ouverture, sousTraitant, peutModifier, changerStatut, enregistrer, ouvrirDocument, recharger: charger };
}
