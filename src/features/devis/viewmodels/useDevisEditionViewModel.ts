import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { getErrorMessage } from "@/core/api/api-client";
import { DEVIS_REGLES, type DevisDetail, type DevisLigne } from "../models/Devis";
import { modifierDevis, modifierLigne, supprimerLigne } from "../services/devis.service";

/**
 * Edition of a draft (or revised) quote: lines (quantity, price, delete), VAT, notes.
 * Every answer of the API is the whole updated quote (totals recalculated by the server).
 */
export function useDevisEditionViewModel(devis: DevisDetail | null, onUpdate: (d: DevisDetail) => void) {
  const router = useRouter();
  const [ligneOuverte, setLigneOuverte] = useState<DevisLigne | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const modifiable = !!devis && DEVIS_REGLES.modifiable.includes(devis.statut) && devis.totalTTC !== undefined;

  async function enregistrer(fn: () => Promise<DevisDetail>): Promise<boolean> {
    if (enregistrement) return false;
    setEnregistrement(true);
    try {
      onUpdate(await fn());
      return true;
    } catch (e) {
      Alert.alert("Enregistrement impossible", getErrorMessage(e));
      return false;
    } finally {
      setEnregistrement(false);
    }
  }

  const modifierLigneOuverte = async (quantite: number, prixUnitaireVente: number) => {
    if (!devis || !ligneOuverte) return;
    const ok = await enregistrer(() => modifierLigne(devis.id, ligneOuverte.id, { quantite, prixUnitaireVente }));
    if (ok) setLigneOuverte(null);
  };

  const supprimerLigneOuverte = () => {
    if (!devis || !ligneOuverte) return;
    const ligne = ligneOuverte;
    Alert.alert("Supprimer la ligne ?", ligne.description ?? "Prestation", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () =>
          void enregistrer(() => supprimerLigne(devis.id, ligne.id)).then((ok) => {
            if (ok) setLigneOuverte(null);
          }),
      },
    ]);
  };

  const changerTva = (tauxTVA: number) => {
    if (!devis || devis.tauxTVA === tauxTVA) return;
    void enregistrer(() => modifierDevis(devis.id, { tauxTVA }));
  };

  const enregistrerNotes = (notes: string) => {
    if (!devis || (devis.notes ?? "") === notes.trim()) return;
    void enregistrer(() => modifierDevis(devis.id, { notes: notes.trim() || null }));
  };

  return {
    modifiable,
    enregistrement,
    ligneOuverte,
    ouvrirLigne: (l: DevisLigne) => modifiable && setLigneOuverte(l),
    fermerLigne: () => setLigneOuverte(null),
    modifierLigneOuverte,
    supprimerLigneOuverte,
    changerTva,
    enregistrerNotes,
    ajouterLigne: () => devis && router.push({ pathname: "/devis/ajout-ligne", params: { devisId: String(devis.id) } }),
  };
}
