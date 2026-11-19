import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getErrorMessage } from "@/core/api/api-client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import type { DevisDetail } from "@/features/devis/models/Devis";
import { getDevis, modifierLigne, supprimerLigne } from "@/features/devis/services/devis.service";
import { choisirPhotos, prendrePhoto, type FichierLocal } from "@/shared/media/media.service";
import {
  ATTENTE_LONGUE_MS,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  lireNombre,
  MAX_PHOTOS_IA,
  versTexte,
  type DemandeRappel,
  type LigneEditee,
  type Onglet,
  type Proposition,
} from "../models/DevisIA";
import { appliquer, getDemandeRappel, proposerPhotos, proposerTexte, transcrire } from "../services/devisIA.service";

export type Etape = "saisie" | "attente" | "apercu" | "recap";

/**
 * Devis IA on a draft: describe (text, photos, voice, plan) → wait → correct the proposal →
 * « Enregistrer en brouillon » → recap with the margin (bureau). The chef never sees a price.
 */
export function useDevisIAViewModel(devisId: number) {
  const { user } = useAuth();
  const avecPrix = !!user && permissions.canViewAmounts(user.role);

  const [devis, setDevis] = useState<DevisDetail | null>(null);
  const [demande, setDemande] = useState<DemandeRappel | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [onglet, setOnglet] = useState<Onglet>("texte");
  const [texte, setTexte] = useState("");
  const [photos, setPhotos] = useState<FichierLocal[]>([]);
  const [transcription, setTranscription] = useState(false);

  const [etape, setEtape] = useState<Etape>("saisie");
  const [attenteLongue, setAttenteLongue] = useState(false);
  const [proposition, setProposition] = useState<Proposition | null>(null);
  const [lignes, setLignes] = useState<LigneEditee[]>([]);
  const [enregistrement, setEnregistrement] = useState(false);
  const [nouvelles, setNouvelles] = useState<number[]>([]);
  const [ligneEnCours, setLigneEnCours] = useState<number | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setErreur(null);
    try {
      const d = await getDevis(devisId);
      setDevis(d);
      if (d.demandeDevis) {
        setTexte((t) => t || d.demandeDevis?.description || "");
        // Photos and voice notes of the request: a reminder only (bureau; never blocks the screen)
        getDemandeRappel(d.demandeDevis.id)
          .then(setDemande)
          .catch(() => setDemande({ id: d.demandeDevis!.id, reference: d.demandeDevis!.reference, description: d.demandeDevis!.description }));
      }
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger le devis."));
    } finally {
      setLoading(false);
    }
  }, [devisId]);

  useEffect(() => {
    void charger();
    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    };
  }, [charger]);

  // ── Ask the AI ─────────────────────────────────────────────────────────

  async function lancer(demander: () => Promise<Proposition>) {
    setErreur(null);
    setEtape("attente");
    setAttenteLongue(false);
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setAttenteLongue(true), ATTENTE_LONGUE_MS);
    try {
      const p = await demander();
      setProposition(p);
      setLignes(
        p.lignes.map((l, i) => ({
          ...l,
          cle: `${l.prestationId}-${i}`,
          quantiteTexte: versTexte(l.quantite),
          prixTexte: versTexte(l.prixUnitaireHT),
        })),
      );
      setEtape("apercu");
    } catch (e) {
      setErreur(getErrorMessage(e, "L’IA n’a pas pu répondre. Réessayez."));
      setEtape("saisie");
    } finally {
      if (minuteur.current) clearTimeout(minuteur.current);
    }
  }

  const texteValide = texte.trim().length >= DESCRIPTION_MIN && texte.trim().length <= DESCRIPTION_MAX;

  const proposerDepuisTexte = () => {
    if (texteValide) void lancer(() => proposerTexte(devisId, texte));
  };

  const proposerDepuisPhotos = () => {
    if (photos.length) void lancer(() => proposerPhotos(devisId, photos, texte.length <= DESCRIPTION_MAX ? texte : ""));
  };

  /** Plan tab: the selected rooms become the description sent to the AI. */
  const proposerDepuisPlan = (description: string) => {
    const complet = [texte.trim(), description].filter(Boolean).join("\n\n").slice(0, DESCRIPTION_MAX);
    if (complet.length >= DESCRIPTION_MIN) void lancer(() => proposerTexte(devisId, complet));
  };

  /** Plan tab: copy the rooms into the « Texte » tab to complete them by hand. */
  const copierDansTexte = (description: string) => {
    setTexte((t) => [t.trim(), description].filter(Boolean).join("\n\n").slice(0, DESCRIPTION_MAX));
    setOnglet("texte");
  };

  // ── Photos ─────────────────────────────────────────────────────────────

  async function ajouterPhotos(source: "galerie" | "camera") {
    setErreur(null);
    try {
      const reste = MAX_PHOTOS_IA - photos.length;
      if (reste <= 0) return;
      const nouvellesPhotos = source === "camera" ? [await prendrePhoto()].filter((p): p is FichierLocal => !!p) : await choisirPhotos(reste);
      setPhotos((ps) => [...ps, ...nouvellesPhotos].slice(0, MAX_PHOTOS_IA));
    } catch (e) {
      setErreur(getErrorMessage(e));
    }
  }

  const retirerPhoto = (i: number) => setPhotos((ps) => ps.filter((_, j) => j !== i));

  // ── Voice ──────────────────────────────────────────────────────────────

  /** The recording → text added to the description, then shown in « Texte » to correct it. */
  async function transcrireNote(audio: FichierLocal) {
    setErreur(null);
    setTranscription(true);
    try {
      const t = await transcrire(devisId, audio);
      if (!t.trim()) {
        setErreur("Rien n’a été compris. Parlez plus près du téléphone et réessayez.");
        return;
      }
      setTexte((avant) => [avant.trim(), t.trim()].filter(Boolean).join("\n").slice(0, DESCRIPTION_MAX));
      setOnglet("texte");
    } catch (e) {
      setErreur(getErrorMessage(e, "La transcription a échoué."));
    } finally {
      setTranscription(false);
    }
  }

  // ── Proposal being corrected ───────────────────────────────────────────

  const modifier = (cle: string, champ: "quantiteTexte" | "prixTexte", valeur: string) =>
    setLignes((ls) => ls.map((l) => (l.cle === cle ? { ...l, [champ]: valeur } : l)));

  const retirerLigne = (cle: string) => setLignes((ls) => ls.filter((l) => l.cle !== cle));

  const lignesValides = lignes.length > 0 && lignes.every((l) => lireNombre(l.quantiteTexte) !== null && lireNombre(l.quantiteTexte)! <= 10_000 && (!avecPrix || lireNombre(l.prixTexte) !== null));

  const totalApercu = useMemo(
    () => (avecPrix ? lignes.reduce((s, l) => s + (lireNombre(l.quantiteTexte) ?? 0) * (lireNombre(l.prixTexte) ?? 0), 0) : null),
    [lignes, avecPrix],
  );

  /** POST …/appliquer, then the prices changed by hand (bureau) on the new lines. */
  async function enregistrer() {
    if (!devis || !lignesValides) return;
    setEnregistrement(true);
    setErreur(null);
    const avant = new Set(devis.lignes.map((l) => l.id));
    try {
      let d = await appliquer(
        devis.id,
        lignes.map((l) => ({ prestationId: l.prestationId, quantite: lireNombre(l.quantiteTexte)! })),
      );
      const ajoutees = d.lignes.filter((l) => !avant.has(l.id));
      if (avecPrix) {
        const libres = [...ajoutees];
        for (const l of lignes) {
          const i = libres.findIndex((n) => n.prestationId === l.prestationId);
          if (i < 0) continue;
          const cible = libres.splice(i, 1)[0];
          const prix = lireNombre(l.prixTexte);
          if (prix !== null && Math.abs(prix - Number(cible.prixUnitaireVente ?? 0)) > 0.005) {
            d = await modifierLigne(devis.id, cible.id, { prixUnitaireVente: prix });
          }
        }
      }
      setDevis(d);
      setNouvelles(ajoutees.map((l) => l.id));
      setEtape("recap");
    } catch (e) {
      setErreur(getErrorMessage(e, "Les lignes n’ont pas pu être ajoutées au devis."));
    } finally {
      setEnregistrement(false);
    }
  }

  // ── Recap (bureau): adjust a quantity or remove a line ─────────────────

  async function changerQuantite(ligneId: number, texteQuantite: string) {
    const q = lireNombre(texteQuantite);
    if (!devis || q === null) {
      setErreur("Quantité invalide.");
      return;
    }
    setLigneEnCours(ligneId);
    setErreur(null);
    try {
      setDevis(await modifierLigne(devis.id, ligneId, { quantite: q }));
    } catch (e) {
      setErreur(getErrorMessage(e));
    } finally {
      setLigneEnCours(null);
    }
  }

  async function supprimer(ligneId: number) {
    if (!devis) return;
    setLigneEnCours(ligneId);
    setErreur(null);
    try {
      setDevis(await supprimerLigne(devis.id, ligneId));
      setNouvelles((ids) => ids.filter((i) => i !== ligneId));
    } catch (e) {
      setErreur(getErrorMessage(e));
    } finally {
      setLigneEnCours(null);
    }
  }

  const recommencer = () => {
    setProposition(null);
    setLignes([]);
    setErreur(null);
    setEtape("saisie");
  };

  return {
    avecPrix,
    devis,
    demande,
    loading,
    erreur,
    setErreur,
    recharger: charger,
    onglet,
    setOnglet,
    texte,
    setTexte,
    texteValide,
    photos,
    ajouterPhotos,
    retirerPhoto,
    transcription,
    transcrireNote,
    etape,
    attenteLongue,
    proposition,
    lignes,
    modifier,
    retirerLigne,
    lignesValides,
    totalApercu,
    enregistrement,
    enregistrer,
    nouvelles,
    ligneEnCours,
    changerQuantite,
    supprimer,
    recommencer,
    proposerDepuisTexte,
    proposerDepuisPhotos,
    proposerDepuisPlan,
    copierDansTexte,
  };
}

export type DevisIAViewModel = ReturnType<typeof useDevisIAViewModel>;
