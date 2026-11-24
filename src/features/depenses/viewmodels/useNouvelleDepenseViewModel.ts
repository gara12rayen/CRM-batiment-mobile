import { useRef, useState } from "react";
import { ApiError, getErrorMessage } from "@/core/api/api-client";
import { nouvelleCleIdempotence } from "@/core/api/idempotency";
import { lireDate, versDateFr } from "@/features/chantier-fiche/viewmodels/useChantierFicheViewModel";
import { positionActuelle, type FichierLocal } from "@/shared/media/media.service";
import { CHAMPS_FACTURE, lireMontant, montantsCoherents, type ChampFacture } from "../models/Depense";
import { creerDepense, lireFacture } from "../services/depenses.service";

type Valeurs = Record<ChampFacture, string>;
const VIDE: Valeurs = { fournisseur: "", numeroFacture: "", dateFacture: "", montantHT: "", montantTVA: "", montantTTC: "" };
const montantTexte = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

/** Photo of the invoice → AI reading (doubtful values highlighted) → correction → expense. */
export function useNouvelleDepenseViewModel(ctx: { chantierId?: number; commandeId?: number }) {
  const [photo, setPhoto] = useState<FichierLocal | null>(null);
  const [valeurs, setValeurs] = useState<Valeurs>(VIDE);
  const [douteux, setDouteux] = useState<Set<ChampFacture>>(new Set());
  const [modifies, setModifies] = useState<Set<ChampFacture>>(new Set());
  const [lecture, setLecture] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [fini, setFini] = useState(false);
  const cle = useRef(nouvelleCleIdempotence());

  async function lire(p: FichierLocal) {
    setPhoto(p);
    setLecture(true);
    setErreur(null);
    setInfo(null);
    try {
      const r = await lireFacture(p);
      setValeurs({
        fournisseur: r.valeurs.fournisseur ?? "",
        numeroFacture: r.valeurs.numeroFacture ?? "",
        dateFacture: versDateFr(r.valeurs.dateFacture),
        montantHT: montantTexte(r.valeurs.montantHT),
        montantTVA: montantTexte(r.valeurs.montantTVA),
        montantTTC: montantTexte(r.valeurs.montantTTC),
      });
      setDouteux(new Set(r.champsDouteux));
      setModifies(new Set());
      setInfo(r.avertissement ?? (r.champsDouteux.length ? "Vérifiez les valeurs surlignées." : "Facture lue : vérifiez avant d’envoyer."));
    } catch (e) {
      if (e instanceof ApiError && (e.code === "IA_NON_CONFIGUREE" || e.code === "IA_OCR_INDISPONIBLE")) setInfo(`${e.message}`);
      else setErreur(getErrorMessage(e, "La facture n’a pas pu être lue."));
    } finally {
      setLecture(false);
    }
  }

  const modifier = (champ: ChampFacture, v: string) => {
    setValeurs((x) => ({ ...x, [champ]: v }));
    setModifies((m) => new Set(m).add(champ));
  };

  const ht = lireMontant(valeurs.montantHT);
  const tva = lireMontant(valeurs.montantTVA);
  const ttc = lireMontant(valeurs.montantTTC);
  const date = lireDate(valeurs.dateFacture);
  const coherent = montantsCoherents(ht, tva, ttc);
  const manquants = CHAMPS_FACTURE.filter((c) => (c === "dateFacture" ? !date : c.startsWith("montant") ? lireMontant(valeurs[c]) === null : !valeurs[c].trim()));
  const pret = !!photo && !manquants.length && coherent && !envoi && !lecture;

  async function envoyer() {
    if (!pret || !photo || ht === null || tva === null || ttc === null || !date) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const gps = await positionActuelle();
      await creerDepense(
        {
          fournisseurNom: valeurs.fournisseur.trim(),
          numeroFacture: valeurs.numeroFacture.trim(),
          dateFacture: date,
          montantHT: ht,
          montantTVA: tva,
          montantTTC: ttc,
          chantierId: ctx.chantierId,
          commandeFournisseurId: ctx.commandeId,
          // Doubtful for the AI and not corrected by hand: the office looks at them first
          champsDouteux: CHAMPS_FACTURE.filter((c) => douteux.has(c) && !modifies.has(c)),
          latitude: gps?.latitude,
          longitude: gps?.longitude,
        },
        photo,
        cle.current,
      );
      setFini(true);
    } catch (e) {
      setErreur(getErrorMessage(e, "La facture n’a pas pu être envoyée."));
    } finally {
      setEnvoi(false);
    }
  }

  return { photo, valeurs, douteux, modifies, lecture, info, erreur, envoi, fini, coherent, manquants, pret, ht, tva, ttc, lire, modifier, envoyer };
}
