import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import type { Prestation, PrestationDetail, PrixSuggere, Unite } from "@/features/catalogue/models/Prestation";
import { getPrestation, prixSuggere, rechercherPrestations } from "@/features/catalogue/services/catalogue.service";
import { lireNombre } from "@/shared/utils/format";
import { ajouterLigne } from "../services/devis.service";

export type ModeAjout = "catalogue" | "libre";

/**
 * Adding a line to a draft quote:
 *  - from the catalogue: search → prestation → quantity + one choice per option → suggested price
 *    (computed by the API, can be replaced);
 *  - free line: description, quantity, unit, unit price.
 */
export function useAjoutLigneViewModel(devisId: number) {
  const router = useRouter();
  const [mode, setMode] = useState<ModeAjout>("catalogue");
  const [enregistrement, setEnregistrement] = useState(false);

  // ── catalogue ──
  const [search, setSearch] = useState("");
  const [resultats, setResultats] = useState<Prestation[]>([]);
  const [recherche, setRecherche] = useState(false);
  const [prestation, setPrestation] = useState<PrestationDetail | null>(null);
  const [chargementPrestation, setChargementPrestation] = useState(false);
  const [choix, setChoix] = useState<Record<number, number | null>>({});
  const [quantite, setQuantite] = useState("1");
  const [prix, setPrix] = useState(""); // empty = suggested price
  const [suggestion, setSuggestion] = useState<PrixSuggere | null>(null);
  const [calcul, setCalcul] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requete = useRef(0);

  // ── free line ──
  const [description, setDescription] = useState("");
  const [quantiteLibre, setQuantiteLibre] = useState("1");
  const [unite, setUnite] = useState<Unite>("FORFAIT");
  const [prixLibre, setPrixLibre] = useState("");

  useEffect(() => {
    if (mode !== "catalogue" || prestation) return;
    const id = ++requete.current;
    const timer = setTimeout(async () => {
      setRecherche(true);
      try {
        const res = await rechercherPrestations(search);
        if (id === requete.current) {
          setResultats(res.data);
          setError(null);
        }
      } catch (e) {
        if (id === requete.current) setError(getErrorMessage(e, "Impossible de charger le catalogue."));
      } finally {
        if (id === requete.current) setRecherche(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, mode, prestation]);

  const choixIds = useMemo(() => Object.values(choix).filter((v): v is number => typeof v === "number"), [choix]);
  const optionsManquantes = prestation?.options.filter((o) => o.obligatoire && !choix[o.id]).map((o) => o.nom) ?? [];
  const qte = lireNombre(quantite);

  // Suggested price, recalculated when the quantity or the options change
  useEffect(() => {
    if (!prestation || !(qte > 0) || optionsManquantes.length) {
      setSuggestion(null);
      return;
    }
    let actif = true;
    const timer = setTimeout(async () => {
      setCalcul(true);
      try {
        const r = await prixSuggere(prestation.id, qte, choixIds);
        if (actif) setSuggestion(r);
      } catch {
        if (actif) setSuggestion(null);
      } finally {
        if (actif) setCalcul(false);
      }
    }, 300);
    return () => {
      actif = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prestation, qte, choixIds, optionsManquantes.length]);

  const choisirPrestation = async (p: Prestation) => {
    setChargementPrestation(true);
    try {
      const detail = await getPrestation(p.id);
      setPrestation({ ...detail, options: detail.options.map((o) => ({ ...o, choix: o.choix.filter((c) => c.actif) })) });
      setChoix({});
      setQuantite("1");
      setPrix("");
    } catch (e) {
      Alert.alert("Prestation indisponible", getErrorMessage(e));
    } finally {
      setChargementPrestation(false);
    }
  };

  const prixSaisi = prix.trim() === "" ? undefined : lireNombre(prix);
  const catalogueValide = !!prestation && qte > 0 && !optionsManquantes.length && (prixSaisi === undefined || prixSaisi >= 0);
  const libreValide = description.trim().length > 0 && lireNombre(quantiteLibre) > 0 && lireNombre(prixLibre) >= 0;

  const valider = async () => {
    if (enregistrement) return;
    if (mode === "catalogue" && !catalogueValide) return;
    if (mode === "libre" && !libreValide) return;
    setEnregistrement(true);
    try {
      await ajouterLigne(
        devisId,
        mode === "catalogue"
          ? { prestationId: prestation!.id, choixIds, quantite: qte, ...(prixSaisi !== undefined ? { prixUnitaireVente: prixSaisi } : {}) }
          : { description: description.trim(), quantite: lireNombre(quantiteLibre), unite, prixUnitaireVente: lireNombre(prixLibre) },
      );
      router.back(); // the quote screen reloads when it comes back into view
    } catch (e) {
      Alert.alert("Ligne non ajoutée", getErrorMessage(e));
    } finally {
      setEnregistrement(false);
    }
  };

  return {
    mode,
    setMode,
    enregistrement,
    valider,
    peutValider: mode === "catalogue" ? catalogueValide : libreValide,
    catalogue: {
      search,
      setSearch,
      resultats,
      recherche,
      error,
      prestation,
      chargementPrestation,
      choisirPrestation: (p: Prestation) => void choisirPrestation(p),
      changerPrestation: () => setPrestation(null),
      choix,
      choisirOption: (optionId: number, choixId: number | null) => setChoix((c) => ({ ...c, [optionId]: choixId })),
      quantite,
      setQuantite,
      prix,
      setPrix,
      suggestion,
      calcul,
      optionsManquantes,
    },
    libre: { description, setDescription, quantite: quantiteLibre, setQuantite: setQuantiteLibre, unite, setUnite, prix: prixLibre, setPrix: setPrixLibre },
  };
}
