import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { jourVersTexte, lireJour } from "@/shared/utils/dates";
import { CHANTIER_FERME } from "../models/Chantier";
import { intervenantsDe, type Intervenant, type Tache, type TacheChecklistReponse, type TacheModification, type TacheStatut } from "../models/Tache";
import { getChantier } from "../services/chantiers.service";
import {
  ajouterPoint,
  cocherPoint,
  creerTache,
  listIntervenants,
  listTaches,
  modifierTache,
  supprimerPoint,
  supprimerTache,
} from "../services/taches.service";

export const AVANCEMENTS = [0, 25, 50, 75, 100] as const;

/**
 * Création (tacheId absent) ou fiche d'une tâche : champs, affectation, statut, avancement,
 * note, checklist et suppression. Mêmes règles que l'API (les erreurs de l'API sont affichées telles quelles).
 */
export function useTacheFormViewModel(chantierId: number, tacheId?: number) {
  const router = useRouter();
  const { user } = useAuth();
  const creation = !tacheId;

  const [tache, setTache] = useState<Tache | null>(null);
  const [libelle, setLibelle] = useState("");
  const [description, setDescription] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [statut, setStatut] = useState<TacheStatut>("A_FAIRE");
  const [avancement, setAvancement] = useState(0);
  const [assignes, setAssignes] = useState<number[]>([]);
  const [options, setOptions] = useState<Intervenant[]>([]);
  const [chantierFerme, setChantierFerme] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [checklistEnCours, setChecklistEnCours] = useState(false);
  const [nouveauPoint, setNouveauPoint] = useState("");
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);

  // Valeurs simples (et non l'objet user) pour ne pas relancer le chargement à chaque rendu
  const role = user?.role ?? null;
  const moiId = user ? Number(user.id) : null;
  const moiNom = user?.nom ?? "";
  const moiPrenom = user?.prenom ?? "";
  const estChef = role === "CHEF_CHANTIER";
  const peutGerer = role !== null && permissions.canManageChantiers(role);
  const peutModifier = peutGerer && !chantierFerme;

  /** Remplit le formulaire avec la tâche reçue de l'API. */
  const remplir = useCallback((t: Tache) => {
    setTache(t);
    setLibelle(t.libelle);
    setDescription(t.description ?? "");
    setDebut(jourVersTexte(t.dateDebut));
    setFin(jourVersTexte(t.dateFin));
    setCommentaire(t.commentaire ?? "");
    setStatut(t.statut);
    setAvancement(t.avancement);
    setAssignes(intervenantsDe(t).map((i) => i.id));
  }, []);

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        // Le chef n'affecte que des sous-traitants ou lui-même (règle de l'API) ; le bureau aussi des chefs.
        const roles = estChef ? ["SOUS_TRAITANT"] : ["SOUS_TRAITANT", "CHEF_CHANTIER"];
        const [chantier, intervenants, taches] = await Promise.all([
          getChantier(chantierId),
          peutGerer ? listIntervenants(roles) : Promise.resolve([] as Intervenant[]),
          creation ? Promise.resolve([] as Tache[]) : listTaches(chantierId),
        ]);
        if (!actif) return;
        setChantierFerme(CHANTIER_FERME.includes(chantier.statut));
        const moi: Intervenant[] = estChef && moiId !== null ? [{ id: moiId, nom: moiNom, prenom: moiPrenom, role: "CHEF_CHANTIER" }] : [];
        setOptions([...moi, ...intervenants.filter((i) => !moi.some((m) => m.id === i.id))]);
        if (!creation) {
          const t = taches.find((x) => x.id === tacheId);
          if (!t) throw new Error("Tâche introuvable.");
          remplir(t);
        }
        setError(null);
      } catch (e) {
        if (actif) setError(getErrorMessage(e, "Impossible de charger la tâche."));
      } finally {
        if (actif) setLoading(false);
      }
    })();
    return () => {
      actif = false;
    };
  }, [chantierId, tacheId, creation, estChef, peutGerer, moiId, moiNom, moiPrenom, remplir]);

  /** Les personnes déjà affectées restent visibles même si elles ne sont plus dans les options. */
  const choixIntervenants = useMemo(() => {
    const deja = tache ? intervenantsDe(tache).filter((i) => !options.some((o) => o.id === i.id)) : [];
    return [...options, ...deja];
  }, [options, tache]);

  const basculerIntervenant = (id: number) => setAssignes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /** Avec une checklist, l'avancement suit les cases cochées : on ne le saisit plus à la main. */
  const avancementAuto = (tache?.checklist.length ?? 0) > 0;

  /** Statut et avancement restent cohérents, comme dans l'API (100 % ⇔ Terminée). */
  const choisirStatut = (s: TacheStatut) => {
    setStatut(s);
    if (s === "TERMINEE") setAvancement(100);
    else if (avancement === 100 && !avancementAuto) setAvancement(s === "A_FAIRE" ? 0 : 75);
    else if (s === "A_FAIRE" && !avancementAuto) setAvancement(0);
  };
  const choisirAvancement = (a: number) => {
    setAvancement(a);
    if (a === 100) setStatut("TERMINEE");
    else if (statut === "TERMINEE" || (statut === "A_FAIRE" && a > 0)) setStatut("EN_COURS");
    else if (a === 0 && statut === "EN_COURS") setStatut("A_FAIRE");
  };

  const dateDebut = lireJour(debut);
  const dateFin = lireJour(fin);
  const erreurDates =
    dateDebut === undefined || dateFin === undefined
      ? "Date invalide : utilisez le format JJ/MM/AAAA."
      : dateDebut && dateFin && dateFin < dateDebut
        ? "La date de fin ne peut pas précéder la date de début."
        : null;
  const peutEnregistrer = peutModifier && libelle.trim().length > 0 && !erreurDates && !enregistrement;

  async function enregistrer() {
    if (!peutEnregistrer) return;
    setEnregistrement(true);
    setError(null);
    try {
      const commun = {
        libelle: libelle.trim(),
        description: description.trim() || null,
        dateDebut: dateDebut ?? null,
        dateFin: dateFin ?? null,
        assigneeIds: assignes,
      };
      if (creation) {
        await creerTache(chantierId, commun);
      } else if (tache) {
        const body: TacheModification = { ...commun, commentaire: commentaire.trim() || null };
        // N'envoyer statut / avancement que s'ils ont changé (l'API les recalcule ensemble)
        if (statut !== tache.statut) body.statut = statut;
        if (!avancementAuto && avancement !== tache.avancement) body.avancement = avancement;
        await modifierTache(chantierId, tache.id, body);
      }
      router.back();
    } catch (e) {
      setError(getErrorMessage(e, "Impossible d’enregistrer la tâche."));
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimer() {
    if (!tache || !peutModifier) return;
    if (!confirmerSuppression) {
      setConfirmerSuppression(true);
      return;
    }
    setEnregistrement(true);
    setError(null);
    try {
      await supprimerTache(chantierId, tache.id);
      router.back();
    } catch (e) {
      setError(getErrorMessage(e, "Impossible de supprimer la tâche."));
      setEnregistrement(false);
    }
  }

  /** Applique la réponse d'une route de checklist (statut et avancement recalculés par l'API). */
  const appliquerChecklist = (r: TacheChecklistReponse) => {
    setTache((t) => (t ? { ...t, statut: r.statut, avancement: r.avancement, checklist: r.checklist } : t));
    setStatut(r.statut);
    setAvancement(r.avancement);
  };

  async function actionChecklist(fn: () => Promise<TacheChecklistReponse>) {
    if (!tache || !peutModifier) return;
    setChecklistEnCours(true);
    setError(null);
    try {
      appliquerChecklist(await fn());
    } catch (e) {
      setError(getErrorMessage(e, "Impossible de modifier la checklist."));
    } finally {
      setChecklistEnCours(false);
    }
  }

  return {
    creation,
    tache,
    loading,
    error,
    peutModifier,
    chantierFerme,
    enregistrement,
    peutEnregistrer,
    erreurDates,
    champs: { libelle, setLibelle, description, setDescription, debut, setDebut, fin, setFin, commentaire, setCommentaire },
    statut,
    choisirStatut,
    avancement,
    choisirAvancement,
    avancementAuto,
    intervenants: choixIntervenants,
    assignes,
    basculerIntervenant,
    enregistrer,
    supprimer,
    confirmerSuppression,
    annulerSuppression: () => setConfirmerSuppression(false),
    checklist: {
      items: tache?.checklist ?? [],
      enCours: checklistEnCours,
      nouveauPoint,
      setNouveauPoint,
      ajouter: () => {
        const texte = nouveauPoint.trim();
        if (!texte || !tache) return;
        void actionChecklist(async () => {
          const r = await ajouterPoint(chantierId, tache.id, texte);
          setNouveauPoint("");
          return r;
        });
      },
      cocher: (itemId: number, fait: boolean) => tache && void actionChecklist(() => cocherPoint(chantierId, tache.id, itemId, fait)),
      supprimer: (itemId: number) => tache && void actionChecklist(() => supprimerPoint(chantierId, tache.id, itemId)),
    },
  };
}
