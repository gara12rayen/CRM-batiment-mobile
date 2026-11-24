import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, getErrorMessage } from "@/core/api/api-client";
import { nouvelleCleIdempotence } from "@/core/api/idempotency";
import { positionActuelle, type FichierLocal } from "@/shared/media/media.service";
import { calculerReception, RECEPTIONNABLES, type ArticleInconnu, type BonLivraisonLu, type CommandeDetail, type LigneControle } from "../models/Livraison";
import { getCommande, joindreBonLivraison, lireBonLivraison, receptionner } from "../services/livraisons.service";

const num = (v: number | string) => Number(v);

/** Delivery check: photo of the note → AI reading → counted quantities and gaps → reception. */
export function useReceptionViewModel(commandeId: number) {
  const [commande, setCommande] = useState<CommandeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [photo, setPhoto] = useState<FichierLocal | null>(null);
  const [lecture, setLecture] = useState<BonLivraisonLu | null>(null);
  const [lectureEnCours, setLectureEnCours] = useState(false);
  const [lignes, setLignes] = useState<LigneControle[]>([]);
  const [inconnus, setInconnus] = useState<ArticleInconnu[]>([]);
  const [notes, setNotes] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [fini, setFini] = useState<string | null>(null);
  const cle = useRef(nouvelleCleIdempotence());

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const c = await getCommande(commandeId);
      setCommande(c);
      setLignes(
        c.lignes
          .map((l) => ({ ligneId: l.id, nom: l.materiauNom, unite: l.unite, restant: Math.max(0, num(l.quantite) - num(l.quantiteRecue)), surBon: null, recuTexte: "", abimeTexte: "", douteux: false }))
          .filter((l) => l.restant > 0),
      );
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger la commande."));
    } finally {
      setLoading(false);
    }
  }, [commandeId]);

  useEffect(() => {
    void charger();
  }, [charger]);

  /** The AI fills the quantities; everything stays editable. */
  async function lire(p: FichierLocal) {
    setPhoto(p);
    setLectureEnCours(true);
    setErreur(null);
    setInfo(null);
    try {
      const r = await lireBonLivraison(commandeId, p);
      setLecture(r);
      setLignes((ls) =>
        ls.map((l) => {
          const lus = r.lignes.filter((x) => x.ligneId === l.ligneId);
          if (!lus.length) return l;
          const q = lus.reduce((s, x) => s + (x.quantite ?? 0), 0);
          const douteux = lus.some((x) => x.douteux);
          return { ...l, surBon: q || null, recuTexte: q ? String(q).replace(".", ",") : l.recuTexte, douteux };
        }),
      );
      setInconnus(r.lignes.filter((x) => x.ligneId === null).map((x, i) => ({ cle: `ia-${i}`, libelle: x.libelle, quantiteTexte: x.quantite ? String(x.quantite).replace(".", ",") : "" })));
      if (r.avertissement) setInfo(r.avertissement);
    } catch (e) {
      if (e instanceof ApiError && (e.code === "IA_NON_CONFIGUREE" || e.code === "IA_OCR_INDISPONIBLE")) setInfo(`${e.message} La photo sera quand même jointe à la réception.`);
      else setErreur(getErrorMessage(e, "Le bon de livraison n’a pas pu être lu."));
    } finally {
      setLectureEnCours(false);
    }
  }

  const modifierLigne = (ligneId: number, champ: "recuTexte" | "abimeTexte", v: string) => setLignes((ls) => ls.map((l) => (l.ligneId === ligneId ? { ...l, [champ]: v } : l)));
  const toutRecu = () => setLignes((ls) => ls.map((l) => ({ ...l, recuTexte: String(l.surBon ?? l.restant).replace(".", ",") })));
  const ajouterInconnu = () => setInconnus((a) => [...a, { cle: `m-${Date.now()}`, libelle: "", quantiteTexte: "" }]);
  const modifierInconnu = (cleA: string, champ: "libelle" | "quantiteTexte", v: string) => setInconnus((a) => a.map((x) => (x.cle === cleA ? { ...x, [champ]: v } : x)));
  const retirerInconnu = (cleA: string) => setInconnus((a) => a.filter((x) => x.cle !== cleA));

  const calcul = useMemo(() => calculerReception(lignes, inconnus), [lignes, inconnus]);
  const receptionnable = !!commande && RECEPTIONNABLES.includes(commande.statutLivraison);
  const pret = receptionnable && !calcul.invalide && (calcul.lignes.length > 0 || calcul.ecarts.length > 0) && !envoi;

  async function valider() {
    if (!pret) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const { receptionId } = await receptionner(commandeId, { lignes: calcul.lignes, ecarts: calcul.ecarts, notes: notes.trim() || undefined }, cle.current);
      let message = calcul.ecarts.length ? `Réception enregistrée avec ${calcul.ecarts.length} écart(s) : le bureau est prévenu.` : "Réception enregistrée, sans écart.";
      if (photo) {
        try {
          await joindreBonLivraison(receptionId, photo, await positionActuelle(), `${cle.current}-bl`);
        } catch {
          message += " La photo du bon n’a pas pu être jointe.";
        }
      }
      setFini(message);
    } catch (e) {
      setErreur(getErrorMessage(e, "La réception n’a pas pu être enregistrée."));
    } finally {
      setEnvoi(false);
    }
  }

  return {
    commande, loading, erreur, info, photo, lecture, lectureEnCours, lignes, inconnus, notes, setNotes,
    lire, modifierLigne, toutRecu, ajouterInconnu, modifierInconnu, retirerInconnu,
    calcul, receptionnable, pret, envoi, valider, fini, recharger: charger,
  };
}
